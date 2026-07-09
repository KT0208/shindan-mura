// 診断村: 結果ごとのOGP画像(1200x630)を一括生成する。
//
// 生成物: public/ogp/{imageKey}.jpg (キャラ160体分)
//
// 事前準備: npm install -D sharp
// 実行:     npm run generate:ogp
//   - 既存ファイルはスキップする。作り直したい場合は --force を付ける。
//   - 新キャラ追加時はこのスクリプトを再実行するだけでよい。
//
// デザイン: 左にキャラ画像、右に診断名・キャラ名・タイプ名・ブランド表記。
// フォントはOS内蔵の日本語フォントを使う(mac: ヒラギノ / Linux: Noto Sans CJK)。

import { mkdir, readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { diagnoses } from '../src/diagnosisData.js'
import { characterCollections } from './generate-share-pages.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')
const outDir = path.join(publicDir, 'ogp')
const force = process.argv.includes('--force')

const W = 1200
const H = 630
const CHAR_SIZE = 470

const escapeXml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

// テキストエリア: x=620 から右端マージン60を引いた 520px が使える最大幅
const TEXT_X = 620
const TEXT_MAX_W = 520

// 全角前提で「1文字 = フォントサイズ相当の幅」とみなし、最大幅に収まるサイズを返す
function fitFontSize(text, base, maxWidth) {
  return Math.max(26, Math.min(base, Math.floor(maxWidth / Math.max(1, text.length))))
}

export function buildOverlaySvg({ diagnosisTitle, characterName, resultTitle }) {
  const nameSize = fitFontSize(characterName, 72, TEXT_MAX_W)
  const typeSize = fitFontSize(resultTitle, 42, TEXT_MAX_W - 48)
  const ribbonW = Math.min(TEXT_MAX_W, resultTitle.length * typeSize + 48)
  const fontFamily = "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', sans-serif"

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff8fd" />
      <stop offset="55%" stop-color="#ffd9fb" />
      <stop offset="100%" stop-color="#e9defa" />
    </linearGradient>
    <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff67ad" />
      <stop offset="100%" stop-color="#8f4ed8" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <!-- キャラを置く白い台座 -->
  <circle cx="310" cy="315" r="255" fill="#ffffff" opacity="0.85" />
  <!-- 右側テキストエリア -->
  <g font-family="${fontFamily}">
    <text x="${TEXT_X}" y="150" font-size="38" fill="#61487f">${escapeXml(diagnosisTitle)}</text>
    <text x="${TEXT_X}" y="300" font-size="${nameSize}" font-weight="bold" fill="#12071f">${escapeXml(characterName)}</text>
    <rect x="${TEXT_X}" y="345" rx="27" ry="27" width="${ribbonW}" height="66" fill="url(#ribbon)" />
    <text x="${TEXT_X + ribbonW / 2}" y="${345 + 33 + typeSize * 0.36}" font-size="${typeSize}" font-weight="bold" fill="#ffffff" text-anchor="middle">${escapeXml(resultTitle)}</text>
    <text x="${TEXT_X}" y="505" font-size="30" fill="#8e5fc6" font-weight="bold">診断村 | 無料キャラ診断</text>
    <text x="${TEXT_X}" y="550" font-size="26" fill="#8f7ba6">shindanmura.com</text>
  </g>
  <!-- 下部リボン -->
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="url(#ribbon)" />
</svg>`
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  // sharpは実行時にだけ読み込む(未インストール環境でこのモジュールをimportしても壊れないように)
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('sharp が見つかりません。先に `npm install -D sharp` を実行してください。')
    process.exit(1)
  }

  await mkdir(outDir, { recursive: true })
  let created = 0
  let skipped = 0
  const failed = []

  for (const diagnosis of diagnoses) {
    if (diagnosis.hidden) continue
    const collection = characterCollections[diagnosis.id]
    if (!collection) continue

    for (const [resultTitle, character] of Object.entries(collection.characters)) {
      const outPath = path.join(outDir, `${character.imageKey}.jpg`)
      if (!force && (await exists(outPath))) {
        skipped++
        continue
      }

      const charImagePath = path.join(publicDir, 'characters', collection.basePath, `${character.imageKey}.webp`)
      let charImage
      try {
        const buf = await readFile(charImagePath)
        if (buf.length === 0) throw new Error('empty file')
        charImage = await sharp(buf)
          .resize(CHAR_SIZE, CHAR_SIZE, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer()
      } catch (e) {
        failed.push(`${character.imageKey} (${e.message})`)
        continue
      }

      const overlay = Buffer.from(
        buildOverlaySvg({
          diagnosisTitle: diagnosis.title,
          emoji: diagnosis.emoji,
          characterName: character.characterName,
          resultTitle,
        }),
      )

      const meta = await sharp(charImage).metadata()
      await sharp(overlay)
        .composite([
          {
            input: charImage,
            left: Math.round(310 - (meta.width || CHAR_SIZE) / 2),
            top: Math.round(315 - (meta.height || CHAR_SIZE) / 2),
          },
        ])
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(outPath)
      created++
    }
  }

  console.log(`OGP画像: ${created} 枚生成 / ${skipped} 枚スキップ(既存)`)
  if (failed.length) {
    console.warn(`生成できなかったキャラ(元画像を確認してください):\n  ${failed.join('\n  ')}`)
  }
}

// 直接実行されたときだけ生成する
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main()
}

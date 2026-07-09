// 診断村: Instagram投稿素材を一括生成する。
//
// 生成物(サイトには含まれない。ビルド・アップロード不要):
//   sns-materials/instagram/feed/{imageKey}.jpg   ... フィード投稿用 1080x1350
//   sns-materials/instagram/story/{imageKey}.jpg  ... ストーリーズ用 1080x1920
//   sns-materials/instagram/captions/{imageKey}.txt ... 投稿キャプション(コピペ用)
//   sns-materials/instagram/一覧.csv               ... 全キャラの管理表
//
// 事前準備: npm install -D sharp (generate:ogp と共通、導入済みならそのまま)
// 実行:     npm run generate:instagram
//   - 既存ファイルはスキップ。作り直すときは --force を付ける。

import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { diagnoses } from '../src/diagnosisData.js'
import { resultDetails } from '../src/resultDetails.js'
import { characterCollections } from './generate-share-pages.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')
const outRoot = path.join(projectRoot, 'sns-materials', 'instagram')
const force = process.argv.includes('--force')

const FONT = "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', sans-serif"

const escapeXml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

// 全角前提: 最大幅に収まるフォントサイズ
function fit(text, base, maxWidth) {
  return Math.max(28, Math.min(base, Math.floor(maxWidth / Math.max(1, text.length))))
}

const defs = `
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
  </defs>`

// フィード用 1080x1350
export function buildFeedSvg({ diagnosisTitle, characterName, resultTitle }) {
  const W = 1080
  const H = 1350
  const nameSize = fit(characterName, 84, 960)
  const typeSize = fit(resultTitle, 48, 860)
  const ribbonW = Math.min(960, resultTitle.length * typeSize + 72)
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <g font-family="${FONT}" text-anchor="middle">
    <text x="540" y="96" font-size="34" font-weight="bold" fill="#8e5fc6">診断村</text>
    <text x="540" y="168" font-size="46" fill="#61487f">${escapeXml(diagnosisTitle)}</text>
  </g>
  <circle cx="540" cy="620" r="360" fill="#ffffff" opacity="0.88" />
  <g font-family="${FONT}" text-anchor="middle">
    <text x="540" y="1090" font-size="${nameSize}" font-weight="bold" fill="#12071f">${escapeXml(characterName)}</text>
    <rect x="${540 - ribbonW / 2}" y="1122" rx="34" ry="34" width="${ribbonW}" height="72" fill="url(#ribbon)" />
    <text x="540" y="${1122 + 36 + typeSize * 0.36}" font-size="${typeSize}" font-weight="bold" fill="#ffffff">${escapeXml(resultTitle)}</text>
    <text x="540" y="1272" font-size="32" fill="#8f7ba6">shindanmura.com | #診断村</text>
  </g>
  <rect x="0" y="${H - 16}" width="${W}" height="16" fill="url(#ribbon)" />
</svg>`
}

// ストーリーズ用 1080x1920 (上下に安全マージンを大きめに確保)
export function buildStorySvg({ diagnosisTitle, characterName, resultTitle }) {
  const W = 1080
  const H = 1920
  const nameSize = fit(characterName, 88, 960)
  const typeSize = fit(resultTitle, 50, 860)
  const ribbonW = Math.min(960, resultTitle.length * typeSize + 72)
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <g font-family="${FONT}" text-anchor="middle">
    <text x="540" y="270" font-size="40" font-weight="bold" fill="#8e5fc6">診断村</text>
    <text x="540" y="350" font-size="52" fill="#61487f">${escapeXml(diagnosisTitle)}</text>
    <text x="540" y="430" font-size="42" fill="#8f4ed8" font-weight="bold">あなたはどのタイプ？</text>
  </g>
  <circle cx="540" cy="900" r="380" fill="#ffffff" opacity="0.88" />
  <g font-family="${FONT}" text-anchor="middle">
    <text x="540" y="1400" font-size="${nameSize}" font-weight="bold" fill="#12071f">${escapeXml(characterName)}</text>
    <rect x="${540 - ribbonW / 2}" y="1436" rx="36" ry="36" width="${ribbonW}" height="76" fill="url(#ribbon)" />
    <text x="540" y="${1436 + 38 + typeSize * 0.36}" font-size="${typeSize}" font-weight="bold" fill="#ffffff">${escapeXml(resultTitle)}</text>
    <text x="540" y="1610" font-size="36" fill="#61487f">プロフィールのリンクから診断できるよ</text>
    <text x="540" y="1680" font-size="32" fill="#8f7ba6">shindanmura.com | #診断村</text>
  </g>
  <rect x="0" y="${H - 16}" width="${W}" height="16" fill="url(#ribbon)" />
</svg>`
}

// 投稿キャプション(コピペ用)
function buildCaption({ diagnosis, resultTitle, character, detail }) {
  const lines = [
    `【${diagnosis.title}】今日のキャラ紹介`,
    ``,
    `${character.characterName}(${resultTitle})`,
    `${character.role}`,
    ``,
  ]
  if (detail?.description) {
    lines.push(detail.description, '')
  }
  lines.push(
    `あなたはどのタイプ？`,
    `プロフィールのリンクから無料で診断できます`,
    ``,
    `#診断村 #診断 #キャラ診断 #性格診断 #${diagnosis.title.replaceAll(' ', '')} #かわいいキャラ #診断メーカー好きと繋がりたい`,
  )
  return lines.join('\n')
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function composite(sharp, svg, charImagePath, circle, outPath) {
  const buf = await readFile(charImagePath)
  if (buf.length === 0) throw new Error('empty file')
  const charImage = await sharp(buf)
    .resize(circle.size, circle.size, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer()
  const meta = await sharp(charImage).metadata()
  await sharp(Buffer.from(svg))
    .composite([
      {
        input: charImage,
        left: Math.round(circle.cx - (meta.width || circle.size) / 2),
        top: Math.round(circle.cy - (meta.height || circle.size) / 2),
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath)
}

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('sharp が見つかりません。先に `npm install -D sharp` を実行してください。')
    process.exit(1)
  }

  const feedDir = path.join(outRoot, 'feed')
  const storyDir = path.join(outRoot, 'story')
  const captionDir = path.join(outRoot, 'captions')
  await Promise.all([feedDir, storyDir, captionDir].map((d) => mkdir(d, { recursive: true })))

  const csvRows = [['imageKey', 'キャラ名', 'タイプ', '診断', 'フィード画像', 'ストーリー画像', 'キャプション']]
  let created = 0
  let skipped = 0
  const failed = []

  for (const diagnosis of diagnoses) {
    if (diagnosis.hidden) continue
    const collection = characterCollections[diagnosis.id]
    if (!collection) continue

    for (const [resultTitle, character] of Object.entries(collection.characters)) {
      const key = character.imageKey
      const charImagePath = path.join(publicDir, 'characters', collection.basePath, `${key}.webp`)
      const feedPath = path.join(feedDir, `${key}.jpg`)
      const storyPath = path.join(storyDir, `${key}.jpg`)
      const captionPath = path.join(captionDir, `${key}.txt`)
      const detail = resultDetails[diagnosis.id]?.[resultTitle]

      csvRows.push([key, character.characterName, resultTitle, diagnosis.title, `feed/${key}.jpg`, `story/${key}.jpg`, `captions/${key}.txt`])

      try {
        if (force || !(await exists(feedPath))) {
          const svg = buildFeedSvg({ diagnosisTitle: diagnosis.title, characterName: character.characterName, resultTitle })
          await composite(sharp, svg, charImagePath, { cx: 540, cy: 620, size: 640 }, feedPath)
          created++
        } else {
          skipped++
        }
        if (force || !(await exists(storyPath))) {
          const svg = buildStorySvg({ diagnosisTitle: diagnosis.title, characterName: character.characterName, resultTitle })
          await composite(sharp, svg, charImagePath, { cx: 540, cy: 900, size: 680 }, storyPath)
          created++
        } else {
          skipped++
        }
        await writeFile(captionPath, buildCaption({ diagnosis, resultTitle, character, detail }))
      } catch (e) {
        failed.push(`${key} (${e.message})`)
      }
    }
  }

  const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  await writeFile(path.join(outRoot, '一覧.csv'), '﻿' + csv)

  console.log(`Instagram素材: 画像 ${created} 枚生成 / ${skipped} 枚スキップ(既存)、キャプション160件、一覧.csv 更新`)
  if (failed.length) {
    console.warn(`生成できなかったキャラ:\n  ${failed.join('\n  ')}`)
  }
}

// 直接実行されたときだけ生成する
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main()
}

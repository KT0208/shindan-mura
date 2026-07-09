// 診断村: 表示用の縮小キャラ画像を一括生成する。
//
// 生成物: public/characters-small/{basePath}/{imageKey}.webp (幅640px・quality80)
//
// 事前準備: npm install -D sharp (generate:ogp と共通)
// 実行:     npm run optimize:images
//   - 生成済みのファイルはスキップする。作り直したい場合は --force を付ける。
//   - 新キャラ画像を public/characters/ に追加したら、これを再実行するだけでよい。
//
// サイト表示は縮小版(/characters-small/)を使い、
// 元画像(/characters/)はOGP画像・ストーリー共有画像の生成用に残す。

import { mkdir, readdir, access, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(projectRoot, 'public', 'characters')
const dstDir = path.join(projectRoot, 'public', 'characters-small')
const force = process.argv.includes('--force')

const WIDTH = 640
const QUALITY = 80

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('sharp が見つかりません。先に `npm install -D sharp` を実行してください。')
    process.exit(1)
  }

  let created = 0
  let skipped = 0
  const failed = []

  const entries = await readdir(srcDir, { recursive: true })
  for (const rel of entries) {
    if (!rel.endsWith('.webp')) continue
    const src = path.join(srcDir, rel)
    const dst = path.join(dstDir, rel)

    if (!force && (await exists(dst))) {
      skipped++
      continue
    }
    if ((await stat(src)).size === 0) {
      failed.push(`${rel} (0バイトの壊れたファイル)`)
      continue
    }

    await mkdir(path.dirname(dst), { recursive: true })
    try {
      await sharp(src).resize({ width: WIDTH }).webp({ quality: QUALITY }).toFile(dst)
      created++
    } catch (e) {
      failed.push(`${rel} (${e.message})`)
    }
  }

  console.log(`縮小画像: ${created} 枚生成 / ${skipped} 枚スキップ(既存)`)
  if (failed.length) {
    console.warn(`生成できなかった画像:\n  ${failed.join('\n  ')}`)
  }
}

main()

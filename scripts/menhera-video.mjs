#!/usr/bin/env node
// メンヘラクラゲ動画: 生成→レンダリング→(任意で)YouTube投稿 までをコマンド一発で。
//
// 使い方:
//   node scripts/menhera-video.mjs --format random               # ランダムで1本 生成+レンダリング(投稿なし)
//   node scripts/menhera-video.mjs --format 4koma --koma kidoku  # 4コマ(既読スルーの夜)
//   node scripts/menhera-video.mjs --format aruaru --jelly 8     # 迷宮クラゲの短尺あるある
//   node scripts/menhera-video.mjs --format montage              # 16種メーター上昇(30秒)
//   ... に --upload を足すと投稿。--privacy private / --when "2026-10-20T19:00"(JST予約) も指定可
//
// フォーマット: montage | 4koma | aruaru | random
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, copyFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TOOL = join(ROOT, 'tools', 'menhera-video')
const OUT = join(TOOL, 'out')
const RENDERS = join(TOOL, 'renders')
// npmキャッシュ権限バグ回避(auth時に作った安定キャッシュを再利用)
const ENV = { ...process.env, npm_config_cache: process.env.npm_config_cache || join(os.homedir(), '.npmcache-hf') }

const args = process.argv.slice(2)
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const has = (k) => args.includes(k)
const DIAG = 'https://shindanmura.com/#diagnosis=menhera-level'

function run(cmd, cmdArgs, cwd) {
  console.log(`\n▶ ${cmd} ${cmdArgs.join(' ')}`)
  return execFileSync(cmd, cmdArgs, { cwd: cwd || ROOT, env: ENV, stdio: 'inherit' })
}
function runSoft(cmd, cmdArgs, cwd, label) {
  try { run(cmd, cmdArgs, cwd) } catch { console.log(`\n⚠ ${label} に失敗しました(上のメッセージ参照)。動画は保存済みなので、原因を直して再実行できます。`) }
}

function metaFor(m) {
  // m = {format, koma?, jelly?}
  const tagsBase = ['診断村', 'メンヘラ度診断', 'メンヘラ', 'メンヘラクラゲ', '心理テスト', '診断', 'shorts']
  const foot = `\n\n▶ 無料で診断する: ${DIAG}\n診断村は無料で遊べる恋愛診断・性格診断・心理テストのサイトです。\nhttps://shindanmura.com\n\n#診断村 #メンヘラ度診断 #メンヘラあるある #心理テスト #shorts`
  if (m.format === 'montage') {
    return {
      title: 'あなたのメンヘラ度どこまで沈む？16種のメンヘラクラゲ診断 #shorts',
      description: `軽いクラゲ→重いクラゲ、あなたはどこまで沈む？16種のメンヘラクラゲで"メンヘラ度"を診断。${foot}`,
      tags: tagsBase,
    }
  }
  if (m.format === '4koma') {
    const titles = { 'three-min': '返信3分ルール', 'self-contradict': '既読でいいよ、の嘘', 'heavy-love': 'いってらっしゃいの裏側' }
    const t = titles[m.koma] || 'メンヘラあるある'
    return {
      title: `メンヘラあるある4コマ『${t}』 #shorts`,
      description: `メンヘラあるある4コマ「${t}」。共感したら、あなたは何クラゲ？${foot}`,
      tags: [...tagsBase, '4コマ', 'あるある'],
    }
  }
  // aruaru
  return {
    title: `メンヘラあるある｜あなたは何クラゲ？ #shorts`,
    description: `メンヘラあるある。あなたに当てはまるクラゲは…？${foot}`,
    tags: [...tagsBase, 'あるある'],
  }
}

function newestMp4(dir) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.mp4')).map((f) => join(dir, f))
  if (!files.length) throw new Error('レンダリング結果(.mp4)が見つかりません: ' + dir)
  return files.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
}

// 1) 生成
const genArgs = ['generate.mjs']
for (const k of ['--format', '--koma', '--jelly', '--seed']) { const v = getArg(k, null); if (v) genArgs.push(k, v) }
run('node', genArgs, TOOL)
const lastMeta = JSON.parse(readFileSync(join(TOOL, '.lastmeta.json'), 'utf8'))

// 2) レンダリング
run('npx', ['--yes', 'hyperframes@latest', 'render'], TOOL)
const rendered = newestMp4(RENDERS)

// 3) 出力+sidecar
mkdirSync(OUT, { recursive: true })
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
const base = `menhera-${lastMeta.format}${lastMeta.koma ? '-' + lastMeta.koma : ''}${lastMeta.jelly != null ? '-j' + lastMeta.jelly : ''}-${stamp}`
const outMp4 = join(OUT, base + '.mp4')
copyFileSync(rendered, outMp4)
const meta = metaFor(lastMeta)
const sidecar = join(OUT, base + '.json')
writeFileSync(sidecar, JSON.stringify({ videoFile: outMp4, ...meta }, null, 1))
// デスクトップにもコピー(手動アップ用)
try { copyFileSync(outMp4, join(os.homedir(), 'Desktop', base + '.mp4')) } catch {}

console.log(`\n✅ 完成: ${outMp4}`)
console.log(`   タイトル: ${meta.title}`)
console.log(`   (デスクトップにもコピーしました)`)

// 4) 任意で投稿
let posted = false
if (has('--upload')) {
  const upArgs = ['scripts/upload_short.py', '--video', outMp4]
  const privacy = getArg('--privacy', 'public'); upArgs.push('--privacy', privacy)
  const when = getArg('--when', null); if (when) upArgs.push('--publish-at', when)
  console.log('\n📤 YouTubeへアップロードします…')
  runSoft('python3', upArgs, ROOT, 'YouTube投稿')
  posted = true
}
if (has('--upload-tiktok')) {
  // TikTokは下書き(受信箱)に送る。アプリで音源・キャプションを付けて最終投稿する。
  console.log('\n📤 TikTok(下書き)へアップロードします…')
  runSoft('python3', ['scripts/upload_tiktok.py', '--video', outMp4], ROOT, 'TikTok投稿')
  posted = true
}
if (!posted) {
  console.log('\n(投稿する場合: --upload=YouTube / --upload-tiktok=TikTok下書き。例: --upload --privacy private --upload-tiktok)')
}

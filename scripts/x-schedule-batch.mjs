// 診断村: Xの「予約投稿」用に、投稿文と画像をまとめて作るスクリプト。
//
// X API の有料化で自動投稿(post-to-x.js)を止めたため、代わりに
// 「投稿文＋画像をまとめて作る → X(Web版)の予約投稿に手で登録する」運用にする。
//
// 使い方:
//   npm run x:batch                    … 明日から7日分(毎日12:00＋火水木20:00 = 10本)
//   npm run x:batch -- --days 14       … 14日分
//   npm run x:batch -- --start 2026-11-20
//
// 生成物: x-schedule/{開始日}/
//   index.html … 予約日時・投稿文(コピーボタン付き)・画像の一覧。ブラウザで開いて使う
//   01.png ... … 投稿に添付する画像(キャラを淡い背景に乗せた正方形)
//   posts.txt  … 投稿文のテキスト版
//
// 文面・キャラの選び方は自動投稿と同じ(data/social-posts.json のテンプレート)。
// 同じ回の中で、同じ文面・同じキャラが重ならないようにしている。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  buildCharacterPool,
  pickNextPost,
  readJson,
  POSTS_PATH,
  calcWeightedLength,
  MAX_TWEET_WEIGHTED_LENGTH,
} from './post-to-x.js'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_ROOT = path.join(ROOT_DIR, 'x-schedule')

// 以前の自動投稿(cron)と同じ時間帯: 毎日12:00 / 火・水・木は20:00も
const SLOTS = [
  { time: '12:00', days: [0, 1, 2, 3, 4, 5, 6] },
  { time: '20:00', days: [2, 3, 4] },
]
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const IMAGE_SIZE = 1080
const IMAGE_BG = { r: 255, g: 244, b: 251, alpha: 1 } // 診断村の淡いピンク

function argValue(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index !== -1 ? process.argv[index + 1] : undefined
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseStartDate() {
  const raw = argValue('start')
  if (raw) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
    if (!m) throw new Error(`--start は YYYY-MM-DD 形式で指定してください: ${raw}`)
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

function buildSchedule(start, days) {
  const schedule = []
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    for (const slot of SLOTS) {
      if (slot.days.includes(date.getDay())) {
        schedule.push({ date, dateKey: toDateKey(date), weekday: WEEKDAYS[date.getDay()], time: slot.time })
      }
    }
  }
  return schedule
}

// 1回分の中で文面・キャラ画像が重複しないように選ぶ
function pickUniquePosts(count, socialPosts, pool) {
  const history = readJson(path.join(ROOT_DIR, 'data', 'social-history.json'), [])
  const posts = []
  const usedTexts = new Set(history.slice(-50).map((h) => h.text))
  const usedImages = new Set()
  for (let i = 0; i < count; i += 1) {
    let post
    for (let attempt = 0; attempt < 200; attempt += 1) {
      post = pickNextPost(socialPosts, pool, history)
      const fits = calcWeightedLength(post.text) <= MAX_TWEET_WEIGHTED_LENGTH
      if (fits && !usedTexts.has(post.text) && !usedImages.has(post.imagePath)) break
    }
    usedTexts.add(post.text)
    usedImages.add(post.imagePath)
    history.push({ text: post.text })
    posts.push(post)
  }
  return posts
}

async function makeImage(src, dest) {
  const inner = Math.round(IMAGE_SIZE * 0.82)
  // 元画像は余白が大きいので、透明部分を切り取ってから配置する
  const character = await sharp(src)
    .trim()
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  await sharp({ create: { width: IMAGE_SIZE, height: IMAGE_SIZE, channels: 4, background: IMAGE_BG } })
    .composite([{ input: character, gravity: 'center' }])
    .png()
    .toFile(dest)
}

const escapeHtml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

function buildHtml(items, startKey) {
  const cards = items
    .map(
      (item, i) => `<section class="card" id="post-${i + 1}">
  <div class="meta"><span class="no">${pad(i + 1)}</span><strong>${item.dateKey}(${item.weekday}) ${item.time}</strong><span class="type">${escapeHtml(item.label)}</span></div>
  <div class="body">
    <img src="${item.imageFile}" alt="" />
    <div class="text-col">
      <textarea readonly rows="7">${escapeHtml(item.text)}</textarea>
      <div class="actions">
        <button type="button" data-copy="${i}">投稿文をコピー</button>
        <a href="${item.imageFile}" download>画像を保存</a>
        <span class="len">${item.length}/280</span>
        <label><input type="checkbox" data-done="${i}" /> 予約済み</label>
      </div>
    </div>
  </div>
</section>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>X予約投稿リスト ${startKey}</title>
<style>
  body { font-family: system-ui, -apple-system, 'Hiragino Sans', sans-serif; background: #fff4fb; color: #241436; margin: 0; padding: 24px 16px 60px; }
  .page { max-width: 860px; margin: 0 auto; }
  h1 { font-size: 20px; }
  .howto { background: #fff; border-radius: 14px; padding: 12px 18px; font-size: 14px; line-height: 1.8; }
  .card { background: #fff; border-radius: 16px; padding: 16px; margin-top: 16px; box-shadow: 0 6px 20px rgba(97,72,127,.12); }
  .card.done { opacity: .45; }
  .meta { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
  .no { background: #8f4ed8; color: #fff; border-radius: 999px; padding: 2px 10px; font-size: 13px; }
  .type { font-size: 12px; color: #8f4ed8; background: #f6ecff; padding: 2px 10px; border-radius: 999px; }
  .body { display: flex; gap: 16px; }
  .body img { width: 160px; height: 160px; border-radius: 12px; flex-shrink: 0; }
  .text-col { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; border: 1px solid #e6d8f3; border-radius: 10px; padding: 8px; resize: vertical; }
  .actions { display: flex; gap: 14px; align-items: center; font-size: 13px; flex-wrap: wrap; }
  button { background: linear-gradient(135deg, #ff67ad, #8f4ed8); color: #fff; border: 0; border-radius: 999px; padding: 8px 16px; font-weight: 700; cursor: pointer; }
  .actions a { color: #8e5fc6; }
  .len { color: #8f7ba6; }
  @media (max-width: 600px) { .body { flex-direction: column; } .body img { width: 120px; height: 120px; } }
</style>
</head>
<body>
<div class="page">
  <h1>X予約投稿リスト(${items.length}本)</h1>
  <div class="howto">
    手順: Xの「ポストする」→ 投稿文を貼り付け → 画像を添付 → カレンダーアイコン(予約設定)で日時を指定 → 「予約設定」。<br />
    終わったら「予約済み」にチェック(このブラウザに記録されます)。
  </div>
${cards}
</div>
<script>
  const texts = ${JSON.stringify(items.map((item) => item.text)).replaceAll('<', '\\u003c')};
  const storeKey = 'x-schedule-done-${startKey}';
  const done = new Set(JSON.parse(localStorage.getItem(storeKey) || '[]'));
  document.querySelectorAll('[data-done]').forEach((box) => {
    const i = Number(box.dataset.done);
    const card = box.closest('.card');
    box.checked = done.has(i);
    card.classList.toggle('done', box.checked);
    box.addEventListener('change', () => {
      box.checked ? done.add(i) : done.delete(i);
      card.classList.toggle('done', box.checked);
      localStorage.setItem(storeKey, JSON.stringify([...done]));
    });
  });
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = texts[Number(button.dataset.copy)];
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = button.closest('.text-col').querySelector('textarea');
        area.select();
        document.execCommand('copy');
      }
      const label = button.textContent;
      button.textContent = 'コピーしました';
      setTimeout(() => { button.textContent = label; }, 1500);
    });
  });
</script>
</body>
</html>
`
}

async function main() {
  const days = Number(argValue('days') || 7)
  if (!Number.isInteger(days) || days < 1 || days > 31) throw new Error('--days は 1〜31 で指定してください')
  const start = parseStartDate()
  const schedule = buildSchedule(start, days)

  const socialPosts = readJson(POSTS_PATH, {})
  const pool = buildCharacterPool()
  if (pool.length === 0) throw new Error('キャラクタープールが空です')
  const posts = pickUniquePosts(schedule.length, socialPosts, pool)

  const startKey = toDateKey(start)
  const outDir = path.join(OUT_ROOT, startKey)
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })

  const items = []
  for (const [i, slot] of schedule.entries()) {
    const post = posts[i]
    const imageFile = `${pad(i + 1)}.png`
    await makeImage(post.imagePath, path.join(outDir, imageFile))
    items.push({ ...slot, label: post.label, text: post.text, imageFile, length: calcWeightedLength(post.text) })
  }

  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(items, startKey), 'utf8')
  const plain = items
    .map((item, i) => `#${pad(i + 1)} ${item.dateKey}(${item.weekday}) ${item.time} [${item.imageFile}]\n${item.text}`)
    .join('\n\n----------------\n\n')
  fs.writeFileSync(path.join(outDir, 'posts.txt'), `${plain}\n`, 'utf8')

  console.log(`[x-batch] ${items.length}本を作成しました: ${path.relative(ROOT_DIR, outDir)}/index.html`)
}

main().catch((error) => {
  console.error('[x-batch] エラー:', error.message)
  process.exitCode = 1
})

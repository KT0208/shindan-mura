// 診断村: Instagramの「予約投稿」用に、画像とキャプションをまとめて作るスクリプト。
//
// FacebookアカウントのMeta広告制限によりInstagram APIが使えないため、
// 「素材をまとめて作る → Meta Business Suite(PC)の予約投稿に手で登録する」運用にする。
//
// 使い方:
//   npm run ig:batch                     … 明日から7日分(毎日1本・19:00目安)
//   npm run ig:batch -- --days 14        … 14日分
//   npm run ig:batch -- --start 2026-11-20
//   npm run ig:batch -- --time 21:00     … 予約時刻の目安を変える
//
// 生成物: ig-schedule/{開始日}/
//   index.html  … 予約日時・画像・キャプション(コピーボタン付き)の一覧。ブラウザで開いて使う
//   01-feed.jpg  … フィード投稿用 1080x1350
//   01-story.jpg … ストーリーズ用 1080x1920(使う場合だけ)
//   captions.txt … キャプションのテキスト版
//
// 画像・キャプションのデザインは generate-instagram.mjs と共通。
// 過去の回で使ったキャラは ig-schedule/history.json に記録し、全キャラを一巡するまで重複させない。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { diagnoses } from '../src/diagnosisData.js'
import { resultDetails } from '../src/resultDetails.js'
import { characterCollections } from './generate-share-pages.mjs'
import { buildFeedSvg, buildStorySvg, buildCaption, composite } from './generate-instagram.mjs'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = path.join(ROOT_DIR, 'public')
const OUT_ROOT = path.join(ROOT_DIR, 'ig-schedule')
const HISTORY_PATH = path.join(OUT_ROOT, 'history.json')
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function argValue(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index !== -1 ? process.argv[index + 1] : undefined
}

const pad = (n) => String(n).padStart(2, '0')
const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

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

function buildPool() {
  const pool = []
  for (const diagnosis of diagnoses) {
    if (diagnosis.hidden) continue
    const collection = characterCollections[diagnosis.id]
    if (!collection) continue
    for (const [resultTitle, character] of Object.entries(collection.characters)) {
      const imagePath = path.join(PUBLIC_DIR, 'characters', collection.basePath, `${character.imageKey}.webp`)
      if (!fs.existsSync(imagePath) || fs.statSync(imagePath).size === 0) continue
      pool.push({ diagnosis, resultTitle, character, imagePath })
    }
  }
  return pool
}

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 未使用キャラから選ぶ。同じ回の中では同じ診断が続かないようにする
function pickCharacters(pool, count, used) {
  let candidates = pool.filter((p) => !used.has(p.character.imageKey))
  if (candidates.length < count) {
    console.log('[ig-batch] 全キャラを一巡したので、使用履歴をリセットします')
    used.clear()
    candidates = pool
  }
  const picked = []
  const rest = shuffle(candidates)
  while (picked.length < count && rest.length > 0) {
    const lastId = picked.at(-1)?.diagnosis.id
    const index = rest.findIndex((p) => p.diagnosis.id !== lastId)
    picked.push(rest.splice(index === -1 ? 0 : index, 1)[0])
  }
  return picked
}

const escapeHtml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

function buildHtml(items, startKey) {
  const cards = items
    .map(
      (item, i) => `<section class="card">
  <div class="meta"><span class="no">${pad(i + 1)}</span><strong>${item.dateKey}(${item.weekday}) ${item.time}</strong><span class="type">${escapeHtml(item.diagnosisTitle)}</span></div>
  <div class="body">
    <img src="${item.feedFile}" alt="" />
    <div class="text-col">
      <textarea readonly rows="10">${escapeHtml(item.caption)}</textarea>
      <div class="actions">
        <button type="button" data-copy="${i}">キャプションをコピー</button>
        <a href="${item.feedFile}" download>フィード画像</a>
        <a href="${item.storyFile}" download>ストーリー画像</a>
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
<title>Instagram予約投稿リスト ${startKey}</title>
<style>
  body { font-family: system-ui, -apple-system, 'Hiragino Sans', sans-serif; background: #fff4fb; color: #241436; margin: 0; padding: 24px 16px 60px; }
  .page { max-width: 900px; margin: 0 auto; }
  h1 { font-size: 20px; }
  .howto { background: #fff; border-radius: 14px; padding: 12px 18px; font-size: 14px; line-height: 1.8; }
  .card { background: #fff; border-radius: 16px; padding: 16px; margin-top: 16px; box-shadow: 0 6px 20px rgba(97,72,127,.12); }
  .card.done { opacity: .45; }
  .meta { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
  .no { background: #8f4ed8; color: #fff; border-radius: 999px; padding: 2px 10px; font-size: 13px; }
  .type { font-size: 12px; color: #8f4ed8; background: #f6ecff; padding: 2px 10px; border-radius: 999px; }
  .body { display: flex; gap: 16px; }
  .body img { width: 180px; height: 225px; object-fit: cover; border-radius: 12px; flex-shrink: 0; }
  .text-col { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 13px; border: 1px solid #e6d8f3; border-radius: 10px; padding: 8px; resize: vertical; }
  .actions { display: flex; gap: 14px; align-items: center; font-size: 13px; flex-wrap: wrap; }
  button { background: linear-gradient(135deg, #ff67ad, #8f4ed8); color: #fff; border: 0; border-radius: 999px; padding: 8px 16px; font-weight: 700; cursor: pointer; }
  .actions a { color: #8e5fc6; }
  @media (max-width: 600px) { .body { flex-direction: column; } }
</style>
</head>
<body>
<div class="page">
  <h1>Instagram予約投稿リスト(${items.length}本)</h1>
  <div class="howto">
    手順: Meta Business Suite →「投稿を作成」→ フィード画像を追加 → キャプションを貼り付け →「日時を指定」で予約。<br />
    ストーリー画像は、ストーリーズにも出したいときだけ使ってください。終わったら「予約済み」にチェック(このブラウザに記録されます)。
  </div>
${cards}
</div>
<script>
  const texts = ${JSON.stringify(items.map((item) => item.caption)).replaceAll('<', '\\u003c')};
  const storeKey = 'ig-schedule-done-${startKey}';
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
  const time = argValue('time') || '19:00'
  const start = parseStartDate()
  const startKey = toDateKey(start)

  const pool = buildPool()
  if (pool.length === 0) throw new Error('キャラクターが見つかりません')
  fs.mkdirSync(OUT_ROOT, { recursive: true })
  const used = new Set(fs.existsSync(HISTORY_PATH) ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')) : [])
  const picked = pickCharacters(pool, days, used)

  const outDir = path.join(OUT_ROOT, startKey)
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })

  const items = []
  for (const [i, entry] of picked.entries()) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const { diagnosis, resultTitle, character, imagePath } = entry
    const labels = { diagnosisTitle: diagnosis.title, characterName: character.characterName, resultTitle }
    const feedFile = `${pad(i + 1)}-feed.jpg`
    const storyFile = `${pad(i + 1)}-story.jpg`
    await composite(sharp, buildFeedSvg(labels), imagePath, { cx: 540, cy: 620, size: 640 }, path.join(outDir, feedFile))
    await composite(sharp, buildStorySvg(labels), imagePath, { cx: 540, cy: 900, size: 680 }, path.join(outDir, storyFile))
    const caption = buildCaption({ diagnosis, resultTitle, character, detail: resultDetails[diagnosis.id]?.[resultTitle] })
    items.push({ dateKey: toDateKey(date), weekday: WEEKDAYS[date.getDay()], time, diagnosisTitle: diagnosis.title, caption, feedFile, storyFile })
    used.add(character.imageKey)
  }

  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(items, startKey), 'utf8')
  const plain = items
    .map((item, i) => `#${pad(i + 1)} ${item.dateKey}(${item.weekday}) ${item.time} [${item.feedFile}]\n${item.caption}`)
    .join('\n\n----------------\n\n')
  fs.writeFileSync(path.join(outDir, 'captions.txt'), `${plain}\n`, 'utf8')
  fs.writeFileSync(HISTORY_PATH, `${JSON.stringify([...used], null, 2)}\n`, 'utf8')

  console.log(`[ig-batch] ${items.length}本を作成しました: ${path.relative(ROOT_DIR, outDir)}/index.html (未使用キャラ残り ${pool.length - used.size}体)`)
}

main().catch((error) => {
  console.error('[ig-batch] エラー:', error.message)
  process.exitCode = 1
})

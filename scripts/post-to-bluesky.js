// 診断村: Bluesky(bsky.social)への自動投稿。
// Xと同じ投稿内容(social-posts.json)を生成して、Blueskyにも画像付きで流す。
//
// 使い方:
//   node scripts/post-to-bluesky.js            … 実際に投稿
//   node scripts/post-to-bluesky.js --dry-run  … 投稿文の確認のみ
//
// 認証: data/bluesky-credentials.json
//   { "identifier": "shindanmura.bsky.social", "appPassword": "xxxx-xxxx-xxxx-xxxx" }
//   ※通常のログインパスワードではなく「アプリパスワード」を使うこと(設定→アプリパスワード)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCharacterPool, pickNextPost, POSTS_PATH, readJson } from './post-to-x.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CRED = path.join(ROOT, 'data', 'bluesky-credentials.json')
const HISTORY = path.join(ROOT, 'data', 'bluesky-history.json')
const PDS = 'https://bsky.social'
const MAX_GRAPHEMES = 300  // Blueskyの上限(Xの280より少し多い)

const isDryRun = process.argv.includes('--dry-run')

function loadHist() {
  try { return JSON.parse(fs.readFileSync(HISTORY, 'utf8')) } catch { return [] }
}
function saveHist(h) {
  fs.writeFileSync(HISTORY, JSON.stringify(h.slice(-200), null, 2) + '\n')
}

// URLをリンク化するための facets(Blueskyはリンクを自前で範囲指定する)
function detectFacets(text) {
  const facets = []
  const enc = new TextEncoder()
  const re = /https?:\/\/[^\s]+/g
  let m
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(0, m.index)
    const start = enc.encode(before).length
    const end = start + enc.encode(m[0]).length
    facets.push({
      index: { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: m[0] }],
    })
  }
  return facets
}

async function login(identifier, appPassword) {
  const res = await fetch(`${PDS}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password: appPassword }),
  })
  if (!res.ok) throw new Error(`ログイン失敗 (${res.status}): ${await res.text()}`)
  return res.json()  // { accessJwt, did, ... }
}

async function uploadBlob(session, imagePath) {
  const data = fs.readFileSync(imagePath)
  const ext = path.extname(imagePath).toLowerCase()
  const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'
  const res = await fetch(`${PDS}/xrpc/com.atproto.repo.uploadBlob`, {
    method: 'POST',
    headers: { 'Content-Type': mime, Authorization: `Bearer ${session.accessJwt}` },
    body: data,
  })
  if (!res.ok) throw new Error(`画像アップロード失敗 (${res.status}): ${await res.text()}`)
  return (await res.json()).blob
}

async function createPost(session, text, blob, altText) {
  const record = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    langs: ['ja'],
    facets: detectFacets(text),
  }
  if (blob) {
    record.embed = {
      $type: 'app.bsky.embed.images',
      images: [{ alt: altText || '', image: blob }],
    }
  }
  const res = await fetch(`${PDS}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessJwt}` },
    body: JSON.stringify({ repo: session.did, collection: 'app.bsky.feed.post', record }),
  })
  if (!res.ok) throw new Error(`投稿失敗 (${res.status}): ${await res.text()}`)
  return res.json()
}

async function main() {
  const socialPosts = readJson(POSTS_PATH, {})
  const pool = buildCharacterPool()
  if (pool.length === 0) throw new Error('キャラクタープールが空です')

  const history = loadHist()
  const post = pickNextPost(socialPosts, pool, history)
  const graphemes = [...post.text].length

  console.log(`[bluesky] type=${post.type} (${post.label})`)
  console.log(`[bluesky] 文字数=${graphemes}/${MAX_GRAPHEMES}`)
  console.log('---- 投稿文 ----')
  console.log(post.text)
  console.log('----------------')
  console.log(`image=${post.imagePath}`)

  if (graphemes > MAX_GRAPHEMES) throw new Error('文字数オーバー')
  if (post.imagePath && !fs.existsSync(post.imagePath)) {
    console.warn('画像が見つからないため、テキストのみで投稿します')
    post.imagePath = null
  }
  if (isDryRun) {
    console.log('[bluesky] --dry-run のため投稿しません')
    return
  }

  const cred = readJson(CRED, null)
  if (!cred || !cred.identifier || !cred.appPassword) {
    throw new Error(`${CRED} に identifier と appPassword を設定してください`)
  }
  const session = await login(cred.identifier, cred.appPassword)
  const blob = post.imagePath ? await uploadBlob(session, post.imagePath) : null
  const res = await createPost(session, post.text, blob, post.label)
  console.log(`[bluesky] 投稿成功: ${res.uri}`)

  history.push({ postedAt: new Date().toISOString(), type: post.type, text: post.text, uri: res.uri })
  saveHist(history)
}

main().catch((e) => {
  console.error('[bluesky] エラー:', e.message)
  process.exitCode = 1
})

// アップ済みYouTube Shortsのうち最新の「公開」動画をXに告知ポストする
// 使い方: node scripts/announce_short_x.mjs            … 実投稿
//         node scripts/announce_short_x.mjs --dry-run  … 投稿文の確認のみ
// Xの鍵: 環境変数(X_API_KEY等) または data/x-credentials.json
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { uploadMedia, postTweet, loadCredentials, calcWeightedLength, MAX_TWEET_WEIGHTED_LENGTH } from './post-to-x.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const UPLOADED = path.join(ROOT, 'data', 'shorts-uploaded.json')
const ANNOUNCED = path.join(ROOT, 'data', 'shorts-announced.json')
const SHORTS_DATA = path.join(ROOT, 'data', 'shorts-data.json')
const CRED_FILE = path.join(ROOT, 'data', 'x-credentials.json')

const isDryRun = process.argv.includes('--dry-run')

// 鍵ファイルがあれば環境変数に流し込む(環境変数が既にあればそちらを優先)
if (fs.existsSync(CRED_FILE)) {
  const creds = JSON.parse(fs.readFileSync(CRED_FILE, 'utf8'))
  for (const key of ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET']) {
    if (!process.env[key] && creds[key]) process.env[key] = creds[key]
  }
}

const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback)

const uploaded = readJson(UPLOADED, [])
const announced = readJson(ANNOUNCED, [])
const announcedIds = new Set(announced.map((a) => a.videoId))

// 告知対象: 「公開済み」または「予約公開の時刻を過ぎた」未告知動画(古い順・最大2本)
const now = Date.now()
const dueList = uploaded.filter((u) => {
  if (announcedIds.has(u.videoId)) return false
  if (u.privacy === 'public') return true
  if (u.privacy === 'scheduled' && u.publishAt) return Date.parse(u.publishAt) <= now
  return false
}).slice(0, 2)
if (dueList.length === 0) {
  console.log('[announce-short] 告知対象がありません(公開時刻前/すべて告知済み)')
  process.exit(0)
}
const target = dueList[0]
if (dueList.length > 1) {
  console.log(`[announce-short] 告知待ちが${dueList.length}本あります(今回は1本告知、次回実行で続き)`)
}

const imageKey = target.file.replace(/^\d{4}-\d{2}-\d{2}_/, '').replace(/\.mp4$/, '')
const entry = readJson(SHORTS_DATA, []).find((e) => e.imagePath.endsWith(`/${imageKey}.webp`))
if (!entry) {
  console.error(`[announce-short] shorts-data.jsonにキャラが見つかりません: ${imageKey}`)
  process.exit(1)
}

const videoUrl = `https://youtube.com/shorts/${target.videoId}`
const tag = entry.diagnosisTitle.replace(/\s/g, '')
const text = [
  `🎬 今日の村人ショート公開!`,
  `${entry.characterName}(${entry.resultTitle})`,
  ``,
  `▶ ${videoUrl}`,
  ``,
  `無料で診断: ${entry.diagnosisUrl}`,
  `#診断村 #${tag} #Shorts`,
].join('\n')

const imagePath = path.join(ROOT, entry.imagePath.replace('public/characters/', 'public/characters-small/'))

const weighted = calcWeightedLength(text)
console.log(`[announce-short] ${entry.characterName} / ${videoUrl}`)
console.log(`[announce-short] weightedLength=${weighted}/${MAX_TWEET_WEIGHTED_LENGTH}`)
console.log('---- 投稿文 ----')
console.log(text)
console.log('----------------')
console.log(`image=${imagePath}`)

if (weighted > MAX_TWEET_WEIGHTED_LENGTH) {
  console.error('[announce-short] 文字数オーバーのため中止')
  process.exit(1)
}
if (isDryRun) {
  console.log('[announce-short] --dry-run のため投稿しません')
  process.exit(0)
}

const credentials = loadCredentials()
const mediaId = await uploadMedia(imagePath, credentials)
const res = await postTweet(text, mediaId, credentials)
const tweetId = res?.data?.id || null
announced.push({ videoId: target.videoId, tweetId, postedAt: new Date().toISOString() })
fs.writeFileSync(ANNOUNCED, JSON.stringify(announced, null, 1))
console.log(`[announce-short] X告知成功: tweetId=${tweetId}`)

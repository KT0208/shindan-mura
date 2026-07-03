// 診断村: X(Twitter)への自動投稿スクリプト。
//
// 使い方:
//   node scripts/post-to-x.js            … 実際に投稿する(GitHub Actionsで使用)
//   node scripts/post-to-x.js --dry-run  … 投稿文・画像パスを生成してログに出すだけ(実際には投稿しない)
//   npm run post:x                        … 上と同じ(実投稿)
//   npm run post:x:test                   … --dry-run 付きで実行(ローカルの安全なテスト用)
//
// 将来 Instagram / Threads にも対応する場合は、
// 「投稿内容を作る(pickNextPost)」と「実際に投稿する(uploadMedia/postTweet)」を分離してあるので、
// postTweet 相当の関数を追加してプラットフォームごとに呼び分ける形で拡張できる。
//
// 必要な環境変数(GitHub Secretsで管理する想定):
//   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
// (--dry-run 実行時はこれらが無くても動作確認できる)

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

import {
  hiddenPersonalityCharacters,
  loveComplicatedCharacters,
  menheraLevelCharacters,
  snsApprovalCharacters,
  dangerousManCharacters,
  darkFallCharacters,
  popularitySeasonCharacters,
  moneyLuckCharacters,
  workStyleCharacters,
  lifeBugCharacters,
} from '../src/characterData.js'
import { diagnoses } from '../src/diagnosisData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT_DIR, 'public')
const POSTS_PATH = path.join(ROOT_DIR, 'data', 'social-posts.json')
const HISTORY_PATH = path.join(ROOT_DIR, 'data', 'social-history.json')

const SITE_URL = 'https://shindanmura.com/'
const MAX_TWEET_WEIGHTED_LENGTH = 280
const MAX_HISTORY_ENTRIES = 200
const MAX_PICK_ATTEMPTS = 30

// diagnosisId -> キャラクター画像が入っているフォルダ名 と キャラクターデータ。
// (src/App.jsx の getCharacterCollection と同じ対応関係)
const CHARACTER_COLLECTIONS = {
  'love-complicated': { basePath: 'love', characters: loveComplicatedCharacters },
  'hidden-personality': { basePath: 'hidden-personality', characters: hiddenPersonalityCharacters },
  'menhera-level': { basePath: 'menheraLevelCharacters', characters: menheraLevelCharacters },
  'sns-approval': { basePath: 'snsApprovalCharacters', characters: snsApprovalCharacters },
  'dangerous-man': { basePath: 'dangerousManCharacters', characters: dangerousManCharacters },
  'dark-fall': { basePath: 'darkFallCharacters', characters: darkFallCharacters },
  'popularity-season': { basePath: 'popularitySeasonCharacters', characters: popularitySeasonCharacters },
  'money-luck': { basePath: 'moneyLuckCharacters', characters: moneyLuckCharacters },
  'work-style': { basePath: 'workStyleCharacters', characters: workStyleCharacters },
  'life-bug': { basePath: 'lifeBugCharacters', characters: lifeBugCharacters },
}

// キャラクターを使わない投稿タイプ(診断あるある等)で使う、村の雰囲気画像。
const GENERIC_IMAGES = [
  'images/top/top-village-day.webp',
  'images/top/top-village-evening.webp',
  'images/top/top-village-night.webp',
  'images/gates/gate-day.webp',
  'images/gates/gate-evening.webp',
  'images/gates/gate-night.webp',
]

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`[post-to-x] ${filePath} の読み込みに失敗したため、デフォルト値を使用します: ${error.message}`)
    return fallback
  }
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.webp') return 'image/webp'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.gif') return 'image/gif'
  return 'application/octet-stream'
}

// Xの実際の文字数カウントを再現する。
// - 全角(CJK等)の文字は2文字分としてカウントされる
// - URLはt.coで自動的に短縮され、実際の文字数に関わらず一律23文字分としてカウントされる
function isWideCodePoint(codePoint) {
  return (
    (codePoint >= 0x1100 && codePoint <= 0x115f) ||
    codePoint === 0x2329 ||
    codePoint === 0x232a ||
    (codePoint >= 0x2e80 && codePoint <= 0x303e) ||
    (codePoint >= 0x3041 && codePoint <= 0x33ff) ||
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) ||
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0xa000 && codePoint <= 0xa4cf) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe4f) ||
    (codePoint >= 0xff00 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
    (codePoint >= 0x1f300 && codePoint <= 0x1faff) ||
    (codePoint >= 0x20000 && codePoint <= 0x3fffd)
  )
}

function calcWeightedLength(text) {
  const withUrlPlaceholder = text.split(SITE_URL).join('#'.repeat(23))
  let total = 0
  for (const character of withUrlPlaceholder) {
    const codePoint = character.codePointAt(0)
    total += isWideCodePoint(codePoint) ? 2 : 1
  }
  return total
}

function fillTemplate(template, context) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (
    context[key] !== undefined && context[key] !== null ? String(context[key]) : match
  ))
}

// ---------------------------------------------------------------------------
// 投稿内容の組み立て
// ---------------------------------------------------------------------------

function buildCharacterPool() {
  const pool = []

  for (const diagnosisItem of diagnoses) {
    const collection = CHARACTER_COLLECTIONS[diagnosisItem.id]
    if (!collection) continue

    for (const [resultTitle, character] of Object.entries(collection.characters)) {
      pool.push({
        diagnosisId: diagnosisItem.id,
        diagnosisTitle: diagnosisItem.title,
        diagnosisCategory: diagnosisItem.category,
        emoji: diagnosisItem.emoji || '',
        resultTitle,
        characterName: character.characterName,
        role: character.role,
        visualConcept: character.visualConcept,
        imagePath: path.join(PUBLIC_DIR, 'characters', collection.basePath, `${character.imageKey}.webp`),
      })
    }
  }

  return pool
}

function generateRandomPost(socialPosts, characterPool) {
  const types = Object.keys(socialPosts)
  const type = pickRandom(types)
  const config = socialPosts[type]
  const template = pickRandom(config.templates)

  let context
  let imagePath

  if (config.usesCharacter) {
    const character = pickRandom(characterPool)
    context = {
      characterName: character.characterName,
      role: character.role,
      visualConcept: character.visualConcept,
      diagnosisTitle: character.diagnosisTitle,
      diagnosisCategory: character.diagnosisCategory,
      resultTitle: character.resultTitle,
      emoji: character.emoji,
      url: SITE_URL,
    }
    imagePath = character.imagePath
  } else {
    const diagnosisItem = pickRandom(diagnoses)
    context = {
      characterName: '',
      role: '',
      visualConcept: '',
      diagnosisTitle: diagnosisItem.title,
      diagnosisCategory: diagnosisItem.category,
      resultTitle: '',
      emoji: diagnosisItem.emoji || '',
      url: SITE_URL,
    }
    imagePath = path.join(PUBLIC_DIR, pickRandom(GENERIC_IMAGES))
  }

  const text = fillTemplate(template, context)

  return { type, label: config.label, text, imagePath }
}

// 直前の投稿と同じ内容にならないように、必要ならやり直す。
function pickNextPost(socialPosts, characterPool, history) {
  const lastEntry = history.length > 0 ? history[history.length - 1] : null

  for (let attempt = 0; attempt < MAX_PICK_ATTEMPTS; attempt += 1) {
    const candidate = generateRandomPost(socialPosts, characterPool)
    const isSameAsLast = lastEntry && lastEntry.text === candidate.text

    if (!isSameAsLast) {
      return candidate
    }
  }

  console.warn(`[post-to-x] ${MAX_PICK_ATTEMPTS}回試しても直前と異なる投稿を選べなかったため、そのまま使用します。`)
  return generateRandomPost(socialPosts, characterPool)
}

// ---------------------------------------------------------------------------
// 投稿履歴
// ---------------------------------------------------------------------------

function loadHistory() {
  const data = readJson(HISTORY_PATH, [])
  return Array.isArray(data) ? data : []
}

function appendHistory(history, entry) {
  const nextHistory = [...history, entry].slice(-MAX_HISTORY_ENTRIES)
  fs.writeFileSync(HISTORY_PATH, `${JSON.stringify(nextHistory, null, 2)}\n`, 'utf8')
}

// ---------------------------------------------------------------------------
// X(Twitter) API 連携 (OAuth 1.0a, 追加ライブラリ無しでNode組み込み機能のみで実装)
// ---------------------------------------------------------------------------

function oauthEncode(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

function buildOAuthAuthorizationHeader({ method, url, credentials }) {
  const oauthParams = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.accessToken,
    oauth_version: '1.0',
  }

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((key) => `${oauthEncode(key)}=${oauthEncode(oauthParams[key])}`)
    .join('&')

  const baseString = [method.toUpperCase(), oauthEncode(url), oauthEncode(paramString)].join('&')
  const signingKey = `${oauthEncode(credentials.apiSecret)}&${oauthEncode(credentials.accessSecret)}`
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')

  const headerParams = { ...oauthParams, oauth_signature: signature }

  return `OAuth ${Object.keys(headerParams)
    .sort()
    .map((key) => `${oauthEncode(key)}="${oauthEncode(headerParams[key])}"`)
    .join(', ')}`
}

function loadCredentials() {
  const apiKey = process.env.X_API_KEY
  const apiSecret = process.env.X_API_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessSecret = process.env.X_ACCESS_SECRET

  const missingKeys = Object.entries({
    X_API_KEY: apiKey,
    X_API_SECRET: apiSecret,
    X_ACCESS_TOKEN: accessToken,
    X_ACCESS_SECRET: accessSecret,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingKeys.length > 0) {
    throw new Error(`次の環境変数が設定されていません: ${missingKeys.join(', ')}`)
  }

  return { apiKey, apiSecret, accessToken, accessSecret }
}

async function uploadMedia(imagePath, credentials) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`画像ファイルが見つかりません: ${imagePath}`)
  }

  const url = 'https://upload.twitter.com/1.1/media/upload.json'
  const authHeader = buildOAuthAuthorizationHeader({ method: 'POST', url, credentials })

  const fileBuffer = fs.readFileSync(imagePath)
  const fileBlob = new Blob([fileBuffer], { type: mimeTypeFor(imagePath) })
  const form = new FormData()
  form.append('media', fileBlob, path.basename(imagePath))

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: authHeader },
    body: form,
  })

  const bodyText = await response.text()

  if (!response.ok) {
    throw new Error(`メディアアップロードに失敗しました (status ${response.status}): ${bodyText}`)
  }

  const data = JSON.parse(bodyText)

  if (!data.media_id_string) {
    throw new Error(`メディアアップロードのレスポンスに media_id_string がありません: ${bodyText}`)
  }

  return data.media_id_string
}

async function postTweet(text, mediaId, credentials) {
  const url = 'https://api.twitter.com/2/tweets'
  const authHeader = buildOAuthAuthorizationHeader({ method: 'POST', url, credentials })

  const payload = { text }
  if (mediaId) {
    payload.media = { media_ids: [mediaId] }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const bodyText = await response.text()

  if (!response.ok) {
    throw new Error(`ツイート投稿に失敗しました (status ${response.status}): ${bodyText}`)
  }

  return JSON.parse(bodyText)
}

// ---------------------------------------------------------------------------
// メイン処理
// ---------------------------------------------------------------------------

async function main() {
  const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true'

  const socialPosts = readJson(POSTS_PATH, {})
  if (Object.keys(socialPosts).length === 0) {
    throw new Error(`${POSTS_PATH} に投稿テンプレートが見つかりません。`)
  }

  const characterPool = buildCharacterPool()
  if (characterPool.length === 0) {
    throw new Error('キャラクターデータの読み込みに失敗しました(characterPoolが空です)。')
  }

  const history = loadHistory()
  const post = pickNextPost(socialPosts, characterPool, history)
  const weightedLength = calcWeightedLength(post.text)

  console.log(`[post-to-x] type=${post.type} (${post.label})`)
  console.log(`[post-to-x] weightedLength=${weightedLength}/${MAX_TWEET_WEIGHTED_LENGTH}`)
  console.log('[post-to-x] ---- 投稿文 ----')
  console.log(post.text)
  console.log('[post-to-x] ----------------')
  console.log(`[post-to-x] image=${post.imagePath}`)

  if (weightedLength > MAX_TWEET_WEIGHTED_LENGTH) {
    throw new Error(`生成された投稿文がXの上限を超えています(重み付き文字数: ${weightedLength}/${MAX_TWEET_WEIGHTED_LENGTH})。data/social-posts.json のテンプレートを短くしてください。`)
  }

  if (!fs.existsSync(post.imagePath)) {
    throw new Error(`画像ファイルが見つかりません: ${post.imagePath}`)
  }

  if (isDryRun) {
    console.log('[post-to-x] --dry-run のため、実際の投稿は行いません。')
    return
  }

  const credentials = loadCredentials()
  const mediaId = await uploadMedia(post.imagePath, credentials)
  const tweetResponse = await postTweet(post.text, mediaId, credentials)
  const tweetId = tweetResponse?.data?.id || null

  console.log(`[post-to-x] 投稿成功: tweetId=${tweetId}`)

  appendHistory(history, {
    postedAt: new Date().toISOString(),
    type: post.type,
    text: post.text,
    imagePath: path.relative(ROOT_DIR, post.imagePath),
    tweetId,
  })
}

main().catch((error) => {
  console.error('[post-to-x] エラーが発生しました:', error.message)
  if (error.stack) {
    console.error(error.stack)
  }
  process.exitCode = 1
})

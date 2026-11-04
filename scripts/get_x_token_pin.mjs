// PINコード方式でXのアクセストークンを取得するスクリプト
// (個人デベロッパーアカウントのアプリで、@shindanmura として投稿できるトークンを作る)
//
// 使い方: node scripts/get_x_token_pin.mjs
//   1. コンシューマーキー(API Key / Secret)を聞かれるので貼り付け
//   2. 表示されたURLを「@shindanmuraでログイン中のブラウザ」で開いて承認
//   3. 画面に出る7桁のPINを貼り付け
//   → data/x-credentials.json に4つの鍵を自動保存
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CRED_FILE = path.join(ROOT, 'data', 'x-credentials.json')

const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())

function oauthHeader({ method, url, extraParams = {}, apiKey, apiSecret, token = '', tokenSecret = '' }) {
  const params = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
    ...extraParams,
  }
  if (token) params.oauth_token = token
  const base = [method, enc(url), enc(Object.keys(params).sort().map((k) => `${enc(k)}=${enc(params[k])}`).join('&'))].join('&')
  const key = `${enc(apiSecret)}&${enc(tokenSecret)}`
  params.oauth_signature = crypto.createHmac('sha1', key).update(base).digest('base64')
  return 'OAuth ' + Object.keys(params).sort().map((k) => `${enc(k)}="${enc(params[k])}"`).join(', ')
}

async function post(url, header) {
  const res = await fetch(url, { method: 'POST', headers: { Authorization: header } })
  const text = await res.text()
  if (!res.ok) throw new Error(`${url} failed (${res.status}): ${text}`)
  return Object.fromEntries(new URLSearchParams(text))
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
console.log('=== X PIN認証セットアップ ===')
console.log('個人デベロッパーアカウントのアプリの「コンシューマーキー」2つを用意してください。\n')
const apiKey = (await rl.question('API Key(コンシューマーキー1つ目): ')).trim()
const apiSecret = (await rl.question('API Key Secret(2つ目): ')).trim()

// 1. リクエストトークン取得
const reqUrl = 'https://api.twitter.com/oauth/request_token'
const reqToken = await post(reqUrl, oauthHeader({ method: 'POST', url: reqUrl, extraParams: { oauth_callback: 'oob' }, apiKey, apiSecret }))

console.log('\n↓このURLを「@shindanmura でログイン中のブラウザ」で開いて、アプリを承認してください:')
console.log(`\n  https://api.twitter.com/oauth/authorize?oauth_token=${reqToken.oauth_token}\n`)
const pin = (await rl.question('画面に表示された7桁のPIN: ')).trim()
rl.close()

// 2. アクセストークン交換
const accUrl = 'https://api.twitter.com/oauth/access_token'
const acc = await post(
  accUrl,
  oauthHeader({ method: 'POST', url: accUrl, extraParams: { oauth_verifier: pin }, apiKey, apiSecret, token: reqToken.oauth_token, tokenSecret: reqToken.oauth_token_secret })
)

console.log(`\n認証成功! アカウント: @${acc.screen_name}`)
if (acc.screen_name !== 'shindanmura') {
  console.log('⚠️ 注意: @shindanmura ではないアカウントで承認されています。')
  console.log('   @shindanmura でログインしたブラウザでURLを開き直して、もう一度実行してください。')
}
fs.writeFileSync(CRED_FILE, JSON.stringify({
  X_API_KEY: apiKey,
  X_API_SECRET: apiSecret,
  X_ACCESS_TOKEN: acc.oauth_token,
  X_ACCESS_SECRET: acc.oauth_token_secret,
}, null, 2))
console.log(`鍵4つを保存しました: ${CRED_FILE}`)

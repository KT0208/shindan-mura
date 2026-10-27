#!/usr/bin/env python3
# TikTok OAuth(video.upload = 下書き投稿用)。一度だけ実行してトークンを取得・保存する。
#
# 事前準備(あなたの作業):
#   1) https://developers.tiktok.com/ でアプリを作成
#   2) 「Content Posting API」を追加し、スコープ video.upload を有効化
#   3) Login Kit の Redirect URI を登録(例: https://shindanmura.com/tiktok-callback)
#   4) data/tiktok-credentials.json に client_key / client_secret / redirect_uri を記入
#      (テンプレは data/tiktok-credentials.example.json)
#
# 使い方: python3 scripts/tiktok_auth.py
import json, os, secrets, sys, urllib.parse
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRED = os.path.join(ROOT, 'data', 'tiktok-credentials.json')
TOKEN = os.path.join(ROOT, 'data', 'tiktok-token.json')
AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/'
TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
SCOPE = 'video.upload'

if not os.path.exists(CRED):
    raise SystemExit(f'認証情報がありません: {CRED}\n  data/tiktok-credentials.example.json をコピーして記入してください。')
cred = json.load(open(CRED))
for k in ('client_key', 'client_secret', 'redirect_uri'):
    if not cred.get(k):
        raise SystemExit(f'{CRED} に {k} が未設定です。')

state = secrets.token_urlsafe(16)
params = {
    'client_key': cred['client_key'],
    'scope': SCOPE,
    'response_type': 'code',
    'redirect_uri': cred['redirect_uri'],
    'state': state,
}
url = AUTH_URL + '?' + urllib.parse.urlencode(params)
print('\n① 下のURLをブラウザで開いて、TikTokアカウントで「許可」してください:\n')
print(url)
print('\n② 許可後、ブラウザが redirect_uri に飛びます(ページが404でもOK)。')
print('   アドレスバーの URL 全体(…?code=XXXX&state=… を含む)をコピーして、下に貼ってください。\n')
pasted = input('リダイレクト後のURL(または code の値)を貼り付け: ').strip()

# code を取り出す
code = pasted
if 'code=' in pasted:
    q = urllib.parse.urlparse(pasted).query or pasted.split('?', 1)[-1]
    qs = urllib.parse.parse_qs(q)
    code = qs.get('code', [''])[0]
    got_state = qs.get('state', [''])[0]
    if got_state and got_state != state:
        print('⚠ state が一致しません(別タブの可能性)。続行しますが、不安なら再実行を。')
code = urllib.parse.unquote(code)
if not code:
    raise SystemExit('code を取り出せませんでした。URL全体を貼り直してください。')

resp = requests.post(TOKEN_URL, data={
    'client_key': cred['client_key'],
    'client_secret': cred['client_secret'],
    'code': code,
    'grant_type': 'authorization_code',
    'redirect_uri': cred['redirect_uri'],
}, headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=30)
data = resp.json()
if 'access_token' not in data:
    raise SystemExit(f'トークン取得に失敗: {json.dumps(data, ensure_ascii=False)}')

import time
data['obtained_at'] = int(time.time())
data['expires_at'] = int(time.time()) + int(data.get('expires_in', 86400))
json.dump(data, open(TOKEN, 'w'), ensure_ascii=False, indent=1)
try:
    os.chmod(TOKEN, 0o600)
except Exception:
    pass
print(f'\n✅ 認証成功! トークンを保存しました: {TOKEN}')
print(f'   open_id: {data.get("open_id","?")[:10]}… / scope: {data.get("scope","?")}')
print('   これで upload_tiktok.py が使えます。')

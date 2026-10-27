#!/usr/bin/env python3
# TikTok 下書き投稿(video.upload / inbox)。MP4をTikTokの「下書き受信箱」に送る。
# 受信後、TikTokアプリで通知を開く→音源・キャプションを付けて「投稿」する(最後のひと手間は手動)。
#
# 使い方: python3 scripts/upload_tiktok.py --video path/to.mp4
import argparse, json, os, sys, time
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRED = os.path.join(ROOT, 'data', 'tiktok-credentials.json')
TOKEN = os.path.join(ROOT, 'data', 'tiktok-token.json')
TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
INIT_URL = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/'
STATUS_URL = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/'

ap = argparse.ArgumentParser()
ap.add_argument('--video', required=True, help='アップロードするMP4のパス')
ap.add_argument('--no-poll', action='store_true', help='ステータス確認をスキップ')
args = ap.parse_args()

video = args.video if os.path.isabs(args.video) else os.path.join(ROOT, args.video)
if not os.path.exists(video):
    raise SystemExit(f'動画がありません: {video}')
if not os.path.exists(CRED) or not os.path.exists(TOKEN):
    raise SystemExit('先に python3 scripts/tiktok_auth.py で認証してください。')
cred = json.load(open(CRED))
tok = json.load(open(TOKEN))

def save_token(t):
    json.dump(t, open(TOKEN, 'w'), ensure_ascii=False, indent=1)
    try: os.chmod(TOKEN, 0o600)
    except Exception: pass

# アクセストークン期限切れならリフレッシュ
if int(time.time()) >= int(tok.get('expires_at', 0)) - 120:
    print('…アクセストークンを更新中')
    r = requests.post(TOKEN_URL, data={
        'client_key': cred['client_key'], 'client_secret': cred['client_secret'],
        'grant_type': 'refresh_token', 'refresh_token': tok['refresh_token'],
    }, headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=30).json()
    if 'access_token' not in r:
        raise SystemExit(f'トークン更新失敗(再認証が必要かも): {json.dumps(r, ensure_ascii=False)}')
    r['obtained_at'] = int(time.time()); r['expires_at'] = int(time.time()) + int(r.get('expires_in', 86400))
    tok = r; save_token(tok)

access = tok['access_token']
size = os.path.getsize(video)
hdr = {'Authorization': f'Bearer {access}', 'Content-Type': 'application/json'}

# 1) init(単一チャンク)
init = requests.post(INIT_URL, headers=hdr, json={
    'source_info': {'source': 'FILE_UPLOAD', 'video_size': size, 'chunk_size': size, 'total_chunk_count': 1}
}, timeout=30).json()
err = init.get('error', {})
if err.get('code') not in (None, 'ok'):
    raise SystemExit(f'init失敗: {err.get("code")}: {err.get("message")}\n  (video.uploadスコープ未承認 / 認証ユーザー不一致 / 24h以内に未処理の下書き5件=spam_risk などを確認)')
publish_id = init['data']['publish_id']
upload_url = init['data']['upload_url']
print(f'init OK: publish_id={publish_id}')

# 2) ファイルをPUT
with open(video, 'rb') as f:
    body = f.read()
put = requests.put(upload_url, data=body, headers={
    'Content-Range': f'bytes 0-{size-1}/{size}',
    'Content-Type': 'video/mp4',
    'Content-Length': str(size),
}, timeout=300)
if put.status_code not in (200, 201, 206):
    raise SystemExit(f'アップロード失敗: HTTP {put.status_code} {put.text[:300]}')
print('アップロード完了。処理待ち…')

# 3) ステータス確認
if not args.no_poll:
    for _ in range(12):
        time.sleep(3)
        st = requests.post(STATUS_URL, headers={'Authorization': f'Bearer {access}', 'Content-Type': 'application/json; charset=UTF-8'},
                           json={'publish_id': publish_id}, timeout=30).json()
        status = (st.get('data') or {}).get('status')
        if status == 'SEND_TO_USER_INBOX':
            print('\n✅ TikTokの下書き(受信箱)に届きました!')
            print('   → スマホのTikTokアプリで通知を開く → 音源・キャプションを付けて「投稿」してください。')
            break
        if status == 'FAILED':
            raise SystemExit(f'処理失敗: {json.dumps(st.get("data"), ensure_ascii=False)}')
        print(f'   status={status}')
    else:
        print('\n(処理中のままでした。少し待ってからTikTokアプリの通知を確認してください)')
else:
    print(f'\n✅ 送信しました(publish_id={publish_id})。TikTokアプリの通知を確認してください。')

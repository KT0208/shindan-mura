# YouTube API 初回認証(1回だけ実行)
# 使い方: python3 scripts/youtube_auth.py
# 前提: data/youtube-client-secret.json にGoogle CloudでダウンロードしたOAuthクライアントJSONを置く
import os, json
from google_auth_oauthlib.flow import InstalledAppFlow

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRET = os.path.join(ROOT, 'data', 'youtube-client-secret.json')
TOKEN = os.path.join(ROOT, 'data', 'youtube-token.json')
SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
]

if not os.path.exists(SECRET):
    raise SystemExit(f'先に {SECRET} を配置してください(ガイド参照)')

flow = InstalledAppFlow.from_client_secrets_file(SECRET, SCOPES)
creds = flow.run_local_server(port=0, prompt='consent')
with open(TOKEN, 'w') as f:
    f.write(creds.to_json())
print('認証OK! トークンを保存しました:', TOKEN)

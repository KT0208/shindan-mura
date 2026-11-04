# 生成済みShortsをYouTubeへアップロード
# 使い方: python3 scripts/upload_short.py                    → 未アップの最新動画をアップ
#         python3 scripts/upload_short.py --privacy private  → 非公開でアップ
#         python3 scripts/upload_short.py --video videos/shorts/xxx.mp4
import argparse, glob, json, os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = os.path.join(ROOT, 'data', 'youtube-token.json')
LOG = os.path.join(ROOT, 'data', 'shorts-uploaded.json')
SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
]

ap = argparse.ArgumentParser()
ap.add_argument('--video')
ap.add_argument('--privacy', default='public', choices=['public', 'unlisted', 'private'])
ap.add_argument('--publish-at', help='予約公開の日時(日本時間)。例: 2026-07-17T19:00')
args = ap.parse_args()

publish_at_utc = None
if args.publish_at:
    from datetime import datetime, timedelta, timezone
    dt = datetime.fromisoformat(args.publish_at)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone(timedelta(hours=9)))  # 日本時間として解釈
    utc = dt.astimezone(timezone.utc)
    if utc <= datetime.now(timezone.utc):
        raise SystemExit(f'予約時刻が過去です: {args.publish_at}')
    publish_at_utc = utc.strftime('%Y-%m-%dT%H:%M:%S.000Z')

uploaded = json.load(open(LOG)) if os.path.exists(LOG) else []

if args.video:
    video = os.path.join(ROOT, args.video) if not os.path.isabs(args.video) else args.video
else:
    cands = sorted(glob.glob(os.path.join(ROOT, 'videos', 'shorts', '*.mp4')))
    cands = [c for c in cands if os.path.basename(c) not in [u['file'] for u in uploaded]]
    if not cands:
        raise SystemExit('未アップロードの動画がありません。先に make_short.py を実行してください。')
    video = cands[-1]

meta_path = video.replace('.mp4', '.json')
if not os.path.exists(meta_path):
    raise SystemExit(f'メタデータがありません: {meta_path}')
meta = json.load(open(meta_path))

if not os.path.exists(TOKEN):
    raise SystemExit('先に python3 scripts/youtube_auth.py で認証してください')
creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
if creds.expired and creds.refresh_token:
    creds.refresh(Request())
    open(TOKEN, 'w').write(creds.to_json())

yt = build('youtube', 'v3', credentials=creds)
body = {
    'snippet': {
        'title': meta['title'][:100],
        'description': meta['description'],
        'tags': meta['tags'],
        'categoryId': '24',  # エンターテイメント
        'defaultLanguage': 'ja',
    },
    'status': {'privacyStatus': args.privacy, 'selfDeclaredMadeForKids': False},
}
if publish_at_utc:
    # 予約公開: アップ時はprivate+publishAtで、時刻になると自動で公開される
    body['status']['privacyStatus'] = 'private'
    body['status']['publishAt'] = publish_at_utc
media = MediaFileUpload(video, mimetype='video/mp4', resumable=True)
req = yt.videos().insert(part='snippet,status', body=body, media_body=media)
print(f'アップロード中: {os.path.basename(video)}')
res = None
while res is None:
    status, res = req.next_chunk()
    if status:
        print(f'  {int(status.progress() * 100)}%')

vid = res['id']
entry = {'file': os.path.basename(video), 'videoId': vid, 'privacy': args.privacy}
if publish_at_utc:
    entry['privacy'] = 'scheduled'
    entry['publishAt'] = publish_at_utc
uploaded.append(entry)
json.dump(uploaded, open(LOG, 'w'), ensure_ascii=False, indent=1)
print(f'完了! https://youtube.com/shorts/{vid}')
if publish_at_utc:
    print(f'予約公開: {args.publish_at}(日本時間)に自動で公開されます')
elif args.privacy != 'public':
    print('※ YouTube Studioアプリから「公開」に切り替えてください')

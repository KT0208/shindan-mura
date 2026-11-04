# 診断村Shorts 週次バッチ: N本まとめて生成→毎日指定時刻に予約公開
# 使い方: python3 scripts/shorts_batch.py              → 5本、明日から毎日19:00に予約
#         python3 scripts/shorts_batch.py --count 6    → 6本
#         python3 scripts/shorts_batch.py --time 07:30 → 毎日07:30に予約
#         python3 scripts/shorts_batch.py --start 2026-07-20 → 開始日を指定
import argparse
import re
import subprocess
import sys
import os
from datetime import date, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ap = argparse.ArgumentParser()
ap.add_argument('--count', type=int, default=5, help='作る本数(APIの1日上限的に6本まで推奨)')
ap.add_argument('--time', default='19:00', help='毎日の公開時刻(日本時間)')
ap.add_argument('--start', help='1本目の公開日(省略時は明日)')
args = ap.parse_args()

if args.count > 6:
    print('⚠️ APIの1日上限の関係で6本までにしてください')
    sys.exit(1)

start = date.fromisoformat(args.start) if args.start else date.today() + timedelta(days=1)
schedule = []

for i in range(args.count):
    publish_date = start + timedelta(days=i)
    publish_at = f'{publish_date.isoformat()}T{args.time}'
    print(f'\n=== {i+1}/{args.count}本目(公開予定: {publish_at}) ===')

    # 1. 生成
    gen = subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'make_short.py')],
                         capture_output=True, text=True)
    print(gen.stdout.strip())
    if gen.returncode != 0:
        print(gen.stderr[-500:])
        sys.exit(f'生成に失敗しました({i}本目まで完了)')
    m = re.search(r'完了: (.+\.mp4)', gen.stdout)
    if not m:
        sys.exit('生成結果のパスが取得できませんでした')
    video = m.group(1).strip()

    # 2. 予約アップロード
    up = subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'upload_short.py'),
                         '--video', video, '--publish-at', publish_at],
                        capture_output=True, text=True)
    print(up.stdout.strip())
    if up.returncode != 0:
        print(up.stderr[-500:])
        print(f'⚠️ アップロードに失敗({i}本目まで予約済み)。クォータ切れの場合は明日続きを実行してください。')
        sys.exit(1)
    url = re.search(r'(https://youtube\.com/shorts/\S+)', up.stdout)
    schedule.append((publish_at, url.group(1) if url else '?'))

print('\n===== 予約完了 =====')
for at, url in schedule:
    print(f'{at}  {url}')
print('\nX告知は公開時刻を過ぎた分を `node scripts/announce_short_x.mjs` が自動で拾います(cron推奨)。')

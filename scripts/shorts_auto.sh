#!/bin/bash
# 診断村Shorts: 生成→YouTubeアップ→X告知(毎日実行用)
cd "$(dirname "$0")/.." || exit 1
python3 scripts/make_short.py && python3 scripts/upload_short.py "$@" || exit 1
node scripts/announce_short_x.mjs || echo "⚠️ X告知は失敗しましたが、YouTubeアップは成功しています"

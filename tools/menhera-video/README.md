# メンヘラクラゲ動画ツール

コマンド一発で、メンヘラクラゲのショート動画を **生成 → レンダリング(MP4) →(任意で)YouTube投稿** します。

## 使い方(リポジトリ直下で実行)

```bash
# ランダムで1本(生成+レンダリングのみ・投稿なし)
node scripts/menhera-video.mjs --format random

# フォーマット指定
node scripts/menhera-video.mjs --format montage          # 16種メーター上昇(30秒)
node scripts/menhera-video.mjs --format 4koma --koma kidoku    # 4コマ(既読スルーの夜)
node scripts/menhera-video.mjs --format aruaru --jelly 8  # 迷宮クラゲの短尺あるある(1体)

# 投稿まで(YouTube)
node scripts/menhera-video.mjs --format random --upload --privacy private
node scripts/menhera-video.mjs --format montage --upload --when "2026-10-20T19:00"  # JST予約公開

# TikTok(下書きに自動アップ。アプリで音源+キャプションを付けて最終投稿)
node scripts/menhera-video.mjs --format random --upload-tiktok
# YouTube + TikTok 同時
node scripts/menhera-video.mjs --format random --upload --privacy private --upload-tiktok
```

## TikTok 初回セットアップ(一度だけ・あなたの作業)
1. https://developers.tiktok.com/ でアプリ作成 →「Login Kit」+「Content Posting API」を追加
2. Content Posting API のスコープ **video.upload** を有効化(下書き投稿用。直接公開=video.publishは別途審査が必要)
3. Login Kit に Redirect URI を登録(例 `https://shindanmura.com/tiktok-callback`)＋ドメイン検証
4. `data/tiktok-credentials.example.json` を `data/tiktok-credentials.json` にコピーして client_key / client_secret / redirect_uri を記入
5. `python3 scripts/tiktok_auth.py` を実行 → ブラウザで許可 → リダイレクト後のURLを貼り付け(トークン保存)
6. 以降 `--upload-tiktok` で下書きに自動アップ。TikTokアプリの通知から音源を付けて投稿

※TikTok下書きは24時間に5件まで(API制限)。自分のアカウントはsandboxのテストユーザーに追加すれば審査前でも使えます。

- 出力: `tools/menhera-video/out/` と デスクトップ(手動アップ用)
- `--upload` 省略時は **生成+レンダリングだけ**(安全)。投稿は `--upload` を付けたときだけ
- 投稿は既存の `scripts/upload_short.py`(YouTube Data API, `data/youtube-token.json` の認証)を使用
- BGMは入りません(無音)。Shorts編集でトレンド音源を付けるのが推奨

## フォーマット
| format | 内容 | 長さ |
|---|---|---|
| `montage` | メンヘラ度メーターが軽→重に上がる16種紹介 | 30秒 |
| `4koma` | メンヘラあるある4コマ漫画(`--koma kidoku|yakimochi|tameshi`) | 約11秒 |
| `aruaru` | 1体のクラゲ＋あるある一言のループ短尺(`--jelly 0〜15`) | 9秒 |

## 中身の編集
- クラゲのセリフ・4コマ脚本 → `tools/menhera-video/data.mjs`
- レイアウト/モーション → `tools/menhera-video/generate.mjs`
- タイトル・説明・タグ → `scripts/menhera-video.mjs` の `metaFor()`

## 注意
- 初回や環境によって npm キャッシュ権限エラーが出る場合、ラッパーが `~/.npmcache-hf` を使って回避します。
- YouTube投稿はクォータ(1日の上限)を消費します。`upload_short.py` 参照。

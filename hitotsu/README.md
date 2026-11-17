# ひとつ(仮) — 世界にひとつの贈り物ゲーム

思い出を入力すると、AI(Claude)がその人専用のクイズゲームを作り、500円の支払い後にリンクで贈れるサイト。
診断村とは別サイトとして公開する(このフォルダだけで独立。あとで別リポジトリに切り出せる)。

## 名前・ドメインを変えるとき
- `.env` … サイト名・ローマ字表記・URL(画面、タイトル、規約ページすべてに反映)
- `server/api/config.php` … `site_name`(支払いページの商品名)と `site_url`(支払い後の戻り先)

## しくみ
- 画面: `index.html` + `src/`(React + Vite)。規約類は `tokushoho/` `privacy/` `terms/`
  - `/` … トップと作成フォーム
  - `/?id=…&key=…` … 作った人のページ(試し遊び・支払い・リンク共有)
  - `/?id=…` … 受け取った人のページ(支払い済みのみ開ける)
- サーバー: `server/api/*.php`(PHP + MySQL。Claude API と Stripe は SDK なしで curl から呼ぶ)
  - `create.php` … Claude でゲームを作って保存。AI が失敗したらテンプレートで作る
  - `get.php` … 贈り物の取得。作った人が開いたときは Stripe に支払い状況を確認
  - `checkout.php` … Stripe Checkout の支払いページを作る。Stripe 鍵が空なら無料で送れる(動作確認用)
- 開発時は `dev-api.mjs` が仮APIとして動く(AI・支払いなし、データはメモリ上)

## 開発
今は親フォルダ(診断村)の node_modules を借りている。親フォルダで:

    npx vite --config hitotsu/vite.config.js          # 開発サーバー
    npx vite build --config hitotsu/vite.config.js    # hitotsu/dist/ に出力

別リポジトリに切り出したあとは、このフォルダで `npm install` → `npm run dev` / `npm run build`。

## 公開の手順
1. ドメインを取り、レンタルサーバーに追加する(PHP 8 + MySQL)
2. phpMyAdmin で `server/schema.sql` を実行する
3. `server/api/config.example.php` をコピーして `config.php` を作り、DB情報・Claude API キー・Stripe のテストキー(`sk_test_…`)を入れる
4. ビルドして `dist/` の中身を公開フォルダへ、`server/api/` の中身(config.php を含む)を公開フォルダの `api/` へアップロードする
5. `tokushoho/` と `privacy/` の【要記入】(販売事業者名・責任者名・メールアドレス)を埋める
6. テストカード 4242 4242 4242 4242 で支払いまで確認してから、Stripe 鍵を本番(`sk_live_…`)に差し替える

## まだ確認できていないこと
- PHP の API 一式、Claude での生成、Stripe の支払いは、実サーバーでまだ一度も動かしていない

# ひとつ(仮) — 世界にひとつの贈り物ゲーム

思い出と写真を入力すると、AI(Claude)がその人専用の章立てのゲームを作り、支払い後にリンクで贈れるサイト。

| プラン | 価格 | 章 | 写真 |
|---|---|---|---|
| スタンダード | 500円 | 3章 | 3枚まで(章ごとに1枚) |
| プレミアム | 1,000円 | 4章 | 10枚まで(章ごとに1枚 + スライドショー専用6枚) |

プランの内容は `src/site.js` と `server/api/lib.php`(GIFT_PLANS)、価格は `server/api/config.php` で決まる。変えるときは両方そろえる。

- 不正解はない。相手がどの答えを選んでも、贈り主の気持ちが伝わる言葉が返る
- 章を終えるたびに写真が一枚ずつ開く(写真は任意)
- 全章を終えると、BGMつきの写真スライドショー → 手紙と称号
- BGM は音楽ファイルを使わず `src/bgm.js` がブラウザの中で音を作る(著作権の心配がない)。曲を差し替えたいときはこのファイルを直す
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
  - `create.php` … Claude でゲームを作って保存。AI が失敗したらテンプレートで作る。写真は公開フォルダの `uploads/` に保存(AI には送らない)
  - `get.php` … 贈り物の取得。作った人が開いたときは Stripe に支払い状況を確認
  - `send-scheduled.php` … 予約送信。指定の日時を過ぎた贈り物のメールを送る(cron から数分おきに動かす)
  - `checkout.php` … Stripe Checkout の支払いページを作る。Stripe 鍵が空なら無料で送れる(動作確認用)
- 開発時は `dev-api.mjs` が仮APIとして動く(AI・支払いなし、データはメモリ上)

## 開発
今は親フォルダ(診断村)の node_modules を借りている。親フォルダで:

    npx vite --config hitotsu/vite.config.js          # 開発サーバー
    npx vite build --config hitotsu/vite.config.js    # hitotsu/dist/ に出力

別リポジトリに切り出したあとは、このフォルダで `npm install` → `npm run dev` / `npm run build`。

## お試し版(友人に見せる用)
`VITE_DEMO=1` を付けてビルドすると、サーバーなしで動くお試し版になる(`src/demo-api.js` がブラウザの中で仮APIの役をする)。
AI・支払い・メール送信は行わず、作った贈り物はその端末のブラウザ内にだけ保存される。
Vercel では `vercel.json` がこのビルドを指定している。Vercel のプロジェクト設定で Root Directory を `hitotsu` にすること。

## 公開の手順
1. ドメインを取り、レンタルサーバーに追加する(PHP 8 + MySQL)
2. phpMyAdmin で `server/schema.sql` を実行する
3. `server/api/config.example.php` をコピーして `config.php` を作り、DB情報・Claude API キー・Stripe のテストキー(`sk_test_…`)を入れる
4. ビルドして `dist/` の中身を公開フォルダへ、`server/api/` の中身(config.php を含む)を公開フォルダの `api/` へアップロードする
5. ロボットよけの準備: Cloudflare(無料)で Turnstile にサイトのドメインを登録し、サイトキーを `.env` の `VITE_TURNSTILE_SITE_KEY` に、
   シークレットキーを `config.php` の `turnstile_secret_key` に入れる(`.env` を変えたらビルドし直す)
6. 予約送信の準備: サーバーでサイトのドメインのメールアドレス(例 `gift@ドメイン`)を作って `config.php` の `mail_from` に入れ、
   サーバーの cron 設定に `*/5 * * * * php /…/public_html/api/send-scheduled.php` を登録する。
   迷惑メール扱いを減らすため、ドメインの SPF / DKIM を有効にしておく
7. `tokushoho/` と `privacy/` の【要記入】(販売事業者名・責任者名・メールアドレス)を埋める
8. テストカード 4242 4242 4242 4242 で支払いまで確認してから、Stripe 鍵を本番(`sk_live_…`)に差し替える

## まだ確認できていないこと
- PHP の API 一式、Claude での生成、写真の保存、Stripe の支払い、予約メールの送信(cron)は、実サーバーでまだ一度も動かしていない
- BGM は音が作られるところまで確認。実際にどう聞こえるかは、ブラウザで聞いて確かめる必要がある

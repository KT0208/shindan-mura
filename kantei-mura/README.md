# 鑑定村

生年月日・名前から占う、無料の数秘術占いサイト(Vite + React)。診断村とは独立したサイトです。

## 鑑定メニュー

| URL | 内容 |
| --- | --- |
| `#/birthday` | 誕生日鑑定: 運命数(1〜9・11・22・33)、星座、今年の個人年数 |
| `#/name` | 名前鑑定: 名前の数(外面)と、母音から出す魂の数(内面) |
| `#/today` | 今日の運勢・おみくじ: 箱を振る→棒の番号→引き出し→紙を開く演出付き(スマホは実際に振っても引ける・効果音は任意)。凶なら木に結べる。生年月日 + 日付で日替わり |
| `#/compat` | 2人の相性鑑定: 運命数の関係(同数・調和・補完・刺激)から相性％ |

- ページ切り替えは URL ハッシュなので、`dist/` をそのまま静的ホスティング(Xserver の public_html など)に置けば動きます。
- 6言語対応: 日本語(`/`)・英語(`/en/`)・簡体字(`/zh-hans/`)・繁体字(`/zh-hant/`)・韓国語(`/ko/`)・スペイン語(`/es/`)。
  文章は `src/i18n/*.js`(すべて `ja.js` と同じ形。`npm test` で形の違いを検査)。その言語のページを開いたときだけ読み込む。
  言語ごとのページとサイトマップは、ビルド後に `scripts/build-languages.mjs` が作る。
- 名前鑑定はひらがな・カタカナ・ローマ字(ピンイン)・ハングル(字母に分解)・漢字(画数)に対応。
  画数表 `src/strokes-data.js` は cnchar(MIT)から生成済み(`scripts/generate-strokes.cjs`)。漢字の名前が入力されたときだけ読み込む。
- 読み物・運命数の解説・規約ページ(日本語)は、ビルド後に `scripts/build-pages.mjs` が静的HTML(`numerology.html` など)として書き出す。文章は `src/content/`。
- Google アドセンス: `site.config.js` に運営者ID(ca-pub-…)を入れてビルドすると、全ページにコードが入り `ads.txt` も作られる。
- 入力はすべてブラウザ内で処理し、生年月日・名前は localStorage にだけ保存します。
- 同じ入力には常に同じ結果を返します(シード付き乱数)。

## 開発

```bash
cd kantei-mura
npm install
npm run dev     # 開発サーバー
npm test        # 鑑定ロジックのテスト
npm run build   # dist/ に出力
```

## ファイル構成

- `src/fortune.js` … 鑑定ロジック(純粋関数)
- `src/readings.js` … 鑑定結果の文章
- `src/App.jsx` / `src/App.css` … 画面

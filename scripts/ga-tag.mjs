// 静的ページ(診断の解説・コラム・図鑑・法務ページ)に埋め込む GA4 タグ。
//
// - 本番ドメイン(shindanmura.com)のときだけ gtag.js を読み込む。
//   localhost の開発サーバーや Vercel のプレビュー環境のアクセスが、本番の数値に混ざらないようにするため。
// - 静的ページは「1ファイル = 1ページ」なので、page_view は gtag の自動送信に任せる。
//   (SPA本体の index.html は手動送信に一本化しているので send_page_view: false。こちらとは扱いが違う)
// - /c/ と /r/(noindex の薄いページ)には入れない。
export const GA_MEASUREMENT_ID = 'G-5Q648ZRFZB'

export const GA_TAG = `<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  if (/(^|\\.)shindanmura\\.com$/.test(location.hostname)) {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
    document.head.appendChild(gaScript);
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  }
</script>`

// GA4(gtag)のイベント計測ヘルパー。
// gtag.js は本番ドメインでだけ読み込まれる(index.html)。それ以外の環境では dataLayer に積まれるだけで、どこにも送信されない。
// 計測の失敗がサイト本体の動作に影響しないよう、必ず try/catch で握りつぶす。
export function trackEvent(name, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params)
    }
  } catch {
    /* 計測失敗は無視 */
  }
}

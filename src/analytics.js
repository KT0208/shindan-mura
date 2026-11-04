// GA4(gtag)のイベント計測ヘルパー。
// gtag が読み込まれていない環境(開発サーバー等)では安全に何もしない。
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

// Google アナリティクスへのイベント送信。計測コードが入っていない(gtag がない)ときは何もしない。
// 生年月日や名前などの入力内容は送らない(結果の種類だけを送る)。
export function track(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

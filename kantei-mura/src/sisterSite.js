// 姉妹サイト「診断村」(https://shindanmura.com) への案内。
// 鑑定の結果の下に、内容の近い診断を1つだけ紹介する。フッターにも小さく案内を置く。
// 診断村は日本語と英語のみなので、日本語以外のページからは英語版(?lang=en)へ案内する。
// どのリンクから来たかを Google アナリティクスで見分けられるよう、UTMパラメータを付ける。

const SHINDAN_URL = 'https://shindanmura.com/'

// 鑑定ごとに紹介する診断(診断村の診断ID)
export const SHINDAN_DIAGNOSIS_BY_PAGE = {
  birthday: 'work-style',
  name: 'hidden-personality',
  today: 'money-luck',
  compat: 'love-complicated',
}

export function shindanUrl(languageCode, page, campaign) {
  const params = new URLSearchParams({
    lang: languageCode === 'ja' ? 'ja' : 'en',
    utm_source: 'kanteimura',
    utm_medium: 'referral',
    utm_campaign: campaign,
  })
  const diagnosis = page ? SHINDAN_DIAGNOSIS_BY_PAGE[page] : null
  return `${SHINDAN_URL}?${params}${diagnosis ? `#diagnosis=${diagnosis}` : ''}`
}

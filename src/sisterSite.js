// 姉妹サイト「鑑定村」(https://kanteimura.com) への案内。
// 診断の結果画面で、内容の近い鑑定を1つだけ紹介する。フッターにも小さく案内を置く。
// どのリンクから来たかを Google アナリティクスで見分けられるよう、UTMパラメータを付ける。

const KANTEI_URL = 'https://kanteimura.com'

// 診断ごとに紹介する鑑定(#/birthday・#/name・#/today・#/compat)
const KANTEI_PAGE_BY_DIAGNOSIS = {
  'love-complicated': 'compat',
  'menhera-level': 'compat',
  'dangerous-man': 'compat',
  'popularity-season': 'compat',
  'reply-type': 'compat',
  'crush-misread': 'compat',
  'money-luck': 'today',
  'sns-approval': 'today',
  'life-bug': 'today',
  'oshikatsu-type': 'today',
  'work-style': 'birthday',
  'hidden-personality': 'name',
  'dark-fall': 'name',
  'dark-depth': 'name',
}

const texts = {
  ja: {
    label: '姉妹サイト',
    footer: '🔮 生年月日・名前で占うなら「鑑定村」',
    button: '鑑定村で占う',
    pages: {
      compat: { emoji: '💞', title: '気になるあの人との相性は?', text: '2人の生年月日から、相性を％で鑑定します。' },
      today: { emoji: '⛩️', title: '今日の運勢をおみくじで', text: '箱を振って引く、毎日変わるおみくじ。金運・恋愛運もわかります。' },
      birthday: { emoji: '🎂', title: '生まれ持った才能を誕生日で', text: '生年月日から「運命数」を出して、向いている仕事や今年のテーマを鑑定します。' },
      name: { emoji: '🖋️', title: '名前に宿る、本当のあなた', text: '名前の文字から、周りに見せている顔と心の奥の願いを鑑定します。' },
    },
  },
  en: {
    label: 'Sister site',
    footer: '🔮 Fortunes from your birthday and name: Kantei Mura',
    button: 'Try it on Kantei Mura',
    pages: {
      compat: { emoji: '💞', title: 'How compatible are you two?', text: 'Get your compatibility as a percentage from two birthdays.' },
      today: { emoji: '⛩️', title: 'Draw today’s omikuji', text: 'Shake the box and draw a Japanese fortune slip that changes every day.' },
      birthday: { emoji: '🎂', title: 'Talents you were born with', text: 'Find your life path number and the work that suits you from your birthday.' },
      name: { emoji: '🖋️', title: 'The true you, hidden in your name', text: 'Read the numbers in your name to see your outer face and your heart’s wish.' },
    },
  },
}

export function kanteiUrl(language, page, campaign) {
  const path = language === 'en' ? '/en/' : '/'
  const params = new URLSearchParams({ utm_source: 'shindanmura', utm_medium: 'referral', utm_campaign: campaign })
  return `${KANTEI_URL}${path}?${params}${page ? `#/${page}` : ''}`
}

export function sisterTexts(language) {
  return texts[language] || texts.ja
}

export function sisterPageForDiagnosis(diagnosisId) {
  return KANTEI_PAGE_BY_DIAGNOSIS[diagnosisId] || 'today'
}

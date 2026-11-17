// 鑑定結果から、日本語の解説ページ(静的HTML)へのリンク先
export const ETO_SLUGS = ['ne', 'ushi', 'tora', 'u', 'tatsu', 'mi', 'uma', 'hitsuji', 'saru', 'tori', 'inu', 'i']
export const ZODIAC_SLUGS = ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius']
export const TAROT_SLUGS = ['fool', 'magician', 'high-priestess', 'empress', 'emperor', 'hierophant', 'lovers', 'chariot', 'strength', 'hermit', 'wheel-of-fortune', 'justice', 'hanged-man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'world']

export const guideHref = {
  kyusei: (star) => `/kyusei-${star}.html`,
  eto: (index) => `/eto-${ETO_SLUGS[index]}.html`,
  zodiac: (index) => `/zodiac-${ZODIAC_SLUGS[index]}.html`,
  tarot: (index) => `/tarot-${TAROT_SLUGS[index]}.html`,
}

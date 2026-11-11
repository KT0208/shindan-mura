// 対応言語の一覧。path はURLの先頭部分(日本語はトップ / 、英語は /en/ …)。
// ビルド後のスクリプト(scripts/build-languages.mjs)もこの一覧を使って、言語ごとのページを作る。
export const LANGUAGES = [
  { code: 'ja', path: '', label: '日本語', ogLocale: 'ja_JP' },
  { code: 'en', path: 'en', label: 'English', ogLocale: 'en_US' },
  { code: 'zh-Hans', path: 'zh-hans', label: '简体中文', ogLocale: 'zh_CN' },
  { code: 'zh-Hant', path: 'zh-hant', label: '繁體中文', ogLocale: 'zh_TW' },
  { code: 'ko', path: 'ko', label: '한국어', ogLocale: 'ko_KR' },
  { code: 'es', path: 'es', label: 'Español', ogLocale: 'es_ES' },
]

export const SITE_URL = 'https://kanteimura.com'

export function languagePath(lang) {
  return lang.path ? `/${lang.path}/` : '/'
}

// 今のURL(/en/ など)から言語を決める。該当がなければ日本語。
export function languageFromPath(pathname) {
  const first = (pathname || '/').split('/').filter(Boolean)[0]?.toLowerCase()
  return LANGUAGES.find((lang) => lang.path && lang.path === first) || LANGUAGES[0]
}

// ブラウザの言語設定から、おすすめの言語を探す(トップページで案内を出すため)。
export function preferredLanguage(navigatorLanguages) {
  for (const raw of navigatorLanguages || []) {
    const tag = raw.toLowerCase()
    if (tag.startsWith('ja')) return LANGUAGES[0]
    if (tag.startsWith('zh')) {
      const traditional = /hant|tw|hk|mo/.test(tag)
      return LANGUAGES.find((l) => l.code === (traditional ? 'zh-Hant' : 'zh-Hans'))
    }
    const found = LANGUAGES.find((l) => tag.startsWith(l.code.toLowerCase()))
    if (found) return found
  }
  return null
}

// トップページ(日本語)で、ほかの言語の人に出す案内文
export const LANGUAGE_SUGGESTIONS = {
  en: 'This site is also available in English',
  'zh-Hans': '本站提供简体中文版',
  'zh-Hant': '本站提供繁體中文版',
  ko: '한국어 버전도 있습니다',
  es: 'Este sitio también está disponible en español',
}

import ja from './ja'

// 日本語以外の辞書は、その言語のページを開いたときだけ読み込む(サイトを軽く保つため)
const loaders = {
  en: () => import('./en'),
  'zh-Hans': () => import('./zh-Hans'),
  'zh-Hant': () => import('./zh-Hant'),
  ko: () => import('./ko'),
  es: () => import('./es'),
}

export { ja }

export async function loadDictionary(code) {
  if (code === 'ja' || !loaders[code]) return ja
  const mod = await loaders[code]()
  return mod.default
}

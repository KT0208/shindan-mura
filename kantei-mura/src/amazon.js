// Amazon アソシエイト(日本)のリンクを作る。日本語ページだけで使う。
import siteConfig from '../site.config.js'

// 今日の運勢のラッキーアイテム(i18n の luckyItems と同じ順番)ごとの検索ことば
export const LUCKY_ITEM_KEYWORDS = [
  'ハンカチ',
  '手帳',
  'リップクリーム',
  'ハーブティー',
  'コンパクトミラー',
  'Bluetooth スピーカー',
  'プリザーブドフラワー',
  'ワイヤレスイヤホン',
  '腕時計',
  '小説 ベストセラー',
  'チョコレート ギフト',
  '香水',
  'ボールペン',
  'ヘアアクセサリー',
  '観葉植物 ミニ',
  'スニーカー',
]

// Amazon の検索結果ページへのリンク。タグが無いときは null(リンクを出さない)
export function amazonSearchUrl(keyword, tag = siteConfig.amazonTag) {
  if (!tag || !keyword) return null
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${encodeURIComponent(tag)}`
}

// 日本語ページで、タグが設定されているときだけ表示する
export function amazonEnabled(languageCode, tag = siteConfig.amazonTag) {
  return languageCode === 'ja' && Boolean(tag)
}

export const AMAZON_DISCLOSURE = 'Amazonのアソシエイトとして、鑑定村は適格販売により収入を得ています。'

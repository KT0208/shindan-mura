// 鑑定メニューの一覧(カテゴリごと)。表示名は各言語の辞書の ui.menus と ui.categories にある。
export const MENU_CATEGORIES = [
  { id: 'numerology', items: [
    { id: 'birthday', emoji: '🎂' },
    { id: 'name', emoji: '🖋️' },
    { id: 'compat', emoji: '💞' },
    { id: 'chart', emoji: '🔢' },
    { id: 'month', emoji: '📅' },
    { id: 'angel', emoji: '👼' },
  ] },
  { id: 'omikuji', items: [
    { id: 'today', emoji: '⛩️' },
    { id: 'enmusubi', emoji: '💗' },
    { id: 'kinun', emoji: '💰' },
  ] },
  { id: 'japan', items: [
    { id: 'mamori', emoji: '🪷' },
    { id: 'kyusei', emoji: '⭐' },
    { id: 'eto', emoji: '🐉' },
  ] },
  { id: 'western', items: [
    { id: 'zodiac', emoji: '✨' },
    { id: 'moon', emoji: '🌙' },
    { id: 'celtic', emoji: '🌳' },
    { id: 'tarot', emoji: '🃏' },
    { id: 'rune', emoji: '🪨' },
    { id: 'pendulum', emoji: '🔮' },
    { id: 'pastlife', emoji: '🕰️' },
  ] },
]

export const MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items)

export function menuEmoji(id) {
  return MENU_ITEMS.find((m) => m.id === id)?.emoji || '🔮'
}

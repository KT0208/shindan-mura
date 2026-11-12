// 読み物ページ用のイラスト(SVG)。画像ファイルを使わず図形で描くので、軽くて拡大してもきれい。
// 色は鑑定村の夜空のデザインに合わせている。文字はすべて日本語のラベル。

const C = {
  wood: '#c88a4c',
  woodDark: '#8a5428',
  woodLight: '#e0ad6c',
  water: '#7cc4f0',
  skin: '#f3d2b3',
  skinLine: '#a0684a',
  gold: '#e8c26a',
  red: '#d2433a',
  ink: '#f6f0ff',
  muted: 'rgba(246,240,255,0.7)',
  person: '#b8a6e0',
}

const svg = (viewBox, inner, label, top = '') =>
  `<svg class="illust" viewBox="${viewBox}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${inner}${top}</svg>`

const text = (x, y, value, { size = 13, color = C.ink, anchor = 'middle', weight = 700 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}" font-family="'Hiragino Sans','Noto Sans JP',sans-serif">${value}</text>`

// 手(ミトン形)。x,y は手首の位置。dir=1 で右向き、-1 で左向き。highlight で金色の輪
function hand(x, y, { dir = 1, rotate = 0, highlight = false, cupped = false } = {}) {
  const ring = highlight ? `<ellipse cx="26" cy="0" rx="38" ry="21" fill="none" stroke="${C.gold}" stroke-width="2.5" stroke-dasharray="5 4"/>` : ''
  const palm = cupped
    ? `<path d="M0 -10 Q 26 -2 50 -12 Q 52 6 44 12 Q 24 20 0 12 Z" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2"/>`
    : `<rect x="0" y="-11" width="50" height="22" rx="11" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2"/>`
  const thumb = `<ellipse cx="14" cy="-13" rx="9" ry="5" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2" transform="rotate(-20 14 -13)"/>`
  const sleeve = `<rect x="-22" y="-13" width="24" height="26" rx="5" fill="${C.person}"/>`
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${dir} 1)">${ring}${sleeve}${palm}${thumb}</g>`
}

// 柄杓。x,y は器の中心。angle で傾き、handleDir で柄の向き
function ladle(x, y, angle = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">
    <rect x="10" y="-3.5" width="74" height="7" rx="3.5" fill="${C.woodLight}" stroke="${C.woodDark}" stroke-width="1.5"/>
    <rect x="-16" y="-14" width="30" height="26" rx="4" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="2"/>
    <ellipse cx="-1" cy="-14" rx="15" ry="4.5" fill="${C.water}" stroke="${C.woodDark}" stroke-width="2"/>
  </g>`
}

const drops = (points) => points.map(([x, y, s = 1]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z" fill="${C.water}"/>`).join('')

const stepNo = (n) => `<circle cx="20" cy="20" r="14" fill="${C.gold}"/>${text(20, 25, n, { size: 15, color: '#2a1a00' })}`

// ---- 手水 ----
export const temizuSteps = [
  svg('0 0 240 150', `${ladle(160, 56, -28)}${hand(196, 70, { dir: 1, rotate: -20 })}${drops([[128, 80], [124, 96, 0.8], [132, 104, 0.7]])}${hand(70, 100, { dir: 1, highlight: true })}${text(96, 146, '左手を清める', { color: C.gold })}${text(214, 108, '右手', { size: 11, color: C.muted })}`, '右手で柄杓を持ち、左手に水をかける', stepNo(1)),
  svg('0 0 240 150', `${ladle(92, 60, 28 + 180)}${hand(44, 70, { dir: -1, rotate: 20 })}${drops([[112, 80], [116, 96, 0.8], [108, 104, 0.7]])}${hand(170, 100, { dir: -1, highlight: true })}${text(146, 146, '右手を清める', { color: C.gold })}${text(26, 108, '左手', { size: 11, color: C.muted })}`, '柄杓を左手に持ちかえ、右手に水をかける', stepNo(2)),
  svg('0 0 240 150', `${stepNo(3)}${ladle(150, 50, -28)}${hand(186, 64, { dir: 1, rotate: -20 })}${drops([[120, 72], [118, 86, 0.8]])}${hand(70, 104, { dir: 1, cupped: true, highlight: true })}
    <path d="M 98 92 Q 70 60 52 52" fill="none" stroke="${C.gold}" stroke-width="2.5" stroke-dasharray="4 4" marker-end="url(#arrow)"/>
    <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="${C.gold}"/></marker></defs>
    <circle cx="40" cy="44" r="18" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2"/><path d="M 32 50 Q 40 56 48 50" fill="none" stroke="${C.skinLine}" stroke-width="2"/><circle cx="34" cy="40" r="2" fill="${C.skinLine}"/><circle cx="46" cy="40" r="2" fill="${C.skinLine}"/>
    ${text(120, 146, '左の手のひらで受けて口をすすぐ', { color: C.gold, size: 12 })}`, '左の手のひらに水を受けて、口をすすぐ'),
  svg('0 0 240 150', `${ladle(160, 56, -28)}${hand(196, 70, { dir: 1, rotate: -20 })}${drops([[128, 80], [124, 96, 0.8], [132, 104, 0.7]])}${hand(70, 100, { dir: 1, highlight: true })}${text(96, 146, 'もう一度、左手', { color: C.gold })}`, 'もう一度、左手を清める', stepNo(4)),
  svg('0 0 240 150', `${ladle(120, 34, 90)}${hand(146, 86, { dir: -1, rotate: -90 })}${drops([[112, 70, 0.8], [112, 92, 0.7], [112, 112, 0.7], [112, 128, 0.6]])}${text(120, 146, '柄杓を立てて柄を清める', { color: C.gold, size: 12 })}`, '柄杓を縦にして、残った水で柄を清める', stepNo(5)),
]

// ---- 参拝 ----
// 横から見た人。bow=90 で90度のお辞儀
function person(x, y, bow = 0) {
  return `<g transform="translate(${x} ${y})">
    <rect x="-9" y="0" width="8" height="46" rx="4" fill="${C.person}"/><rect x="1" y="0" width="8" height="46" rx="4" fill="${C.person}"/>
    <g transform="rotate(${bow} 0 0)">
      <rect x="-12" y="-52" width="24" height="56" rx="10" fill="${C.person}"/>
      <circle cx="0" cy="-66" r="13" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2"/>
      <rect x="-5" y="-48" width="10" height="40" rx="5" fill="#9d8bd0"/>
    </g>
  </g>`
}

// 正面から見た両手(拍手・合掌)
function frontHands(x, y, { offset = 0, marks = false, glow = false } = {}) {
  const hl = (dx, dy) => `<rect x="${dx}" y="${dy}" width="22" height="58" rx="11" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2"/>`
  const m = marks ? `${text(-52, 20, 'パン!', { size: 14, color: C.gold })}${text(52, 20, 'パン!', { size: 14, color: C.gold })}<path d="M-34 -6 l-10 -8 M-36 6 l-12 0 M34 -6 l10 -8 M36 6 l12 0" stroke="${C.gold}" stroke-width="2.5" stroke-linecap="round"/>` : ''
  const g = glow ? `<circle cx="0" cy="10" r="46" fill="${C.gold}" opacity="0.15"/>${text(-40, -18, '✦', { size: 14, color: C.gold })}${text(42, -10, '✦', { size: 12, color: C.gold })}` : ''
  return `<g transform="translate(${x} ${y})">${g}${hl(-22, -20)}${hl(0, -20 + offset)}${m}</g>`
}

export const sanpaiSteps = [
  svg('0 0 240 150', `${person(110, 86, 80)}${text(196, 70, '×2', { size: 22, color: C.gold })}${text(120, 146, '深いお辞儀を2回', { color: C.gold })}`, '二礼:深いお辞儀を2回', stepNo(1)),
  svg('0 0 240 150', `${frontHands(120, 64, { offset: 8, marks: true })}${text(120, 146, '右手を少し下げて2回打つ', { color: C.gold, size: 12 })}`, '二拍手:右手を少し下にずらして2回手を打つ', stepNo(2)),
  svg('0 0 240 150', `${frontHands(120, 64, { glow: true })}${text(120, 146, '手を合わせてお祈り', { color: C.gold })}`, '指先をそろえて手を合わせ、お祈りする', stepNo(3)),
  svg('0 0 240 150', `${person(110, 86, 80)}${text(196, 70, '×1', { size: 22, color: C.gold })}${text(120, 146, '最後にお辞儀を1回', { color: C.gold })}`, '一礼:最後に深いお辞儀を1回', stepNo(4)),
]

function torii(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-44" y="-62" width="88" height="9" rx="3" fill="${C.red}"/><rect x="-50" y="-66" width="100" height="6" rx="3" fill="#2a1a1a"/>
    <rect x="-38" y="-46" width="76" height="6" fill="${C.red}"/>
    <rect x="-32" y="-55" width="8" height="58" fill="${C.red}"/><rect x="24" y="-55" width="8" height="58" fill="${C.red}"/>
  </g>`
}

function sanmon(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-58 -46 Q 0 -74 58 -46 L 48 -40 L -48 -40 Z" fill="#4a4a5a"/>
    <rect x="-40" y="-40" width="80" height="6" fill="${C.woodDark}"/>
    <rect x="-36" y="-34" width="8" height="37" fill="${C.wood}"/><rect x="28" y="-34" width="8" height="37" fill="${C.wood}"/>
    <rect x="-22" y="-34" width="44" height="37" fill="rgba(0,0,0,0.35)"/>
  </g>`
}

// 参道を上から見た図
export const sando = svg('0 0 240 200', `
  <rect x="80" y="30" width="80" height="150" fill="rgba(232,194,106,0.12)" stroke="${C.gold}" stroke-opacity="0.4"/>
  <line x1="120" y1="40" x2="120" y2="170" stroke="${C.gold}" stroke-width="2" stroke-dasharray="6 6"/>
  ${text(120, 22, '拝殿', { color: C.ink })}
  <rect x="88" y="0" width="64" height="8" rx="2" fill="${C.woodDark}" transform="translate(0 4)"/>
  ${torii(120, 196, 0.55)}
  ${text(190, 104, '正中', { color: C.gold, size: 14 })}${text(196, 122, '(神様の通り道)', { color: C.muted, size: 10 })}
  <path d="M 172 100 L 128 100" stroke="${C.gold}" stroke-width="1.5" marker-end="url(#a2)"/>
  <defs><marker id="a2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="${C.gold}"/></marker></defs>
  ${[150, 128, 106, 84, 62].map((yy, i) => `<ellipse cx="${i % 2 ? 98 : 106}" cy="${yy}" rx="4" ry="6" fill="${C.ink}" opacity="0.8"/>`).join('')}
  ${text(44, 104, '端を歩く', { color: C.ink, size: 13 })}
  <path d="M 64 100 L 92 100" stroke="${C.ink}" stroke-width="1.5" marker-end="url(#a3)"/>
  <defs><marker id="a3" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="${C.ink}"/></marker></defs>
`, '参道は真ん中(正中)を避けて端を歩く')

// ---- 神社とお寺 ----
export const jinjaTeraCompare = svg('0 0 300 210', `
  <rect x="6" y="6" width="138" height="198" rx="14" fill="rgba(210,67,58,0.12)" stroke="${C.red}" stroke-opacity="0.6"/>
  <rect x="156" y="6" width="138" height="198" rx="14" fill="rgba(200,138,76,0.12)" stroke="${C.wood}" stroke-opacity="0.6"/>
  ${text(75, 30, '神社', { size: 17, color: C.ink })}${text(225, 30, 'お寺', { size: 17, color: C.ink })}
  ${torii(75, 104, 0.8)}${sanmon(225, 104, 0.85)}
  ${text(75, 124, '入り口:鳥居', { size: 12, color: C.muted })}${text(225, 124, '入り口:山門', { size: 12, color: C.muted })}
  <g transform="translate(0 4)">${frontHands(75, 150, { offset: 6 }).replace('<g transform="translate(75 150)">', '<g transform="translate(75 150) scale(0.5)">')}</g>
  <g transform="translate(0 4)">${frontHands(225, 150).replace('<g transform="translate(225 150)">', '<g transform="translate(225 150) scale(0.5)">')}</g>
  ${text(50, 162, 'パン', { size: 10, color: C.gold })}${text(100, 162, 'パン', { size: 10, color: C.gold })}
  ${text(75, 196, '拍手する', { size: 13, color: C.gold })}${text(225, 196, '拍手しない(合掌)', { size: 13, color: C.gold })}
`, '神社は鳥居があり拍手をする。お寺は山門があり拍手をせず合掌する')

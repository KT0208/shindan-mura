// 読み物ページ用のイラスト(SVG)。画像ファイルを使わず図形で描くので、軽くて拡大してもきれい。
// 色は鑑定村の夜空のデザインに合わせている。
// 図の中の文字は言語ごとに変えられるよう、makeIllustrations(L) に言語別のラベル(illustrationLabels.js)を渡して作る。

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
  paper: '#fbf6ea',
}

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')

const svg = (viewBox, inner, label, top = '') =>
  `<svg class="illust" viewBox="${viewBox}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${inner}${top}</svg>`

const text = (x, y, value, { size = 13, color = C.ink, anchor = 'middle', weight = 700 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}" font-family="'Hiragino Sans','Noto Sans JP','Noto Sans SC','Noto Sans KR',sans-serif">${esc(value)}</text>`

// 長いラベルは文字数に応じて小さくする
const fit = (value, base, max) => Math.min(base, Math.floor((max / Math.max([...String(value)].length, 1)) * 1.9))

const arrowDef = (id, color) => `<defs><marker id="${id}" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="${color}"/></marker></defs>`

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

// 柄杓。x,y は器の中心。angle で傾き
function ladle(x, y, angle = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">
    <rect x="10" y="-3.5" width="74" height="7" rx="3.5" fill="${C.woodLight}" stroke="${C.woodDark}" stroke-width="1.5"/>
    <rect x="-16" y="-14" width="30" height="26" rx="4" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="2"/>
    <ellipse cx="-1" cy="-14" rx="15" ry="4.5" fill="${C.water}" stroke="${C.woodDark}" stroke-width="2"/>
  </g>`
}

const drops = (points) => points.map(([x, y, s = 1]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z" fill="${C.water}"/>`).join('')

const stepNo = (n) => `<circle cx="20" cy="20" r="14" fill="${C.gold}"/>${text(20, 25, n, { size: 15, color: '#2a1a00' })}`

const caption = (value, y = 146, max = 220) => text(120, y, value, { color: C.gold, size: fit(value, 13, max) })

// 横から見た人。bow=80 で深いお辞儀
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
function frontHands(x, y, { offset = 0, marks = '', glow = false, scale = 1 } = {}) {
  const hl = (dx, dy) => `<rect x="${dx}" y="${dy}" width="22" height="58" rx="11" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2"/>`
  const m = marks ? `${text(-54, 20, marks, { size: 14, color: C.gold })}${text(54, 20, marks, { size: 14, color: C.gold })}<path d="M-34 -6 l-10 -8 M-36 6 l-12 0 M34 -6 l10 -8 M36 6 l12 0" stroke="${C.gold}" stroke-width="2.5" stroke-linecap="round"/>` : ''
  const g = glow ? `<circle cx="0" cy="10" r="46" fill="${C.gold}" opacity="0.15"/>${text(-40, -18, '✦', { size: 14, color: C.gold })}${text(42, -10, '✦', { size: 12, color: C.gold })}` : ''
  return `<g transform="translate(${x} ${y}) scale(${scale})">${g}${hl(-22, -20)}${hl(0, -20 + offset)}${m}</g>`
}

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

// お守り(袋の形)
function omamoriPouch(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-26 -30 L -14 -44 L 14 -44 L 26 -30 L 26 40 Q 26 46 20 46 L -20 46 Q -26 46 -26 40 Z" fill="${C.red}" stroke="#8d1c1c" stroke-width="2"/>
    <path d="M-26 -16 L 26 -16 M -26 30 L 26 30" stroke="${C.gold}" stroke-width="2" opacity="0.7"/>
    <circle cx="0" cy="-50" r="6" fill="none" stroke="${C.gold}" stroke-width="3"/>
    <path d="M-4 -46 Q -14 -60 -8 -66 M 4 -46 Q 14 -60 8 -66" fill="none" stroke="${C.gold}" stroke-width="3"/>
    ${text(0, -2, '御', { size: 14, color: C.gold })}${text(0, 16, '守', { size: 14, color: C.gold })}
  </g>`
}

// 古札納所(古いお守り・お札を返す箱)
function returnBox(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-44 -34 L 0 -54 L 44 -34 Z" fill="#4a4a5a"/>
    <rect x="-38" y="-34" width="76" height="62" rx="3" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="2"/>
    <rect x="-24" y="-24" width="48" height="8" rx="3" fill="#2a1508"/>
    <rect x="-28" y="-6" width="56" height="26" rx="2" fill="${C.paper}" opacity="0.9"/>
    ${text(0, 12, '古札納所', { size: 11, color: '#8d1c1c' })}
  </g>`
}

// 五円玉
function coin(x, y, r = 22) {
  return `<g transform="translate(${x} ${y})">
    <circle r="${r}" fill="#e3b34a" stroke="#a87a1e" stroke-width="2"/>
    <circle r="${r * 0.32}" fill="#1b1036" stroke="#a87a1e" stroke-width="2"/>
    <path d="M ${-r * 0.75} ${r * 0.45} q ${r * 0.75} ${r * 0.35} ${r * 1.5} 0" fill="none" stroke="#a87a1e" stroke-width="1.5"/>
  </g>`
}

// 賽銭箱
function saisenBox(x, y) {
  return `<g transform="translate(${x} ${y})">
    <path d="M-70 -20 L 70 -20 L 60 40 L -60 40 Z" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="2"/>
    ${[-50, -30, -10, 10, 30, 50].map((dx) => `<rect x="${dx - 3}" y="-24" width="6" height="12" rx="2" fill="${C.woodDark}"/>`).join('')}
    <rect x="-72" y="-28" width="144" height="8" rx="3" fill="${C.woodDark}"/>
    ${text(0, 22, '奉納', { size: 14, color: '#2a1508' })}
  </g>`
}

// 御朱印帳(見開き)。sealed で朱印あり
function goshuinBook(x, y, { sealed = false, s = 1 } = {}) {
  const page = (dx) => `<rect x="${dx}" y="-44" width="52" height="88" rx="2" fill="${C.paper}" stroke="#d8ccb0" stroke-width="1.5"/>`
  const ink = sealed
    ? `<path d="M 26 -34 l 0 30 M 18 -26 l 16 0 M 32 -10 l 0 22 M 22 4 l 0 26" stroke="#222" stroke-width="3" stroke-linecap="round"/>
       <rect x="6" y="-8" width="24" height="24" rx="2" fill="none" stroke="${C.red}" stroke-width="3"/><rect x="12" y="-2" width="12" height="12" fill="${C.red}" opacity="0.8"/>
       <circle cx="38" cy="-26" r="6" fill="none" stroke="${C.red}" stroke-width="2.5"/>`
    : ''
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-58" y="-48" width="116" height="96" rx="4" fill="#3b2a6a" stroke="${C.gold}" stroke-width="1.5"/>
    ${page(-54)}${page(2)}${ink}
  </g>`
}

// 授与所(お守りや御朱印をいただく窓口)
function juyosho(x, y, sign) {
  return `<g transform="translate(${x} ${y})">
    <path d="M-60 -40 L 0 -62 L 60 -40 Z" fill="#4a4a5a"/>
    <rect x="-52" y="-40" width="104" height="70" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="2"/>
    <rect x="-40" y="-26" width="80" height="36" fill="#2a1508"/>
    <rect x="-22" y="-56" width="44" height="18" rx="2" fill="${C.paper}"/>
    ${text(0, -42, sign, { size: fit(sign, 11, 40), color: '#8d1c1c' })}
  </g>`
}

export function makeIllustrations(L) {
  // ---- 手水 ----
  const T = L.temizu
  const temizuSteps = [
    svg('0 0 240 150', `${ladle(160, 56, -28)}${hand(196, 70, { dir: 1, rotate: -20 })}${drops([[128, 80], [124, 96, 0.8], [132, 104, 0.7]])}${hand(70, 100, { dir: 1, highlight: true })}${caption(T.steps[0])}${text(214, 108, T.right, { size: 11, color: C.muted })}`, T.aria[0], stepNo(1)),
    svg('0 0 240 150', `${ladle(92, 60, 28 + 180)}${hand(44, 70, { dir: -1, rotate: 20 })}${drops([[112, 80], [116, 96, 0.8], [108, 104, 0.7]])}${hand(170, 100, { dir: -1, highlight: true })}${caption(T.steps[1])}${text(26, 108, T.left, { size: 11, color: C.muted })}`, T.aria[1], stepNo(2)),
    svg('0 0 240 150', `${ladle(150, 50, -28)}${hand(186, 64, { dir: 1, rotate: -20 })}${drops([[120, 72], [118, 86, 0.8]])}${hand(70, 98, { dir: 1, cupped: true, highlight: true })}
      <path d="M 98 88 Q 74 62 56 56" fill="none" stroke="${C.gold}" stroke-width="2.5" stroke-dasharray="4 4" marker-end="url(#tz-arrow)"/>${arrowDef('tz-arrow', C.gold)}
      <circle cx="40" cy="48" r="18" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="2"/><path d="M 32 54 Q 40 60 48 54" fill="none" stroke="${C.skinLine}" stroke-width="2"/><circle cx="34" cy="44" r="2" fill="${C.skinLine}"/><circle cx="46" cy="44" r="2" fill="${C.skinLine}"/>
      ${caption(T.steps[2])}`, T.aria[2], stepNo(3)),
    svg('0 0 240 150', `${ladle(160, 56, -28)}${hand(196, 70, { dir: 1, rotate: -20 })}${drops([[128, 80], [124, 96, 0.8], [132, 104, 0.7]])}${hand(70, 100, { dir: 1, highlight: true })}${caption(T.steps[3])}`, T.aria[3], stepNo(4)),
    svg('0 0 240 150', `${ladle(120, 34, 90)}${hand(146, 86, { dir: -1, rotate: -90 })}${drops([[112, 70, 0.8], [112, 92, 0.7], [112, 112, 0.7], [112, 128, 0.6]])}${caption(T.steps[4])}`, T.aria[4], stepNo(5)),
  ]

  // ---- 参拝 ----
  const S = L.sanpai
  const sanpaiSteps = [
    svg('0 0 240 150', `${person(110, 86, 80)}${text(196, 70, '×2', { size: 22, color: C.gold })}${caption(S.steps[0])}`, S.aria[0], stepNo(1)),
    svg('0 0 240 150', `${frontHands(120, 64, { offset: 8, marks: S.clap })}${caption(S.steps[1])}`, S.aria[1], stepNo(2)),
    svg('0 0 240 150', `${frontHands(120, 64, { glow: true })}${caption(S.steps[2])}`, S.aria[2], stepNo(3)),
    svg('0 0 240 150', `${person(110, 86, 80)}${text(196, 70, '×1', { size: 22, color: C.gold })}${caption(S.steps[3])}`, S.aria[3], stepNo(4)),
  ]

  const D = L.sando
  const sando = svg('0 0 240 200', `
    <rect x="80" y="30" width="80" height="150" fill="rgba(232,194,106,0.12)" stroke="${C.gold}" stroke-opacity="0.4"/>
    <line x1="120" y1="40" x2="120" y2="170" stroke="${C.gold}" stroke-width="2" stroke-dasharray="6 6"/>
    ${text(120, 22, D.hall)}
    <rect x="88" y="4" width="64" height="8" rx="2" fill="${C.woodDark}"/>
    ${torii(120, 196, 0.55)}
    ${text(198, 104, D.center, { color: C.gold, size: fit(D.center, 14, 70) })}${text(198, 122, D.centerNote, { color: C.muted, size: fit(D.centerNote, 10, 70) })}
    <path d="M 168 100 L 128 100" stroke="${C.gold}" stroke-width="1.5" marker-end="url(#sd-a1)"/>${arrowDef('sd-a1', C.gold)}
    ${[150, 128, 106, 84, 62].map((yy, i) => `<ellipse cx="${i % 2 ? 98 : 106}" cy="${yy}" rx="4" ry="6" fill="${C.ink}" opacity="0.8"/>`).join('')}
    ${text(40, 104, D.side, { size: fit(D.side, 13, 70) })}
    <path d="M 66 100 L 92 100" stroke="${C.ink}" stroke-width="1.5" marker-end="url(#sd-a2)"/>${arrowDef('sd-a2', C.ink)}
  `, D.aria)

  // ---- 神社とお寺 ----
  const J = L.compare
  const jinjaTeraCompare = svg('0 0 300 210', `
    <rect x="6" y="6" width="138" height="198" rx="14" fill="rgba(210,67,58,0.12)" stroke="${C.red}" stroke-opacity="0.6"/>
    <rect x="156" y="6" width="138" height="198" rx="14" fill="rgba(200,138,76,0.12)" stroke="${C.wood}" stroke-opacity="0.6"/>
    ${text(75, 30, J.shrine, { size: fit(J.shrine, 17, 120) })}${text(225, 30, J.temple, { size: fit(J.temple, 17, 120) })}
    ${torii(75, 104, 0.8)}${sanmon(225, 104, 0.85)}
    ${text(75, 124, J.torii, { size: fit(J.torii, 12, 120), color: C.muted })}${text(225, 124, J.sanmon, { size: fit(J.sanmon, 12, 120), color: C.muted })}
    ${frontHands(75, 154, { offset: 6, scale: 0.5 })}${frontHands(225, 154, { scale: 0.5 })}
    ${text(48, 166, J.clapSound, { size: 10, color: C.gold })}${text(102, 166, J.clapSound, { size: 10, color: C.gold })}
    ${text(75, 196, J.clap, { size: fit(J.clap, 13, 125), color: C.gold })}${text(225, 196, J.noClap, { size: fit(J.noClap, 13, 125), color: C.gold })}
  `, J.aria)

  // ---- お守り ----
  const O = L.omamori
  const omamori = svg('0 0 320 180', `
    ${omamoriPouch(60, 78, 1)}
    ${text(60, 150, O.carry, { size: fit(O.carry, 13, 110), color: C.ink })}
    <path d="M 108 76 L 200 76" stroke="${C.gold}" stroke-width="2.5" stroke-dasharray="6 5" marker-end="url(#om-a)"/>${arrowDef('om-a', C.gold)}
    ${text(154, 64, O.year, { size: fit(O.year, 15, 90), color: C.gold })}
    ${text(154, 98, O.thanks, { size: fit(O.thanks, 11, 90), color: C.muted })}
    ${returnBox(256, 84, 1)}
    ${text(256, 150, O.give, { size: fit(O.give, 13, 110), color: C.ink })}
    ${text(160, 174, O.note, { size: fit(O.note, 11, 300), color: C.muted })}
  `, O.aria)

  // ---- お賽銭 ----
  const M = L.saisen
  const saisen = svg('0 0 320 190', `
    ${coin(70, 60, 30)}
    ${text(70, 116, M.coin, { size: fit(M.coin, 14, 120), color: C.gold })}
    ${text(70, 136, M.coinNote, { size: fit(M.coinNote, 11, 120), color: C.muted })}
    ${coin(222, 34, 13)}
    <path d="M 222 52 L 222 92" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="3 4" marker-end="url(#ss-a)"/>${arrowDef('ss-a', C.ink)}
    ${text(268, 66, M.gently, { size: fit(M.gently, 12, 90), color: C.ink })}
    ${saisenBox(222, 130)}
    ${text(222, 186, M.noThrow, { size: fit(M.noThrow, 11, 190), color: C.gold })}
  `, M.aria)

  // ---- 初詣の時期 ----
  const H = L.hatsumode
  const cell = (day, i) => {
    const row = i < 8 ? 0 : 1
    const col = i < 8 ? i : i - 8
    const x = 22 + col * 35
    const y = 44 + row * 44
    const fill = day <= 3 ? C.gold : day <= 7 ? 'rgba(232,194,106,0.45)' : 'rgba(232,194,106,0.15)'
    const color = day <= 3 ? '#2a1a00' : C.ink
    return `<rect x="${x}" y="${y}" width="30" height="34" rx="6" fill="${fill}"/>${text(x + 15, y + 23, day, { size: 14, color })}`
  }
  const hatsumode = svg('0 0 320 200', `
    ${text(160, 26, H.month, { size: 16, color: C.ink })}
    ${Array.from({ length: 15 }, (_, i) => cell(i + 1, i)).join('')}
    <rect x="18" y="140" width="14" height="14" rx="3" fill="${C.gold}"/>${text(38, 152, H.sanganichi, { size: fit(H.sanganichi, 12, 250), color: C.ink, anchor: 'start' })}
    <rect x="18" y="162" width="14" height="14" rx="3" fill="rgba(232,194,106,0.45)"/>${text(38, 174, H.matsunouchi, { size: fit(H.matsunouchi, 12, 250), color: C.ink, anchor: 'start' })}
    <rect x="18" y="184" width="14" height="14" rx="3" fill="rgba(232,194,106,0.15)"/>${text(38, 196, H.kansai, { size: fit(H.kansai, 12, 250), color: C.muted, anchor: 'start' })}
  `, H.aria)

  // ---- 御朱印 ----
  const G = L.goshuin
  const goshuinSteps = [
    svg('0 0 240 150', `${torii(62, 104, 0.7)}${person(140, 86, 80)}${caption(G.steps[0])}`, G.aria[0], stepNo(1)),
    svg('0 0 240 150', `${juyosho(120, 92, G.sign)}${caption(G.steps[1])}`, G.aria[1], stepNo(2)),
    svg('0 0 240 150', `${goshuinBook(120, 72, { s: 0.85 })}${hand(170, 112, { dir: -1, rotate: -15 })}${caption(G.steps[2])}`, G.aria[2], stepNo(3)),
    svg('0 0 240 150', `${goshuinBook(110, 72, { sealed: true, s: 0.85 })}${coin(196, 96, 14)}${caption(G.steps[3])}`, G.aria[3], stepNo(4)),
  ]

  return { temizuSteps, sanpaiSteps, sando, jinjaTeraCompare, omamori, saisen, hatsumode, goshuinSteps }
}

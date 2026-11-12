// 追加の鑑定の計算(純粋関数)。文章は言語ごとのデータ(data/{言語}.js)にあり、ここでは「どの結果か」だけを決める。
import { hashString, lifePathNumber, nameNumber, personalYearNumber, reduceNumber, seededRandom, soulNumber, zodiacIndex } from '../fortune.js'

// ---- 干支(十二支)・守り本尊 ----
// 年の干支は1月1日で切り替える(日本で一般的な数え方)。0=子 … 11=亥
export function etoIndex(birth) {
  return (((birth.year - 4) % 12) + 12) % 12
}

// 守り本尊(生まれ年の干支ごとの8尊)
export const HONZON_KEYS = ['senju', 'kokuzo', 'kokuzo', 'monju', 'fugen', 'fugen', 'seishi', 'dainichi', 'dainichi', 'fudo', 'amida', 'amida']
export function honzonKey(birth) {
  return HONZON_KEYS[etoIndex(birth)]
}

// 干支の相性: 三合(4つ違い)と支合(六合)
const SHIGO = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]]
export function etoPartners(index) {
  const sango = [(index + 4) % 12, (index + 8) % 12]
  const pair = SHIGO.find(([a, b]) => a === index || b === index)
  const rokugo = pair[0] === index ? pair[1] : pair[0]
  return { sango, rokugo }
}

// ---- 九星気学 ----
// 年の区切りは立春(2月4日ごろ)。それより前に生まれた人は前の年として数える。
export function kyuseiYear(date) {
  return date.month < 2 || (date.month === 2 && date.day < 4) ? date.year - 1 : date.year
}

// その年の九星(1=一白水星 … 9=九紫火星)
export function kyuseiOfYear(year) {
  const digits = reduceNumber(String(year).split('').reduce((a, d) => a + Number(d), 0), false)
  const star = 11 - digits
  return star > 9 ? star - 9 : star
}

export function honmeiStar(birth) {
  return kyuseiOfYear(kyuseiYear(birth))
}

// 九星の五行(相性を出すため)
export const KYUSEI_ELEMENT = { 1: 'water', 2: 'earth', 3: 'wood', 4: 'wood', 5: 'earth', 6: 'metal', 7: 'metal', 8: 'earth', 9: 'fire' }
const GENERATES = { water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water' }

// 相性の良い星: 自分を生かす五行・自分が生かす五行、同じ五行
export function kyuseiPartners(star) {
  const el = KYUSEI_ELEMENT[star]
  const result = []
  for (let s = 1; s <= 9; s += 1) {
    if (s === star) continue
    const other = KYUSEI_ELEMENT[s]
    if (GENERATES[el] === other || GENERATES[other] === el || other === el) result.push(s)
  }
  return result
}

// 年盤での位置(今年の運勢)。中宮→乾→兌→艮→離→坎→坤→震→巽 の順に九星が並ぶ
export const PALACE_ORDER = ['center', 'northwest', 'west', 'northeast', 'south', 'north', 'southwest', 'east', 'southeast']
export function kyuseiPalace(star, centerStar) {
  return PALACE_ORDER[(((star - centerStar) % 9) + 9) % 9]
}

// ---- 星座・誕生石 ----
// 星座は fortune.js の zodiacIndex(0=やぎ座 … 11=いて座)を使う。
export const ZODIAC_ELEMENT = ['earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire']
const ELEMENT_FRIEND = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' }
export function zodiacPartners(index) {
  const el = ZODIAC_ELEMENT[index]
  return ZODIAC_ELEMENT.map((e, i) => (i !== index && (e === el || e === ELEMENT_FRIEND[el]) ? i : -1)).filter((i) => i >= 0)
}
export { zodiacIndex }

// ---- 月の満ち欠け ----
const SYNODIC = 29.530588853
// 2000年1月6日18:14(UTC)の新月を基準にした月齢(0〜29.5)
export function moonAge(date) {
  const jd = Date.UTC(date.year, date.month - 1, date.day, 12) / 86400000 + 2440587.5
  const age = ((jd - 2451550.26) % SYNODIC + SYNODIC) % SYNODIC
  return age
}
// 8つの形: 0=新月 1=三日月 2=上弦 3=十三夜(満ちていく月) 4=満月 5=寝待月(欠けていく月) 6=下弦 7=有明月
export function moonPhaseIndex(date) {
  return Math.floor((moonAge(date) / SYNODIC) * 8 + 0.5) % 8
}

// ---- ケルトの樹木暦 ----
// 各期間の最初の日(月, 日)。0=シラカバ(12/24〜1/20)… 12=ニワトコ(11/25〜12/23)
const CELTIC_START = [[12, 24], [1, 21], [2, 18], [3, 18], [4, 15], [5, 13], [6, 10], [7, 8], [8, 5], [9, 2], [9, 30], [10, 28], [11, 25]]
export const CELTIC_KEYS = ['birch', 'rowan', 'ash', 'alder', 'willow', 'hawthorn', 'oak', 'holly', 'hazel', 'vine', 'ivy', 'reed', 'elder']
export function celticTreeIndex(date) {
  const md = date.month * 100 + date.day
  if (md >= 1224 || md <= 120) return 0
  for (let i = CELTIC_START.length - 1; i >= 1; i -= 1) {
    const [m, d] = CELTIC_START[i]
    if (md >= m * 100 + d) return i
  }
  return 0
}

// ---- 数秘術の追加 ----
// 誕生数(バースデーナンバー): 生まれた日だけを還元(11・22は残す)
export function birthDayNumber(birth) {
  return reduceNumber(birth.day)
}

// 個人月数(パーソナルマンス)
export function personalMonthNumber(birth, year, month) {
  return reduceNumber(personalYearNumber(birth, year) + reduceNumber(month, false), false)
}

export function numerologyChart(birth, name, today) {
  const chart = {
    lifePath: lifePathNumber(birth),
    birthday: birthDayNumber(birth),
    personalYear: personalYearNumber(birth, today.year),
    personalMonth: personalMonthNumber(birth, today.year, today.month),
  }
  if (name && name.trim()) {
    chart.expression = nameNumber(name)
    chart.soul = soulNumber(name)
  }
  return chart
}

// ---- エンジェルナンバー ----
// 数字の並びの種類を判定する。repeat=ゾロ目、sequence=連番、mirror=左右対称、mix=それ以外
export function angelNumberKind(text) {
  const digits = String(text || '').replace(/\D/g, '')
  if (digits.length === 0) return null
  if (digits.length >= 2 && /^(\d)\1+$/.test(digits)) return { kind: 'repeat', digit: Number(digits[0]), digits }
  const ns = digits.split('').map(Number)
  if (digits.length >= 3) {
    const up = ns.every((n, i) => i === 0 || n === ns[i - 1] + 1)
    const down = ns.every((n, i) => i === 0 || n === ns[i - 1] - 1)
    if (up || down) return { kind: 'sequence', direction: up ? 'up' : 'down', digits }
    if (digits === digits.split('').reverse().join('')) return { kind: 'mirror', digits }
  }
  return { kind: 'mix', digits }
}

// 数字に含まれる数(重複なし、出てくる順)と、全体を足して還元した数
export function angelNumberParts(digits) {
  const unique = [...new Set(digits.split('').map(Number))]
  const total = reduceNumber(digits.split('').reduce((a, d) => a + Number(d), 0), false)
  return { unique, total }
}

// ---- 前世鑑定 ----
// 生年月日(+名前)から、時代と場所・職業を決める。教訓は運命数(1〜9)から。
export const PASTLIFE_WORLDS = 12
export const PASTLIFE_JOBS = 16
export function pastLife(birthText, birth, name = '') {
  const rand = seededRandom(hashString(`pastlife:${birthText}:${(name || '').trim()}`))
  return {
    world: Math.floor(rand() * PASTLIFE_WORLDS),
    job: Math.floor(rand() * PASTLIFE_JOBS),
    lesson: reduceNumber(lifePathNumber(birth), false),
  }
}

// ---- テーマ別のおみくじ(縁結び・金運) ----
const OMIKUJI_WEIGHTS = [16, 20, 20, 24, 14, 6]
export function themedFortune(theme, birthText, dateText, itemCount, actionCount) {
  const rand = seededRandom(hashString(`${theme}:${birthText}:${dateText}`))
  const total = OMIKUJI_WEIGHTS.reduce((a, b) => a + b, 0)
  let r = rand() * total
  let omikujiIndex = OMIKUJI_WEIGHTS.length - 1
  for (let i = 0; i < OMIKUJI_WEIGHTS.length; i += 1) {
    r -= OMIKUJI_WEIGHTS[i]
    if (r < 0) {
      omikujiIndex = i
      break
    }
  }
  return {
    omikujiIndex,
    stickNumber: Math.floor(rand() * 50) + 1,
    itemPicks: Array.from({ length: itemCount }, () => (rand() < 0.5 ? 0 : 1)),
    action: Math.floor(rand() * actionCount),
    score: [5, 4, 4, 3, 3, 2][omikujiIndex],
  }
}

// ---- 引く占い(タロット・ルーン・振り子) ----
// 毎回ちがう結果にするため、暗号用の乱数を使う(テストでは random を差し替える)
export function randomInt(max, random = Math.random) {
  if (random === Math.random && typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] % max
  }
  return Math.floor(random() * max)
}

export function drawTarot(random) {
  return { card: randomInt(22, random), reversed: randomInt(2, random) === 1 }
}

export function drawRune(random) {
  return { rune: randomInt(24, random) }
}

// 振り子: 0=はい 1=いいえ 2=今はまだ 3=もう一度心を整えて
export function swingPendulum(random) {
  const r = randomInt(100, random)
  if (r < 40) return 0
  if (r < 80) return 1
  if (r < 93) return 2
  return 3
}

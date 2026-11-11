// 鑑定ロジック(純粋関数のみ。UIから独立させてテスト可能にしている)
// 同じ入力には常に同じ結果を返す。「今日の運勢」は日付も入力に含めるので日替わりになる。

// ---- 共通ユーティリティ ----

// 文字列から32bitハッシュを作る(FNV-1a)。乱数の種として使う。
export function hashString(text) {
  let hash = 0x811c9dc5
  for (const ch of text) {
    hash ^= ch.codePointAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

// 種から決定的な疑似乱数列を作る(mulberry32)。
export function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function digitSum(n) {
  return String(n)
    .split('')
    .reduce((sum, d) => sum + Number(d), 0)
}

// 数秘術の還元: 1桁になるまで各桁を足す。11・22・33 はマスターナンバーとして残す。
export function reduceNumber(n, keepMaster = true) {
  let value = Math.abs(n)
  while (value > 9) {
    if (keepMaster && (value === 11 || value === 22 || value === 33)) return value
    value = digitSum(value)
  }
  return value
}

// "YYYY-MM-DD" を { year, month, day } に。不正なら null。
export function parseDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '')
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return { year, month, day }
}

export function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// ---- 誕生日鑑定 ----

// 運命数(ライフパスナンバー): 生年月日の全桁を足して還元する。
export function lifePathNumber(birth) {
  const { year, month, day } = birth
  return reduceNumber(digitSum(year) + digitSum(month) + digitSum(day))
}

// 個人年数(パーソナルイヤー): 誕生月日 + 対象年 を還元(マスターは使わない)。
export function personalYearNumber(birth, targetYear) {
  return reduceNumber(digitSum(birth.month) + digitSum(birth.day) + digitSum(targetYear), false)
}

// 誕生日から星座を求める。
// 星座: 各星座の最終日(月, 日)。並びは やぎ座(1月)→…→いて座→やぎ座(12月末)。
// 名前は言語ごとの辞書(i18n)の zodiac 配列に、同じ並び(0=やぎ座 … 11=いて座)で入れる。
const ZODIAC_UNTIL = [[1, 19], [2, 18], [3, 20], [4, 19], [5, 20], [6, 21], [7, 22], [8, 22], [9, 22], [10, 23], [11, 22], [12, 21], [12, 31]]
export const ZODIAC_EMOJI = ['♑', '♒', '♓', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐']

// 星座の番号(0〜11)を返す
export function zodiacIndex(birth) {
  const i = ZODIAC_UNTIL.findIndex(([m, d]) => birth.month < m || (birth.month === m && birth.day <= d))
  return i % 12
}

// ---- 名前鑑定 ----

const KANA_ROWS = [
  'あいうえお',
  'かきくけこ',
  'さしすせそ',
  'たちつてと',
  'なにぬねの',
  'はひふへほ',
  'まみむめも',
  'や ゆ よ',
  'らりるれろ',
  'わゐ ゑを',
]
const VOICED = { が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ', ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ', だ: 'た', ぢ: 'ち', づ: 'つ', で: 'て', ど: 'と', ば: 'は', び: 'ひ', ぶ: 'ふ', べ: 'へ', ぼ: 'ほ', ぱ: 'は', ぴ: 'ひ', ぷ: 'ふ', ぺ: 'へ', ぽ: 'ほ', ゔ: 'う' }
const SMALL = { ぁ: 'あ', ぃ: 'い', ぅ: 'う', ぇ: 'え', ぉ: 'お', ゃ: 'や', ゅ: 'ゆ', ょ: 'よ', っ: 'つ', ゎ: 'わ' }

// カタカナ→ひらがな、ラテン文字のアクセント除去(ñ→n, é→e)、空白除去
export function normalizeName(name) {
  return (name || '')
    .normalize('NFKC')
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[À-ɏ]/g, (ch) => ch.normalize('NFD')[0])
    .replace(/[\s・·.\-'’]/g, '')
}

// ---- 漢字の画数 ----
// 画数表(src/strokes-data.js)は大きめなので、漢字の名前が入力されたときだけ読み込む。
const HAN = /\p{Script=Han}/u
let strokeTable = null

export function containsHan(text) {
  return HAN.test(text || '')
}

export function parseStrokeData(encoded) {
  const table = new Map()
  for (const group of encoded.split('|')) {
    const [count, chars] = group.split(':')
    for (const ch of chars) table.set(ch, Number(count))
  }
  return table
}

export function setStrokeTable(table) {
  strokeTable = table
}

export async function loadStrokeTable() {
  if (!strokeTable) {
    const mod = await import('./strokes-data.js')
    strokeTable = parseStrokeData(mod.default)
  }
  return strokeTable
}

export function strokeCount(ch) {
  return strokeTable?.get(ch) ?? null
}

// ---- ハングル ----
// 音節を「初声・中声・終声」に分解する(例: 한 → ㅎ + ㅏ + ㄴ)。
function decomposeHangul(ch) {
  const code = ch.codePointAt(0) - 0xac00
  if (code < 0 || code > 11171) return null
  return { initial: Math.floor(code / 588), vowel: Math.floor((code % 588) / 28), final: code % 28 }
}

// 1文字を数秘術の数(1〜9)に変換する。
// ひらがな: 五十音の通し番号を還元。濁音・半濁音は清音+1、小書き文字は元の文字と同じ。
// アルファベット: ピタゴラス式(A=1 … I=9, J=1 …)。中国語のピンインもこれで数える。
// ハングル: 初声・中声・終声の番号の合計を還元。
// 漢字: 画数を還元(画数表にない字は文字コードから決める)。
export function charNumber(ch) {
  const lower = ch.toLowerCase()
  if (/^[a-z]$/.test(lower)) return ((lower.charCodeAt(0) - 97) % 9) + 1
  if (ch === 'ん') return reduceNumber(46, false)
  if (ch === 'ー') return 1
  const hangul = decomposeHangul(ch)
  if (hangul) return reduceNumber(hangul.initial + 1 + hangul.vowel + 1 + hangul.final, false)
  const strokes = strokeCount(ch)
  if (strokes) return reduceNumber(strokes, false)
  const base = SMALL[ch] || VOICED[ch] || ch
  const bonus = VOICED[ch] ? 1 : 0
  for (let row = 0; row < KANA_ROWS.length; row += 1) {
    const col = KANA_ROWS[row].indexOf(base)
    if (col >= 0 && base !== ' ') return reduceNumber(row * 5 + col + 1 + bonus, false)
  }
  return (ch.codePointAt(0) % 9) + 1
}

// 名前の数(ネームナンバー)
export function nameNumber(name) {
  const chars = [...normalizeName(name)]
  if (chars.length === 0) return null
  return reduceNumber(chars.reduce((sum, ch) => sum + charNumber(ch), 0))
}

// 「魂の数」(内面)。
// かな: 各文字の段(あ段=1 … お段=5)、ローマ字: 母音、ハングル: 中声(母音)の番号を足す。
// 漢字だけの名前: 1文字目を姓とみなし、2文字目以降(名)の画数を足す。
export function soulNumber(name) {
  const chars = [...normalizeName(name)]
  if (chars.length >= 2 && chars.every((ch) => strokeCount(ch))) {
    return reduceNumber(chars.slice(1).reduce((sum, ch) => sum + strokeCount(ch), 0))
  }
  let sum = 0
  for (const ch of chars) {
    const lower = ch.toLowerCase()
    if ('aeiou'.includes(lower)) {
      sum += charNumber(lower)
      continue
    }
    const hangul = decomposeHangul(ch)
    if (hangul) {
      sum += hangul.vowel + 1
      continue
    }
    const base = SMALL[ch] || VOICED[ch] || ch
    for (const row of KANA_ROWS) {
      const col = row.indexOf(base)
      if (col >= 0 && base !== ' ') sum += col + 1
    }
  }
  return sum === 0 ? nameNumber(name) : reduceNumber(sum)
}

// ---- 今日の運勢 ----

// おみくじの段階(0=大吉 … 5=凶)。紙は日本語のまま表示し、訳は辞書の omikujiRanks に入れる。
export const OMIKUJI = ['大吉', '中吉', '小吉', '吉', '末吉', '凶']
// 大吉・吉が出やすく、凶はたまに出る程度の重み
const OMIKUJI_WEIGHTS = [16, 20, 20, 24, 14, 6]
const OMIKUJI_BASE_SCORES = [5, 4, 4, 3, 3, 2]

function pickWeighted(rand, weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < weights.length; i += 1) {
    r -= weights[i]
    if (r < 0) return i
  }
  return weights.length - 1
}

// ラッキーカラー等の候補数。中身(文言)は言語ごとの辞書に、同じ数だけ同じ並びで入れる。
export const LUCKY_COLOR_COUNT = 12
export const LUCKY_ITEM_COUNT = 16
export const LUCKY_ACTION_COUNT = 12

// 生年月日と日付から今日の運勢を出す。scores は 1〜5。lucky〜 は候補の番号(辞書で文言にする)。
export function dailyFortune(birthText, dateText) {
  const rand = seededRandom(hashString(`daily:${birthText}:${dateText}`))
  const omikujiIndex = pickWeighted(rand, OMIKUJI_WEIGHTS)
  // おみくじの結果を基準に、各運をぶれさせる(凶でも総合運は★2にとどめる)
  const base = OMIKUJI_BASE_SCORES[omikujiIndex]
  const score = () => Math.max(1, Math.min(5, base + Math.floor(rand() * 3) - 1))
  return {
    omikujiIndex,
    omikuji: OMIKUJI[omikujiIndex],
    scores: { total: base, love: score(), money: score(), work: score(), health: score() },
    luckyColor: Math.floor(rand() * LUCKY_COLOR_COUNT),
    luckyItem: Math.floor(rand() * LUCKY_ITEM_COUNT),
    luckyNumber: Math.floor(rand() * 9) + 1,
    luckyAction: Math.floor(rand() * LUCKY_ACTION_COUNT),
    // おみくじの棒の番号(1〜50)と、紙に書く各項目の文言の選び方(0か1)
    stickNumber: Math.floor(rand() * 50) + 1,
    itemPicks: Array.from({ length: 7 }, () => (rand() < 0.5 ? 0 : 1)),
  }
}

// おみくじの吉凶を、紙の文言の3段階に分ける
export function omikujiTier(omikujiIndex) {
  if (omikujiIndex <= 1) return 'good'
  if (omikujiIndex <= 3) return 'mid'
  return 'low'
}

// 1〜99 を漢数字に(23 → 二十三)
export function toKanjiNumber(n) {
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return (tens ? (tens === 1 ? '' : digits[tens]) + '十' : '') + digits[ones]
}

// ---- 相性鑑定 ----

// 運命数同士の基本相性(1〜9に還元した数で判定)
// 同じ数: 似た者同士、差が3・6: 調和(三角の関係)、足して10: 補い合う、その他: 刺激し合う
export function numberRelation(a, b) {
  const x = reduceNumber(a, false)
  const y = reduceNumber(b, false)
  if (x === y) return 'same'
  if (x + y === 10) return 'complement'
  if (Math.abs(x - y) % 3 === 0) return 'harmony'
  return 'stimulus'
}

const RELATION_BASE = { same: 82, harmony: 88, complement: 78, stimulus: 66 }

// 2人の相性%を出す。順番を入れ替えても同じ結果になるようにキーを並べ替える。
export function compatibility(personA, personB) {
  const lpA = lifePathNumber(personA.birth)
  const lpB = lifePathNumber(personB.birth)
  const relation = numberRelation(lpA, lpB)
  const key = [personA, personB]
    .map((p) => `${p.birthText}|${normalizeName(p.name)}`)
    .sort()
    .join('::')
  const rand = seededRandom(hashString(`compat:${key}`))
  let percent = RELATION_BASE[relation] + Math.floor(rand() * 21) - 8
  // 名前が両方あれば名前の数でも少し補正
  const nA = personA.name ? nameNumber(personA.name) : null
  const nB = personB.name ? nameNumber(personB.name) : null
  if (nA && nB) {
    const nameRelation = numberRelation(nA, nB)
    percent += nameRelation === 'stimulus' ? -2 : 4
  }
  percent = Math.max(42, Math.min(99, percent))
  return {
    percent,
    relation,
    lifePaths: [lpA, lpB],
    sub: {
      talk: Math.max(1, Math.min(5, Math.round(percent / 20) + Math.floor(rand() * 3) - 1)),
      heart: Math.max(1, Math.min(5, Math.round(percent / 20) + Math.floor(rand() * 3) - 1)),
      future: Math.max(1, Math.min(5, Math.round(percent / 20) + Math.floor(rand() * 3) - 1)),
    },
  }
}

// 2体のキャラから相性結果を組み立てる。
// キャラは { name, code, set } で渡す(code は characterAttributes の4文字)。
import { ELEMENT_ORDER, BASE_ORDER, BASE_NAMES, ELEMENT_TEXTS, BASE_TEXTS } from './compatTexts.js'

const GRADE_SCORE = { '◎': 40, '○': 30, '△': 20 }

const fill = (text, a, b) => text.replaceAll('{A}', a).replaceAll('{B}', b)

// 並び順に従って2つを並べ替え、入れ替えたかどうかも返す
function order(x, y, list) {
  return list.indexOf(x) <= list.indexOf(y) ? [x, y, false] : [y, x, true]
}

// ペアごとに毎回同じになる 0〜(n-1) の値(順不同)
function pairHash(a, b, n) {
  const key = [a, b].sort().join('|')
  let h = 0
  for (const ch of key) h = (h * 31 + ch.codePointAt(0)) >>> 0
  return h % n
}

export function getCompat(a, b) {
  const [e1, e2, eSwap] = order(a.code[3], b.code[3], ELEMENT_ORDER)
  const [b1, b2, bSwap] = order(a.code.slice(0, 3), b.code.slice(0, 3), BASE_ORDER)
  const element = ELEMENT_TEXTS[e1 + e2]
  const base = BASE_TEXTS[`${b1}-${b2}`]
  const [eA, eB] = eSwap ? [b.name, a.name] : [a.name, b.name]
  const [bA, bB] = bSwap ? [b.name, a.name] : [a.name, b.name]

  const sameVillage = a.set === b.set
  const raw = 45 + GRADE_SCORE[element.grade] + (sameVillage ? 5 : 0) + pairHash(a.name, b.name, 15)
  const score = Math.max(60, Math.min(99, raw))

  return {
    score,
    grade: element.grade,
    title: base.title,
    elementTitle: element.title,
    baseNames: [BASE_NAMES[a.code.slice(0, 3)], BASE_NAMES[b.code.slice(0, 3)]],
    elementText: fill(element.body, eA, eB),
    baseText: fill(base.body, bA, bB),
    tip: fill(base.tip, bA, bB),
    sameVillage,
  }
}

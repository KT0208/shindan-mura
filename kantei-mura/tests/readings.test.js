import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  angelNumberKind, angelNumberParts, celticTreeIndex, CELTIC_KEYS, drawRune, drawTarot, etoIndex, etoPartners,
  honmeiStar, honzonKey, kyuseiOfYear, kyuseiPalace, kyuseiPartners, kyuseiYear, moonPhaseIndex, numerologyChart,
  pastLife, personalMonthNumber, swingPendulum, themedFortune, zodiacPartners,
} from '../src/readings/logic.js'

test('eto and honzon', () => {
  assert.equal(etoIndex({ year: 2020 }), 0) // 子
  assert.equal(etoIndex({ year: 2024 }), 4) // 辰
  assert.equal(etoIndex({ year: 1990 }), 6) // 午
  assert.equal(honzonKey({ year: 2020 }), 'senju')
  assert.equal(honzonKey({ year: 1993 }), 'fudo') // 酉
  assert.deepEqual(etoPartners(0), { sango: [4, 8], rokugo: 1 })
  assert.equal(etoPartners(6).rokugo, 7)
})

test('kyusei', () => {
  assert.equal(kyuseiOfYear(1990), 1)
  assert.equal(kyuseiOfYear(1991), 9)
  assert.equal(kyuseiOfYear(2000), 9)
  assert.equal(kyuseiOfYear(2026), 1)
  assert.equal(kyuseiYear({ year: 1991, month: 2, day: 3 }), 1990)
  assert.equal(honmeiStar({ year: 1991, month: 2, day: 3 }), 1)
  assert.equal(honmeiStar({ year: 1991, month: 2, day: 4 }), 9)
  assert.equal(kyuseiPalace(1, 1), 'center')
  assert.equal(kyuseiPalace(2, 1), 'northwest')
  assert.ok(kyuseiPartners(1).includes(3)) // 水→木
  assert.ok(kyuseiPartners(1).includes(6)) // 金→水
  assert.ok(!kyuseiPartners(1).includes(9)) // 水と火
})

test('moon phase', () => {
  assert.equal(moonPhaseIndex({ year: 2024, month: 1, day: 11 }), 0) // 新月
  assert.equal(moonPhaseIndex({ year: 2024, month: 1, day: 25 }), 4) // 満月
  assert.equal(moonPhaseIndex({ year: 2024, month: 1, day: 18 }), 2) // 上弦
})

test('celtic tree', () => {
  assert.equal(CELTIC_KEYS[celticTreeIndex({ month: 1, day: 1 })], 'birch')
  assert.equal(CELTIC_KEYS[celticTreeIndex({ month: 12, day: 24 })], 'birch')
  assert.equal(CELTIC_KEYS[celticTreeIndex({ month: 2, day: 18 })], 'ash')
  assert.equal(CELTIC_KEYS[celticTreeIndex({ month: 6, day: 10 })], 'oak')
  assert.equal(CELTIC_KEYS[celticTreeIndex({ month: 12, day: 23 })], 'elder')
})

test('numerology chart and month', () => {
  const birth = { year: 1990, month: 5, day: 15 }
  const c = numerologyChart(birth, 'Taro', { year: 2026, month: 11 })
  assert.equal(c.lifePath, 3)
  assert.equal(c.birthday, 6)
  assert.ok(c.expression && c.soul)
  assert.equal(numerologyChart(birth, '', { year: 2026, month: 11 }).expression, undefined)
  for (let m = 1; m <= 12; m += 1) {
    const pm = personalMonthNumber(birth, 2026, m)
    assert.ok(pm >= 1 && pm <= 9)
  }
})

test('angel numbers', () => {
  assert.equal(angelNumberKind('777').kind, 'repeat')
  assert.equal(angelNumberKind('1111').digit, 1)
  assert.equal(angelNumberKind('1234').kind, 'sequence')
  assert.equal(angelNumberKind('321').direction, 'down')
  assert.equal(angelNumberKind('1221').kind, 'mirror')
  assert.equal(angelNumberKind('1027').kind, 'mix')
  assert.equal(angelNumberKind('ab'), null)
  assert.deepEqual(angelNumberParts('1027').unique, [1, 0, 2, 7])
  assert.ok(angelNumberParts('1027').total >= 1)
})

test('signs, past life, omikuji and draws', () => {
  assert.deepEqual(zodiacPartners(3).sort((a, b) => a - b), [1, 5, 7, 9, 11]) // おひつじ座: 火と風
  const pl = pastLife('1990-05-15', { year: 1990, month: 5, day: 15 })
  assert.deepEqual(pl, pastLife('1990-05-15', { year: 1990, month: 5, day: 15 }))
  assert.ok(pl.world < 12 && pl.job < 16 && pl.lesson >= 1 && pl.lesson <= 9)
  const f = themedFortune('enmusubi', '1990-05-15', '2026-11-12', 7, 12)
  assert.equal(f.itemPicks.length, 7)
  assert.ok(f.action < 12)
  let i = 0
  const seq = [0.1, 0.9, 0.5]
  const fake = () => seq[i++ % seq.length]
  assert.deepEqual(drawTarot(fake), { card: 2, reversed: true })
  assert.ok(drawRune().rune < 24)
  assert.ok([0, 1, 2, 3].includes(swingPendulum()))
})

// 追加の鑑定の文章データが、すべての言語で日本語と同じ形か
import jaData from '../src/readings/data/ja.js'
import { LANGUAGES } from '../src/i18n/languages.js'

function sameShape(reference, target, path) {
  if (typeof reference === 'function') {
    assert.equal(typeof target, 'function', `${path} should be a function`)
    return
  }
  if (Array.isArray(reference)) {
    assert.ok(Array.isArray(target), `${path} should be an array`)
    assert.equal(target.length, reference.length, `${path} length`)
    reference.forEach((item, i) => sameShape(item, target[i], `${path}[${i}]`))
    return
  }
  if (reference && typeof reference === 'object') {
    assert.ok(target && typeof target === 'object', `${path} should be an object`)
    assert.deepEqual(Object.keys(target).sort(), Object.keys(reference).sort(), `${path} keys`)
    for (const key of Object.keys(reference)) sameShape(reference[key], target[key], `${path}.${key}`)
    return
  }
  assert.equal(typeof target, typeof reference, `${path} type`)
  if (typeof reference === 'string') assert.ok(target.trim().length > 0, `${path} is empty`)
}

for (const lang of LANGUAGES.filter((l) => l.code !== 'ja')) {
  test(`${lang.code} reading texts match the Japanese shape`, async () => {
    const data = (await import(`../src/readings/data/${lang.code}.js`)).default
    sameShape(jaData, data, lang.code)
    // 関数が文字列を返すこと
    assert.equal(typeof data.pastlife.story(data.pastlife.worlds[0], data.pastlife.jobs[0]), 'string')
    assert.equal(typeof data.tarot.share('x', 'y'), 'string')
  })
}

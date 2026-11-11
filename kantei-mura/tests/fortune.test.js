import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  charNumber,
  compatibility,
  dailyFortune,
  lifePathNumber,
  nameNumber,
  normalizeName,
  parseDate,
  personalYearNumber,
  reduceNumber,
  soulNumber,
  zodiacSign,
} from '../src/fortune.js'
import { numberTypes, yearThemes } from '../src/readings.js'

test('reduceNumber keeps master numbers', () => {
  assert.equal(reduceNumber(29), 11)
  assert.equal(reduceNumber(22), 22)
  assert.equal(reduceNumber(38), 11)
  assert.equal(reduceNumber(29, false), 2)
  assert.equal(reduceNumber(7), 7)
})

test('parseDate rejects invalid dates', () => {
  assert.deepEqual(parseDate('1990-05-15'), { year: 1990, month: 5, day: 15 })
  assert.equal(parseDate('2023-02-29'), null)
  assert.equal(parseDate(''), null)
  assert.equal(parseDate('abc'), null)
})

test('lifePathNumber', () => {
  // 1+9+9+0+0+5+1+5 = 30 -> 3
  assert.equal(lifePathNumber({ year: 1990, month: 5, day: 15 }), 3)
  // 1+9+8+7+1+1+2+9 = 38 -> 11
  assert.equal(lifePathNumber({ year: 1987, month: 11, day: 29 }), 11)
})

test('every birthday 1900-2030 maps to a defined type and year theme', () => {
  const start = Date.UTC(1900, 0, 1)
  const end = Date.UTC(2030, 11, 31)
  for (let t = start; t <= end; t += 86400000 * 3) {
    const d = new Date(t)
    const birth = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
    assert.ok(numberTypes[lifePathNumber(birth)], JSON.stringify(birth))
    assert.ok(yearThemes[personalYearNumber(birth, 2026)])
    assert.ok(zodiacSign(birth))
  }
})

test('zodiac boundaries', () => {
  assert.equal(zodiacSign({ month: 1, day: 10 }).name, 'やぎ座')
  assert.equal(zodiacSign({ month: 12, day: 25 }).name, 'やぎ座')
  assert.equal(zodiacSign({ month: 3, day: 21 }).name, 'おひつじ座')
  assert.equal(zodiacSign({ month: 8, day: 22 }).name, 'しし座')
})

test('names: kana/katakana equivalence and valid numbers', () => {
  assert.equal(normalizeName('ヤマダ ハナコ'), 'やまだはなこ')
  assert.equal(nameNumber('やまだ はなこ'), nameNumber('ヤマダハナコ'))
  assert.equal(charNumber('あ'), 1)
  assert.equal(charNumber('か'), 6)
  assert.equal(charNumber('a'), 1)
  assert.equal(charNumber('j'), 1)
  for (const name of ['やまだはなこ', 'たなか', 'Taro', '山田', 'ん', 'ゆうき', 'きょうこ']) {
    assert.ok(numberTypes[nameNumber(name)], name)
    assert.ok(numberTypes[soulNumber(name)], name)
  }
  assert.equal(nameNumber('   '), null)
})

test('daily fortune is deterministic per day', () => {
  const a = dailyFortune('1990-05-15', '2026-11-11')
  assert.deepEqual(a, dailyFortune('1990-05-15', '2026-11-11'))
  for (const v of Object.values(a.scores)) assert.ok(v >= 1 && v <= 5)
  // 日付が変われば(ほぼ確実に)どこかが変わる
  const days = new Set()
  for (let d = 1; d <= 28; d += 1) days.add(JSON.stringify(dailyFortune('1990-05-15', `2026-02-${String(d).padStart(2, '0')}`)))
  assert.ok(days.size > 20)
})

test('compatibility is symmetric and in range', () => {
  const p1 = { birth: parseDate('1990-05-15'), birthText: '1990-05-15', name: 'たろう' }
  const p2 = { birth: parseDate('1992-08-03'), birthText: '1992-08-03', name: 'はなこ' }
  const ab = compatibility(p1, p2)
  const ba = compatibility(p2, p1)
  assert.equal(ab.percent, ba.percent)
  assert.ok(ab.percent >= 42 && ab.percent <= 99)
})

test('total score follows omikuji rank (never below 2)', () => {
  for (let d = 1; d <= 28; d += 1) {
    const f = dailyFortune('2000-01-01', `2026-03-${String(d).padStart(2, '0')}`)
    assert.equal(f.scores.total, [5, 4, 4, 3, 3, 2][f.omikujiIndex])
  }
})

test('omikuji stick number and item picks', async () => {
  const { toKanjiNumber, omikujiTier } = await import('../src/fortune.js')
  const { omikujiItems } = await import('../src/readings.js')
  assert.equal(toKanjiNumber(1), '一')
  assert.equal(toKanjiNumber(10), '十')
  assert.equal(toKanjiNumber(23), '二十三')
  assert.equal(toKanjiNumber(50), '五十')
  for (let d = 1; d <= 28; d += 1) {
    const f = dailyFortune('1985-07-07', `2026-04-${String(d).padStart(2, '0')}`)
    assert.ok(f.stickNumber >= 1 && f.stickNumber <= 50)
    assert.equal(f.itemPicks.length, omikujiItems.length)
    const tier = omikujiTier(f.omikujiIndex)
    omikujiItems.forEach((item, i) => assert.ok(item.tiers[tier][f.itemPicks[i]]))
  }
})

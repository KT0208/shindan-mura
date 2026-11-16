import test from 'node:test'
import assert from 'node:assert/strict'
import * as f from '../src/content/fortune2027.ja.js'
import { etoIndex, etoPartners, kyuseiOfYear, kyuseiPalace } from '../src/readings/logic.js'
import { amazonKeywordFor } from '../src/amazon.js'

test('2027年は九紫火星・ひつじ年', () => {
  assert.equal(kyuseiOfYear(2027), 9)
  assert.equal(etoIndex({ year: 2027 }), 7)
})

test('本命星の文章が入る場所(宮)と合っている', () => {
  const expected = { 1: 'northwest', 2: 'west', 3: 'northeast', 4: 'south', 5: 'north', 6: 'southwest', 7: 'east', 8: 'southeast', 9: 'center' }
  for (let n = 1; n <= 9; n++) assert.equal(kyuseiPalace(n, 9), expected[n])
})

test('干支の関係が十二支の決まりと合っている', () => {
  const { sango, rokugo } = etoPartners(7)
  const rel = f.eto.signs.map((s) => s.relation)
  for (const i of sango) assert.equal(rel[i], 'sango')
  assert.equal(rel[rokugo], 'rokugo')
  assert.equal(rel[7], 'self')
  assert.equal(rel[1], 'clash')
  assert.equal(f.eto.signs.length, 12)
})

test('すべての項目がそろっている', () => {
  const entries = [...Object.values(f.kyusei.stars), ...f.eto.signs, ...Object.values(f.numerology.years)]
  assert.equal(entries.length, 30)
  for (const e of entries) {
    for (const key of ['overall', 'love', 'work', 'money', 'color', 'item']) assert.ok(e[key], key)
    assert.equal(e.actions.length, 3)
    assert.ok(e.stars >= 1 && e.stars <= 5)
  }
})

test('個人年数の例の計算が正しい', () => {
  const digits = '5' + '15' + '2027'
  const sum = [...digits].reduce((a, d) => a + Number(d), 0)
  assert.equal(sum, 22)
  assert.ok(amazonKeywordFor('手帳'))
  assert.equal(amazonKeywordFor('お守り'), null)
})

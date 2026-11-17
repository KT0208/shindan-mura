import test from 'node:test'
import assert from 'node:assert/strict'
import { kyusei, eto } from '../src/content/guides/kyuseiEto.ja.js'
import { zodiac, tarot } from '../src/content/guides/zodiacTarot.ja.js'
import { ETO_SLUGS, TAROT_SLUGS, ZODIAC_SLUGS } from '../src/guideLinks.js'
import ja from '../src/readings/data/ja.js'

test('解説の数が鑑定データと合っている', () => {
  assert.equal(Object.keys(kyusei.stars).length, 9)
  assert.equal(eto.animals.length, ja.eto.animals.length)
  assert.equal(zodiac.signs.length, ja.zodiac.signs.length)
  assert.equal(tarot.cards.length, ja.tarot.cards.length)
})

test('鑑定結果からのリンク先が解説ページと合っている', () => {
  assert.deepEqual(eto.animals.map((a) => a.slug), ETO_SLUGS)
  assert.deepEqual(zodiac.signs.map((s) => s.slug), ZODIAC_SLUGS)
  assert.deepEqual(tarot.cards.map((c) => c.slug), TAROT_SLUGS)
})

test('すべての項目に文章がある', () => {
  for (const x of [...Object.values(kyusei.stars), ...eto.animals, ...zodiac.signs]) {
    assert.ok(x.summary && x.advice)
    assert.equal(x.strengths.length, 3)
    assert.equal(x.cautions.length, 2)
  }
  for (const c of tarot.cards) assert.ok(c.summary && c.love && c.work && c.english)
})

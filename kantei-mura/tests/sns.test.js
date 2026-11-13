import test from 'node:test'
import assert from 'node:assert/strict'
import { dailyRanking, dateLabel, postText, xWeightedLength } from '../src/sns.js'

test('ランキングは1〜9を1回ずつ含み、同じ日は同じ順位', () => {
  const a = dailyRanking('2026-11-14')
  assert.deepEqual(a.map((r) => r.number).sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  assert.deepEqual(a, dailyRanking('2026-11-14'))
  assert.notDeepEqual(a.map((r) => r.number), dailyRanking('2026-11-15').map((r) => r.number))
  assert.equal(new Set(a.map((r) => r.message)).size, 9)
})

test('日付の表示', () => {
  assert.equal(dateLabel('2026-11-14'), '11月14日(土)')
})

test('投稿文は1年分すべてXの文字数制限におさまる', () => {
  for (let i = 0; i < 366; i++) {
    const d = new Date(2027, 0, 1 + i)
    const text = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    assert.ok(xWeightedLength(postText(text)) <= 280, text)
  }
})

test('Instagram用の文章は9位まで入り、2200文字以内', async () => {
  const { instagramText } = await import('../src/sns.js')
  const text = instagramText('2026-11-14')
  for (let rank = 1; rank <= 9; rank++) assert.ok(text.includes(`${rank}位 運命数`))
  assert.ok([...text].length <= 2200)
  assert.ok(!text.includes('http'))
})

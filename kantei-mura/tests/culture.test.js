import { test } from 'node:test'
import assert from 'node:assert/strict'
import { articles, shrineArticles } from '../src/content/articles.ja.js'
import labels from '../src/content/illustrationLabels.js'
import { LANGUAGES } from '../src/i18n/languages.js'

const ja = { ...shrineArticles, omikuji: articles.omikuji }
const KEYS = Object.keys(ja).sort()

// ラベルの形が日本語と同じか
function sameShape(a, b, where) {
  if (Array.isArray(a)) {
    assert.ok(Array.isArray(b) && b.length === a.length, `${where} length`)
    return
  }
  if (typeof a === 'object') {
    assert.deepEqual(Object.keys(b).sort(), Object.keys(a).sort(), `${where} keys`)
    for (const k of Object.keys(a)) sameShape(a[k], b[k], `${where}.${k}`)
    return
  }
  assert.equal(typeof b, typeof a, where)
}

test('illustration labels have the same shape in every language', () => {
  for (const lang of LANGUAGES) sameShape(labels.ja, labels[lang.code], lang.code)
})

for (const lang of LANGUAGES.filter((l) => l.code !== 'ja')) {
  test(`${lang.code} culture articles match the Japanese ones`, async () => {
    const { ui, articles: all } = (await import(`../src/content/culture/${lang.code}.js`)).default
    assert.deepEqual(Object.keys(all).sort(), KEYS)
    assert.equal(ui.quotes.length, 2)
    for (const key of KEYS) {
      const a = all[key]
      assert.equal(a.file, ja[key].file, `${key} file`)
      assert.ok(a.title && a.description && a.lead, `${key} texts`)
      assert.deepEqual(a.related || [], ja[key].related || [], `${key} related`)
      // イラスト付きの手順は、手順の数とイラストの数が同じ
      for (const s of a.sections) {
        if (s.stepFigures) assert.equal(s.steps.length, s.stepFigures.length, `${key}: ${s.heading}`)
        if (s.table) s.table.rows.forEach((r) => assert.equal(r.length, s.table.head.length))
      }
      // 日本語と同じ数のイラストがある
      const count = (list) => list.reduce((n, s) => n + (s.figure ? 1 : 0) + (s.stepFigures?.length || 0), 0)
      assert.equal(count(a.sections), count(ja[key].sections), `${key} figures`)
    }
  })
}

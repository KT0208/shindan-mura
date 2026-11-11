import { test } from 'node:test'
import assert from 'node:assert/strict'
import ja from '../src/i18n/ja.js'
import { LUCKY_ACTION_COUNT, LUCKY_COLOR_COUNT, LUCKY_ITEM_COUNT } from '../src/fortune.js'
import { LANGUAGES, languageFromPath, preferredLanguage } from '../src/i18n/languages.js'

// ja.js と同じ形(キー・配列の長さ・関数かどうか)になっているかを再帰的に確かめる
function sameShape(reference, target, path) {
  if (typeof reference === 'function') {
    assert.equal(typeof target, 'function', `${path} should be a function`)
    return
  }
  if (reference === null) return
  if (Array.isArray(reference)) {
    assert.ok(Array.isArray(target), `${path} should be an array`)
    // 文の部品の配列(例: tied)以外は長さも一致させる
    assert.equal(target.length, reference.length, `${path} length`)
    reference.forEach((item, i) => sameShape(item, target[i], `${path}[${i}]`))
    return
  }
  if (typeof reference === 'object') {
    assert.ok(target && typeof target === 'object', `${path} should be an object`)
    assert.deepEqual(Object.keys(target).sort(), Object.keys(reference).sort(), `${path} keys`)
    for (const key of Object.keys(reference)) sameShape(reference[key], target[key], `${path}.${key}`)
    return
  }
  assert.equal(typeof target, typeof reference, `${path} type`)
  if (typeof reference === 'string') assert.ok(target.trim().length > 0, `${path} is empty`)
}

test('ja dictionary matches fortune constants', () => {
  assert.equal(ja.luckyColors.length, LUCKY_COLOR_COUNT)
  assert.equal(ja.luckyItems.length, LUCKY_ITEM_COUNT)
  assert.equal(ja.luckyActions.length, LUCKY_ACTION_COUNT)
  assert.equal(ja.zodiac.length, 12)
  assert.equal(ja.omikujiRanks.length, 6)
  assert.equal(ja.compatComments.length, 5)
})

for (const lang of LANGUAGES.filter((l) => l.code !== 'ja')) {
  test(`${lang.code} dictionary has the same shape as ja`, async () => {
    const dict = (await import(`../src/i18n/${lang.code}.js`)).default
    assert.equal(dict.code, lang.code)
    // 翻訳の有無で形が変わる項目(translation は ja では null)
    assert.equal(typeof dict.ui.omikuji.translation, 'string')
    sameShape(ja, dict, lang.code)
    // 関数の項目が文字列や配列を返すこと
    assert.equal(typeof dict.ui.birthday.share(3, 'x', 2026, 'y'), 'string')
    assert.equal(dict.ui.name.summary('A', 'B', 'C').length, 5)
    assert.equal(dict.ui.omikuji.stickNumber('二十三', 23).length, 3)
  })
}

test('language detection', () => {
  assert.equal(languageFromPath('/').code, 'ja')
  assert.equal(languageFromPath('/en/').code, 'en')
  assert.equal(languageFromPath('/zh-hant/').code, 'zh-Hant')
  assert.equal(languageFromPath('/unknown/').code, 'ja')
  assert.equal(preferredLanguage(['zh-TW']).code, 'zh-Hant')
  assert.equal(preferredLanguage(['zh-CN']).code, 'zh-Hans')
  assert.equal(preferredLanguage(['ko-KR']).code, 'ko')
  assert.equal(preferredLanguage(['es-MX']).code, 'es')
  assert.equal(preferredLanguage(['ja-JP', 'en']).code, 'ja')
  assert.equal(preferredLanguage(['fr-FR']), null)
})

test('sister site links', async () => {
  const { shindanUrl } = await import('../src/sisterSite.js')
  assert.equal(shindanUrl('ja', 'compat', 'result_compat'), 'https://shindanmura.com/?lang=ja&utm_source=kanteimura&utm_medium=referral&utm_campaign=result_compat#diagnosis=love-complicated')
  assert.ok(shindanUrl('ko', null, 'footer').startsWith('https://shindanmura.com/?lang=en&'))
  assert.ok(!shindanUrl('es', null, 'footer').includes('#'))
})

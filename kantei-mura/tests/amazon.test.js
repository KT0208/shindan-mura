import test from 'node:test'
import assert from 'node:assert/strict'
import { LUCKY_ITEM_KEYWORDS, amazonEnabled, amazonSearchUrl } from '../src/amazon.js'
import { LUCKY_ITEM_COUNT } from '../src/fortune.js'

test('ラッキーアイテムの数だけ検索ことばがある', () => {
  assert.equal(LUCKY_ITEM_KEYWORDS.length, LUCKY_ITEM_COUNT)
})

test('Amazonリンクにタグが入る', () => {
  const url = amazonSearchUrl('ハンカチ', 'test-22')
  assert.equal(url, 'https://www.amazon.co.jp/s?k=%E3%83%8F%E3%83%B3%E3%82%AB%E3%83%81&tag=test-22')
  assert.equal(amazonSearchUrl('ハンカチ', ''), null)
})

test('日本語ページだけで表示する', () => {
  assert.equal(amazonEnabled('ja', 'test-22'), true)
  assert.equal(amazonEnabled('en', 'test-22'), false)
  assert.equal(amazonEnabled('ja', ''), false)
})

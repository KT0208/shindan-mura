// ビルド後に実行し、言語ごとのページ(dist/en/index.html など)とサイトマップを作る。
// 中身(画面)は同じプログラムで、URLの /en/ などを見て言語を切り替える。
// ここでは検索エンジンやSNS向けに、タイトル・説明文・言語の情報だけを書き換える。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LANGUAGES, SITE_URL, languagePath } from '../src/i18n/languages.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const escapeAttr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const pageUrl = (lang) => SITE_URL + languagePath(lang)

// 全ページ共通: 各言語版の場所を検索エンジンに伝える(hreflang)
const alternates = [
  ...LANGUAGES.map((lang) => `<link rel="alternate" hreflang="${lang.code}" href="${pageUrl(lang)}" />`),
  `<link rel="alternate" hreflang="x-default" href="${pageUrl(LANGUAGES[0])}" />`,
].join('\n    ')

function replaceMeta(html, selector, value) {
  const pattern = new RegExp(`(<meta ${selector} content=")[^"]*(")`)
  if (!pattern.test(html)) throw new Error(`meta not found: ${selector}`)
  return html.replace(pattern, `$1${escapeAttr(value)}$2`)
}

function buildPage(lang, dict) {
  let html = template
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${lang.code}">`)
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(dict.meta.title)}</title>`)
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${pageUrl(lang)}" />\n    ${alternates}`)
  html = replaceMeta(html, 'name="description"', dict.meta.description)
  html = replaceMeta(html, 'property="og:url"', pageUrl(lang))
  html = replaceMeta(html, 'property="og:site_name"', dict.siteName)
  html = replaceMeta(html, 'property="og:title"', dict.meta.title)
  html = replaceMeta(html, 'property="og:description"', dict.meta.shortDescription)
  html = replaceMeta(html, 'property="og:locale"', lang.ogLocale)
  html = replaceMeta(html, 'name="twitter:title"', dict.meta.title)
  html = replaceMeta(html, 'name="twitter:description"', dict.meta.shortDescription)
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: dict.siteName,
    alternateName: '鑑定村',
    url: pageUrl(lang),
    description: dict.meta.shortDescription,
    inLanguage: lang.code,
  }, null, 2).replace(/\n/g, '\n      ')
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n      ${jsonLd}\n    </script>`)
  return html
}

for (const lang of LANGUAGES) {
  const dict = (await import(`../src/i18n/${lang.code}.js`)).default
  const dir = lang.path ? path.join(dist, lang.path) : dist
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(lang, dict))
}

// サイトマップ(各言語版の関係も書く)
const links = LANGUAGES.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang.code}" href="${pageUrl(lang)}" />`).join('\n')
const urls = LANGUAGES.map((lang) => `  <url>
    <loc>${pageUrl(lang)}</loc>
${links}
    <changefreq>daily</changefreq>
    <priority>${lang.path ? '0.8' : '1.0'}</priority>
  </url>`).join('\n')
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`)

console.log(`language pages: ${LANGUAGES.map((l) => languagePath(l)).join(', ')}`)

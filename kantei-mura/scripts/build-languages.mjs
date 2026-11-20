// ビルド後に実行し、言語ごとのページ(dist/en/index.html など)とサイトマップを作る。
// 中身(画面)は同じプログラムで、URLの /en/ などを見て言語を切り替える。
// ここでは検索エンジンやSNS向けに、タイトル・説明文・言語の情報だけを書き換える。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LANGUAGES, SITE_URL, languagePath } from '../src/i18n/languages.js'
import { MENU_CATEGORIES } from '../src/menus.js'
import { siteAbout } from '../src/content/siteAbout.ja.js'

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

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// トップページの中身を、JavaScriptを読まなくても読めるHTMLとして入れておく
// (表示されるとアプリの画面に置き換わる。検索エンジンや審査で中身が伝わるようにするため)
function staticHome(lang, dict) {
  const ui = dict.ui
  const base = languagePath(lang)
  const card = (href, title, text, cls) => `<a class="${cls}" href="${href}"><strong>${esc(title)}</strong><span>${esc(text)}</span></a>`
  const parts = [
    '<main>',
    `<header class="hero"><p class="eyebrow">${esc(ui.heroEyebrow)}</p><h1>鑑定村</h1>${dict.siteName !== '鑑定村' ? `<p class="hero-sub">${esc(dict.siteName)}</p>` : ''}<p>${esc(ui.heroText)}</p></header>`,
    ...MENU_CATEGORIES.map((c) => `<section class="menu-category"><h2 class="category-heading">${esc(ui.categories[c.id])}</h2><div class="menu-grid">${c.items.map((m) => card(`${base}#/${m.id}`, `${m.emoji} ${ui.menus[m.id].title}`, ui.menus[m.id].text, 'menu-card')).join('')}</div></section>`),
    `<section class="readings"><h2 class="eyebrow">${esc(ui.links.readingsHeading)}</h2><div class="readings-list">${ui.links.readings.map((r) => card(r.href, r.title, r.text, 'reading-card')).join('')}</div><a class="detail-link" href="${base}guide.html">${esc(ui.links.readingsMore)}</a></section>`,
  ]
  if (lang.code === 'ja') {
    const a = siteAbout
    parts.push(`<section class="site-about"><h2>${esc(a.guidesHeading)}</h2><div class="readings-list">${a.guides.map((g) => card(g.href, g.title, g.text, 'reading-card')).join('')}</div></section>`)
    parts.push(`<section class="site-about"><h2>${esc(a.heading)}</h2>${a.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}<h3>${esc(a.policyHeading)}</h3>${a.policies.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`)
  }
  parts.push(`<footer class="footer">${ui.footer.map((line) => `<p>${esc(line)}</p>`).join('')}<p><a href="/privacy.html">${esc(ui.links.privacy)}</a> ・ <a href="/contact.html">${esc(ui.links.contact)}</a> ・ <a href="/operator.html">${esc(ui.links.operator)}</a></p></footer>`)
  parts.push('</main>')
  return parts.join('\n')
}

function buildPage(lang, dict) {
  let html = template
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${lang.code}">`)
  html = html.replace('<div id="root"></div>', `<div id="root"><div class="app">${staticHome(lang, dict)}</div></div>`)
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

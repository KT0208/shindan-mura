// ビルド後に実行し、読み物ページ・運命数の解説ページ・規約ページを、
// 文章がそのまま入った静的なHTMLとして書き出す(検索エンジンやアドセンス審査が読みやすいように)。
// - 日本語: dist/ 直下(例: /sanpai.html)
// - ほかの言語: dist/{言語}/ の中(例: /en/sanpai.html)。フォルダは言語ページ用に既にあるので増えない。
// 数秘術・運命数・規約のページは日本語のみ。神社・おみくじなど日本文化の記事は全言語で作る。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ja from '../src/i18n/ja.js'
import numberGuide from '../src/content/numberGuide.ja.js'
import { articles, shrineArticles, legalPages, CONTACT_EMAIL } from '../src/content/articles.ja.js'
import { lifePathNumber, numberRelation, reduceNumber } from '../src/fortune.js'
import { LANGUAGES, SITE_URL, languagePath } from '../src/i18n/languages.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]
const numberFile = (n) => `number-${n}.html`
const GUIDE_FILE = 'guide.html'
// 全言語で作る日本文化の記事(この順で一覧に並べる)
const CULTURE_KEYS = ['sanpai', 'temizu', 'jinjaTera', 'omamori', 'saisen', 'hatsumode', 'goshuin', 'omikuji']

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// 本文中のURLとメールアドレスをリンクにする
function linkify(text) {
  return esc(text)
    .replace(/https?:\/\/[^\s)、。]+/g, (url) => `<a href="${url}" rel="noopener">${url}</a>`)
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (mail) => `<a href="mailto:${mail}">${mail}</a>`)
}

// ---- 言語ごとの、ページの枠(ヘッダー・フッターなど)の文言 ----
const jaUi = {
  siteName: '鑑定村',
  nav: { birthday: '誕生日鑑定', name: '名前鑑定', today: 'おみくじ', compat: '相性' },
  navAria: '鑑定メニュー',
  breadcrumbAria: 'パンくずリスト',
  readings: '読み物',
  related: 'あわせて読みたい',
  footerAria: 'サイト情報',
  legal: { privacy: 'プライバシーポリシー', contact: 'お問い合わせ', operator: '運営者情報' },
  sister: '姉妹サイト:🧩 キャラクターで性格がわかる「診断村」',
  disclaimer: '※ 鑑定結果は数秘術などをもとにしたエンターテインメントです。',
  quotes: ['「', '」'],
  languages: 'この記事をほかの言語で読む',
  guide: {
    title: '読み物一覧|数秘術・おみくじ・神社のお参りの作法',
    description: '鑑定村の読み物一覧です。数秘術の基本と運命数1〜9・11・22・33の解説、おみくじの意味、手水や二礼二拍手一礼など神社のお参りの作法をまとめています。',
    lead: '鑑定村の占いをもっと楽しむための解説ページです。数秘術のしくみや運命数ごとの性格、おみくじの意味、神社でのお参りの作法をまとめています。',
    cultureHeading: '神社・お寺・おみくじ',
    cta: { text: '読んだら、実際に鑑定してみましょう', label: '鑑定村のトップへ' },
  },
}

async function loadCulture(lang) {
  if (lang.code === 'ja') {
    return { ui: jaUi, articles: { ...shrineArticles, omikuji: articles.omikuji } }
  }
  // まだ翻訳がない言語は作らない(日本語ページだけになる)
  if (!fs.existsSync(path.join(root, 'src', 'content', 'culture', `${lang.code}.js`))) return null
  const mod = await import(`../src/content/culture/${lang.code}.js`)
  return mod.default
}

const cultures = {}
for (const lang of LANGUAGES) cultures[lang.code] = await loadCulture(lang)

const pageUrl = (lang, file) => `${SITE_URL}${languagePath(lang)}${file}`

function layout({ lang, file, title, description, breadcrumb, body, jsonLd, alternates = [] }) {
  const ui = cultures[lang.code].ui
  const base = languagePath(lang)
  const url = pageUrl(lang, file)
  const crumbs = [{ name: ui.siteName, href: base }, ...breadcrumb]
  const breadcrumbLd = {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.href ? `${SITE_URL}${c.href}` : url })),
  }
  const ld = { '@context': 'https://schema.org', '@graph': [breadcrumbLd, ...(jsonLd ? [jsonLd] : [])] }
  const hreflang = alternates.length > 1
    ? `\n    ${alternates.map((a) => `<link rel="alternate" hreflang="${a.code}" href="${pageUrl(a, file)}" />`).join('\n    ')}\n    <link rel="alternate" hreflang="x-default" href="${pageUrl(LANGUAGES[0], file)}" />`
    : ''
  // 規約ページは日本語のみ。ほかの言語では「(日本語)」付きのラベルで日本語ページへ
  const dict = langDicts[lang.code]
  const legalLabel = (key) => (lang.code === 'ja' ? ui.legal[key] : dict.ui.links[key])
  const sisterHref = `https://shindanmura.com/?lang=${lang.code === 'ja' ? 'ja' : 'en'}&amp;utm_source=kanteimura&amp;utm_medium=referral&amp;utm_campaign=pages`
  return `<!doctype html>
<html lang="${lang.code}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}｜${esc(ui.siteName)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />${hreflang}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/pages.css" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${esc(ui.siteName)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE_URL}/og-image.jpg" />
    <meta property="og:locale" content="${lang.ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(ld)}</script>
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="${base}">鑑定村</a>
      <nav aria-label="${esc(ui.navAria)}">
        <a href="${base}#/birthday">${esc(ui.nav.birthday)}</a>
        <a href="${base}#/name">${esc(ui.nav.name)}</a>
        <a href="${base}#/today">${esc(ui.nav.today)}</a>
        <a href="${base}#/compat">${esc(ui.nav.compat)}</a>
      </nav>
    </header>
    <nav class="breadcrumb" aria-label="${esc(ui.breadcrumbAria)}">
      ${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<a href="${c.href}">${esc(c.name)}</a>` : `<span>${esc(c.name)}</span>`)).join(' › ')}
    </nav>
    <main class="article">
${body}
    </main>
    <footer class="site-footer">
      <nav aria-label="${esc(ui.footerAria)}">
        <a href="${base}${GUIDE_FILE}">${esc(ui.readings)}</a>
        <a href="/${legalPages.privacy.file}">${esc(legalLabel('privacy'))}</a>
        <a href="/${legalPages.contact.file}">${esc(legalLabel('contact'))}</a>
        <a href="/${legalPages.operator.file}">${esc(legalLabel('operator'))}</a>
      </nav>
      <p><a href="${sisterHref}" rel="noopener">${esc(ui.sister)}</a></p>
      <p>${esc(ui.disclaimer)}</p>
      <p>© 2026 ${esc(ui.siteName)}</p>
    </footer>
  </body>
</html>
`
}

function renderSection(section) {
  const parts = [`      <h2>${esc(section.heading)}</h2>`]
  // イラスト(SVG)は自分で作ったものなので、そのまま埋め込む
  if (section.figure) parts.push(`      <figure class="figure">${section.figure}</figure>`)
  if (section.table) {
    const { head, rows } = section.table
    parts.push(`      <div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`)
  }
  for (const p of section.paragraphs || []) parts.push(`      <p>${linkify(p)}</p>`)
  if (section.example) parts.push(`      <div class="example">${section.example.map((line) => `<p>${esc(line)}</p>`).join('')}</div>`)
  if (section.steps) {
    const figures = section.stepFigures || []
    const cls = figures.length ? 'steps illustrated' : 'steps'
    parts.push(`      <ol class="${cls}">${section.steps.map((item, i) => `<li>${figures[i] ? `<figure>${figures[i]}</figure>` : ''}<p>${linkify(item)}</p></li>`).join('')}</ol>`)
  }
  if (section.list) parts.push(`      <ul>${section.list.map((item) => `<li>${linkify(item)}</li>`).join('')}</ul>`)
  for (const p of section.after || []) parts.push(`      <p>${linkify(p)}</p>`)
  return parts.join('\n')
}

const cta = ({ text, href, label }) => `      <div class="cta"><p>${esc(text)}</p><a class="cta-button" href="${href}">${esc(label)}</a></div>`

const shortName = (a) => a.shortTitle || a.title.split(/[?|？]/)[0]
const articleCard = (a, base) => `        <a class="card" href="${base}${a.file}"><b>${a.emoji || '📖'} ${esc(a.title)}</b><span>${esc(a.description)}</span></a>`

// 本文中で「記事名」と書かれているところを、その記事へのリンクにする
function linkArticleNames(html, self, all, base, [open, close]) {
  let out = html
  for (const a of Object.values(all)) {
    if (a === self) continue
    const name = shortName(a).replace(/\s*[(（].*[)）]$/, '')
    out = out.split(`${open}${esc(name)}${close}`).join(`${open}<a href="${base}${a.file}">${esc(name)}</a>${close}`)
  }
  return out
}

const langDicts = {}
for (const lang of LANGUAGES) langDicts[lang.code] = (await import(`../src/i18n/${lang.code}.js`)).default

const pages = []
const jaLang = LANGUAGES[0]

// ---- 運命数の解説ページ(日本語のみ) ----
function numberGrid(current) {
  return `      <div class="number-grid">${NUMBERS.map((n) => (n === current
    ? `<span class="current"><b>${n}</b><small>${esc(ja.numberTypes[n].title.replace(/\(.*\)/, ''))}</small></span>`
    : `<a href="/${numberFile(n)}"><b>${n}</b><small>${esc(ja.numberTypes[n].title.replace(/\(.*\)/, ''))}</small></a>`)).join('')}</div>`
}

// その運命数になる生年月日の例を探す(計算の流れも見せる)
function exampleBirth(n) {
  for (let year = 1990; year >= 1950; year -= 1) {
    for (let month = 1; month <= 12; month += 1) {
      for (let day = 1; day <= 28; day += 1) {
        if (lifePathNumber({ year, month, day }) !== n) continue
        const digits = `${year}${month}${day}`.split('')
        const total = digits.reduce((a, d) => a + Number(d), 0)
        const steps = [`${digits.join(' + ')} = ${total}`]
        let v = total
        while (v > 9 && ![11, 22, 33].includes(v)) {
          const next = String(v).split('').reduce((a, d) => a + Number(d), 0)
          steps.push(`${String(v).split('').join(' + ')} = ${next}`)
          v = next
        }
        return { label: `${year}年${month}月${day}日生まれ`, steps }
      }
    }
  }
  return null
}

// 相性の良い運命数(調和・補い合う関係)
function goodPartners(n) {
  return NUMBERS.filter((m) => m !== n && m <= 9).map((m) => ({ m, relation: numberRelation(n, m) })).filter((r) => r.relation === 'harmony' || r.relation === 'complement')
}

const articleLd = (title, code) => ({ '@type': 'Article', headline: title, inLanguage: code, author: { '@type': 'Organization', name: '鑑定村' } })

for (const n of NUMBERS) {
  const info = ja.numberTypes[n]
  const extra = numberGuide[n]
  const example = exampleBirth(n)
  const partners = goodPartners(n)
  const base = reduceNumber(n, false)
  const title = `運命数${n}「${info.title.replace(/\(.*\)/, '')}」の性格・恋愛・仕事・相性`
  const body = [
    `      <p class="eyebrow">数秘術・運命数の解説</p>`,
    `      <h1>運命数${n}<span>${esc(info.title)}</span></h1>`,
    `      <ul class="keywords">${info.keywords.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>`,
    `      <p class="lead">${esc(extra.summary)}</p>`,
    renderSection({ heading: `運命数${n}の性格`, paragraphs: [info.nature] }),
    renderSection({ heading: `運命数${n}の強み`, list: extra.strengths }),
    renderSection({ heading: '気をつけたいこと', list: extra.cautions }),
    renderSection({ heading: `運命数${n}の恋愛`, paragraphs: [info.love] }),
    renderSection({ heading: `運命数${n}に向いている仕事`, paragraphs: [info.work] }),
    `      <h2>運命数${n}と相性の良い数</h2>`,
    `      <p>数秘術では、数どうしの関係から相性を読み解きます。運命数${n}${n > 9 ? `(1けたにすると${base})` : ''}と、特に心地よい関係を築きやすいのは次の数です。</p>`,
    `      <ul>${partners.map(({ m, relation }) => `<li><a href="/${numberFile(m)}">運命数${m}「${esc(ja.numberTypes[m].title)}」</a>:${esc(ja.relationTexts[relation].title)}</li>`).join('')}</ul>`,
    `      <p>同じ運命数どうしは「${esc(ja.relationTexts.same.title)}」の関係です。2人の生年月日から相性を％で知りたいときは、<a href="/#/compat">相性鑑定</a>を試してみてください。</p>`,
    renderSection({ heading: '成長のヒント', paragraphs: [extra.growth] }),
    renderSection({ heading: '開運アドバイス', paragraphs: [info.advice] }),
    example ? renderSection({ heading: `運命数${n}になる生年月日の例`, paragraphs: ['運命数は、生年月日の数字をすべて1けたずつ足して求めます。'], example: [`例:${example.label}`, ...example.steps, `→ 運命数は「${n}」`], after: ['くわしい計算方法は「数秘術とは?」で解説しています。'] }).replace('「数秘術とは?」', `「<a href="/${articles.numerology.file}">数秘術とは?</a>」`) : '',
    cta({ text: 'あなたの運命数はいくつ?生年月日を入れるだけで鑑定できます', href: '/#/birthday', label: '誕生日鑑定をする' }),
    `      <h2>ほかの運命数</h2>`,
    numberGrid(n),
  ].filter(Boolean).join('\n')
  pages.push({ lang: jaLang, file: numberFile(n), title, description: `${extra.summary} 運命数${n}の性格・強み・恋愛・向いている仕事・相性の良い数を解説します。`.slice(0, 160), breadcrumb: [{ name: '読み物', href: `/${GUIDE_FILE}` }, { name: `運命数${n}` }], body, jsonLd: articleLd(title, 'ja') })
}

// ---- 数秘術の記事(日本語のみ) ----
{
  const a = articles.numerology
  const body = [
    `      <p class="eyebrow">読み物</p>`,
    `      <h1>${esc(a.title)}</h1>`,
    `      <p class="lead">${esc(a.lead)}</p>`,
    ...a.sections.map(renderSection),
    cta(a.cta),
    `      <h2>運命数ごとの解説</h2>\n${numberGrid(null)}`,
  ].join('\n')
  pages.push({ lang: jaLang, file: a.file, title: a.title, description: a.description, breadcrumb: [{ name: '読み物', href: `/${GUIDE_FILE}` }, { name: shortName(a) }], body, jsonLd: articleLd(a.title, 'ja') })
}

// ---- 日本文化の記事(全言語) ----
for (const lang of LANGUAGES) {
  if (!cultures[lang.code]) continue
  const { ui, articles: all } = cultures[lang.code]
  const base = languagePath(lang)
  const available = LANGUAGES.filter((l) => cultures[l.code])
  for (const key of CULTURE_KEYS) {
    const article = all[key]
    if (!article) throw new Error(`${lang.code}: article "${key}" is missing`)
    const ctaHref = article.cta.href.replace(/^\//, base)
    const otherLangs = available.filter((l) => l.code !== lang.code)
    const body = [
      `      <p class="eyebrow">${esc(ui.readings)}</p>`,
      `      <h1>${esc(article.title)}</h1>`,
      `      <p class="lead">${esc(article.lead)}</p>`,
      ...article.sections.map((section) => linkArticleNames(renderSection(section), article, all, base, ui.quotes)),
      cta({ ...article.cta, href: ctaHref }),
      article.related?.length ? [`      <h2>${esc(ui.related)}</h2>`, `      <div class="cards">`, ...article.related.map((k) => articleCard(all[k], base)), `      </div>`].join('\n') : '',
      `      <p class="other-languages">🌐 ${esc(ui.languages)}: ${otherLangs.map((l) => `<a href="${languagePath(l)}${article.file}" hreflang="${l.code}">${esc(l.label)}</a>`).join(' · ')}</p>`,
    ].filter(Boolean).join('\n')
    pages.push({ lang, file: article.file, title: article.title, description: article.description, breadcrumb: [{ name: ui.readings, href: `${base}${GUIDE_FILE}` }, { name: shortName(article) }], body, jsonLd: articleLd(article.title, lang.code), alternates: available })
  }

  // 読み物一覧
  const g = ui.guide
  const guideBody = [
    `      <p class="eyebrow">${esc(ui.readings)}</p>`,
    `      <h1>${esc(g.title.split('|')[0])}</h1>`,
    `      <p class="lead">${esc(g.lead)}</p>`,
    `      <h2>${esc(g.cultureHeading)}</h2>`,
    `      <div class="cards">`,
    ...CULTURE_KEYS.map((k) => articleCard(all[k], base)),
    `      </div>`,
    lang.code === 'ja'
      ? [`      <h2>数秘術</h2>`, `      <div class="cards">`, articleCard(articles.numerology, '/'), `      </div>`, `      <h3>運命数ごとの解説</h3>`, numberGrid(null)].join('\n')
      : '',
    cta({ text: g.cta.text, href: base, label: g.cta.label }),
  ].filter(Boolean).join('\n')
  pages.push({ lang, file: GUIDE_FILE, title: g.title, description: g.description, breadcrumb: [{ name: ui.readings }], body: guideBody, alternates: available })
}

// ---- 規約ページ(日本語のみ) ----
for (const page of Object.values(legalPages)) {
  const body = [
    `      <h1>${esc(page.title)}</h1>`,
    `      <p class="lead">${esc(page.lead)}</p>`,
    ...page.sections.map(renderSection),
    page.file === legalPages.operator.file ? `      <p><a href="/${legalPages.contact.file}">お問い合わせページへ</a></p>` : '',
    page.updated ? `      <p class="updated">${esc(page.updated)}</p>` : '',
  ].filter(Boolean).join('\n')
  pages.push({ lang: jaLang, file: page.file, title: page.title, description: page.description, breadcrumb: [{ name: page.title }], body, legal: true })
}

for (const page of pages) {
  const dir = page.lang.path ? path.join(dist, page.lang.path) : dist
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, page.file), layout(page))
}

// サイトマップに追記する(build-languages.mjs が先に作った sitemap.xml の末尾に足す)
const sitemapPath = path.join(dist, 'sitemap.xml')
const extraUrls = pages
  .filter((p) => !p.legal)
  .map((p) => {
    const alts = (p.alternates || []).length > 1 ? p.alternates.map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.code}" href="${pageUrl(a, p.file)}" />`).join('') : ''
    return `  <url>\n    <loc>${pageUrl(p.lang, p.file)}</loc>${alts}\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
  })
  .join('\n')
const sitemap = fs.readFileSync(sitemapPath, 'utf8').replace('</urlset>', `${extraUrls}\n</urlset>`)
fs.writeFileSync(sitemapPath, sitemap)

console.log(`static pages: ${pages.length} (contact: ${CONTACT_EMAIL ? 'ok' : 'missing'})`)

// ---- Google アドセンス ----
// site.config.js に運営者IDが入っていれば、全HTMLの<head>にコードを入れ、ads.txt を作る。
const { default: siteConfig } = await import('../site.config.js')
const client = siteConfig.adsenseClient
if (client) {
  if (!/^ca-pub-\d{10,20}$/.test(client)) throw new Error(`adsenseClient の形式が正しくありません: ${client}`)
  const tag = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`
  const htmlFiles = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.html')) htmlFiles.push(full)
    }
  }
  walk(dist)
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8')
    if (!html.includes('adsbygoogle.js')) fs.writeFileSync(file, html.replace('</head>', `    ${tag}\n  </head>`))
  }
  fs.writeFileSync(path.join(dist, 'ads.txt'), `google.com, ${client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`)
  console.log(`adsense: ${htmlFiles.length} pages + ads.txt`)
} else {
  console.log('adsense: not configured (site.config.js)')
}

// ---- Google アナリティクス(GA4) ----
// site.config.js に測定IDが入っていれば、全HTMLの<head>の先頭近くに計測コードを入れる。
// 画面の切り替え(#/today など)は、GA4の自動計測(ブラウザの履歴の変化)でページビューとして記録される。
const ga = siteConfig.gaMeasurementId
if (ga) {
  if (!/^G-[A-Z0-9]{6,12}$/.test(ga)) throw new Error(`gaMeasurementId の形式が正しくありません: ${ga}`)
  const tag = `<script async src="https://www.googletagmanager.com/gtag/js?id=${ga}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');</script>`
  const htmlFiles = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.html')) htmlFiles.push(full)
    }
  }
  walk(dist)
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8')
    if (!html.includes('googletagmanager.com/gtag')) fs.writeFileSync(file, html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${tag}`))
  }
  console.log(`analytics: ${htmlFiles.length} pages`)
} else {
  console.log('analytics: not configured (site.config.js)')
}

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
import * as f2027 from '../src/content/fortune2027.ja.js'
import readingsJa from '../src/readings/data/ja.js'
import { etoIndex, kyuseiOfYear, kyuseiPalace } from '../src/readings/logic.js'
import { AMAZON_DISCLOSURE, amazonKeywordFor, amazonSearchUrl } from '../src/amazon.js'

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

function layout({ lang, file, title, description, breadcrumb, body, jsonLd, alternates = [], amazon = false }) {
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
${amazon ? `      <p>${esc(AMAZON_DISCLOSURE)}</p>\n` : ''}      <p>© 2026 ${esc(ui.siteName)}</p>
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
      ? [`      <h2>${f2027.YEAR}年の運勢</h2>`, `      <div class="cards">`, articleCard({ file: `${f2027.YEAR}.html`, emoji: '🎍', title: f2027.hub.shortTitle, description: f2027.hub.description }, '/'), `      </div>`, `      <h2>数秘術</h2>`, `      <div class="cards">`, articleCard(articles.numerology, '/'), `      </div>`, `      <h3>運命数ごとの解説</h3>`, numberGrid(null)].join('\n')
      : '',
    cta({ text: g.cta.text, href: base, label: g.cta.label }),
  ].filter(Boolean).join('\n')
  pages.push({ lang, file: GUIDE_FILE, title: g.title, description: g.description, breadcrumb: [{ name: ui.readings }], body: guideBody, alternates: available })
}

// ---- 2027年の運勢(日本語のみ) ----
{
  const Y = f2027.YEAR
  const kd = readingsJa.kyusei
  const ed = readingsJa.eto
  const KYUSEI_CENTER = kyuseiOfYear(Y)
  const ETO_SLUG = ['ne', 'ushi', 'tora', 'u', 'tatsu', 'mi', 'uma', 'hitsuji', 'saru', 'tori', 'inu', 'i']
  const ETO_EMOJI = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐗']
  const files = {
    hub: `${Y}.html`,
    kyusei: `${Y}-kyusei.html`,
    eto: `${Y}-eto.html`,
    numerology: `${Y}-numerology.html`,
    star: (n) => `${Y}-kyusei-${n}.html`,
    sign: (i) => `${Y}-eto-${ETO_SLUG[i]}.html`,
    year: (n) => `${Y}-year-${n}.html`,
  }
  const starName = (n) => kd.stars[n].name
  const etoName = (i) => ed.animals[i].name
  const starsLine = (count) => `<span class="rating" aria-label="5段階中${count}">${'★'.repeat(count)}<span>${'★'.repeat(5 - count)}</span></span>`
  const hubCrumb = { name: `${Y}年の運勢`, href: `/${files.hub}` }
  const readingsCrumb = { name: '読み物', href: `/${GUIDE_FILE}` }

  // その本命星・干支になる生まれ年(1930〜2026)
  const yearsOf = (test) => {
    const list = []
    for (let y = 1930; y <= 2026; y += 1) if (test(y)) list.push(y)
    return list
  }
  const starYears = (n) => yearsOf((y) => kyuseiOfYear(y) === n)
  const etoYears = (i) => yearsOf((y) => etoIndex({ year: y }) === i)

  const luckySection = (item) => {
    const url = amazonSearchUrl(amazonKeywordFor(item.item))
    return [
      `      <h2>ラッキーカラー・ラッキーアイテム</h2>`,
      `      <div class="lucky-box"><p>🎨 ラッキーカラー:<b>${esc(item.color)}</b></p><p>🍀 ラッキーアイテム:<b>${esc(item.item)}</b></p>${url ? `<a class="amazon-link" href="${url}" target="_blank" rel="sponsored noopener"><span class="pr-label">PR</span> ${esc(item.item)}をAmazonで見る →</a>` : ''}</div>`,
    ].join('\n')
  }
  const hasAmazon = (item) => Boolean(amazonSearchUrl(amazonKeywordFor(item.item)))

  const grid = (entries, current) => `      <div class="number-grid">${entries.map(({ key, href, big, small }) => (key === current
    ? `<span class="current"><b>${esc(big)}</b><small>${esc(small)}</small></span>`
    : `<a href="${href}"><b>${esc(big)}</b><small>${esc(small)}</small></a>`)).join('')}</div>`
  const starGrid = (current) => grid([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ key: n, href: `/${files.star(n)}`, big: starName(n).slice(0, 2), small: starName(n) })), current)
  const etoGrid = (current) => grid(ETO_SLUG.map((_, i) => ({ key: i, href: `/${files.sign(i)}`, big: ETO_EMOJI[i], small: etoName(i) })), current)
  const yearGrid = (current) => grid([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ key: n, href: `/${files.year(n)}`, big: String(n), small: f2027.numerology.years[n].theme })), current)

  const otherYearLinks = [
    `      <h2>ほかの占いで見る${Y}年</h2>`,
    `      <ul><li><a href="/${files.kyusei}">九星気学 本命星別の${Y}年の運勢</a></li><li><a href="/${files.eto}">干支別の${Y}年の運勢</a></li><li><a href="/${files.numerology}">数秘術 個人年数別の${Y}年の運勢</a></li></ul>`,
  ].join('\n')

  const fortuneBody = ({ eyebrow, h1, sub, rating, entry, extraSections = [], ctaInfo, gridHtml, gridHeading }) => [
    `      <p class="eyebrow">${esc(eyebrow)}</p>`,
    `      <h1>${esc(h1)}<span>${esc(sub)}</span></h1>`,
    `      <p class="rating-line">${Y}年の運気 ${starsLine(rating)}</p>`,
    `      <p class="lead">${esc(entry.overall)}</p>`,
    renderSection({ heading: '恋愛運', paragraphs: [entry.love] }),
    renderSection({ heading: '仕事運', paragraphs: [entry.work] }),
    renderSection({ heading: '金運', paragraphs: [entry.money] }),
    entry.health ? renderSection({ heading: '健康運', paragraphs: [entry.health] }) : '',
    renderSection({ heading: `${Y}年の開運アクション`, list: entry.actions }),
    luckySection(entry),
    ...extraSections,
    cta(ctaInfo),
    `      <h2>${esc(gridHeading)}</h2>`,
    gridHtml,
    otherYearLinks,
  ].filter(Boolean).join('\n')

  // 九星気学:本命星ごと
  for (let n = 1; n <= 9; n += 1) {
    const entry = f2027.kyusei.stars[n]
    const palace = kd.palaces[kyuseiPalace(n, KYUSEI_CENTER)]
    const name = starName(n)
    const title = `${name}の${Y}年の運勢|総合運・恋愛運・仕事運・金運`
    const body = fortuneBody({
      eyebrow: `九星気学 ${Y}年の運勢`,
      h1: `${name}の${Y}年`,
      sub: palace.title,
      rating: entry.stars,
      entry,
      extraSections: [
        renderSection({ heading: `${Y}年、${name}が入る場所`, paragraphs: [`${Y}年の${name}は「${palace.title}」に入ります。${palace.text}`, `九星気学の1年は立春から始まるため、この運勢は${Y}年2月4日から${Y + 1}年2月3日までの流れです。`] }),
        renderSection({ heading: `${name}の人の生まれ年`, paragraphs: [`${starYears(n).map((y) => `${y}年`).join('・')}生まれ(いずれも2月4日〜翌年2月3日生まれ)の人が${name}です。`] }),
        renderSection({ heading: `${name}の性格`, paragraphs: [kd.stars[n].nature] }),
      ],
      ctaInfo: { text: '自分の本命星がわからない人は、生年月日を入れるだけで調べられます', href: '/#/kyusei', label: '九星気学で鑑定する' },
      gridHeading: `ほかの本命星の${Y}年`,
      gridHtml: starGrid(n),
    })
    pages.push({ lang: jaLang, file: files.star(n), title, description: `${name}の${Y}年は「${palace.title}」。${entry.overall}`.slice(0, 150), breadcrumb: [readingsCrumb, hubCrumb, { name: `九星気学`, href: `/${files.kyusei}` }, { name }], body, jsonLd: articleLd(title, 'ja'), amazon: hasAmazon(entry) })
  }

  // 干支ごと
  for (let i = 0; i < 12; i += 1) {
    const entry = f2027.eto.signs[i]
    const name = etoName(i)
    const relation = f2027.eto.relations[entry.relation]
    const title = `${name}年生まれの${Y}年の運勢|恋愛運・仕事運・金運`
    const body = fortuneBody({
      eyebrow: `干支別 ${Y}年(丁未年)の運勢`,
      h1: `${ETO_EMOJI[i]} ${name}年生まれの${Y}年`,
      sub: relation,
      rating: entry.stars,
      entry,
      extraSections: [
        renderSection({ heading: `${name}年生まれの人`, paragraphs: [`${etoYears(i).map((y) => `${y}年`).join('・')}生まれの人が${name}年です。`] }),
        renderSection({ heading: `${name}年生まれの性格`, paragraphs: [ed.animals[i].nature] }),
      ],
      ctaInfo: { text: '干支の性格と相性の良い干支は、干支占いで見られます', href: '/#/eto', label: '干支占いをする' },
      gridHeading: `ほかの干支の${Y}年`,
      gridHtml: etoGrid(i),
    })
    pages.push({ lang: jaLang, file: files.sign(i), title, description: `${Y}年(丁未年)の${name}年生まれは「${relation.split('…')[0]}」の年。${entry.overall}`.slice(0, 150), breadcrumb: [readingsCrumb, hubCrumb, { name: '干支別', href: `/${files.eto}` }, { name }], body, jsonLd: articleLd(title, 'ja'), amazon: hasAmazon(entry) })
  }

  // 数秘術:個人年数ごと
  for (let n = 1; n <= 9; n += 1) {
    const entry = f2027.numerology.years[n]
    const title = `個人年数${n}の${Y}年の運勢「${entry.theme}」|数秘術`
    const body = fortuneBody({
      eyebrow: `数秘術 ${Y}年の運勢`,
      h1: `個人年数${n}の${Y}年`,
      sub: entry.theme,
      rating: entry.stars,
      entry,
      extraSections: [
        renderSection({ heading: '個人年数の出し方', paragraphs: f2027.numerology.howTo, example: f2027.numerology.example }),
      ],
      ctaInfo: { text: '生まれ持った運命数も、生年月日を入れるだけで鑑定できます', href: '/#/birthday', label: '誕生日鑑定をする' },
      gridHeading: `ほかの個人年数の${Y}年`,
      gridHtml: yearGrid(n),
    })
    pages.push({ lang: jaLang, file: files.year(n), title, description: `数秘術で見る${Y}年。個人年数${n}の人は「${entry.theme}」。${entry.overall}`.slice(0, 150), breadcrumb: [readingsCrumb, hubCrumb, { name: '数秘術', href: `/${files.numerology}` }, { name: `個人年数${n}` }], body, jsonLd: articleLd(title, 'ja'), amazon: hasAmazon(entry) })
  }

  // 一覧ページ(九星・干支・数秘)
  const table = (head, rows) => renderSection({ heading: '早見表', table: { head, rows } })
  const listPage = (key, crumbName, sections, gridHtml) => {
    const p = f2027[key]
    const body = [
      `      <p class="eyebrow">${Y}年の運勢</p>`,
      `      <h1>${esc(p.title)}</h1>`,
      `      <p class="lead">${esc(p.lead)}</p>`,
      ...sections,
      `      <h2>あなたの${crumbName}を選んでください</h2>`,
      gridHtml,
      otherYearLinks,
    ].join('\n')
    pages.push({ lang: jaLang, file: files[key], title: p.title, description: p.description, breadcrumb: [readingsCrumb, hubCrumb, { name: crumbName }], body, jsonLd: articleLd(p.title, 'ja') })
  }
  listPage('kyusei', '本命星', [
    renderSection({ heading: `${Y}年は九紫火星の年`, paragraphs: [`${Y}年は、九紫火星が九星の中心(中宮)に入る年です。それぞれの本命星が1年間どの場所(宮)に入るかによって、運気の流れが変わります。`, `九星気学の1年は立春(${Y}年2月4日)から始まります。1月1日〜2月3日生まれの人は、前の年の星になるので注意してください。`] }),
    renderSection({ heading: `本命星別 ${Y}年の運気`, table: { head: ['本命星', '入る場所', '運気'], rows: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [starName(n), kd.palaces[kyuseiPalace(n, KYUSEI_CENTER)].title, '★'.repeat(f2027.kyusei.stars[n].stars)]) } }),
    table(['本命星', '生まれ年(2月4日〜翌年2月3日)'], [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [starName(n), starYears(n).filter((y) => y >= 1950).join('・')])),
  ], starGrid(null))
  listPage('eto', '干支', [
    renderSection({ heading: `${Y}年は丁未(ひのと・ひつじ)年`, paragraphs: ['十二支どうしには、助け合う「三合」「支合」や、ぶつかりやすい「冲」などの関係があります。その年の干支と、生まれ年の干支との関係から、1年の運気の流れを読み解きます。'] }),
    renderSection({ heading: `干支別 ${Y}年の運気`, table: { head: ['干支', 'ひつじ年との関係', '運気'], rows: f2027.eto.signs.map((s, i) => [etoName(i), f2027.eto.relations[s.relation].split('…')[0], '★'.repeat(s.stars)]) } }),
    table(['干支', '生まれ年'], ETO_SLUG.map((_, i) => [etoName(i), etoYears(i).filter((y) => y >= 1950).join('・')])),
  ], etoGrid(null))
  listPage('numerology', '個人年数', [
    renderSection({ heading: '個人年数の出し方', paragraphs: f2027.numerology.howTo, example: f2027.numerology.example, after: ['途中で11や22になったときも、1けたになるまで足してください。'] }),
    renderSection({ heading: `個人年数別 ${Y}年のテーマ`, table: { head: ['個人年数', 'テーマ', '運気'], rows: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [String(n), f2027.numerology.years[n].theme, '★'.repeat(f2027.numerology.years[n].stars)]) } }),
  ], yearGrid(null))

  // まとめページ
  {
    const h = f2027.hub
    const card = (file, emoji, title, text) => `        <a class="card" href="/${file}"><b>${emoji} ${esc(title)}</b><span>${esc(text)}</span></a>`
    const body = [
      `      <p class="eyebrow">${Y}年の運勢</p>`,
      `      <h1>${esc(h.shortTitle)}<span>九星気学・干支・数秘術</span></h1>`,
      `      <p class="lead">${esc(h.lead)}</p>`,
      `      <div class="cards">`,
      card(files.kyusei, '⭐', f2027.kyusei.shortTitle, '一白水星〜九紫火星。本命星が入る場所から1年を読みます'),
      card(files.eto, '🐑', f2027.eto.shortTitle, '丁未(ひつじ)年と、あなたの干支との関係から読みます'),
      card(files.numerology, '🔢', f2027.numerology.shortTitle, '誕生日から出す「個人年数」で、9年サイクルの位置を読みます'),
      `      </div>`,
      ...h.about.map(renderSection),
      cta({ text: '新しい年のはじまりに、今日のおみくじも引いてみましょう', href: '/#/today', label: '今日のおみくじを引く' }),
      `      <h2>${Y}年のはじまりに読みたい記事</h2>`,
      `      <div class="cards">`,
      articleCard(cultures.ja.articles.hatsumode, '/'),
      articleCard(cultures.ja.articles.sanpai, '/'),
      `      </div>`,
    ].join('\n')
    pages.push({ lang: jaLang, file: files.hub, title: h.title, description: h.description, breadcrumb: [readingsCrumb, { name: h.shortTitle }], body, jsonLd: articleLd(h.title, 'ja') })
  }
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

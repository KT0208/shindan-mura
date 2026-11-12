// ビルド後に実行し、読み物ページ・運命数の解説ページ・規約ページを、
// 文章がそのまま入った静的なHTMLとして dist/ に書き出す(検索エンジンやアドセンス審査が読みやすいように)。
// フォルダを作らず dist/ 直下に置くので、Xserver へのアップロードも1か所で済む。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ja from '../src/i18n/ja.js'
import numberGuide from '../src/content/numberGuide.ja.js'
import { articles, shrineArticles, legalPages, CONTACT_EMAIL } from '../src/content/articles.ja.js'
import { lifePathNumber, numberRelation, reduceNumber } from '../src/fortune.js'
import { SITE_URL } from '../src/i18n/languages.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]
const numberFile = (n) => `number-${n}.html`
const GUIDE_FILE = 'guide.html'

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// 本文中のURLとメールアドレスをリンクにする
function linkify(text) {
  return esc(text)
    .replace(/https?:\/\/[^\s)、。]+/g, (url) => `<a href="${url}" rel="noopener">${url}</a>`)
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (mail) => `<a href="mailto:${mail}">${mail}</a>`)
}

function layout({ file, title, description, breadcrumb, body, jsonLd }) {
  const url = `${SITE_URL}/${file}`
  const crumbs = [{ name: '鑑定村', href: '/' }, ...breadcrumb]
  const breadcrumbLd = {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.href || `/${file}`}` })),
  }
  const ld = { '@context': 'https://schema.org', '@graph': [breadcrumbLd, ...(jsonLd ? [jsonLd] : [])] }
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}｜鑑定村</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/pages.css" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="鑑定村" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE_URL}/og-image.jpg" />
    <meta property="og:locale" content="ja_JP" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(ld)}</script>
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="/">鑑定村</a>
      <nav aria-label="鑑定メニュー">
        <a href="/#/birthday">誕生日鑑定</a>
        <a href="/#/name">名前鑑定</a>
        <a href="/#/today">おみくじ</a>
        <a href="/#/compat">相性</a>
      </nav>
    </header>
    <nav class="breadcrumb" aria-label="パンくずリスト">
      ${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<a href="${c.href}">${esc(c.name)}</a>` : `<span>${esc(c.name)}</span>`)).join(' › ')}
    </nav>
    <main class="article">
${body}
    </main>
    <footer class="site-footer">
      <nav aria-label="サイト情報">
        <a href="/${GUIDE_FILE}">読み物</a>
        <a href="/${legalPages.privacy.file}">プライバシーポリシー</a>
        <a href="/${legalPages.contact.file}">お問い合わせ</a>
        <a href="/${legalPages.operator.file}">運営者情報</a>
      </nav>
      <p>姉妹サイト:<a href="https://shindanmura.com/?utm_source=kanteimura&amp;utm_medium=referral&amp;utm_campaign=pages" rel="noopener">🧩 キャラクターで性格がわかる「診断村」</a></p>
      <p>※ 鑑定結果は数秘術などをもとにしたエンターテインメントです。</p>
      <p>© 2026 鑑定村</p>
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

const pages = []

// ---- 運命数の解説ページ ----
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
    example ? renderSection({ heading: `運命数${n}になる生年月日の例`, paragraphs: ['運命数は、生年月日の数字をすべて1けたずつ足して求めます。'], example: [`例:${example.label}`, ...example.steps, `→ 運命数は「${n}」`], after: [`くわしい計算方法は「<数秘術とは?>」で解説しています。`] }).replace('&lt;数秘術とは?&gt;', `<a href="/${articles.numerology.file}">数秘術とは?</a>`) : '',
    cta({ text: 'あなたの運命数はいくつ?生年月日を入れるだけで鑑定できます', href: '/#/birthday', label: '誕生日鑑定をする' }),
    `      <h2>ほかの運命数</h2>`,
    numberGrid(n),
  ].filter(Boolean).join('\n')
  pages.push({ file: numberFile(n), title, description: `${extra.summary} 運命数${n}の性格・強み・恋愛・向いている仕事・相性の良い数を解説します。`.slice(0, 160), breadcrumb: [{ name: '読み物', href: `/${GUIDE_FILE}` }, { name: `運命数${n}` }], body, jsonLd: { '@type': 'Article', headline: title, inLanguage: 'ja', author: { '@type': 'Organization', name: '鑑定村' } } })
}

// ---- 読み物記事 ----
const allArticles = { ...articles, ...shrineArticles }
const articleCard = (a) => `        <a class="card" href="/${a.file}"><b>${a.emoji || '📖'} ${esc(a.title)}</b><span>${esc(a.description)}</span></a>`
const shortName = (a) => a.shortTitle || a.title.split(/[?|]/)[0]

function related(keys) {
  if (!keys?.length) return ''
  return [`      <h2>あわせて読みたい</h2>`, `      <div class="cards">`, ...keys.map((k) => articleCard(allArticles[k])), `      </div>`].join('\n')
}

// 本文中の「〜」(記事名)を、その記事へのリンクにする
function linkArticleNames(html, self) {
  let out = html
  for (const a of Object.values(allArticles)) {
    if (a === self) continue
    const name = shortName(a).replace(/\(.*\)$/, '')
    out = out.replace(`「${esc(name)}」`, `「<a href="/${a.file}">${esc(name)}</a>」`)
  }
  return out
}

for (const article of Object.values(allArticles)) {
  const body = [
    `      <p class="eyebrow">読み物</p>`,
    `      <h1>${esc(article.title)}</h1>`,
    `      <p class="lead">${esc(article.lead)}</p>`,
    ...article.sections.map((section) => linkArticleNames(renderSection(section), article)),
    cta(article.cta),
    article === articles.numerology ? `      <h2>運命数ごとの解説</h2>\n${numberGrid(null)}` : '',
    related(article.related),
  ].filter(Boolean).join('\n')
  pages.push({ file: article.file, title: article.title, description: article.description, breadcrumb: [{ name: '読み物', href: `/${GUIDE_FILE}` }, { name: shortName(article) }], body, jsonLd: { '@type': 'Article', headline: article.title, inLanguage: 'ja', author: { '@type': 'Organization', name: '鑑定村' } } })
}

// ---- 読み物一覧 ----
pages.push({
  file: GUIDE_FILE,
  title: '読み物一覧|数秘術・おみくじ・神社のお参りの作法',
  description: '鑑定村の読み物一覧です。数秘術の基本と運命数1〜9・11・22・33の解説、おみくじの意味、手水や二礼二拍手一礼など神社のお参りの作法をまとめています。',
  breadcrumb: [{ name: '読み物' }],
  body: [
    `      <p class="eyebrow">読み物</p>`,
    `      <h1>読み物一覧</h1>`,
    `      <p class="lead">鑑定村の占いをもっと楽しむための解説ページです。数秘術のしくみや運命数ごとの性格、おみくじの意味、神社でのお参りの作法をまとめています。</p>`,
    `      <h2>神社・おみくじ</h2>`,
    `      <div class="cards">`,
    articleCard(shrineArticles.sanpai),
    articleCard(shrineArticles.temizu),
    articleCard(shrineArticles.jinjaTera),
    articleCard(articles.omikuji),
    `      </div>`,
    `      <h2>数秘術</h2>`,
    `      <div class="cards">`,
    articleCard(articles.numerology),
    `      </div>`,
    `      <h3>運命数ごとの解説</h3>`,
    numberGrid(null),
    cta({ text: '読んだら、実際に鑑定してみましょう', href: '/', label: '鑑定村のトップへ' }),
  ].join('\n'),
})

// ---- 規約ページ ----
for (const page of Object.values(legalPages)) {
  const body = [
    `      <h1>${esc(page.title)}</h1>`,
    `      <p class="lead">${esc(page.lead)}</p>`,
    ...page.sections.map(renderSection),
    page.file === legalPages.operator.file ? `      <p><a href="/${legalPages.contact.file}">お問い合わせページへ</a></p>` : '',
    page.updated ? `      <p class="updated">${esc(page.updated)}</p>` : '',
  ].filter(Boolean).join('\n')
  pages.push({ file: page.file, title: page.title, description: page.description, breadcrumb: [{ name: page.title }], body })
}

for (const page of pages) fs.writeFileSync(path.join(dist, page.file), layout(page))

// サイトマップに追記する(build-languages.mjs が先に作った sitemap.xml の末尾に足す)
const sitemapPath = path.join(dist, 'sitemap.xml')
const extraUrls = pages
  .filter((p) => !Object.values(legalPages).some((l) => l.file === p.file))
  .map((p) => `  <url>\n    <loc>${SITE_URL}/${p.file}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`)
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

// 診断村: コラム(読み物)ページを静的生成する。
//
// 入力: content/column/*.md (フロントマター + Markdown本文)
// 生成物: public/column/index.html(一覧) と public/column/{slug}/index.html(記事)
//
// 実行: npm run generate:columns (prebuildで自動実行)
//
// 目的:
//   - サイト独自の読み物を用意し、コンテンツの厚みを出す(AdSense対策・SEO)
//   - 診断への回遊導線を増やす
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { GA_TAG } from './ga-tag.mjs'
import { fileURLToPath } from 'node:url'

const SITE_ORIGIN = 'https://shindanmura.com'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(projectRoot, 'content', 'column')
const publicDir = path.join(projectRoot, 'public')

const escapeHtml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

// --- 最小限のMarkdown変換(見出し/段落/箇条書き/強調/リンク) ---
function inline(text) {
  return escapeHtml(text)
    .replaceAll(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replaceAll(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
}

function markdownToHtml(md) {
  const lines = md.split('\n')
  const html = []
  let inList = false
  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      closeList()
      continue
    }
    if (line.startsWith('## ')) {
      closeList()
      html.push(`<h2>${inline(line.slice(3))}</h2>`)
    } else if (line.startsWith('### ')) {
      closeList()
      html.push(`<h3>${inline(line.slice(4))}</h3>`)
    } else if (line.startsWith('> ')) {
      closeList()
      html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`)
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${inline(line.slice(2))}</li>`)
    } else {
      closeList()
      html.push(`<p>${inline(line)}</p>`)
    }
  }
  closeList()
  return html.join('\n')
}

function parseFrontMatter(source) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source)
  if (!match) throw new Error('フロントマターが見つかりません')
  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: match[2] }
}

const STYLE = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
    background: linear-gradient(160deg, #fff8fd 0%, #ffe6f8 55%, #ece2fb 100%);
    color: #241436; min-height: 100vh; padding: 24px 16px 48px;
    display: flex; justify-content: center; line-height: 1.9;
  }
  .page { max-width: 720px; width: 100%; }
  .brand { font-size: 14px; letter-spacing: 0.08em; text-align: center; margin-bottom: 16px; }
  .brand a { color: #8e5fc6; font-weight: 700; text-decoration: none; }
  article, .card {
    background: rgba(255, 255, 255, 0.94); border-radius: 24px;
    padding: 32px 24px; box-shadow: 0 12px 40px rgba(97, 72, 127, 0.16);
  }
  .category { display: inline-block; font-size: 12px; color: #8f4ed8; background: #f6ecff; padding: 4px 12px; border-radius: 999px; }
  h1 { font-size: 24px; line-height: 1.5; margin: 12px 0 8px; color: #2c1a44; }
  time { font-size: 13px; color: #8f7ba6; }
  .lead { margin-top: 14px; color: #4a3763; font-size: 15px; }
  article h2 { font-size: 19px; margin: 32px 0 10px; color: #61487f; border-left: 5px solid #ff8fd0; padding-left: 12px; }
  article h3 { font-size: 16px; margin: 22px 0 6px; color: #61487f; }
  article p { margin: 12px 0; font-size: 15.5px; color: #33234a; }
  article ul { margin: 12px 0 12px 20px; }
  article li { margin: 6px 0; font-size: 15px; color: #33234a; }
  article blockquote {
    margin: 16px 0; padding: 12px 16px; border-left: 4px solid #c9a6ef;
    background: #faf4ff; color: #4a3763; font-size: 15px; border-radius: 0 12px 12px 0;
  }
  article a { color: #c2358f; }
  .cta {
    display: block; margin-top: 32px; padding: 15px; border-radius: 999px; text-decoration: none;
    background: linear-gradient(135deg, #ff67ad, #8f4ed8); color: #fff; font-weight: 700;
    font-size: 16px; text-align: center;
  }
  .sub-links { margin-top: 18px; font-size: 13px; text-align: center; }
  .sub-links a { color: #8e5fc6; margin: 0 8px; }
  .column-list { display: grid; gap: 14px; margin-top: 20px; }
  .column-item {
    display: block; background: rgba(255,255,255,0.94); border-radius: 18px;
    padding: 20px; text-decoration: none; color: #241436;
    box-shadow: 0 8px 26px rgba(97, 72, 127, 0.12);
  }
  .column-item strong { display: block; font-size: 17px; margin: 8px 0 6px; line-height: 1.5; }
  .column-item p { font-size: 14px; color: #5b476f; }
`

function head({ title, description, url, extraJsonLd, robots }) {
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
${robots ? `<meta name="robots" content="${robots}" />\n` : ''}<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="診断村" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE_ORIGIN}/og-image.jpg" />
<meta property="og:locale" content="ja_JP" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${SITE_ORIGIN}/og-image.jpg" />
<script type="application/ld+json">${JSON.stringify(extraJsonLd)}</script>
${GA_TAG}
<style>${STYLE}</style>`
}

function buildArticle({ meta, body }) {
  const url = `${SITE_ORIGIN}/column/${meta.slug}/`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    url,
    author: { '@type': 'Organization', name: '診断村' },
    publisher: { '@type': 'Organization', name: '診断村', url: SITE_ORIGIN },
    mainEntityOfPage: url,
  }
  // 診断ごとの guide-* コラムは、各診断の本体ページ(/diagnosis/{id}/)と内容が重複する
  // 同型の量産ページ。AdSense「有用性の低いコンテンツ」対策として、ページは残しつつ
  // 検索インデックスからは外す(noindex, follow)。sitemapからも除外する。
  const isGuide = typeof meta.slug === 'string' && meta.slug.startsWith('guide-')
  return `<!doctype html>
<html lang="ja">
<head>
${head({ title: `${meta.title} | 診断村コラム`, description: meta.description, url, extraJsonLd: jsonLd, robots: isGuide ? 'noindex, follow' : undefined })}
</head>
<body>
<div class="page">
  <div class="brand"><a href="/">診断村</a> ／ <a href="/column/">コラム</a></div>
  <article>
    <span class="category">${escapeHtml(meta.category || 'コラム')}</span>
    <h1>${escapeHtml(meta.title)}</h1>
    <time datetime="${escapeHtml(meta.date)}">${escapeHtml(meta.date)}</time>
    <p class="lead">${escapeHtml(meta.description)}</p>
${markdownToHtml(body)}
    <a class="cta" href="/">診断村で診断してみる</a>
    <div class="sub-links">
      <a href="/column/">コラム一覧</a>
      <a href="/#guide">キャラ図鑑</a>
      <a href="/">トップ</a>
    </div>
  </article>
</div>
</body>
</html>
`
}

function buildIndex(articles) {
  const url = `${SITE_ORIGIN}/column/`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '診断村コラム',
    description: '診断村の楽しみ方、診断の解説、制作の裏側などの読み物です。',
    url,
    isPartOf: { '@type': 'WebSite', name: '診断村', url: SITE_ORIGIN },
  }
  const items = articles
    .map(
      ({ meta }) => `    <a class="column-item" href="/column/${meta.slug}/">
      <span class="category">${escapeHtml(meta.category || 'コラム')}</span>
      <strong>${escapeHtml(meta.title)}</strong>
      <p>${escapeHtml(meta.description)}</p>
    </a>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="ja">
<head>
${head({ title: '診断村コラム｜診断の解説と楽しみ方', description: '診断村の楽しみ方、人気診断の解説、キャラクター制作の裏側などをまとめた読み物ページです。', url, extraJsonLd: jsonLd })}
</head>
<body>
<div class="page">
  <div class="brand"><a href="/">診断村</a></div>
  <div class="card">
    <span class="category">コラム</span>
    <h1>診断村コラム</h1>
    <p class="lead">診断村の楽しみ方、人気診断の解説、キャラクターができるまでの裏側などをまとめています。診断のあとの読み物にどうぞ。</p>
  </div>
  <div class="column-list">
${items}
  </div>
  <div class="sub-links">
    <a href="/">診断村トップ</a>
    <a href="/#guide">キャラ図鑑</a>
  </div>
</div>
</body>
</html>
`
}

export async function loadColumns() {
  const files = (await readdir(contentDir)).filter((f) => f.endsWith('.md'))
  const articles = []
  for (const file of files) {
    const source = await readFile(path.join(contentDir, file), 'utf8')
    articles.push(parseFrontMatter(source))
  }
  articles.sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
  return articles
}

async function main() {
  const articles = await loadColumns()
  const columnDir = path.join(publicDir, 'column')
  await mkdir(columnDir, { recursive: true })
  await writeFile(path.join(columnDir, 'index.html'), buildIndex(articles), 'utf8')
  for (const article of articles) {
    const dir = path.join(columnDir, article.meta.slug)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'index.html'), buildArticle(article), 'utf8')
  }
  console.log(`コラムページ ${articles.length} 本 + 一覧を生成しました`)
}

if (process.argv[1] && path.resolve(process.argv[1]).endsWith('generate-columns.mjs')) {
  main().catch((error) => {
    console.error('[generate-columns] エラー:', error)
    process.exitCode = 1
  })
}

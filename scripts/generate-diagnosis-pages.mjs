// 診断村: 各診断の「静的・インデックス対象」ページを生成する。
//
// 背景:
//   本体SPAはハッシュルーティング(#diagnosis=xxx)のため、25本の診断が
//   検索エンジンには「トップ1ページ」としてしか見えていなかった。
//   各診断の16タイプ解説(characterData + resultDetails に既にある独自テキスト)を
//   実体のある静的HTMLとして出し、サイトの「有用性のあるコンテンツ」を一気に増やす。
//
// 生成物:
//   public/diagnosis/index.html            ... 診断一覧ハブ
//   public/diagnosis/{id}/index.html       ... 診断ごとの解説ページ(16タイプ全掲載)
//
// 実行: npm run generate:diagnosis (prebuildで自動実行)
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { diagnoses } from '../src/diagnosisData.js'
import { resultDetails } from '../src/resultDetails.js'
import { characterCollections } from './generate-share-pages.mjs'

const SITE_ORIGIN = 'https://shindanmura.com'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')

const escapeHtml = (s) =>
  String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const STYLE = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
    background: linear-gradient(160deg, #fff8fd 0%, #ffe6f8 55%, #ece2fb 100%);
    color: #241436; min-height: 100vh; padding: 24px 16px 56px;
    display: flex; justify-content: center; line-height: 1.9;
  }
  .page { max-width: 760px; width: 100%; }
  .brand { font-size: 14px; letter-spacing: 0.06em; text-align: center; margin-bottom: 16px; }
  .brand a { color: #8e5fc6; font-weight: 700; text-decoration: none; }
  .card, article {
    background: rgba(255, 255, 255, 0.94); border-radius: 24px;
    padding: 30px 24px; box-shadow: 0 12px 40px rgba(97, 72, 127, 0.16);
  }
  .category { display: inline-block; font-size: 12px; color: #8f4ed8; background: #f6ecff; padding: 4px 12px; border-radius: 999px; }
  h1 { font-size: 25px; line-height: 1.5; margin: 12px 0 8px; color: #2c1a44; }
  .lead { margin-top: 10px; color: #4a3763; font-size: 15.5px; }
  h2 { font-size: 19px; margin: 30px 0 12px; color: #61487f; border-left: 5px solid #ff8fd0; padding-left: 12px; }
  .how p { font-size: 15px; color: #33234a; margin: 10px 0; }
  .how ul { margin: 10px 0 0 20px; }
  .how li { font-size: 15px; color: #33234a; margin: 6px 0; }
  .type-list { display: grid; gap: 16px; margin-top: 8px; }
  .type-card {
    display: grid; grid-template-columns: 96px 1fr; gap: 14px; align-items: start;
    background: #fff; border: 1px solid #f0e4fb; border-radius: 18px; padding: 16px;
  }
  .type-card img { width: 96px; height: 64px; object-fit: contain; border-radius: 12px; background: #faf4ff; }
  .type-name { font-weight: 700; font-size: 16px; color: #2c1a44; }
  .type-title { font-size: 12.5px; color: #8f4ed8; margin: 2px 0 6px; }
  .type-role { font-size: 13px; color: #61487f; margin-bottom: 6px; }
  .type-desc { font-size: 14px; color: #33234a; margin-bottom: 6px; }
  .type-meta { font-size: 12.5px; color: #6b5685; margin-top: 3px; }
  .cta {
    display: block; margin-top: 28px; padding: 16px; border-radius: 999px; text-decoration: none;
    background: linear-gradient(135deg, #ff67ad, #8f4ed8); color: #fff; font-weight: 700;
    font-size: 16px; text-align: center;
  }
  .diagnosis-list { display: grid; gap: 14px; margin-top: 20px; }
  .diagnosis-item {
    display: block; background: rgba(255,255,255,0.94); border-radius: 18px;
    padding: 18px 20px; text-decoration: none; color: #241436;
    box-shadow: 0 8px 26px rgba(97, 72, 127, 0.12);
  }
  .diagnosis-item strong { display: block; font-size: 17px; margin: 6px 0 4px; }
  .diagnosis-item p { font-size: 13.5px; color: #5b476f; }
  .sub-links { margin-top: 22px; font-size: 13px; text-align: center; }
  .sub-links a { color: #8e5fc6; margin: 0 8px; white-space: nowrap; }
  .zukan-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .zukan-nav a { font-size: 12.5px; color: #8f4ed8; background: #f6ecff; padding: 5px 11px; border-radius: 999px; text-decoration: none; }
  .zukan-section { margin-top: 30px; }
  .zukan-section h2 { margin-bottom: 4px; }
  .zukan-section h2 a { color: #61487f; text-decoration: none; }
  .zukan-lead { font-size: 13px; color: #5b476f; margin: 0 0 12px; }
  .zukan-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .zukan-char { display: block; text-decoration: none; color: #241436; background: #fff; border: 1px solid #f0e4fb; border-radius: 14px; padding: 8px; text-align: center; }
  .zukan-char img { width: 100%; height: 72px; object-fit: contain; background: #faf4ff; border-radius: 10px; }
  .zukan-char .cname { display: block; font-size: 12px; font-weight: 700; margin-top: 6px; line-height: 1.4; color: #2c1a44; }
  .zukan-char .ctype { display: block; font-size: 10.5px; color: #8f7ba6; line-height: 1.3; }
  @media (max-width: 520px) { .zukan-grid { grid-template-columns: repeat(2, 1fr); } }
`

function head({ title, description, url, jsonLd }) {
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
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
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${STYLE}</style>`
}

function footerLinks() {
  return `    <div class="sub-links">
      <a href="/diagnosis/">診断一覧</a>
      <a href="/zukan/">村人図鑑</a>
      <a href="/column/">コラム</a>
      <a href="/">トップ</a>
      <a href="/about/">運営者情報</a>
      <a href="/privacy/">プライバシー</a>
      <a href="/contact/">お問い合わせ</a>
    </div>`
}

function buildDiagnosisPage(diagnosis) {
  const collection = characterCollections[diagnosis.id]
  const url = `${SITE_ORIGIN}/diagnosis/${diagnosis.id}/`
  const entries = Object.entries(collection.characters)
  const typeCount = entries.length

  const cards = entries
    .map(([resultTitle, c]) => {
      const d = resultDetails[diagnosis.id]?.[resultTitle] || {}
      const img = `/characters-small/${collection.basePath}/${c.imageKey}.webp`
      return `      <div class="type-card">
        <img src="${img}" alt="${escapeHtml(c.characterName)}" loading="lazy" width="96" height="64" />
        <div>
          <div class="type-name">${escapeHtml(c.characterName)}</div>
          <div class="type-title">${escapeHtml(resultTitle)}</div>
          <div class="type-role">${escapeHtml(c.role)}</div>
          <p class="type-desc">${escapeHtml(d.description || '')}</p>
          ${d.match ? `<p class="type-meta">${escapeHtml(d.match)}</p>` : ''}
          ${d.advice ? `<p class="type-meta">${escapeHtml(d.advice)}</p>` : ''}
        </div>
      </div>`
    })
    .join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${diagnosis.title}`,
    description: diagnosis.description,
    url,
    inLanguage: 'ja',
    isPartOf: { '@type': 'WebSite', name: '診断村', url: SITE_ORIGIN },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '診断村', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: '診断一覧', item: `${SITE_ORIGIN}/diagnosis/` },
        { '@type': 'ListItem', position: 3, name: diagnosis.title, item: url },
      ],
    },
  }

  return `<!doctype html>
<html lang="ja">
<head>
${head({ title: `${diagnosis.title}｜無料で遊べる心理テスト | 診断村`, description: diagnosis.description, url, jsonLd })}
</head>
<body>
<div class="page">
  <div class="brand"><a href="/">診断村</a> ／ <a href="/diagnosis/">診断一覧</a></div>
  <article>
    <span class="category">${escapeHtml(diagnosis.category || '診断')}</span>
    <h1>${escapeHtml(diagnosis.emoji || '')} ${escapeHtml(diagnosis.title)}</h1>
    <p class="lead">${escapeHtml(diagnosis.description)}</p>

    <h2>遊び方</h2>
    <div class="how">
      <p>かんたんな${diagnosis.questions ? diagnosis.questions.length : 8}問の質問に、直感で「違う〜完全に自分」の4段階から答えるだけ。所要時間は1分ほどで、${typeCount}タイプの中からあなたに近いキャラクターが結果として出ます。登録不要・完全無料で、結果はそのままSNSでシェアできます。</p>
    </div>

    <h2>${escapeHtml(diagnosis.title)}の全${typeCount}タイプ</h2>
    <div class="type-list">
${cards}
    </div>

    <a class="cta" href="/#diagnosis=${diagnosis.id}">${escapeHtml(diagnosis.title)}をやってみる(無料)</a>
${footerLinks()}
  </article>
</div>
</body>
</html>
`
}

function buildIndex(list) {
  const url = `${SITE_ORIGIN}/diagnosis/`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '診断一覧｜診断村',
    description: '診断村で遊べる無料の性格診断・心理テストの一覧です。',
    url,
    isPartOf: { '@type': 'WebSite', name: '診断村', url: SITE_ORIGIN },
  }
  const items = list
    .map(
      (d) => `    <a class="diagnosis-item" href="/diagnosis/${d.id}/">
      <span class="category">${escapeHtml(d.category || '診断')}</span>
      <strong>${escapeHtml(d.emoji || '')} ${escapeHtml(d.title)}</strong>
      <p>${escapeHtml(d.description)}</p>
    </a>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="ja">
<head>
${head({ title: '診断一覧｜無料で遊べる性格診断・心理テスト | 診断村', description: '診断村で遊べる無料の性格診断・恋愛診断・心理テストの一覧です。気になる診断を選んで、あなたに近いキャラクターを見つけよう。', url, jsonLd })}
</head>
<body>
<div class="page">
  <div class="brand"><a href="/">診断村</a></div>
  <div class="card">
    <span class="category">診断一覧</span>
    <h1>診断一覧</h1>
    <p class="lead">診断村で遊べる無料の性格診断・恋愛診断・心理テストの一覧です。気になるテーマを選んで、あなたに近いキャラクターを見つけてください。</p>
  </div>
  <div class="diagnosis-list">
${items}
  </div>
${footerLinks()}
</div>
</body>
</html>
`
}

function buildZukan(list) {
  const url = `${SITE_ORIGIN}/zukan/`
  const totalChars = list.reduce((n, d) => n + Object.keys(characterCollections[d.id].characters).length, 0)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '村人図鑑｜診断村の全キャラクター一覧',
    description: `診断村に登場する全${totalChars}体のキャラクター図鑑です。`,
    url,
    isPartOf: { '@type': 'WebSite', name: '診断村', url: SITE_ORIGIN },
  }
  const nav = list
    .map((d) => `<a href="#${d.id}">${escapeHtml(d.emoji || '')} ${escapeHtml(d.title)}</a>`)
    .join('\n    ')
  const sections = list
    .map((d) => {
      const collection = characterCollections[d.id]
      const cards = Object.entries(collection.characters)
        .map(([resultTitle, c]) => {
          const img = `/characters-small/${collection.basePath}/${c.imageKey}.webp`
          return `      <a class="zukan-char" href="/diagnosis/${d.id}/">
        <img src="${img}" alt="${escapeHtml(c.characterName)}" loading="lazy" width="120" height="72" />
        <span class="cname">${escapeHtml(c.characterName)}</span>
        <span class="ctype">${escapeHtml(resultTitle)}</span>
      </a>`
        })
        .join('\n')
      return `  <section class="zukan-section" id="${d.id}">
    <h2><a href="/diagnosis/${d.id}/">${escapeHtml(d.emoji || '')} ${escapeHtml(d.title)}</a></h2>
    <p class="zukan-lead">${escapeHtml(d.description)}</p>
    <div class="zukan-grid">
${cards}
    </div>
  </section>`
    })
    .join('\n')
  return `<!doctype html>
<html lang="ja">
<head>
${head({ title: '村人図鑑｜診断村の全キャラクター一覧', description: `診断村に登場する全${totalChars}体のキャラクターを一覧で楽しめる村人図鑑。気になる子の診断にそのまま進めます。`, url, jsonLd })}
</head>
<body>
<div class="page">
  <div class="brand"><a href="/">診断村</a></div>
  <div class="card">
    <span class="category">村人図鑑</span>
    <h1>村人図鑑</h1>
    <p class="lead">診断村に暮らす全${totalChars}体のキャラクターの一覧です。気になる子を見つけたら、その診断にそのまま進んで、あなたに近い村人に出会ってください。</p>
    <nav class="zukan-nav">
    ${nav}
    </nav>
  </div>
${sections}
${footerLinks()}
</div>
</body>
</html>
`
}

async function main() {
  const visible = diagnoses.filter((d) => !d.hidden && characterCollections[d.id])
  const diagnosisDir = path.join(publicDir, 'diagnosis')
  await mkdir(diagnosisDir, { recursive: true })
  await writeFile(path.join(diagnosisDir, 'index.html'), buildIndex(visible), 'utf8')
  for (const d of visible) {
    const dir = path.join(diagnosisDir, d.id)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'index.html'), buildDiagnosisPage(d), 'utf8')
  }
  // 村人図鑑(全キャラ横断のカタログ型ハブ)
  const zukanDir = path.join(publicDir, 'zukan')
  await mkdir(zukanDir, { recursive: true })
  await writeFile(path.join(zukanDir, 'index.html'), buildZukan(visible), 'utf8')
  console.log(`診断ページ ${visible.length} 本 + 一覧 + 村人図鑑を生成しました`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    console.error('[generate-diagnosis-pages] エラー:', error)
    process.exitCode = 1
  })
}

export { main }

// 診断村: キャラクター個別ページを静的生成する。
//
// 生成物: public/c/{imageKey}/index.html (160キャラ分)
//
// 実行: npm run generate:characters  (npm run build の前に自動実行される)
//
// 目的:
//   - キャラをIP資産として単体で共有・検索・発見できるようにする
//   - キャラ名でのSEO流入、SNSキャラ紹介投稿からの直リンク先
//   - 同じ診断の関連キャラへの回遊導線
// OGP画像は generate-ogp-images.mjs が作る /ogp/{imageKey}.jpg を流用する。

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { diagnoses } from '../src/diagnosisData.js'
import { resultDetails } from '../src/resultDetails.js'
import { characterCollections } from './generate-share-pages.mjs'
import { replyTypeFontStyles } from '../src/fontStyles.js'

const SITE_ORIGIN = 'https://shindanmura.com'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')

// 返信タイプ診断のキャラ名は実フォントで表示する
function fontStyleAttr(imageKey) {
  const style = replyTypeFontStyles[imageKey]
  if (!style) return ''
  const css = [
    `font-family:${style.fontFamily.replaceAll('"', "'")}`,
    style.fontWeight ? `font-weight:${style.fontWeight}` : '',
    style.fontStyle ? `font-style:${style.fontStyle}` : '',
  ].filter(Boolean).join(';')
  return ` style="${css}"`
}

const escapeHtml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

// 同じ診断のキャラから、自分以外を最大4体返す(一覧順で自分の次から巡回)
function pickRelated(entries, selfIndex, count = 4) {
  const related = []
  for (let i = 1; related.length < count && i < entries.length; i++) {
    related.push(entries[(selfIndex + i) % entries.length])
  }
  return related
}

function buildPage({ diagnosis, resultTitle, character, detail, related }) {
  const basePath = characterCollections[diagnosis.id].basePath
  const title = `${character.characterName} | ${diagnosis.title}のキャラ | 診断村`
  const description = `${character.characterName}(${resultTitle})は診断村「${diagnosis.title}」のキャラクター。${character.role}。`
  const pageUrl = `${SITE_ORIGIN}/c/${character.imageKey}/`
  const ogImage = `${SITE_ORIGIN}/ogp/${character.imageKey}.jpg`
  const charImage = `/characters-small/${basePath}/${character.imageKey}.webp`

  const relatedHtml = related
    .map(
      ([relTitle, rel]) => `      <a class="related-item" href="/c/${rel.imageKey}/">
        <img src="/characters-small/${basePath}/${rel.imageKey}.webp" alt="${escapeHtml(rel.characterName)}" loading="lazy" decoding="async" width="640" height="427" />
        <strong>${escapeHtml(rel.characterName)}</strong>
        <small>${escapeHtml(relTitle)}</small>
      </a>`,
    )
    .join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: pageUrl,
    primaryImageOfPage: ogImage,
    isPartOf: { '@type': 'WebSite', name: '診断村', url: SITE_ORIGIN },
  }

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${pageUrl}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="診断村" />
<meta property="og:title" content="${escapeHtml(`${character.characterName} | ${diagnosis.title}`)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="ja_JP" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(`${character.characterName} | ${diagnosis.title}`)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${ogImage}" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(160deg, #fff8fd 0%, #ffd9fb 55%, #e9defa 100%);
    color: #12071f; min-height: 100vh; padding: 24px 16px;
    display: flex; justify-content: center;
  }
  .page { max-width: 520px; width: 100%; }
  .card {
    background: rgba(255, 255, 255, 0.92); border-radius: 24px;
    padding: 32px 24px; text-align: center; box-shadow: 0 12px 40px rgba(97, 72, 127, 0.18);
  }
  .brand { font-size: 14px; letter-spacing: 0.08em; }
  .brand a { color: #8e5fc6; font-weight: 700; text-decoration: none; }
  .diagnosis-link { display: inline-block; color: #61487f; font-size: 15px; margin-top: 12px; text-decoration: none; }
  img.character { width: 240px; height: 240px; object-fit: contain; margin: 12px auto; display: block; }
  h1 { font-size: 26px; margin: 4px 0 2px; }
  .result-type { color: #8f4ed8; font-weight: 700; font-size: 16px; margin-bottom: 10px; }
  .role { color: #61487f; font-size: 14px; margin-bottom: 14px; }
  .section { text-align: left; margin-top: 14px; }
  .section h2 { font-size: 14px; color: #8e5fc6; margin-bottom: 6px; }
  .section p { font-size: 14px; line-height: 1.8; color: #3c2b52; }
  .cta {
    display: block; margin-top: 22px; padding: 14px; border-radius: 999px; text-decoration: none;
    background: linear-gradient(135deg, #ff67ad, #8f4ed8); color: #fff; font-weight: 700; font-size: 16px;
  }
  .sub-links { margin-top: 14px; font-size: 13px; }
  .sub-links a { color: #8e5fc6; margin: 0 8px; }
  .related { margin-top: 24px; }
  .related h2 { font-size: 15px; color: #61487f; text-align: center; margin-bottom: 12px; }
  .related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .related-item {
    background: rgba(255, 255, 255, 0.85); border-radius: 16px; padding: 12px;
    text-align: center; text-decoration: none; color: #12071f;
  }
  .related-item img { width: 100%; height: auto; }
  .related-item strong { display: block; font-size: 13px; margin-top: 6px; }
  .related-item small { color: #8f7ba6; font-size: 11px; }
</style>
</head>
<body>
<div class="page">
  <main class="card">
    <div class="brand"><a href="/">診断村</a></div>
    <a class="diagnosis-link" href="/#diagnosis=${diagnosis.id}">${escapeHtml(diagnosis.emoji)} ${escapeHtml(diagnosis.title)}のキャラクター</a>
    <img class="character" src="${charImage}" alt="${escapeHtml(character.characterName)}" width="640" height="427" />
    <h1${fontStyleAttr(character.imageKey)}>${escapeHtml(character.characterName)}</h1>
    <div class="result-type">${escapeHtml(resultTitle)}</div>
    <div class="role">${escapeHtml(character.role)}</div>
    <div class="section">
      <h2>どんなキャラ？</h2>
      <p>${escapeHtml(character.visualConcept)}</p>
    </div>
${detail?.description ? `    <div class="section">
      <h2>このタイプの特徴</h2>
      <p>${escapeHtml(detail.description)}</p>
    </div>
` : ''}${detail?.match ? `    <div class="section">
      <p>${escapeHtml(detail.match)}</p>
    </div>
` : ''}${detail?.advice ? `    <div class="section">
      <p>${escapeHtml(detail.advice)}</p>
    </div>
` : ''}    <a class="cta" href="/#diagnosis=${diagnosis.id}">${escapeHtml(diagnosis.title)}で自分のキャラを見つける</a>
    <div class="sub-links">
      <a href="/#guide">キャラ図鑑</a>
      <a href="/">診断村トップ</a>
    </div>
  </main>
  <section class="related">
    <h2>${escapeHtml(diagnosis.title)}の他のキャラ</h2>
    <div class="related-grid">
${relatedHtml}
    </div>
  </section>
</div>
</body>
</html>
`
}

async function main() {
  let count = 0

  for (const diagnosis of diagnoses) {
    if (diagnosis.hidden) continue
    const collection = characterCollections[diagnosis.id]
    if (!collection) {
      console.warn(`[skip] キャラ定義が見つかりません: ${diagnosis.id}`)
      continue
    }
    const entries = Object.entries(collection.characters)
    for (let i = 0; i < entries.length; i++) {
      const [resultTitle, character] = entries[i]
      const detail = resultDetails[diagnosis.id]?.[resultTitle]
      const related = pickRelated(entries, i)
      const html = buildPage({ diagnosis, resultTitle, character, detail, related })
      const dir = path.join(publicDir, 'c', character.imageKey)
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, 'index.html'), html)
      count++
    }
  }

  console.log(`キャラ個別ページ ${count} 枚を生成しました`)
}

// 直接実行されたときだけ生成する
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main()
}

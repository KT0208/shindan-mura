// 診断村: 結果シェア用の静的ランディングページ + sitemap.xml + robots.txt を生成する。
//
// 生成物:
//   public/r/{diagnosisId}/{imageKey}/index.html ... 結果ごとのOGタグ付きシェアページ(160枚)
//   public/sitemap.xml
//   public/robots.txt
//
// 実行: npm run generate:share  (npm run build の前に自動実行される)
//
// シェアURLの仕組み:
//   SPAはハッシュルーティング(#diagnosis=xxx)のため、URLごとにOGPを出し分けられない。
//   そこで結果ごとに実体のある静的HTMLを用意し、シェアURLをそこに向ける。
//   クローラー(X/LINE等)はこのHTMLのOGタグを読み、人間には結果内容+診断への導線を見せる。

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  hiddenPersonalityCharacters,
  loveComplicatedCharacters,
  menheraLevelCharacters,
  snsApprovalCharacters,
  dangerousManCharacters,
  darkFallCharacters,
  popularitySeasonCharacters,
  moneyLuckCharacters,
  workStyleCharacters,
  lifeBugCharacters,
  oshikatsuCharacters,
  replyTypeCharacters,
  crushMisreadCharacters,
  darkDepthCharacters,
} from '../src/characterData.js'
import { diagnoses } from '../src/diagnosisData.js'
import { resultDetails } from '../src/resultDetails.js'

const SITE_ORIGIN = 'https://shindanmura.com'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')

// App.jsx の characterCollectionsJa と同じ対応表。
// (App.jsxはJSXを含みNodeから直接importできないため、ここに複製している。
//  診断を追加したら両方に追記すること)
export const characterCollections = {
  'love-complicated': { basePath: 'love', characters: loveComplicatedCharacters },
  'hidden-personality': { basePath: 'hidden-personality', characters: hiddenPersonalityCharacters },
  'menhera-level': { basePath: 'menheraLevelCharacters', characters: menheraLevelCharacters },
  'sns-approval': { basePath: 'snsApprovalCharacters', characters: snsApprovalCharacters },
  'dangerous-man': { basePath: 'dangerousManCharacters', characters: dangerousManCharacters },
  'dark-fall': { basePath: 'darkFallCharacters', characters: darkFallCharacters },
  'popularity-season': { basePath: 'popularitySeasonCharacters', characters: popularitySeasonCharacters },
  'money-luck': { basePath: 'moneyLuckCharacters', characters: moneyLuckCharacters },
  'work-style': { basePath: 'workStyleCharacters', characters: workStyleCharacters },
  'life-bug': { basePath: 'lifeBugCharacters', characters: lifeBugCharacters },
  'oshikatsu-type': { basePath: 'oshikatsuCharacters', characters: oshikatsuCharacters },
  'reply-type': { basePath: 'fontCharacters', characters: replyTypeCharacters },
  'crush-misread': { basePath: 'crushFoxCharacters', characters: crushMisreadCharacters },
  'dark-depth': { basePath: 'abyssClioneCharacters', characters: darkDepthCharacters },
}

const escapeHtml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

function buildPage({ diagnosis, resultTitle, character, detail }) {
  const title = `${character.characterName}(${resultTitle})| ${diagnosis.title} | 診断村`
  const ogTitle = `${diagnosis.title}の結果は「${resultTitle}」!`
  const description = detail?.description || diagnosis.description
  const pageUrl = `${SITE_ORIGIN}/r/${diagnosis.id}/${character.imageKey}/`
  // SEO評価はキャラ個別ページ(/c/)に集約する。シェアページは内容が重複するため
  // canonicalをキャラページに向ける(OGタグはこのページのものがそのまま使われる)。
  const canonicalUrl = `${SITE_ORIGIN}/c/${character.imageKey}/`
  const ogImage = `${SITE_ORIGIN}/ogp/${character.imageKey}.jpg`
  const charImage = `/characters-small/${characterCollections[diagnosis.id].basePath}/${character.imageKey}.webp`
  const diagnosisUrl = `/#diagnosis=${diagnosis.id}`

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="診断村" />
<meta property="og:title" content="${escapeHtml(ogTitle)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="ja_JP" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${ogImage}" />
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(160deg, #fff8fd 0%, #ffd9fb 55%, #e9defa 100%);
    color: #12071f; min-height: 100vh;
    display: flex; align-items: center; justify-content: center; padding: 24px 16px;
  }
  .card {
    background: rgba(255, 255, 255, 0.92); border-radius: 24px; max-width: 480px; width: 100%;
    padding: 32px 24px; text-align: center; box-shadow: 0 12px 40px rgba(97, 72, 127, 0.18);
  }
  .brand { color: #8e5fc6; font-weight: 700; font-size: 14px; letter-spacing: 0.08em; }
  .diagnosis-title { color: #61487f; font-size: 15px; margin-top: 12px; }
  img.character { width: 220px; height: 220px; object-fit: contain; margin: 12px auto; display: block; }
  h1 { font-size: 24px; margin: 4px 0 2px; }
  .result-type { color: #8f4ed8; font-weight: 700; font-size: 16px; margin-bottom: 12px; }
  .role { color: #61487f; font-size: 14px; margin-bottom: 12px; }
  p.description { font-size: 14px; line-height: 1.8; text-align: left; color: #3c2b52; }
  .cta {
    display: block; margin-top: 20px; padding: 14px; border-radius: 999px; text-decoration: none;
    background: linear-gradient(135deg, #ff67ad, #8f4ed8); color: #fff; font-weight: 700; font-size: 16px;
  }
  .home-link { display: inline-block; margin-top: 14px; color: #8e5fc6; font-size: 13px; }
</style>
</head>
<body>
<main class="card">
  <div class="brand">診断村</div>
  <div class="diagnosis-title">${escapeHtml(diagnosis.emoji)} ${escapeHtml(diagnosis.title)}</div>
  <img class="character" src="${charImage}" alt="${escapeHtml(character.characterName)}" />
  <h1>${escapeHtml(character.characterName)}</h1>
  <div class="result-type">${escapeHtml(resultTitle)}</div>
  <div class="role">${escapeHtml(character.role)}</div>
  <p class="description">${escapeHtml(description)}</p>
  <a class="cta" href="${diagnosisUrl}">自分も${escapeHtml(diagnosis.title)}をやってみる</a>
  <a class="home-link" href="/c/${character.imageKey}/">このキャラをもっと見る</a>
  <a class="home-link" href="/">診断村トップへ</a>
</main>
</body>
</html>
`
}

async function main() {
  const urls = [`${SITE_ORIGIN}/`]
  let count = 0

  for (const diagnosis of diagnoses) {
    if (diagnosis.hidden) continue
    const collection = characterCollections[diagnosis.id]
    if (!collection) {
      console.warn(`[skip] キャラ定義が見つかりません: ${diagnosis.id}`)
      continue
    }
    for (const [resultTitle, character] of Object.entries(collection.characters)) {
      const detail = resultDetails[diagnosis.id]?.[resultTitle]
      const html = buildPage({ diagnosis, resultTitle, character, detail })
      const dir = path.join(publicDir, 'r', diagnosis.id, character.imageKey)
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, 'index.html'), html)
      // sitemapにはSEO評価を集約するキャラ個別ページ(/c/)の方を載せる
      // (シェアページはcanonicalで/c/を指しているためsitemapには含めない)
      urls.push(`${SITE_ORIGIN}/c/${character.imageKey}/`)
      count++
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
  await writeFile(path.join(publicDir, 'sitemap.xml'), sitemap)
  await writeFile(path.join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`)

  console.log(`シェアページ ${count} 枚 + sitemap.xml(${urls.length} URL)+ robots.txt を生成しました`)
}

// 直接実行されたときだけ生成する(他スクリプトからのimport時は実行しない)
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main()
}

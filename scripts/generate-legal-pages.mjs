// 診断村: プライバシーポリシー / 運営者情報 / お問い合わせ の静的ページを生成する。
//
// 背景:
//   これらの本文は src/i18n.js の legalPagesByLanguage.ja に既にあるが、
//   SPA内のハッシュルート(#privacy 等)でしか表示されず、クローラーには404だった。
//   AdSenseはプライバシーポリシー等の設置・サイトの信頼性(運営者情報・連絡先)を重視するため、
//   同じ本文を実体のある静的HTMLとして出す。
//
// 生成物:
//   public/privacy/index.html   ... プライバシーポリシー
//   public/about/index.html     ... 運営者情報(operator)
//   public/contact/index.html   ... お問い合わせ
//
// 実行: npm run generate:legal (prebuildで自動実行)
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { legalPagesByLanguage } from '../src/i18n.js'

const SITE_ORIGIN = 'https://shindanmura.com'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')

const escapeHtml = (s) =>
  String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim())

const STYLE = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
    background: linear-gradient(160deg, #fff8fd 0%, #ffe6f8 55%, #ece2fb 100%);
    color: #241436; min-height: 100vh; padding: 24px 16px 56px;
    display: flex; justify-content: center; line-height: 1.9;
  }
  .page { max-width: 720px; width: 100%; }
  .brand { font-size: 14px; letter-spacing: 0.06em; text-align: center; margin-bottom: 16px; }
  .brand a { color: #8e5fc6; font-weight: 700; text-decoration: none; }
  article {
    background: rgba(255, 255, 255, 0.94); border-radius: 24px;
    padding: 32px 24px; box-shadow: 0 12px 40px rgba(97, 72, 127, 0.16);
  }
  .category { display: inline-block; font-size: 12px; color: #8f4ed8; background: #f6ecff; padding: 4px 12px; border-radius: 999px; }
  h1 { font-size: 24px; line-height: 1.5; margin: 12px 0 6px; color: #2c1a44; }
  .lead { margin-top: 8px; color: #4a3763; font-size: 15px; }
  h2 { font-size: 17px; margin: 26px 0 8px; color: #61487f; border-left: 5px solid #ff8fd0; padding-left: 12px; }
  p.body { font-size: 15px; color: #33234a; margin: 6px 0; word-break: break-word; }
  a { color: #c2358f; }
  .sub-links { margin-top: 24px; font-size: 13px; text-align: center; }
  .sub-links a { color: #8e5fc6; margin: 0 8px; white-space: nowrap; }
`

function head({ title, description, url }) {
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
<meta property="og:locale" content="ja_JP" />
<style>${STYLE}</style>`
}

function buildLegalPage(page, url) {
  const sections = page.sections
    .map((s) => {
      // 本文中のURL(オプトアウト先など)はリンクにする。escape後の文字列に対して置換するので安全。
      const body = isEmail(s.body)
        ? `<a href="mailto:${escapeHtml(s.body)}">${escapeHtml(s.body)}</a>`
        : escapeHtml(s.body).replace(/https?:\/\/[^\s()（）]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`)
      return `    <h2>${escapeHtml(s.heading)}</h2>
    <p class="body">${body}</p>`
    })
    .join('\n')
  return `<!doctype html>
<html lang="ja">
<head>
${head({ title: `${page.title} | 診断村`, description: page.lead, url })}
</head>
<body>
<div class="page">
  <div class="brand"><a href="/">診断村</a></div>
  <article>
    <span class="category">${escapeHtml(page.title)}</span>
    <h1>${escapeHtml(page.title)}</h1>
    <p class="lead">${escapeHtml(page.lead)}</p>
${sections}
    <div class="sub-links">
      <a href="/">トップ</a>
      <a href="/diagnosis/">診断一覧</a>
      <a href="/column/">コラム</a>
      <a href="/privacy/">プライバシー</a>
      <a href="/about/">運営者情報</a>
      <a href="/contact/">お問い合わせ</a>
    </div>
  </article>
</div>
</body>
</html>
`
}

async function main() {
  const ja = legalPagesByLanguage.ja
  const targets = [
    { key: 'privacy', slug: 'privacy' },
    { key: 'operator', slug: 'about' },
    { key: 'contact', slug: 'contact' },
  ]
  for (const { key, slug } of targets) {
    const page = ja[key]
    const url = `${SITE_ORIGIN}/${slug}/`
    const dir = path.join(publicDir, slug)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'index.html'), buildLegalPage(page, url), 'utf8')
  }
  console.log('法務ページ(privacy / about / contact)を生成しました')
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    console.error('[generate-legal-pages] エラー:', error)
    process.exitCode = 1
  })
}

export { main }

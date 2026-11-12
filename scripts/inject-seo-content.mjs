// トップindex.htmlに、JavaScriptが動かない環境向けの代替コンテンツを埋め込む。
// 診断一覧・コラム一覧・サイト説明を <noscript> で静的に書き出す。ビルド後(dist/index.html)を書き換える。
//
// 以前は画面外(left:-9999px)に飛ばした非表示divで出していたが、
// 「人には見えずボットだけが読むテキスト」はGoogleの隠しテキストに該当しうるため廃止した。
// 本文はSPA側で常に描画している(入口ゲートは本文の上のバナー)ので、ここはJS無効時の代替のみ。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { diagnoses } from '../src/diagnosisData.js'
import { loadColumns } from './generate-columns.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HTML = path.join(ROOT, 'dist', 'index.html')

const escape = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')

async function main() {
  if (!fs.existsSync(HTML)) {
    console.error('dist/index.html がありません。先に npm run build を実行してください。')
    process.exit(1)
  }
  const publicDiagnoses = diagnoses.filter((d) => !d.hidden)
  const columns = await loadColumns()

  // 診断一覧: タイトル+説明+リンク
  const diagList = publicDiagnoses.map((d) => `<article>
      <h3><a href="/diagnosis/${d.id}/">${escape(d.emoji || '')} ${escape(d.title)}</a></h3>
      <p>${escape(d.description)}</p>
    </article>`).join('\n    ')

  // コラム一覧
  const columnList = columns.map(({ meta }) => `<article>
      <h3><a href="/column/${meta.slug}/">${escape(meta.title)}</a></h3>
      <p>${escape(meta.description)}</p>
    </article>`).join('\n    ')

  const seoBlock = `<noscript id="seo-content">
  <h1>診断村｜無料で遊べる恋愛診断・性格診断・心理テスト</h1>
  <p>診断村は、恋愛診断、性格診断、心理テストなど、キャラクターと一緒に楽しめる無料診断サイトです。会員登録不要、1分で完了する診断を${publicDiagnoses.length}本公開しています。診断結果はキャラクターの姿で現れ、友達と結果を見せ合って盛り上がれます。</p>
  <h2>診断一覧(全${publicDiagnoses.length}本)</h2>
  <section>
    ${diagList}
  </section>
  <h2>コラム(${columns.length}本)</h2>
  <section>
    ${columnList}
  </section>
  <h2>診断村について</h2>
  <p>診断村の特徴は、ひとつの診断ごとに1つのモチーフ(クラゲ、猫、カピバラなど)を16通りに描き分けることです。あなたに一番近い1タイプが、村人キャラクターとして現れます。すべての診断は無料で、メールアドレスの入力も会員登録も必要ありません。質問は8問、選択肢を選んでいくだけです。</p>
  <p>結果はSNSでそのまま共有でき、専用の共有用ページからキャラクターの画像つきで表示されます。友達と結果を見せ合うと「え、あなたそのタイプなの!?」という会話が生まれます。</p>
  <p>診断結果はエンターテインメントを目的としたものであり、医学的、心理学的、法律的、金融的な助言を行うものではありません。</p>
  <nav>
    <a href="/">診断村トップ</a>
    <a href="/diagnosis/">診断一覧</a>
    <a href="/zukan/">村人図鑑</a>
    <a href="/column/">コラム一覧</a>
    <a href="/privacy/">プライバシーポリシー</a>
    <a href="/contact/">お問い合わせ</a>
    <a href="/about/">運営者情報</a>
  </nav>
</noscript>`

  let html = fs.readFileSync(HTML, 'utf8')

  // 既に埋め込まれていたら置き換え(旧形式の非表示divも新形式のnoscriptも対象)
  if (html.includes('id="seo-content"')) {
    html = html.replace(/<(div|noscript) id="seo-content"[\s\S]*?<\/\1>\s*<\/body>/, seoBlock + '\n  </body>')
  } else {
    // </body>の直前に挿入
    html = html.replace('</body>', '  ' + seoBlock + '\n  </body>')
  }

  fs.writeFileSync(HTML, html)
  const bodyTextLen = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '').length
  console.log('index.htmlにSEOコンテンツを埋め込みました')
  console.log('  公開診断:', publicDiagnoses.length, '本')
  console.log('  コラム:', columns.length, '本')
  console.log('  noscript込みの本文文字数:', bodyTextLen, '字')
}

main().catch((e) => { console.error(e); process.exit(1) })

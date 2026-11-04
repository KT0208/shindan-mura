// 診断ごとの解説記事(コラム)を自動生成
// 使い方: node scripts/gen-diagnosis-columns.mjs
// 出力: content/column/guide-{diagnosisId}.md を診断ごとに生成
//
// 設計方針: 25本の診断に対して同じテンプレを繰り返すのではなく、
//   - 3つの記事型(mold)から診断IDのハッシュで選ぶ
//   - カテゴリー別に固有の段落を挿入
//   - コメントプールから実例を1つ引用してユニークネスを担保
//   - 代表キャラの選び方(オフセット)を型ごとに変える
// これにより自動生成でありながら各記事の骨格・語り口が変わる。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { diagnoses } from '../src/diagnosisData.js'
import { resultDetails } from '../src/resultDetails.js'
import { randomCommentPools } from '../src/randomComments.js'
import { characterCollections } from './generate-share-pages.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'content', 'column')
const today = new Date().toISOString().slice(0, 10)

fs.mkdirSync(OUT, { recursive: true })

// ---------- ユーティリティ ----------
function hashId(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function pickN(arr, n, offset = 0) {
  if (!arr.length) return []
  const step = Math.max(1, Math.floor(arr.length / n))
  const out = []
  for (let i = 0; i < n; i++) {
    const idx = (offset + i * step) % arr.length
    out.push(arr[idx])
  }
  return out
}

// カテゴリー別の枕詞・切り口を用意
const CATEGORY_HOOK = {
  '恋愛': {
    theme: '恋愛での気持ちの動き方',
    audience: '恋愛で自分の傾向がわからず戸惑ったことがある人',
    context: '恋愛は正解のない領域です。同じ状況でも人によって受け取り方はまったく違い、その差が「相性」を作ります。',
  },
  'メンタル・恋愛': {
    theme: '恋愛でのメンタルの揺れ方',
    audience: '恋愛で自分がどう揺れやすいか把握したい人',
    context: '恋愛の場面では、普段は出さない感情のクセが現れます。それを可視化するのが、この診断の狙いです。',
  },
  '恋愛運': {
    theme: '恋愛のタイミングと巡り合わせ',
    audience: '恋愛の流れが気になる人',
    context: '恋愛運は固定されたものではなく、季節や心の状態で変わります。今のあなたに近い姿を切り取ってみてください。',
  },
  'モテ・雰囲気': {
    theme: '他人から見た印象',
    audience: '自分がどう見られているか気になる人',
    context: '自分の魅力は、自分では意外と気づけないものです。第三者の視点をシミュレートしてみます。',
  },
  '性格・本性': {
    theme: '普段は見えにくい内面',
    audience: '自分の本当の姿を知りたい人',
    context: '人は場面によって違う顔を持ちます。この診断は、その中で「表に出しにくい面」に光を当てます。',
  },
  '性格': {
    theme: '基本的な性格の傾向',
    audience: '自分の性格を言葉にしてみたい人',
    context: '性格は一言では表しきれませんが、キャラクターに置き換えると輪郭が見えてきます。',
  },
  'SNS・現代病': {
    theme: 'SNSまわりのクセ',
    audience: 'SNSとの付き合い方で悩んだことがある人',
    context: 'SNSは便利な反面、いつのまにか感情を消耗させます。自分の使い方のクセを把握しておく価値はあります。',
  },
  '闇・メンタル': {
    theme: '心の奥にあるもの',
    audience: '自分の内側と向き合ってみたい人',
    context: '闇と書くと大げさに聞こえますが、要は「明るく振る舞っているけど本当はしんどい部分」のことです。誰にでもあります。',
  },
  'お金': {
    theme: 'お金との付き合い方',
    audience: 'お金の使い方や貯め方に迷いがある人',
    context: 'お金の使い方には価値観がそのまま出ます。倹約か浪費かだけでなく、そこに込めた気持ちの方向を見ます。',
  },
  '仕事・才能': {
    theme: '仕事での動き方と適性',
    audience: '自分の働き方の傾向を整理したい人',
    context: '仕事の適性は「何ができるか」より「どう動きたいか」で決まる部分があります。動き方のクセを見ます。',
  },
  'ネタ・人生': {
    theme: '人生の遊び方',
    audience: '深刻に考えず自分を眺めてみたい人',
    context: 'ときには真面目に受け取らず、ネタとして自分を見てみるのも健全です。肩の力を抜いてどうぞ。',
  },
  '推し活・オタク': {
    theme: '推しへの向き合い方',
    audience: '推しがいる人、あるいは推し方に個性を感じる人',
    context: '推し方には人それぞれの流儀があります。良し悪しではなく、方向性の違いです。',
  },
}
const DEFAULT_HOOK = {
  theme: 'あなたの内面の傾向',
  audience: '自分の傾向を言葉にしてみたい人',
  context: '性格は言葉にすると輪郭が見えます。キャラクターに置き換えて眺めてみてください。',
}
function hook(d) { return CATEGORY_HOOK[d.category] || DEFAULT_HOOK }

// タイトルパターン(3種類)
const TITLE_PATTERNS = [
  (d, t) => `${d.title}を${t}タイプで読み解く｜キャラクターで見る自分の傾向`,
  (d, t) => `${d.title}とは？${t}タイプのキャラで自分を眺める8問診断`,
  (d, t) => `${d.title}｜${t}人のキャラの中に、あなたに近い1人がいる`,
]

// 各記事型(mold)の実装
function mold0_narrative(d, ctx) {
  // 「体験→仕組み→キャラ紹介→受け取り方」の起承転結型
  const { characters, detail, questionsCount, typesCount, sample, hookInfo } = ctx
  const featured = pickN(characters, 4, 0)
  const L = []

  L.push(`## こんな瞬間に読んでほしい`)
  L.push('')
  L.push(`「${hookInfo.theme}が、自分でもよくわからない」と感じたことがある人は多いはずです。${hookInfo.audience}に向けて、この記事を書いています。`)
  L.push('')
  L.push(`診断村の「${d.title}」は、${questionsCount}問の質問に答えるだけで、あなたに近い1人のキャラクターを教えてくれる無料の心理テストです。${hookInfo.context}`)
  L.push('')

  L.push('## 実際にどんな結果が出るか、コメント例で見てみる')
  L.push('')
  L.push(`結果を受け取った人からは、たとえばこんな声があります。`)
  L.push('')
  L.push(`> ${sample}`)
  L.push('')
  L.push(`このように、単に「性格を分類」して終わりではなく、その傾向が日常のどんな場面に出るかまで含めて描いています。だから、結果を見た瞬間に「あ、これ最近の私だ」と繋がる感覚が生まれます。`)
  L.push('')

  L.push(`## ${typesCount}タイプの仕組み`)
  L.push('')
  L.push(`${d.title}は、大きく分けると${d.results.join('、')}の4段階に分かれます。ただし段階が同じでも、内側の傾向は人によって違います。`)
  L.push('')
  L.push(`診断村では、この「段階×傾向」を掛け合わせて${typesCount}タイプに広げています。合計点だけで一律に判定するのではなく、あなたの回答の偏りを見て、${typesCount}人のキャラクターの中から一番近い1人を選び出す仕組みです。`)
  L.push('')

  L.push('## この診断のキャラ、たとえばこの4人')
  L.push('')
  for (const [resultTitle, ch] of featured) {
    L.push(`### ${ch.characterName}（${resultTitle}）`)
    L.push('')
    L.push(`${ch.role}。${ch.visualConcept}`)
    if (detail[resultTitle]) {
      L.push('')
      L.push(detail[resultTitle].description)
    }
    L.push('')
  }

  L.push('## 結果は「今のあなた」のスケッチ')
  L.push('')
  L.push(`診断結果は、あなたを固定的に判定するものではありません。**今日のあなたを描いた一枚のスケッチ**として受け取ってください。同じ診断を半年後にやってみると、違うキャラが出ることも珍しくありません。それはあなたが変わった、というだけの話です。`)
  L.push('')
  L.push(`もし今、日常生活に支障が出るほど気持ちが沈んでいるなら、診断で答えを探すより、信頼できる人や専門の窓口に話してみてください。診断は入口であって、答えではありません。`)
  L.push('')
  return L
}

function mold1_question_answer(d, ctx) {
  // 「よくある疑問→答え」のQA型
  const { characters, detail, questionsCount, typesCount, sample, hookInfo } = ctx
  const featured = pickN(characters, 3, 1)
  const L = []

  L.push(`## Q. ${d.title}って、どんな診断？`)
  L.push('')
  L.push(`A. **${hookInfo.theme}をキャラクターで映す診断**です。${questionsCount}問の質問に答えると、${typesCount}人のキャラクターの中からあなたに一番近い1人が結果として現れます。`)
  L.push('')
  L.push(`${hookInfo.context}`)
  L.push('')

  L.push('## Q. どんな人におすすめ？')
  L.push('')
  L.push(`A. ${hookInfo.audience}に向いています。特に「自分の傾向を言葉にしたいけど、深刻な自己分析はしんどい」というときに、キャラクターというクッションを挟んで軽く眺められるのがこの診断の良さです。`)
  L.push('')

  L.push('## Q. 何を測ってるの？')
  L.push('')
  L.push(`A. 大きく分けて4段階の**度合い**(${d.results.join('、')})と、4系統の**傾向**を組み合わせて、${typesCount}タイプに分類しています。同じ「強め」でも、内向的に出る人と外向的に出る人では、まったく違うキャラになります。`)
  L.push('')

  L.push('## Q. 結果ってどのくらい当たるの？')
  L.push('')
  L.push(`A. 医学的な検査ではないので、当たる／外れるという物差しは適しません。ただし、受けた人からはこんな感想がよく届きます。`)
  L.push('')
  L.push(`> ${sample}`)
  L.push('')
  L.push('自分を映す鏡としては十分に機能する、と言えると思います。')
  L.push('')

  L.push('## Q. どんなキャラが出るの？')
  L.push('')
  L.push(`A. たとえば以下のようなキャラクターが登場します。`)
  L.push('')
  for (const [resultTitle, ch] of featured) {
    L.push(`**${ch.characterName}（${resultTitle}）** — ${ch.role}`)
    if (detail[resultTitle]) {
      L.push('')
      L.push(detail[resultTitle].description.split('。')[0] + '。')
    }
    L.push('')
  }

  L.push('## Q. 結果はどう活かせばいい？')
  L.push('')
  L.push(`A. **結果ページの「注意ポイント」**が意外と役に立ちます。そのタイプが陥りやすい落とし穴と、その回避方法が書かれています。相性の話より、自分の弱点を知るほうが日常に効きます。`)
  L.push('')
  L.push('ただし決めつけには使わないでください。診断はあなたの一面を切り取るスケッチであって、あなたを規定するものではありません。')
  L.push('')
  return L
}

function mold2_essay(d, ctx) {
  // 「エッセイ調・雑感」型
  const { characters, detail, questionsCount, typesCount, sample, hookInfo } = ctx
  const featured = pickN(characters, 4, 2)
  const L = []

  L.push(`## ${d.title}を作った理由`)
  L.push('')
  L.push(`診断村で${d.title}を作ったとき、まず考えたのは「${hookInfo.theme}を、真面目すぎず、軽すぎず、ちょうどよく描けるだろうか」ということでした。`)
  L.push('')
  L.push(`${hookInfo.context} だからこそ、性格分析としてガチガチに作るのではなく、キャラクターというワンクッションを置いて軽く受け取れる形にしたかったのです。`)
  L.push('')

  L.push(`## ${typesCount}人のキャラで、粒度を保つ`)
  L.push('')
  L.push(`4タイプの診断では、「同じ強さ」の中の違いを描き分けられません。逆に32タイプでは細かすぎて記憶に残らない。${typesCount}タイプは、その中間として選んだ規模感です。`)
  L.push('')
  L.push(`${d.results.join('、')}という4段階に、傾向の4系統を掛け合わせて${typesCount}マス。各マスに、視覚的に一目で区別できるキャラクターを1人ずつ置いています。`)
  L.push('')

  L.push('## 個人的に思い入れのある4人')
  L.push('')
  for (const [resultTitle, ch] of featured) {
    L.push(`### ${ch.characterName}`)
    L.push('')
    L.push(`${resultTitle}に該当するキャラです。${ch.role}。${ch.visualConcept}`)
    if (detail[resultTitle]) {
      L.push('')
      L.push(detail[resultTitle].description)
    }
    L.push('')
  }

  L.push('## こんなコメントが届きます')
  L.push('')
  L.push(`結果ページのランダムコメントには、たとえばこんなものがあります。`)
  L.push('')
  L.push(`> ${sample}`)
  L.push('')
  L.push(`このコメントは、そのタイプのあるあるを凝縮した一言です。診断結果と併せて読むと、「そうそう、これ」と輪郭がはっきりします。`)
  L.push('')

  L.push('## 最後にひとつ')
  L.push('')
  L.push(`${d.title}に限らず、診断村のすべての診断は、あなたを型にはめるためのものではありません。**自分自身と少し距離を置いて、キャラクター経由で眺めてみる**ための道具です。`)
  L.push('')
  L.push('半年後、1年後に同じ診断を受けたら違う結果が出るかもしれません。それは、あなたが変化しているという素直な証拠です。')
  L.push('')
  return L
}

const MOLDS = [mold0_narrative, mold1_question_answer, mold2_essay]

// ---------- メインループ ----------
for (const diagnosis of diagnoses) {
  if (diagnosis.hidden) continue
  const collection = characterCollections[diagnosis.id]
  if (!collection) continue

  const slug = `guide-${diagnosis.id}`
  const outPath = path.join(OUT, `${slug}.md`)

  const characters = Object.entries(collection.characters)
  const detail = resultDetails[diagnosis.id] || {}
  const questionsCount = diagnosis.questions.length
  const typesCount = characters.length
  const hookInfo = hook(diagnosis)

  // 診断IDからハッシュで型と諸々を選ぶ
  const h = hashId(diagnosis.id)
  const moldIdx = h % MOLDS.length
  const titleIdx = (h >> 3) % TITLE_PATTERNS.length
  const mold = MOLDS[moldIdx]

  // コメントプールからランダム(だが決定的)に1つ引用
  const commentPool = randomCommentPools[diagnosis.id] || []
  const sample = commentPool.length
    ? commentPool[h % commentPool.length]
    : `${diagnosis.title}の結果として、あなたに近い1人のキャラが選ばれます。`

  const ctx = { characters, detail, questionsCount, typesCount, sample, hookInfo }

  const lines = []
  lines.push('---')
  lines.push(`slug: ${slug}`)
  lines.push(`title: ${TITLE_PATTERNS[titleIdx](diagnosis, typesCount)}`)
  lines.push(`description: ${diagnosis.description.slice(0, 110)}`)
  lines.push(`date: ${today}`)
  lines.push(`category: 診断の解説`)
  lines.push('---')
  lines.push('')

  // 本文(型ごと)
  lines.push(...mold(diagnosis, ctx))

  // 共通末尾
  lines.push('## 無料・登録不要・1分で終わります')
  lines.push('')
  lines.push('診断村のすべての診断は無料で、会員登録もメールアドレスの入力も必要ありません。質問は8問、選択肢を選ぶだけなので1分ほどで終わります。')
  lines.push('')
  lines.push(`[${diagnosis.title}をやってみる](/#diagnosis=${diagnosis.id})`)
  lines.push('')

  fs.writeFileSync(outPath, lines.join('\n'))
  console.log('生成:', slug, `(mold${moldIdx}, title${titleIdx})`)
}
console.log('完了')

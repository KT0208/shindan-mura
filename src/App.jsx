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
  loveComplicatedResultTypes,
  hiddenPersonalityResultTypes,
  menheraLevelResultTypes,
  snsApprovalResultTypes,
  dangerousManResultTypes,
  darkFallResultTypes,
  popularitySeasonResultTypes,
  moneyLuckResultTypes,
  workStyleResultTypes,
  lifeBugResultTypes,
} from './characterData'
import { resultDetails } from './resultDetails'
import { randomCommentPools } from './randomComments'
import { categories, scenes, sceneSets, diagnoses, options } from './diagnosisData'
import { useEffect, useState } from 'react'
import './App.css'

// シェア導線で使う小さなインラインアイコン群。
// 外部アイコンフォント/画像を使わず、ボタンの色(currentColor)を継承するSVGとして定義する。
function IconStoryImage() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.3" fill="currentColor" stroke="none" />
      <path d="m4 17 5-5 3.5 3.5L15 12l5 5" />
    </svg>
  )
}

function IconX() {
  return (
    <svg viewBox="0 0 19 19" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function IconLine() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.5c-4.97 0-9 3.36-9 7.5 0 3.7 3.14 6.78 7.38 7.38.29.06.68.19.78.44.09.22.06.57.03.79l-.13.79c-.04.22-.17.87.76.47s5.02-2.96 6.85-5.07C19.85 14.1 21 12.4 21 11c0-4.14-4.03-7.5-9-7.5"
      />
    </svg>
  )
}

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="12" height="12" rx="2.5" />
      <path d="M5.5 15.5H5A2.5 2.5 0 0 1 2.5 13V5A2.5 2.5 0 0 1 5 2.5h8A2.5 2.5 0 0 1 15.5 5v.5" />
    </svg>
  )
}

const answerComments = {
  'hidden-personality': [
    'まだ村人モードです。今のところ裏の顔は控えめで、かなり平和に見えています。',
    '少しだけ裏の顔が見えています。笑っている時でも、頭の中ではちゃんと観察しているタイプです。',
    'かなり裏人格が出ています。優しそうに見えて、実は相手の違和感をかなり見抜いています。',
    'これはもう裏ボス級です。表では穏やかでも、心の中では全部見透かしている可能性があります。',
  ],
  'love-complicated': [
    '今のところ恋愛はわりと素直です。まだこじらせ村の入口には立っていません。',
    '少しこじらせています。好きな人の一言で、心の中の会議が始まりがちです。',
    'かなりこじらせています。返信ひとつで感情が動くタイプなので、相手は責任重大です。',
    'これは恋愛沼の住人です。好きなのに強がる、気になるのに冷静ぶる、全部セットで出ています。',
  ],
  'menhera-level': [
    '今のところ安定寄りです。愛情確認はそこまで強くありません。',
    '少し不安になりやすいタイプです。平気なふりをしていても、内心はちゃんと気にしています。',
    'かなり感情が揺れやすいです。相手のテンションひとつで、心の天気が変わりがちです。',
    'これは愛情確認モードが強めです。大丈夫と言いながら、全然大丈夫じゃない可能性があります。',
  ],
  'dangerous-man': [
    'まだ安全圏です。危ない雰囲気より、普通にいい人感が勝っています。',
    '少しミステリアスです。何を考えているか分からない感じが、ちょっと気にならせます。',
    'かなり危ない魅力が出ています。近づきにくいのに気になる、少し沼らせるタイプです。',
    'これは深沼の支配者感があります。優しさと距離感のギャップで、相手を強く惹きつけがちです。',
  ],
  'popularity-season': [
    'まだ小さなつぼみ状態です。今は無理に咲こうとせず、自分の魅力を育てる時期です。',
    '少しずつ花びらが開き始めています。自分では気づかなくても、雰囲気はちゃんと変わっています。',
    'モテ期の風が近づいています。最近の変化に、周りが少しずつ気づき始めているかもしれません。',
    'かなり満開寄りです。変に遠慮せず、堂々としていた方が魅力がきれいに出ます。',
  ],
  'sns-approval': [
    'SNSとはほどよい距離感です。反応に振り回されすぎないタイプです。',
    '少し気にしています。投稿後に反応を見に行く回数が、ちょっと多めかもしれません。',
    'かなり承認欲求が出ています。見てほしい人に向けた投稿、心当たりがありそうです。',
    'これはSNS村の住人です。いいね、閲覧者、匂わせ、全部ちゃんと気にしています。',
  ],
  'dark-fall': [
    'まだ光側です。多少疲れていても、心の闇はそこまで濃くありません。',
    '少し闇が出ています。笑っていても、内心では冷静に距離を測っているかもしれません。',
    'かなり闇落ちに近いです。期待しないようにしているのは、過去に疲れた証拠かもしれません。',
    'これは深淵に近い状態です。優しさの奥に、なかなか強めの黒い感情が眠っています。',
  ],
  'money-luck': [
    'お金との距離感はかなり安定しています。無理な勝負より堅実寄りです。',
    '少しお金に気持ちが動きやすいです。欲しいものと将来不安の間で揺れがちです。',
    'かなりお金に反応するタイプです。稼ぐ話や増やす話に、ついアンテナが立ちます。',
    'これは財運マスター候補です。大きく稼ぐ話やお金のチャンスにワクワクする才能があります。',
  ],
  'work-style': [
    '安定運用タイプです。決まった流れの中で、落ち着いて力を出せます。',
    '少し自由度がほしいタイプです。ルールが多すぎると、やる気が削られやすいです。',
    'かなり自走型です。言われたことだけより、自分で考えて動く方が向いています。',
    'これはビジネス覇者寄りです。型にはめられるより、自分のやり方で突破するタイプです。',
  ],
  'life-bug': [
    'まだ正常プレイです。人生のバグは少なめで、比較的まともなルートを歩いています。',
    '少しバグっています。普通にしているのに、なぜか変なイベントに巻き込まれがちです。',
    'かなりイベント多めです。人生の脚本を書いている人が、少しふざけている可能性があります。',
    'これはカオスプレイヤー感があります。何が起きても、なんだかんだ生き残る謎の運があります。',
  ],
}

function getLoveComplicatedTendencyIndex(answers) {
  const safeAnswers = answers.map((answer) => answer ?? 0)
  const tendencyScores = [
    safeAnswers[3] + safeAnswers[4],
    safeAnswers[2] + safeAnswers[6],
    safeAnswers[0] + safeAnswers[5],
    safeAnswers[1] + safeAnswers[7],
  ]

  return tendencyScores.indexOf(Math.max(...tendencyScores))
}


function getHiddenPersonalityTendencyIndex(answers) {
  const safeAnswers = answers.map((answer) => answer ?? 0)
  const tendencyScores = [
    safeAnswers[0] + safeAnswers[5],
    safeAnswers[1] + safeAnswers[6],
    safeAnswers[2] + safeAnswers[7],
    safeAnswers[3] + safeAnswers[4],
  ]

  return tendencyScores.indexOf(Math.max(...tendencyScores))
}

function getMenheraLevelTendencyIndex(answers) {
  const safeAnswers = answers.map((answer) => answer ?? 0)
  const tendencyScores = [
    safeAnswers[3] + safeAnswers[6],
    safeAnswers[0] + safeAnswers[7],
    safeAnswers[1] + safeAnswers[5],
    safeAnswers[2] + safeAnswers[4],
  ]

  return tendencyScores.indexOf(Math.max(...tendencyScores))
}

function getSnsApprovalTendencyIndex(answers) {
  const safeAnswers = answers.map((answer) => answer ?? 0)
  const tendencyScores = [
    safeAnswers[0] + safeAnswers[3],
    safeAnswers[1] + safeAnswers[6],
    safeAnswers[2] + safeAnswers[4],
    safeAnswers[5] + safeAnswers[7],
  ]

  return tendencyScores.indexOf(Math.max(...tendencyScores))
}

function getBalancedTendencyIndex(answers) {
  const safeAnswers = answers.map((answer) => answer ?? 0)
  const tendencyScores = [
    safeAnswers[0] + safeAnswers[4],
    safeAnswers[1] + safeAnswers[5],
    safeAnswers[2] + safeAnswers[6],
    safeAnswers[3] + safeAnswers[7],
  ]

  return tendencyScores.indexOf(Math.max(...tendencyScores))
}

// 診断IDごとの「傾向インデックス算出関数」と「結果タイトル一覧」の対応表。
// 診断を追加する際はこの2つのマップにエントリを足すだけでよい。
const tendencyIndexResolvers = {
  'love-complicated': getLoveComplicatedTendencyIndex,
  'hidden-personality': getHiddenPersonalityTendencyIndex,
  'menhera-level': getMenheraLevelTendencyIndex,
  'sns-approval': getSnsApprovalTendencyIndex,
  'dangerous-man': getBalancedTendencyIndex,
  'dark-fall': getBalancedTendencyIndex,
  'popularity-season': getBalancedTendencyIndex,
  'money-luck': getBalancedTendencyIndex,
  'work-style': getBalancedTendencyIndex,
  'life-bug': getBalancedTendencyIndex,
}

const resultTypesByDiagnosis = {
  'love-complicated': loveComplicatedResultTypes,
  'hidden-personality': hiddenPersonalityResultTypes,
  'menhera-level': menheraLevelResultTypes,
  'sns-approval': snsApprovalResultTypes,
  'dangerous-man': dangerousManResultTypes,
  'dark-fall': darkFallResultTypes,
  'popularity-season': popularitySeasonResultTypes,
  'money-luck': moneyLuckResultTypes,
  'work-style': workStyleResultTypes,
  'life-bug': lifeBugResultTypes,
}

function getResultTitle(diagnosis, answers, score, maxScore) {
  if (!diagnosis) return ''

  const scoreBand = Math.min(3, Math.floor((score / maxScore) * 4))
  const tendencyResolver = tendencyIndexResolvers[diagnosis.id]
  const resultTypes = resultTypesByDiagnosis[diagnosis.id]

  if (tendencyResolver && resultTypes) {
    const tendencyIndex = tendencyResolver(answers)
    return resultTypes[scoreBand][tendencyIndex]
  }

  return diagnosis.results[scoreBand]
}

function getCharacterCollection(diagnosisId) {
  const characterCollections = {
    'love-complicated': {
      basePath: 'love',
      characters: loveComplicatedCharacters,
    },
    'hidden-personality': {
      basePath: 'hidden-personality',
      characters: hiddenPersonalityCharacters,
    },
    'menhera-level': {
      basePath: 'menheraLevelCharacters',
      characters: menheraLevelCharacters,
    },
    'sns-approval': {
      basePath: 'snsApprovalCharacters',
      characters: snsApprovalCharacters,
    },
    'dangerous-man': {
      basePath: 'dangerousManCharacters',
      characters: dangerousManCharacters,
    },
    'dark-fall': {
      basePath: 'darkFallCharacters',
      characters: darkFallCharacters,
    },
    'popularity-season': {
      basePath: 'popularitySeasonCharacters',
      characters: popularitySeasonCharacters,
    },
    'money-luck': {
      basePath: 'moneyLuckCharacters',
      characters: moneyLuckCharacters,
    },
    'work-style': {
      basePath: 'workStyleCharacters',
      characters: workStyleCharacters,
    },
    'life-bug': {
      basePath: 'lifeBugCharacters',
      characters: lifeBugCharacters,
    },
  }

  return characterCollections[diagnosisId] || null
}

function getCharacterForResult(diagnosisId, resultTitle) {
  const characterCollection = getCharacterCollection(diagnosisId)
  return characterCollection?.characters[resultTitle] || null
}



function getCharacterImagePath(diagnosisId, resultTitle, savedImage = '') {
  const characterCollection = getCharacterCollection(diagnosisId)
  const character = characterCollection?.characters[resultTitle] || null
  const currentImage = character && characterCollection
    ? `/characters/${characterCollection.basePath}/${character.imageKey}.webp`
    : ''

  return currentImage || savedImage
}

function drawImageContain(ctx, image, x, y, width, height) {
  const imageRatio = image.width / image.height
  const frameRatio = width / height
  let drawWidth = width
  let drawHeight = height
  let drawX = x
  let drawY = y

  if (imageRatio > frameRatio) {
    drawHeight = width / imageRatio
    drawY = y + (height - drawHeight) / 2
  } else {
    drawWidth = height * imageRatio
    drawX = x + (width - drawWidth) / 2
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
}

const legalPages = {
  privacy: {
    label: 'Privacy Policy',
    title: 'プライバシーポリシー',
    lead: '診断村では、ユーザーの安心と安全を大切にし、個人情報や端末内データの取り扱いについて以下の通り定めます。',
    sections: [
      {
        heading: '取得する情報について',
        body: '診断村では、氏名、住所、電話番号など、個人を直接特定する情報を原則として取得しません。診断結果、診断履歴、好きボタンの情報は、サービス体験向上のために利用されます。',
      },
      {
        heading: '端末内に保存される情報について',
        body: '診断履歴、好きボタン、入口画面の通過状態などは、ユーザーの端末内のlocalStorageに保存されます。これらの情報は、同じ端末・同じブラウザで表示を便利にするために利用されます。',
      },
      {
        heading: '広告配信について',
        body: '診断村では、Google AdSenseなどの第三者配信事業者による広告を掲載する場合があります。広告配信事業者は、Cookie等を使用して、ユーザーの興味に応じた広告を表示する場合があります。',
      },
      {
        heading: 'アクセス解析について',
        body: '診断村では、サービス改善のためにGoogle Analytics等のアクセス解析ツールを利用する場合があります。これらのツールはCookie等を使用して匿名の利用状況データを収集することがあります。',
      },
      {
        heading: 'Cookieについて',
        body: 'ユーザーはブラウザの設定によりCookieを無効にすることができます。ただし、Cookieを無効にした場合、一部の機能が正しく動作しない場合があります。',
      },
      {
        heading: '免責事項',
        body: '診断村の診断結果はエンターテインメントを目的としたものであり、医学的、心理学的、法律的、金融的な助言を行うものではありません。診断結果の利用により生じた損害について、運営者は責任を負いかねます。',
      },
      {
        heading: '著作権について',
        body: '診断村に掲載される文章、画像、キャラクター、デザイン等の著作権は、運営者または正当な権利者に帰属します。無断転載、無断使用、二次配布を禁止します。',
      },
      {
        heading: '改定について',
        body: '本ポリシーは、必要に応じて予告なく変更される場合があります。変更後の内容は、本ページに掲載された時点で有効となります。',
      },
    ],
  },
  contact: {
    label: 'Contact',
    title: 'お問い合わせ',
    lead: '診断村に関するお問い合わせは、下記メールアドレスまでお願いいたします。',
    sections: [
      {
        heading: 'お問い合わせ先',
        body: 'katuya0208@gmail.com',
      },
    ],
  },
  operator: {
    label: 'Operator',
    title: '運営者情報',
    lead: '診断村の運営者情報です。',
    sections: [
      {
        heading: 'サイト名',
        body: '診断村',
      },
      {
        heading: '運営者',
        body: 'Katsuya Ohara',
      },
      {
        heading: 'サイト内容',
        body: '恋愛、性格、仕事、お金、SNSなどをテーマにしたキャラクター診断コンテンツを提供しています。診断結果はエンターテインメントを目的としています。',
      },
      {
        heading: '著作権表記',
        body: '© 2026 Katsuya Ohara / 診断村. All Rights Reserved.',
      },
    ],
  },
}


function getGateTheme() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 16) return 'morning'
  if (hour >= 16 && hour < 19) return 'evening'
  return 'night'
}

function getShareUrl() {
  return `${window.location.origin}${window.location.pathname}`
}

function getQrCodeImageUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(text)}`
}

function drawStoryQrCode(ctx, qrImage) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
  ctx.beginPath()
  ctx.roundRect(748, 1518, 210, 246, 28)
  ctx.fill()

  ctx.strokeStyle = 'rgba(143, 78, 216, 0.18)'
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.drawImage(qrImage, 778, 1544, 150, 150)

  ctx.fillStyle = '#8f4ed8'
  ctx.font = '800 22px system-ui, sans-serif'
  ctx.fillText('診断村へ', 853, 1720)
}

function loadImageAsync(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

// 診断結果・診断履歴の両方から呼ばれる、ストーリー共有用画像(1080x1920)を
// 1枚のcanvasに描画してBlobとして返す共通処理。
// 呼び出し側は表示するテキストと画像パスだけを渡す。
async function createResultStoryBlob({
  headingLabel,
  resultTitle,
  nameLine,
  subLine,
  characterImagePath,
  fallbackLabel,
  fallbackFontSize = 120,
}) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920

  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1920)
  gradient.addColorStop(0, '#fff4fb')
  gradient.addColorStop(1, '#e9ddff')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1920)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.roundRect(80, 100, 920, 1720, 56)
  ctx.fill()

  ctx.textAlign = 'center'

  ctx.fillStyle = '#8f4ed8'
  ctx.font = '700 42px system-ui, sans-serif'
  ctx.fillText('診断村', 540, 200)

  ctx.fillStyle = '#29183a'
  ctx.font = '800 72px system-ui, sans-serif'
  ctx.fillText(headingLabel, 540, 310)

  ctx.fillStyle = '#ff69ad'
  ctx.font = '800 50px system-ui, sans-serif'
  ctx.fillText(resultTitle, 540, 410)

  if (characterImagePath) {
    try {
      const image = await loadImageAsync(characterImagePath)
      drawImageContain(ctx, image, 140, 520, 800, 800)
    } catch {
      ctx.fillStyle = '#8f4ed8'
      ctx.font = `800 ${fallbackFontSize}px system-ui, sans-serif`
      ctx.fillText(fallbackLabel, 540, 920)
    }
  }

  ctx.fillStyle = '#29183a'
  ctx.font = '800 54px system-ui, sans-serif'
  ctx.fillText(nameLine, 540, 1430)

  ctx.fillStyle = '#6f5c7d'
  ctx.font = '600 34px system-ui, sans-serif'
  ctx.fillText(subLine, 540, 1510)

  ctx.fillStyle = '#ff69ad'
  ctx.font = '800 42px system-ui, sans-serif'
  ctx.fillText('#診断村', 540, 1710)

  ctx.fillStyle = '#8c7a98'
  ctx.font = '600 28px system-ui, sans-serif'
  ctx.fillText('診断結果をストーリーでシェアしてね', 540, 1770)

  try {
    const qrImage = await loadImageAsync(getQrCodeImageUrl(getShareUrl()))
    drawStoryQrCode(ctx, qrImage)
  } catch {
    ctx.fillStyle = '#8f4ed8'
    ctx.font = '700 24px system-ui, sans-serif'
    ctx.fillText('診断村で検索', 853, 1708)
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

function pickRandomComment(pool, usedComments) {
  const availableComments = pool.filter((comment) => !usedComments.includes(comment))
  const targetPool = availableComments.length > 0 ? availableComments : pool
  return targetPool[Math.floor(Math.random() * targetPool.length)]
}

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [hasEnteredVillage, setHasEnteredVillage] = useState(() => localStorage.getItem('shindanMuraEntered') === 'true')
  const [gateOpening, setGateOpening] = useState(false)
  const [showCharacterGuide, setShowCharacterGuide] = useState(false)
  const [legalPage, setLegalPage] = useState(null)
  const [activeCategory, setActiveCategory] = useState('すべて')
  const [activeScene, setActiveScene] = useState('all')
  const [randomComments, setRandomComments] = useState({})
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [likedCharacterIds, setLikedCharacterIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shindanMuraLikedCharacters')) || []
    } catch {
      return []
    }
  })
  const [characterLikeCounts, setCharacterLikeCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shindanMuraCharacterLikes')) || {}
    } catch {
      return {}
    }
  })
  const [diagnosisHistory, setDiagnosisHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shindanMuraHistory')) || []
    } catch {
      return []
    }
  })
  const diagnosis = diagnoses.find((item) => item.id === selectedId)
  const filteredDiagnoses = diagnoses.filter((item) => {
    const categoryMatched = activeCategory === 'すべて' || item.category === activeCategory
    const sceneMatched = activeScene === 'all' || item.scenes.includes(activeScene)
    return categoryMatched && sceneMatched
  })
  const score = answers.reduce((sum, value) => sum + value, 0)
  const maxScore = diagnosis ? diagnosis.questions.length * 3 : 1
  const scoreBand = Math.min(3, Math.floor((score / maxScore) * 4))
  const resultTitle = getResultTitle(diagnosis, answers, score, maxScore)

  const startDiagnosis = (id, shouldPushState = true) => {
    const nextDiagnosis = diagnoses.find((item) => item.id === id)

    if (!nextDiagnosis) return

    if (shouldPushState) {
      window.history.pushState(null, '', `#diagnosis=${id}`)
    }

    setSelectedId(id)
    setAnswers(Array(nextDiagnosis.questions.length).fill(null))
    setShowResult(false)
    setShowCharacterGuide(false)
    setSelectedHistory(null)
    setRandomComments({})

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const updateAnswer = (index, value) => {
    const nextAnswers = [...answers]
    nextAnswers[index] = value
    setAnswers(nextAnswers)

    if (diagnosis && randomCommentPools[diagnosis.id]) {
      const pool = randomCommentPools[diagnosis.id]
      const usedComments = Object.entries(randomComments)
        .filter(([key]) => Number(key) !== index)
        .map(([, comment]) => comment)

      setRandomComments((currentComments) => ({
        ...currentComments,
        [index]: pickRandomComment(pool, usedComments),
      }))
    }
  }

  const resetFilters = () => {
    setActiveCategory('すべて')
    setActiveScene('all')
  }

  const toggleCharacterLike = (characterId) => {
    const alreadyLiked = likedCharacterIds.includes(characterId)
    const nextLikedCharacterIds = alreadyLiked
      ? likedCharacterIds.filter((id) => id !== characterId)
      : [...likedCharacterIds, characterId]
    const nextCharacterLikeCounts = {
      ...characterLikeCounts,
      [characterId]: Math.max(0, (characterLikeCounts[characterId] || 0) + (alreadyLiked ? -1 : 1)),
    }

    setLikedCharacterIds(nextLikedCharacterIds)
    setCharacterLikeCounts(nextCharacterLikeCounts)
    localStorage.setItem('shindanMuraLikedCharacters', JSON.stringify(nextLikedCharacterIds))
    localStorage.setItem('shindanMuraCharacterLikes', JSON.stringify(nextCharacterLikeCounts))
  }

  const saveDiagnosisHistory = ({ diagnosisItem, result, character, characterCollection, totalScore, totalMaxScore }) => {
    const currentResultDetail = resultDetails[diagnosisItem.id]?.[result] || null
    const historyItem = {
      id: `${diagnosisItem.id}-${Date.now()}`,
      diagnosisId: diagnosisItem.id,
      diagnosisTitle: diagnosisItem.title,
      resultTitle: result,
      resultDetail: currentResultDetail || null,
      characterName: character?.characterName || '',
      characterImage: character && characterCollection
        ? `/characters/${characterCollection.basePath}/${character.imageKey}.webp`
        : '',
      score: totalScore,
      maxScore: totalMaxScore,
      createdAt: new Date().toISOString(),
    }

    const nextHistory = [historyItem, ...diagnosisHistory].slice(0, 30)
    setDiagnosisHistory(nextHistory)
    localStorage.setItem('shindanMuraHistory', JSON.stringify(nextHistory))
  }

  const gateTheme = getGateTheme()

  const allCharacterItems = diagnoses.flatMap((diagnosisItem) => {
    const characterCollection = getCharacterCollection(diagnosisItem.id)

    if (!characterCollection) {
      return []
    }

    return Object.entries(characterCollection.characters).map(([resultName, character]) => ({
      id: `${diagnosisItem.id}-${resultName}`,
      diagnosisId: diagnosisItem.id,
      diagnosisTitle: diagnosisItem.title,
      diagnosisCategory: diagnosisItem.category,
      resultTitle: resultName,
      characterName: character.characterName,
      role: character.role,
      visualConcept: character.visualConcept,
      image: `/characters/${characterCollection.basePath}/${character.imageKey}.webp`,
    }))
  })

  const popularCharacterRanking = allCharacterItems
    .map((character) => ({
      ...character,
      likeCount: characterLikeCounts[character.id] || 0,
      isLiked: likedCharacterIds.includes(character.id),
    }))
    .sort((a, b) => {
      if (b.likeCount !== a.likeCount) {
        return b.likeCount - a.likeCount
      }

      return allCharacterItems.findIndex((item) => item.id === a.id) - allCharacterItems.findIndex((item) => item.id === b.id)
    })
    .slice(0, 5)

  const enterVillage = () => {
    setGateOpening(true)

    setTimeout(() => {
      localStorage.setItem('shindanMuraEntered', 'true')
      setHasEnteredVillage(true)
      setGateOpening(false)
      window.history.pushState(null, '', '#home')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 900)
  }

  useEffect(() => {
    const syncRoute = () => {
      const rawHash = window.location.hash
      const hash = rawHash || '#home'

      if (!rawHash && localStorage.getItem('shindanMuraEntered') !== 'true') {
        return
      }

      if (rawHash && rawHash !== '#') {
        localStorage.setItem('shindanMuraEntered', 'true')
        setHasEnteredVillage(true)
      }

      if (hash === '#privacy' || hash === '#contact' || hash === '#operator') {
        setSelectedId(null)
        setShowResult(false)
        setAnswers([])
        setRandomComments({})
        setSelectedHistory(null)
        setShowCharacterGuide(false)
        setLegalPage(hash.replace('#', ''))
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      if (hash === '#guide') {
        setSelectedId(null)
        setShowResult(false)
        setAnswers([])
        setRandomComments({})
        setSelectedHistory(null)
        setLegalPage(null)
        setShowCharacterGuide(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      if (hash.startsWith('#diagnosis=')) {
        const nextId = decodeURIComponent(hash.replace('#diagnosis=', ''))
        setSelectedHistory(null)
        setShowCharacterGuide(false)
        startDiagnosis(nextId, false)
        return
      }

      if (hash.startsWith('#history=')) {
        const historyId = decodeURIComponent(hash.replace('#history=', ''))
        let savedHistory
        try {
          savedHistory = JSON.parse(localStorage.getItem('shindanMuraHistory')) || []
        } catch {
          savedHistory = []
        }

        const historyItem = savedHistory.find((item) => item.id === historyId)

        if (historyItem) {
          const historyCharacter = getCharacterForResult(historyItem.diagnosisId, historyItem.resultTitle)
          const historyCharacterImage = getCharacterImagePath(historyItem.diagnosisId, historyItem.resultTitle, historyItem.characterImage)
          const historyCharacterName = historyItem.characterName || historyCharacter?.characterName || ''

          setSelectedId(null)
          setShowResult(false)
          setAnswers([])
          setRandomComments({})
          setShowCharacterGuide(false)
          setSelectedHistory({
            ...historyItem,
            characterName: historyCharacterName,
            characterImage: historyCharacterImage,
            resultDetail: historyItem.resultDetail || resultDetails[historyItem.diagnosisId]?.[historyItem.resultTitle] || null,
          })
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
      }

      setSelectedId(null)
      setShowResult(false)
      setAnswers([])
      setRandomComments({})
      setSelectedHistory(null)
      setLegalPage(null)
      setShowCharacterGuide(false)
    }

    syncRoute()
    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)

    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  if (!hasEnteredVillage) {
    return (
      <main className={`gate-page gate-${gateTheme} ${gateOpening ? 'gate-opening' : ''}`}>
        <section className="village-gate-card">
          <div className="gate-sky">
            <div className="gate-moon" />
            <div className="gate-sun" />
            <div className="gate-stars" />
          </div>

          <div className="gate-sign">診断村</div>

          <div className="gate-frame">
            <div className="gate-post gate-post-left" />
            <div className="gate-post gate-post-right" />

            <div className="gate-doors">
              <div className="gate-door gate-door-left">
                <span />
              </div>
              <div className="gate-door gate-door-right">
                <span />
              </div>
            </div>
          </div>

          <button className="gate-enter-button" onClick={enterVillage}>
            診断村に入る
          </button>

          <p className="gate-caption">
            恋愛・性格・闇属性・仕事・お金・SNSまで、あなたにぴったりの診断が見つかる村。
          </p>
        </section>
      </main>
    )
  }

  if (legalPage && legalPages[legalPage]) {
    const page = legalPages[legalPage]

    return (
      <main className="app">
        <button
          className="back"
          onClick={() => {
            window.history.pushState(null, '', '#home')
            setLegalPage(null)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          ← 診断村に戻る
        </button>

        <section className="hero detail legal-hero">
          <p className="label">{page.label}</p>
          <h1>{page.title}</h1>
          <p>{page.lead}</p>
        </section>

        <section className="legal-panel">
          {page.sections.map((section) => (
            <article className="legal-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>
      </main>
    )
  }

  if (showCharacterGuide) {
    return (
      <main className="app">
        <button
          className="back"
          onClick={() => {
            window.history.pushState(null, '', '#home')
            setShowCharacterGuide(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          ← 診断村に戻る
        </button>

        <section className="hero detail character-guide-hero">
          <p className="label">診断村キャラ図鑑</p>
          <h1>村人図鑑</h1>
          <p>診断村に登場するキャラクターたちを一覧で見られます。気になるキャラから診断を始めてみてください。</p>
        </section>

        <section className="character-guide-grid">
          {allCharacterItems.map((character) => (
            <article className="character-guide-card" key={character.id}>
              <div className="character-guide-image-wrap">
                <img
                  src={character.image}
                  alt={character.characterName}
                  className="character-guide-image"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className="character-guide-copy">
                <p className="label">{character.diagnosisCategory}</p>
                <h3>{character.characterName}</h3>
                <strong>{character.resultTitle}</strong>
                <p>{character.role || character.visualConcept}</p>
                <div className="character-guide-actions">
                  <button className="share-button story" onClick={() => startDiagnosis(character.diagnosisId)}>
                    この診断をやる
                  </button>
                  <button
                    className={likedCharacterIds.includes(character.id) ? 'like-button liked' : 'like-button'}
                    type="button"
                    onClick={() => toggleCharacterLike(character.id)}
                  >
                    {likedCharacterIds.includes(character.id) ? '♥ 好き' : '♡ 好き'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    )
  }

  if (selectedHistory) {
    const historyCharacter = getCharacterForResult(selectedHistory.diagnosisId, selectedHistory.resultTitle)
    const historyCharacterImage = getCharacterImagePath(
      selectedHistory.diagnosisId,
      selectedHistory.resultTitle,
      selectedHistory.characterImage,
    )
    const historyCharacterName = selectedHistory.characterName || historyCharacter?.characterName || ''
    const historyResultDetail = selectedHistory.resultDetail || resultDetails[selectedHistory.diagnosisId]?.[selectedHistory.resultTitle] || null

    const createHistoryStoryImage = () => createResultStoryBlob({
      headingLabel: '診断履歴',
      resultTitle: selectedHistory.resultTitle,
      nameLine: historyCharacterName || selectedHistory.resultTitle,
      subLine: selectedHistory.diagnosisTitle,
      characterImagePath: historyCharacterImage,
      fallbackLabel: '診断村',
      fallbackFontSize: 90,
    })

    const shareHistoryStoryImage = async () => {
      try {
        const blob = await createHistoryStoryImage()

        if (!blob) {
          alert('画像の作成に失敗しました。')
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'shindan-mura-history-story.png'
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      } catch {
        alert('ストーリー画像の作成に失敗しました。')
      }
    }

    return (
      <main className="app">
        <button
          className="back"
          onClick={() => {
            window.history.pushState(null, '', '#home')
            setSelectedHistory(null)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          ← 診断履歴に戻る
        </button>

        <section className="result">
          <p className="label">診断履歴</p>
          <h2>{selectedHistory.resultTitle}</h2>
          <p>あなたは「{selectedHistory.diagnosisTitle}」で、{selectedHistory.resultTitle}でした。</p>

          {historyCharacterImage && (
            <div className="character-card">
              <div className="character-portrait">
                <img
                  src={historyCharacterImage}
                  alt={historyCharacterName || selectedHistory.resultTitle}
                  className="character-image"
                />
              </div>
              <div className="character-copy">
                <p className="label">診断キャラクター</p>
                <h3>{historyCharacterName || selectedHistory.resultTitle}</h3>
                <strong>{selectedHistory.diagnosisTitle}</strong>
                <p>過去に保存された診断結果です。</p>
              </div>
            </div>
          )}

          {historyResultDetail && (
            <div className="result-detail">
              <p>{historyResultDetail.description}</p>
              <p>{historyResultDetail.match}</p>
              <p>{historyResultDetail.advice}</p>
            </div>
          )}

          <div className="share">私は「{selectedHistory.diagnosisTitle}」で「{selectedHistory.resultTitle}」でした。#診断村</div>

          <div className="share-primary">
            <button className="share-button story" onClick={shareHistoryStoryImage}>
              <IconStoryImage />
              ストーリー画像を作る
            </button>
          </div>

          <div className="share-icon-row" role="group" aria-label="シェア">
            <button
              className="icon-button copy"
              type="button"
              aria-label="結果文をコピー"
              title="結果文をコピー"
              onClick={async () => {
                const text = `私は「${selectedHistory.diagnosisTitle}」で「${selectedHistory.resultTitle}」でした。\n${historyResultDetail?.description || ''}\n#診断村`
                await navigator.clipboard.writeText(text)
                alert('履歴の結果文をコピーしました。')
              }}
            >
              <IconCopy />
            </button>
          </div>

          <div className="result-nav-actions">
            <button
              className="share-button"
              onClick={() => {
                window.history.pushState(null, '', '#home')
                setSelectedHistory(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              診断村に戻る
            </button>
          </div>
        </section>
      </main>
    )
  }

  if (diagnosis) {
    const answeredCount = answers.filter((answer) => answer !== null).length
    const completed = answeredCount === diagnosis.questions.length
    const currentResultDetail = resultDetails[diagnosis.id]?.[resultTitle] || resultDetails[diagnosis.id]?.[diagnosis.results[scoreBand]]
    const currentCharacterCollection = getCharacterCollection(diagnosis.id)
    const currentCharacter = currentCharacterCollection?.characters[resultTitle] || null
    const shareText = `私は「${diagnosis.title}」で「${resultTitle}」でした。\n${currentCharacter ? `診断キャラ：${currentCharacter.characterName}\n` : ''}${currentResultDetail?.description || ''}\n#診断村`

    const copyShareText = async () => {
      await navigator.clipboard.writeText(shareText)
      alert('結果文をコピーしました。X・LINE・Instagramなど好きな場所に貼り付けてシェアできます。')
    }

    const shareToX = () => {
      const text = encodeURIComponent(shareText)
      const url = encodeURIComponent(window.location.href)
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    }

    const shareToLine = () => {
      const url = encodeURIComponent(`${window.location.origin}${window.location.pathname}`)
      window.open(`https://social-plugins.line.me/lineit/share?url=${url}`, '_blank')
    }

    const createStoryImage = () => createResultStoryBlob({
      headingLabel: '診断結果',
      resultTitle,
      nameLine: currentCharacter?.characterName || diagnosis.title,
      subLine: diagnosis.title,
      characterImagePath: currentCharacter && currentCharacterCollection
        ? `/characters/${currentCharacterCollection.basePath}/${currentCharacter.imageKey}.webp`
        : '',
      fallbackLabel: diagnosis.emoji,
      fallbackFontSize: 120,
    })

    const shareStoryImage = async () => {
      try {
        const blob = await createStoryImage()

        if (!blob) {
          alert('画像の作成に失敗しました。')
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'shindan-mura-story.png'
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      } catch {
        alert('ストーリー画像の作成に失敗しました。')
      }
    }
    return (
      <main className="app">
        <button
          className="back"
          onClick={() => {
            window.history.pushState(null, '', '#home')
            setSelectedId(null)
            setShowResult(false)
            setAnswers([])
            setRandomComments({})
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          ← 診断村に戻る
        </button>

        <section className="hero detail">
          <div className="emoji">{diagnosis.emoji}</div>
          <p className="label">{diagnosis.category}</p>
          <h1>{diagnosis.title}</h1>
          <p>{diagnosis.description}</p>
        </section>

        {!showResult ? (
          <section className="panel">
            <div className="progress">{answeredCount} / {diagnosis.questions.length} 問回答済み</div>

            {diagnosis.questions.map((question, index) => (
              <div className="question" key={question}>
                <h2>Q{index + 1}. {question}</h2>
                <div className="answers">
                  {options.map((option) => (
                    <button
                      key={option.label}
                      className={answers[index] === option.value ? 'answer active' : 'answer'}
                      onClick={() => updateAnswer(index, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {answers[index] !== null && (
                  <div className="question-comment">
                    {randomComments[index] || answerComments[diagnosis.id]?.[answers[index]]}
                  </div>
                )}
              </div>
            ))}

            <button
              className="primary"
              disabled={!completed}
              onClick={() => {
                saveDiagnosisHistory({
                  diagnosisItem: diagnosis,
                  result: resultTitle,
                  character: currentCharacter,
                  characterCollection: currentCharacterCollection,
                  totalScore: score,
                  totalMaxScore: maxScore,
                })
                setShowResult(true)

                setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
            >
              診断結果を見る
            </button>
          </section>
        ) : (
          <section className="result">
            <p className="label">スコア {score} / {maxScore}</p>
            <h2>{resultTitle}</h2>
            <p>あなたは「{diagnosis.title}」で、{resultTitle}でした。</p>

            {currentCharacter && (
              <div className="character-card">
                <div className={`character-portrait ${currentCharacter.imageKey}`}>
                  <img
                    src={`/characters/${currentCharacterCollection.basePath}/${currentCharacter.imageKey}.webp`}
                    alt={currentCharacter.characterName}
                    className="character-image"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div className="character-copy">
                  <p className="label">診断キャラクター</p>
                  <h3>{currentCharacter.characterName}</h3>
                  <strong>{currentCharacter.role}</strong>
                  <p>{currentCharacter.visualConcept}</p>
                </div>
              </div>
            )}

            {currentResultDetail && (
              <div className="result-detail">
                <p>{currentResultDetail.description}</p>
                <p>{currentResultDetail.match}</p>
                <p>{currentResultDetail.advice}</p>
              </div>
            )}

            <div className="share">私は「{diagnosis.title}」で「{resultTitle}」でした。#診断村</div>

            <div className="share-primary">
              <button className="share-button story" onClick={shareStoryImage}>
                <IconStoryImage />
                ストーリー画像を作る
              </button>
            </div>

            <div className="share-icon-row" role="group" aria-label="SNSでシェア">
              <button className="icon-button x" type="button" onClick={shareToX} aria-label="Xでシェア" title="Xでシェア">
                <IconX />
              </button>
              <button className="icon-button line" type="button" onClick={shareToLine} aria-label="LINEでシェア" title="LINEでシェア">
                <IconLine />
              </button>
              <button className="icon-button copy" type="button" onClick={copyShareText} aria-label="結果文をコピー" title="結果文をコピー">
                <IconCopy />
              </button>
            </div>

            <div className="result-nav-actions">
              <button
                className="share-button"
                onClick={() => {
                  window.history.pushState(null, '', '#home')
                  setSelectedId(null)
                  setShowResult(false)
                  setAnswers([])
                  setRandomComments({})
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                他の診断も見る
              </button>
              <button className="primary" onClick={() => startDiagnosis(diagnosis.id)}>もう一度診断する</button>
            </div>
          </section>
        )}
      </main>
    )
  }

  return (
    <main className={`app top-app top-${gateTheme}`}>
      <section className="hero top-hero">
        <div className="top-hero-copy">
          <h1>診断村</h1>
          <p>あなたにぴったりの診断が見つかる場所</p>
          <div className="top-hero-actions">
            <button className="primary hero-primary" onClick={() => startDiagnosis('menhera-level')}>人気診断をはじめる</button>
            <button className="share-button" onClick={() => {
              window.history.pushState(null, '', '#guide')
              setShowCharacterGuide(true)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}>村人図鑑を見る</button>
          </div>
        </div>
        <div className="top-hero-card village-welcome-sign">
          <span>🌿</span>
          <strong>ようこそ診断村へ</strong>
          <p>気になる診断を探して、あなたにぴったりのキャラに出会いましょう。</p>
        </div>
      </section>


      <section className="panel intro top-intro">
        <h2>あなたはどの村へ行く？</h2>
        <p>気分・シーン・キャラから診断を選べます。結果はキャラ付きで保存され、あとからInstagram用画像としてシェアできます。</p>
      </section>

      <section className="top-feature-grid">
        <button className="top-feature-card" onClick={() => startDiagnosis('love-complicated')}>
          <span>💗</span>
          <strong>恋愛診断</strong>
          <p>恋の傾向をチェック</p>
        </button>
        <button className="top-feature-card" onClick={() => startDiagnosis('hidden-personality')}>
          <span>👻</span>
          <strong>性格診断</strong>
          <p>あなたの性格をまるっと診断</p>
        </button>
        <button className="top-feature-card" onClick={() => startDiagnosis('dangerous-man')}>
          <span>⭐</span>
          <strong>関係性診断</strong>
          <p>あの人との関係を診断</p>
        </button>
        <button className="top-feature-card" onClick={() => startDiagnosis('work-style')}>
          <span>💼</span>
          <strong>仕事診断</strong>
          <p>向いている仕事を見つけよう</p>
        </button>
        <button className="top-feature-card" onClick={() => startDiagnosis('sns-approval')}>
          <span>💬</span>
          <strong>SNS診断</strong>
          <p>SNSでのあなたは？</p>
        </button>
      </section>

      <section className="popular-ranking-panel">
        <div className="history-head">
          <div>
            <p className="label">人気キャラランキング</p>
            <h2>今見られている診断キャラ</h2>
          </div>
          <button className="reset" onClick={() => {
            window.history.pushState(null, '', '#guide')
            setShowCharacterGuide(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}>村人図鑑を見る</button>
        </div>

        <div className="popular-character-list">
          {popularCharacterRanking.map((character, index) => (
            <article className="popular-character-item" key={character.id}>
              <button className="popular-character-main" type="button" onClick={() => startDiagnosis(character.diagnosisId)}>
                <em>{index + 1}</em>
                <img
                  src={character.image}
                  alt={character.characterName}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
                <span>
                  <strong>{character.characterName}</strong>
                  <small>{character.diagnosisTitle}</small>
                  <small>{character.likeCount}いいね</small>
                </span>
              </button>
              <button
                className={character.isLiked ? 'like-button liked' : 'like-button'}
                type="button"
                onClick={() => toggleCharacterLike(character.id)}
              >
                {character.isLiked ? '♥ 好き' : '♡ 好き'}
              </button>
            </article>
          ))}
        </div>
      </section>

      {diagnosisHistory.length > 0 && (
        <section className="history-panel">
          <div className="history-head">
            <div>
              <p className="label">診断履歴</p>
              <h2>最近の診断結果</h2>
            </div>
          </div>

          <div className="history-list">
            {diagnosisHistory.slice(0, 6).map((item) => {
              const historyCharacter = getCharacterForResult(item.diagnosisId, item.resultTitle)
              const historyCharacterImage = getCharacterImagePath(item.diagnosisId, item.resultTitle, item.characterImage)
              const historyCharacterName = item.characterName || historyCharacter?.characterName || ''

              return (
                <button
                  className="history-item"
                  key={item.id}
                  onClick={() => {
                    window.history.pushState(null, '', `#history=${item.id}`)
                    setSelectedHistory({
                      ...item,
                      characterName: historyCharacterName,
                      characterImage: historyCharacterImage,
                      resultDetail: item.resultDetail || resultDetails[item.diagnosisId]?.[item.resultTitle] || null,
                    })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  {historyCharacterImage && (
                    <img
                      src={historyCharacterImage}
                      alt={historyCharacterName || item.resultTitle}
                    />
                  )}

                  <span>
                    <small>{item.diagnosisTitle}</small>
                    <strong>{item.resultTitle}</strong>
                    {historyCharacterName && <em>{historyCharacterName}</em>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="filter-panel">
        <div className="filter-block">
          <h2>カテゴリーで選ぶ</h2>
          <div className="chip-row">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? 'chip active' : 'chip'}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-block">
          <h2>シーンで選ぶ</h2>
          <div className="scene-row">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                className={activeScene === scene.id ? 'scene-chip active' : 'scene-chip'}
                onClick={() => setActiveScene(scene.id)}
              >
                <span>{scene.emoji}</span>
                <strong>{scene.label}</strong>
                <small>{scene.description}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="scene-sets">
        {sceneSets.map((set) => (
          <button className="set-card" key={set.id} onClick={() => setActiveScene(set.id)}>
            <span>{set.emoji}</span>
            <strong>{set.title}</strong>
            <p>{set.text}</p>
          </button>
        ))}
      </section>

      <section className="list-heading">
        <div>
          <p className="label">診断一覧</p>
          <h2>{filteredDiagnoses.length}個の診断が見つかりました</h2>
        </div>
        <button className="reset" onClick={resetFilters}>絞り込みをリセット</button>
      </section>

      <section className="grid">
        {filteredDiagnoses.map((item) => (
          <button className={`card ${item.id}`} key={item.id} onClick={() => startDiagnosis(item.id)}>
            <span className="emoji">{item.emoji}</span>
            <span className="label">{item.category}</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </button>
        ))}
      </section>

      <footer className="copyright-footer">
        <nav className="footer-links" aria-label="フッターリンク">
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '#privacy')
              setLegalPage('privacy')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            プライバシーポリシー
          </button>
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '#contact')
              setLegalPage('contact')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            お問い合わせ
          </button>
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '#operator')
              setLegalPage('operator')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            運営者情報
          </button>
        </nav>
        <p>© 2026 Katsuya Ohara / 診断村. All Rights Reserved.</p>
      </footer>

      <nav className="bottom-nav" aria-label="診断村メニュー">
        <button type="button" onClick={() => window.history.pushState(null, '', '#home')}><span>🏠</span><strong>ホーム</strong></button>
        <button type="button" onClick={() => document.querySelector('.filter-panel')?.scrollIntoView({ behavior: 'smooth' })}><span>🔍</span><strong>さがす</strong></button>
        <button type="button" className="bottom-nav-main" onClick={() => startDiagnosis('menhera-level')}><span>🧩</span><strong>診断する</strong></button>
        <button
          type="button"
          onClick={() => {
            window.history.pushState(null, '', '#guide')
            setShowCharacterGuide(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <span>👤</span><strong>図鑑</strong>
        </button>
        <button type="button" onClick={() => document.querySelector('.grid')?.scrollIntoView({ behavior: 'smooth' })}><span>☰</span><strong>メニュー</strong></button>
      </nav>
    </main>
  )
}

export default App
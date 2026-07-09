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
  oshikatsuCharacters,
  oshikatsuResultTypes,
  replyTypeCharacters,
  replyTypeResultTypes,
  crushMisreadCharacters,
  crushMisreadResultTypes,
  darkDepthCharacters,
  darkDepthResultTypes,
} from './characterData'
import { resultDetails as resultDetailsJa } from './resultDetails'
import { randomCommentPools as randomCommentPoolsJa } from './randomComments'
import { categories as categoriesJa, scenes as scenesJa, sceneSets as sceneSetsJa, diagnoses as diagnosesJa, options as optionsJa } from './diagnosisData'
import { uiText, legalPagesByLanguage, answerCommentsByLanguage } from './i18n'
// 英語データは初期バンドルに含めず、言語切替時に loadEnPack() で遅延読み込みする。
// 読み込み前に en を参照すると undefined になり、各所の `|| ja` フォールバックが効く。
import { getEnPack, loadEnPack } from './langPacks'
import { getReplyTypeFontStyle } from './fontStyles'
import AdBanner from './components/AdBanner'
import { useEffect, useState } from 'react'
import './App.css'

const dataByLanguage = {
  ja: {
    categories: categoriesJa,
    scenes: scenesJa,
    sceneSets: sceneSetsJa,
    diagnoses: diagnosesJa,
    options: optionsJa,
    resultDetails: resultDetailsJa,
    randomCommentPools: randomCommentPoolsJa,
  },
  get en() {
    return getEnPack()?.dataEn
  },
}

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

// アフィリエイト(A8.net ちょびリッチ)の広告枠。
// 景品表示法のステマ規制対応として「PR」表記を必ず視認性の高い位置に出す。
const RECOMMEND_PICK_URL = 'https://px.a8.net/svt/ejp?a8mat=4B7SGX+FHV6LU+389A+67RK1'
// A8.net推奨の効果測定用トラッキングピクセル(1x1、非表示)。クリックの成果計測には必須ではないが、
// インプレッション計測の精度を上げるためバナー掲載時と同様に埋め込んでおく。
const RECOMMEND_PICK_PIXEL = 'https://www11.a8.net/0.gif?a8mat=4B7SGX+FHV6LU+389A+67RK1'

// キャラクターの「いいね」を全訪問者分で集計するためのAPI(Xserver上のPHP+MySQL)。
// 同一オリジンなので相対パスでOK。public_html直下に /api/likes.php を配置している前提。
const LIKES_API_URL = '/api/likes.php'

function RecommendPick({ t }) {
  if (!t.recommend) return null
  return (
    <div className="recommend-pick">
      <span className="pr-badge">{t.recommend.badge}</span>
      <p className="recommend-title">{t.recommend.title}</p>
      <p className="recommend-text">{t.recommend.description}</p>
      <a
        className="recommend-button"
        href={RECOMMEND_PICK_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        {t.recommend.buttonLabel}
      </a>
      <img src={RECOMMEND_PICK_PIXEL} alt="" width="1" height="1" style={{ position: 'absolute', width: 1, height: 1 }} />
    </div>
  )
}

// 言語切り替えボタン。日本語/英語をトグルする。
// 将来的に中国語・韓国語・タイ語を追加する際は、ここをドロップダウンに拡張する。
function LanguageSwitcher({ language, setLanguage }) {
  const nextLanguage = language === 'ja' ? 'en' : 'ja'
  const label = language === 'ja' ? 'EN' : '日本語'
  const currentText = uiText[language] || uiText.ja

  return (
    <button
      type="button"
      className="language-switcher"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={currentText.languageSwitcher.aria}
      title={currentText.languageSwitcher.label}
    >
      <span aria-hidden="true">🌐</span> {label}
    </button>
  )
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
  'oshikatsu-type': getBalancedTendencyIndex,
  'reply-type': getBalancedTendencyIndex,
  'crush-misread': getBalancedTendencyIndex,
  'dark-depth': getBalancedTendencyIndex,
}

const resultTypesByDiagnosisJa = {
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
  'oshikatsu-type': oshikatsuResultTypes,
  'reply-type': replyTypeResultTypes,
  'crush-misread': crushMisreadResultTypes,
  'dark-depth': darkDepthResultTypes,
}

const resultTypesByDiagnosisByLanguage = {
  ja: resultTypesByDiagnosisJa,
  get en() {
    return getEnPack()?.resultTypesByDiagnosisEn
  },
}

function getResultTitle(diagnosis, answers, score, maxScore, language = 'ja') {
  if (!diagnosis) return ''

  const scoreBand = Math.min(3, Math.floor((score / maxScore) * 4))
  const tendencyResolver = tendencyIndexResolvers[diagnosis.id]
  const resultTypes = (resultTypesByDiagnosisByLanguage[language] || resultTypesByDiagnosisJa)[diagnosis.id]

  if (tendencyResolver && resultTypes) {
    const tendencyIndex = tendencyResolver(answers)
    return resultTypes[scoreBand][tendencyIndex]
  }

  return diagnosis.results[scoreBand]
}

const characterCollectionsJa = {
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

const characterCollectionsByLanguage = {
  ja: characterCollectionsJa,
  get en() {
    return getEnPack()?.characterCollectionsEn
  },
}

function getCharacterCollection(diagnosisId, language = 'ja') {
  const characterCollections = characterCollectionsByLanguage[language] || characterCollectionsJa
  return characterCollections[diagnosisId] || null
}

function getCharacterForResult(diagnosisId, resultTitle, language = 'ja') {
  const characterCollection = getCharacterCollection(diagnosisId, language)
  return characterCollection?.characters[resultTitle] || null
}

function getCharacterImagePath(diagnosisId, resultTitle, savedImage = '', language = 'ja') {
  const characterCollection = getCharacterCollection(diagnosisId, language)
  const character = characterCollection?.characters[resultTitle] || null
  const currentImage = character && characterCollection
    ? `/characters/${characterCollection.basePath}/${character.imageKey}.webp`
    : ''

  return currentImage || savedImage
}

// 診断履歴は保存した時点の言語のテキストがそのまま入っている。
// 表示言語を切り替えた後でも診断タイトル・結果タイトル・キャラ名・説明文を
// 現在の言語で出し直せるように、resultTypesのグリッド上の位置(行・列)から
// 現在言語での結果タイトルを逆引きするヘルパー。
function findResultPosition(diagnosisId, resultTitle) {
  for (const lang of ['ja', 'en']) {
    const grid = resultTypesByDiagnosisByLanguage[lang]?.[diagnosisId]
    if (!grid) continue

    for (let row = 0; row < grid.length; row += 1) {
      const col = grid[row].indexOf(resultTitle)
      if (col !== -1) return { row, col }
    }
  }

  return null
}

function localizeHistoryEntry(item, language, diagnoses, resultDetails) {
  const diagnosisItem = diagnoses.find((entry) => entry.id === item.diagnosisId)
  const diagnosisTitle = diagnosisItem?.title || item.diagnosisTitle

  let resultTitle = item.resultTitle
  const position = findResultPosition(item.diagnosisId, item.resultTitle)
  if (position) {
    const grid = resultTypesByDiagnosisByLanguage[language]?.[item.diagnosisId]
    if (grid?.[position.row]?.[position.col]) {
      resultTitle = grid[position.row][position.col]
    }
  }

  const character = getCharacterForResult(item.diagnosisId, resultTitle, language)
  const characterName = character?.characterName || item.characterName || ''
  const characterImage = getCharacterImagePath(item.diagnosisId, resultTitle, item.characterImage, language)
  const resultDetail = resultDetails[item.diagnosisId]?.[resultTitle] || item.resultDetail || null

  return {
    ...item,
    diagnosisTitle,
    resultTitle,
    characterName,
    characterImage,
    resultDetail,
  }
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

function getGateTheme() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 16) return 'morning'
  if (hour >= 16 && hour < 19) return 'evening'
  return 'night'
}

function getShareUrl() {
  return `${window.location.origin}${window.location.pathname}`
}

// 結果ごとのシェアURL(OGタグ付き静的ページ /r/{diagnosisId}/{imageKey}/)を返す。
// このページは scripts/generate-share-pages.mjs がビルド時に生成する。
// キャラ情報が取れない場合はトップURLにフォールバック。
// 表示用の縮小キャラ画像パス(scripts/optimize-images.mjs が生成する /characters-small/ を参照)。
// 元画像(/characters/)はビルド時のOGP画像生成(scripts)用にローカルに残しているだけで、
// 本番では配信されない。ブラウザ実行時(表示・共有画像)は必ず /characters-small/ を使う。
function toDisplayImage(path) {
  return typeof path === 'string' ? path.replace('/characters/', '/characters-small/') : path
}

// 更新情報(トピックス)の日付表示ヘルパー。'2026-07-09' → '7/9'。
function formatTopicDate(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 直近(既定7日以内)の更新かどうか。NEWバッジの表示判定に使う。
function isRecentTopic(dateStr, days = 7) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return false
  return Date.now() - d.getTime() < days * 24 * 60 * 60 * 1000
}

// SNSアカウントのリンク(自動取得しないものはアイコンリンクのみ)。
const SNS_LINKS = [
  { id: 'x', label: 'X', url: 'https://x.com/shindanmura' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/shindanmura/?hl=ja' },
  { id: 'threads', label: 'Threads', url: 'https://www.threads.com/@shindanmura' },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61591359254588' },
  { id: 'note', label: 'note', url: 'https://note.com/shindanmura' },
]

// SNSアイコン(ブランドロゴのSVG)。noteだけは文字ロゴなので別扱い。
function SnsIcon({ id }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true }
  if (id === 'x') {
    return (
      <svg {...common}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    )
  }
  if (id === 'instagram') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" /></svg>
    )
  }
  if (id === 'threads') {
    return (
      <svg {...common}><path d="M12.19 21.5c-2.94-.02-5.2-1-6.71-2.9C4.14 16.9 3.5 14.66 3.5 12s.64-4.9 1.98-6.6C6.99 3.5 9.25 2.52 12.19 2.5c2.28.02 4.18.61 5.62 1.75 1.35 1.07 2.29 2.6 2.79 4.53l-1.94.53c-.85-3.09-2.9-4.6-6.47-4.62-2.34.02-4.06.75-5.13 2.16C6.06 8.2 5.55 9.9 5.55 12s.51 3.8 1.51 5.15c1.07 1.41 2.79 2.14 5.13 2.16 2.11-.02 3.5-.5 4.42-1.42.86-.85 1.29-1.94 1.29-3.07 0-.71-.14-1.34-.42-1.86-.44 1.03-1.16 1.82-2.15 2.35-.98.52-2.13.75-3.41.66-1.4-.1-2.53-.55-3.31-1.35-.7-.72-1.05-1.62-1-2.55.06-1.02.56-1.88 1.42-2.44.82-.53 1.9-.79 3.15-.75 1 .03 1.92.19 2.74.47-.05-.79-.31-1.4-.77-1.83-.5-.46-1.24-.7-2.19-.71-1.13 0-2.02.36-2.63 1.08l-1.54-1.24c.99-1.18 2.42-1.78 4.2-1.78 1.5.01 2.71.44 3.58 1.27.85.81 1.34 1.98 1.44 3.47.09.06.18.12.26.19 1.28 1.05 1.95 2.63 1.95 4.6 0 1.65-.65 3.24-1.88 4.45-1.31 1.29-3.24 1.96-5.86 1.98zm.83-9.02c-.94-.03-1.71.14-2.24.49-.4.26-.6.61-.62 1.05-.03.55.24.99.79 1.28.53.28 1.2.42 1.94.35 1.6-.14 2.6-1.1 2.86-2.83-.77-.29-1.66-.36-2.69-.34z" /></svg>
    )
  }
  if (id === 'facebook') {
    return (
      <svg {...common}><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.87h2.78l-.44 2.9h-2.34V22c4.78-.75 8.44-4.92 8.44-9.94z" /></svg>
    )
  }
  return null
}

function getResultShareUrl(diagnosisId, imageKey) {
  if (diagnosisId && imageKey) {
    return `${window.location.origin}/r/${diagnosisId}/${imageKey}/`
  }
  return getShareUrl()
}

// 画像Blobを、対応端末ではOSの共有シート経由でInstagramストーリーズ等に直接シェアし、
// 非対応の場合(主にPCブラウザ)は従来通りダウンロードにフォールバックする。
async function shareOrDownloadImageBlob(blob, filename) {
  if (blob && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: blob.type || 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
        return true
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        return true
      }
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return false
}

function getQrCodeImageUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(text)}`
}

function drawStoryQrCode(ctx, qrImage, storyText, centerX = 540, topY = 1590, size = 130) {
  ctx.drawImage(qrImage, centerX - size / 2, topY, size, size)

  ctx.fillStyle = '#8f4ed8'
  ctx.font = '700 24px system-ui, sans-serif'
  ctx.fillText(storyText.qrCaption, centerX, topY + size + 38)
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
  brandName = '診断村',
  hashtag = '#診断村',
  storyText = { qrCaption: '診断村へ', shareCaption: '診断結果をストーリーでシェアしてね', qrFallback: '診断村で検索' },
  shareUrl = '',
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
  ctx.fillText(brandName, 540, 200)

  ctx.fillStyle = '#29183a'
  ctx.font = '800 72px system-ui, sans-serif'
  ctx.fillText(headingLabel, 540, 310)

  ctx.fillStyle = '#ff69ad'
  ctx.font = '800 50px system-ui, sans-serif'
  ctx.fillText(resultTitle, 540, 410)

  if (characterImagePath) {
    try {
      // フルサイズ /characters/ は本番で配信されない(404)ため、
      // 実際に配信されている表示用の縮小画像(/characters-small/)を読み込む。
      const image = await loadImageAsync(toDisplayImage(characterImagePath))
      drawImageContain(ctx, image, 140, 520, 800, 800)
    } catch {
      ctx.fillStyle = '#8f4ed8'
      ctx.font = `800 ${fallbackFontSize}px system-ui, sans-serif`
      ctx.fillText(fallbackLabel, 540, 920)
    }
  }

  ctx.fillStyle = '#29183a'
  ctx.font = '800 54px system-ui, sans-serif'
  ctx.fillText(nameLine, 540, 1390)

  ctx.fillStyle = '#6f5c7d'
  ctx.font = '600 34px system-ui, sans-serif'
  ctx.fillText(subLine, 540, 1450)

  ctx.fillStyle = '#ff69ad'
  ctx.font = '800 42px system-ui, sans-serif'
  ctx.fillText(hashtag, 540, 1512)

  ctx.fillStyle = '#8c7a98'
  ctx.font = '600 28px system-ui, sans-serif'
  ctx.fillText(storyText.shareCaption, 540, 1558)

  try {
    const qrImage = await loadImageAsync(getQrCodeImageUrl(shareUrl || getShareUrl()))
    drawStoryQrCode(ctx, qrImage, storyText, 540, 1590, 130)
  } catch {
    ctx.fillStyle = '#8f4ed8'
    ctx.font = '700 24px system-ui, sans-serif'
    ctx.fillText(storyText.qrFallback, 540, 1660)
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

// Safariのプライベートブラウズモードや一部アプリ内ブラウザ(LINE等)では
// localStorageへのアクセス自体や書き込みが例外を投げることがある。
// ここで例外を握りつぶし、保存や履歴の読み書きが原因で画面が固まったり
// ループしたりしないようにする。
function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function App() {
  const [language, setLanguage] = useState(() => safeGetItem('shindanMuraLanguage') || 'ja')

  // 英語データの遅延読み込み。読み込み完了時に再レンダリングして英語表示へ切り替える。
  // (読み込みが終わるまでは各所の `|| ja` フォールバックにより日本語のまま表示される)
  const [, setEnPackVersion] = useState(0)
  useEffect(() => {
    if (language === 'en' && !getEnPack()) {
      loadEnPack().then(() => setEnPackVersion((version) => version + 1))
    }
  }, [language])
  const { categories, scenes, sceneSets, diagnoses, options, resultDetails, randomCommentPools } = dataByLanguage[language] || dataByLanguage.ja
  const t = uiText[language] || uiText.ja
  const currentLegalPages = legalPagesByLanguage[language] || legalPagesByLanguage.ja
  const currentAnswerComments = answerCommentsByLanguage[language] || answerCommentsByLanguage.ja
  const [selectedId, setSelectedId] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [hasEnteredVillage, setHasEnteredVillage] = useState(() => safeGetItem('shindanMuraEntered') === 'true')
  const [gateOpening, setGateOpening] = useState(false)
  const [showCharacterGuide, setShowCharacterGuide] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [legalPage, setLegalPage] = useState(null)
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const [activeScene, setActiveScene] = useState('all')
  // 更新情報(note の新着)。/api/topics.php(サーバー側で note RSS を中継)から取得する。
  const [topics, setTopics] = useState([])
  const [randomComments, setRandomComments] = useState({})
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [likedCharacterIds, setLikedCharacterIds] = useState(() => {
    try {
      return JSON.parse(safeGetItem('shindanMuraLikedCharacters')) || []
    } catch {
      return []
    }
  })
  const [characterLikeCounts, setCharacterLikeCounts] = useState(() => {
    try {
      return JSON.parse(safeGetItem('shindanMuraCharacterLikes')) || {}
    } catch {
      return {}
    }
  })
  const [diagnosisHistory, setDiagnosisHistory] = useState(() => {
    try {
      return JSON.parse(safeGetItem('shindanMuraHistory')) || []
    } catch {
      return []
    }
  })
  const diagnosis = diagnoses.find((item) => item.id === selectedId)
  const filteredDiagnoses = diagnoses.filter((item) => {
    if (item.hidden) return false
    const categoryMatched = activeCategory === categories[0] || item.category === activeCategory
    const sceneMatched = activeScene === 'all' || item.scenes.includes(activeScene)
    return categoryMatched && sceneMatched
  })
  const score = answers.reduce((sum, value) => sum + value, 0)
  const maxScore = diagnosis ? diagnosis.questions.length * 3 : 1
  const scoreBand = Math.min(3, Math.floor((score / maxScore) * 4))
  const resultTitle = getResultTitle(diagnosis, answers, score, maxScore, language)

  // カテゴリー/シーンの絞り込みは、カテゴリー一覧そのものが変わった時にリセットする。
  // 「言語切替時」だけでなく「英語データパックの遅延読み込み完了時」もここで拾える。
  // (英語で起動した場合、読み込み完了までは日本語カテゴリーで初期化されており、
  //  そのままだと英語カテゴリーと一致せず診断が0件表示になるため)
  // レンダー中にstateを調整する公式パターン。effect内でsetStateすると
  // cascading renderの警告が出るため、前回値との比較で行う。
  const [prevCategories, setPrevCategories] = useState(categories)
  if (categories !== prevCategories) {
    setPrevCategories(categories)
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0])
      setActiveScene('all')
    }
  }

  useEffect(() => {
    safeSetItem('shindanMuraLanguage', language)
  }, [language])

  // 起動時に一度だけ、サーバー(全員分の集計)から「いいね」数を取得してローカルの値を上書きする。
  // 取得できるまでの間はローカルキャッシュの値をそのまま表示しておく(チラつき防止)。
  useEffect(() => {
    fetch(LIKES_API_URL)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setCharacterLikeCounts(data)
          safeSetItem('shindanMuraCharacterLikes', JSON.stringify(data))
        }
      })
      .catch(() => {
        // 取得に失敗した場合はローカルキャッシュのまま表示を続ける。
      })
  }, [])

  // 画面が切り替わるたびにタブのタイトルを更新する。
  // GA4は自動計測でpushState/hashchangeのたびにページビューを送るが、
  // ページタイトルが常に固定だと「どの診断が見られているか」がレポート上で区別できない。
  // ここでタイトルを都度変えることで、GA4のレポートで診断ごとの閲覧数を追えるようにする。
  useEffect(() => {
    const baseTitle = language === 'en'
      ? 'Shindan Mura | Free Love Quizzes, Personality Tests & Fun Quizzes'
      : '診断村｜無料で遊べる恋愛診断・性格診断・心理テスト'
    let nextTitle = baseTitle

    if (legalPage && currentLegalPages[legalPage]) {
      nextTitle = `${currentLegalPages[legalPage].title} | ${t.brandName}`
    } else if (showCharacterGuide) {
      nextTitle = `${t.characterGuide.title} | ${t.brandName}`
    } else if (showAllHistory) {
      nextTitle = `${t.historyList.title} | ${t.brandName}`
    } else if (selectedHistory) {
      nextTitle = `${selectedHistory.resultTitle} | ${selectedHistory.diagnosisTitle} | ${t.brandName}`
    } else if (diagnosis) {
      nextTitle = showResult
        ? `${resultTitle} | ${diagnosis.title} | ${t.brandName}`
        : `${diagnosis.title} | ${t.brandName}`
    }

    document.title = nextTitle
  }, [diagnosis, legalPage, showCharacterGuide, showAllHistory, selectedHistory, showResult, resultTitle, language, t, currentLegalPages])

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
    setActiveCategory(categories[0])
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

    // 楽観的更新: まずローカルの見た目とキャッシュを即時反映する。
    setLikedCharacterIds(nextLikedCharacterIds)
    setCharacterLikeCounts(nextCharacterLikeCounts)
    safeSetItem('shindanMuraLikedCharacters', JSON.stringify(nextLikedCharacterIds))
    safeSetItem('shindanMuraCharacterLikes', JSON.stringify(nextCharacterLikeCounts))

    // サーバー側(全員分の集計)にも反映する。失敗してもローカルの見た目はそのまま維持し、
    // 次回のGET取得時に実際の集計値へ静かに補正される。
    fetch(LIKES_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, action: alreadyLiked ? 'unlike' : 'like' }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && typeof data.likeCount === 'number') {
          setCharacterLikeCounts((current) => {
            const merged = { ...current, [characterId]: data.likeCount }
            safeSetItem('shindanMuraCharacterLikes', JSON.stringify(merged))
            return merged
          })
        }
      })
      .catch(() => {
        // オフライン等で失敗した場合は何もしない(ローカルの楽観的更新のまま)。
      })
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
    safeSetItem('shindanMuraHistory', JSON.stringify(nextHistory))
  }

  const gateTheme = getGateTheme()

  const allCharacterItems = diagnoses.flatMap((diagnosisItem) => {
    if (diagnosisItem.hidden) return []
    const characterCollection = getCharacterCollection(diagnosisItem.id, language)

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

  // 診断リスト(コンパクトカード)用の代表キャラ。各診断の先頭キャラを「表紙」にする。
  const coverCharacterByDiagnosis = {}
  for (const character of allCharacterItems) {
    if (!coverCharacterByDiagnosis[character.diagnosisId]) {
      coverCharacterByDiagnosis[character.diagnosisId] = character
    }
  }

  const enterVillage = () => {
    setGateOpening(true)

    setTimeout(() => {
      safeSetItem('shindanMuraEntered', 'true')
      setHasEnteredVillage(true)
      setGateOpening(false)
      window.history.pushState(null, '', '#home')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 900)
  }

  // 更新情報(note の新着)を取得。取得できなくてもSNSリンクだけは表示する。
  useEffect(() => {
    let active = true
    fetch('/api/topics.php')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.items)) {
          setTopics(data.items)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      const rawHash = window.location.hash
      const hash = rawHash || '#home'

      if (!rawHash && safeGetItem('shindanMuraEntered') !== 'true') {
        return
      }

      if (rawHash && rawHash !== '#') {
        safeSetItem('shindanMuraEntered', 'true')
        setHasEnteredVillage(true)
      }

      if (hash === '#privacy' || hash === '#contact' || hash === '#operator') {
        setSelectedId(null)
        setShowResult(false)
        setAnswers([])
        setRandomComments({})
        setSelectedHistory(null)
        setShowCharacterGuide(false)
        setShowAllHistory(false)
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
        setShowAllHistory(false)
        setShowCharacterGuide(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      if (hash === '#history-list') {
        setSelectedId(null)
        setShowResult(false)
        setAnswers([])
        setRandomComments({})
        setSelectedHistory(null)
        setLegalPage(null)
        setShowCharacterGuide(false)
        setShowAllHistory(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      if (hash.startsWith('#diagnosis=')) {
        const nextId = decodeURIComponent(hash.replace('#diagnosis=', ''))
        setSelectedHistory(null)
        setShowCharacterGuide(false)
        setShowAllHistory(false)
        startDiagnosis(nextId, false)
        return
      }

      if (hash.startsWith('#history=')) {
        const historyId = decodeURIComponent(hash.replace('#history=', ''))
        let savedHistory
        try {
          savedHistory = JSON.parse(safeGetItem('shindanMuraHistory')) || []
        } catch {
          savedHistory = []
        }

        const historyItem = savedHistory.find((item) => item.id === historyId)

        if (historyItem) {
          setSelectedId(null)
          setShowResult(false)
          setAnswers([])
          setRandomComments({})
          setShowCharacterGuide(false)
          setShowAllHistory(false)
          setSelectedHistory(localizeHistoryEntry(historyItem, language, diagnoses, resultDetails))
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
      setShowAllHistory(false)
    }

    syncRoute()
    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)

    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  if (!hasEnteredVillage) {
    return (
      <main className={`gate-page gate-${gateTheme} ${gateOpening ? 'gate-opening' : ''}`}>
        <section className="village-gate-card">
          <LanguageSwitcher language={language} setLanguage={setLanguage} />

          <div className="gate-sky">
            <div className="gate-moon" />
            <div className="gate-sun" />
            <div className="gate-stars" />
          </div>

          <div className="gate-sign">{t.brandName}</div>

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
            {t.gate.enterButton}
          </button>

          <p className="gate-caption">
            {t.gate.caption}
          </p>
        </section>
      </main>
    )
  }

  if (legalPage && currentLegalPages[legalPage]) {
    const page = currentLegalPages[legalPage]

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
          {t.backToVillage}
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
          {t.backToVillage}
        </button>

        <section className="hero detail character-guide-hero">
          <p className="label">{t.characterGuide.label}</p>
          <h1>{t.characterGuide.title}</h1>
          <p>{t.characterGuide.lead}</p>
        </section>

        <section className="character-guide-grid">
          {allCharacterItems.map((character) => (
            <article className="character-guide-card" key={character.id}>
              <div className="character-guide-image-wrap">
                <img
                  src={toDisplayImage(character.image)}
                  alt={`${character.characterName} - ${character.diagnosisTitle} | ${t.brandName}`}
                  className="character-guide-image"
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="427"
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
                    {t.characterGuide.startButton}
                  </button>
                  <button
                    className={likedCharacterIds.includes(character.id) ? 'like-button liked' : 'like-button'}
                    type="button"
                    onClick={() => toggleCharacterLike(character.id)}
                  >
                    {likedCharacterIds.includes(character.id) ? t.characterGuide.likeOn : t.characterGuide.likeOff}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    )
  }

  if (showAllHistory) {
    return (
      <main className="app">
        <button
          className="back"
          onClick={() => {
            window.history.pushState(null, '', '#home')
            setShowAllHistory(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          {t.backToVillage}
        </button>

        <section className="hero detail">
          <p className="label">{t.historyList.label}</p>
          <h1>{t.historyList.title}</h1>
        </section>

        {diagnosisHistory.length === 0 ? (
          <p className="history-empty">{t.historyList.empty}</p>
        ) : (
          <section className="history-panel">
            <div className="history-list">
              {diagnosisHistory.map((item) => {
                const localizedItem = localizeHistoryEntry(item, language, diagnoses, resultDetails)

                return (
                  <button
                    className="history-item"
                    key={item.id}
                    onClick={() => {
                      window.history.pushState(null, '', `#history=${item.id}`)
                      setSelectedHistory(localizedItem)
                      setShowAllHistory(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    {localizedItem.characterImage && (
                      <img
                        src={toDisplayImage(localizedItem.characterImage)}
                        alt={localizedItem.characterName || localizedItem.resultTitle}
                        loading="lazy"
                        decoding="async"
                        width="640"
                        height="427"
                      />
                    )}

                    <span>
                      <small>{localizedItem.diagnosisTitle}</small>
                      <strong>{localizedItem.resultTitle}</strong>
                      {localizedItem.characterName && <em>{localizedItem.characterName}</em>}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <AdBanner />
      </main>
    )
  }

  if (selectedHistory) {
    const historyCharacter = getCharacterForResult(selectedHistory.diagnosisId, selectedHistory.resultTitle, language)
    const historyCharacterImage = getCharacterImagePath(
      selectedHistory.diagnosisId,
      selectedHistory.resultTitle,
      selectedHistory.characterImage,
      language,
    )
    const historyCharacterName = selectedHistory.characterName || historyCharacter?.characterName || ''
    const historyResultDetail = selectedHistory.resultDetail || resultDetails[selectedHistory.diagnosisId]?.[selectedHistory.resultTitle] || null
    const historyShareUrl = getResultShareUrl(selectedHistory.diagnosisId, historyCharacter?.imageKey)

    const createHistoryStoryImage = () => createResultStoryBlob({
      headingLabel: t.history.label,
      resultTitle: selectedHistory.resultTitle,
      nameLine: historyCharacterName || selectedHistory.resultTitle,
      subLine: selectedHistory.diagnosisTitle,
      characterImagePath: historyCharacterImage,
      fallbackLabel: t.brandName,
      fallbackFontSize: 90,
      brandName: t.brandName,
      hashtag: t.hashtag,
      storyText: t.storyImage,
      shareUrl: historyShareUrl,
    })

    const shareHistoryStoryImage = async () => {
      try {
        const blob = await createHistoryStoryImage()

        if (!blob) {
          alert(t.diagnosis.imageFailAlert)
          return
        }

        await shareOrDownloadImageBlob(blob, 'shindan-mura-history-story.png')
      } catch {
        alert(t.diagnosis.storyImageFailAlert)
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
          {t.backToHistory}
        </button>

        <section className="result">
          <p className="label">{t.history.label}</p>
          <h2>{selectedHistory.resultTitle}</h2>
          <p>{t.history.resultLine(selectedHistory.diagnosisTitle, selectedHistory.resultTitle)}</p>

          {historyCharacterImage && (
            <div className="character-card">
              <div className="character-portrait">
                <img
                  src={toDisplayImage(historyCharacterImage)}
                  alt={historyCharacterName || selectedHistory.resultTitle}
                  className="character-image"
                  decoding="async"
                  width="640"
                  height="427"
                />
              </div>
              <div className="character-copy">
                <p className="label">{t.history.characterLabel}</p>
                <h3>{historyCharacterName || selectedHistory.resultTitle}</h3>
                <strong>{selectedHistory.diagnosisTitle}</strong>
                <p>{t.history.savedNote}</p>
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

          {language === 'ja' && <RecommendPick t={t} />}

          <div className="share">{t.history.resultSentence(selectedHistory.diagnosisTitle, selectedHistory.resultTitle)}{t.hashtag}</div>

          <div className="share-primary">
            <button className="share-button story" onClick={shareHistoryStoryImage}>
              <IconStoryImage />
              {t.diagnosis.storyImageButton}
            </button>
          </div>

          <div className="share-icon-row" role="group" aria-label={t.diagnosis.shareAria}>
            <button
              className="icon-button copy"
              type="button"
              aria-label={t.diagnosis.copyAria}
              title={t.diagnosis.copyAria}
              onClick={async () => {
                const text = `${t.history.resultSentence(selectedHistory.diagnosisTitle, selectedHistory.resultTitle)}\n${historyResultDetail?.description || ''}\n${t.hashtag}\n${historyShareUrl}`
                await navigator.clipboard.writeText(text)
                alert(t.history.copyAlert)
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
              {t.history.backButton}
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
    const currentCharacterCollection = getCharacterCollection(diagnosis.id, language)
    const currentCharacter = currentCharacterCollection?.characters[resultTitle] || null
    const resultShareUrl = getResultShareUrl(diagnosis.id, currentCharacter?.imageKey)
    const shareText = `${t.diagnosis.resultSentence(diagnosis.title, resultTitle)}\n${currentCharacter ? `${t.diagnosis.characterLinePrefix}${currentCharacter.characterName}\n` : ''}${currentResultDetail?.description || ''}\n${t.hashtag}\n${resultShareUrl}`

    const copyShareText = async () => {
      await navigator.clipboard.writeText(shareText)
      alert(t.diagnosis.copyAlert)
    }

    const shareToX = () => {
      // Xは280文字が上限で、日本語などの全角文字は2文字分としてカウントされる。
      // shareTextには診断結果の説明文まで含まれており、長い結果だとXの上限を
      // 超えて投稿できないことがあるため、X共有専用に説明文を省いた短い文言を使う。
      const xShareText = `${t.diagnosis.resultSentence(diagnosis.title, resultTitle)}
${currentCharacter ? `${t.diagnosis.characterLinePrefix}${currentCharacter.characterName}
` : ''}${t.hashtag}
${resultShareUrl}`
      const text = encodeURIComponent(xShareText)
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    }

    const shareToLine = () => {
      // 旧来のsocial-plugins.line.me/lineit/shareは、LINEアプリへの受け渡し処理の途中で
      // ブラウザのプライベートモード等ではCookie/セッションが正しく引き継がれず、
      // アプリ起動⇔ブラウザ表示を行き来する無限ループになる報告があるため、
      // より単純で直接的な「LINEでメッセージを送る」形式のURLに変更する。
      const text = encodeURIComponent(shareText)
      window.open(`https://line.me/R/msg/text/?${text}`, '_blank')
    }

    const createStoryImage = () => createResultStoryBlob({
      headingLabel: t.diagnosis.resultHeading,
      resultTitle,
      nameLine: currentCharacter?.characterName || diagnosis.title,
      subLine: diagnosis.title,
      characterImagePath: currentCharacter && currentCharacterCollection
        ? `/characters/${currentCharacterCollection.basePath}/${currentCharacter.imageKey}.webp`
        : '',
      fallbackLabel: diagnosis.emoji,
      fallbackFontSize: 120,
      brandName: t.brandName,
      hashtag: t.hashtag,
      storyText: t.storyImage,
      shareUrl: resultShareUrl,
    })

    const shareStoryImage = async () => {
      try {
        const blob = await createStoryImage()

        if (!blob) {
          alert(t.diagnosis.imageFailAlert)
          return
        }

        await shareOrDownloadImageBlob(blob, 'shindan-mura-story.png')
      } catch {
        alert(t.diagnosis.storyImageFailAlert)
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
          {t.backToVillage}
        </button>

        <section className="hero detail">
          <div className="emoji">{diagnosis.emoji}</div>
          <p className="label">{diagnosis.category}</p>
          <h1>{diagnosis.title}</h1>
          <p>{diagnosis.description}</p>
        </section>

        {!showResult ? (
          <section className="panel">
            <div className="progress">{t.diagnosis.progress(answeredCount, diagnosis.questions.length)}</div>

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
                    {randomComments[index] || currentAnswerComments[diagnosis.id]?.[answers[index]]}
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
              {t.diagnosis.seeResultButton}
            </button>
          </section>
        ) : (
          <section className="result">
            <p className="label">{t.diagnosis.scoreLabel(score, maxScore)}</p>
            <h2 style={currentCharacter ? getReplyTypeFontStyle(currentCharacter.imageKey) : undefined}>{resultTitle}</h2>
            <p>{t.diagnosis.resultLine(diagnosis.title, resultTitle)}</p>

            {currentCharacter && (
              <div className="character-card">
                <div className={`character-portrait ${currentCharacter.imageKey}`}>
                  <img
                    src={toDisplayImage(`/characters/${currentCharacterCollection.basePath}/${currentCharacter.imageKey}.webp`)}
                    alt={`${currentCharacter.characterName} - ${diagnosis.title} | ${t.brandName}`}
                    className="character-image"
                    decoding="async"
                    width="640"
                    height="427"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div className="character-copy">
                  <p className="label">{t.diagnosis.characterLabel}</p>
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

            {language === 'ja' && <RecommendPick t={t} />}

            <div className="share">{t.diagnosis.resultSentence(diagnosis.title, resultTitle)}{t.hashtag}</div>

            <div className="share-primary">
              <button className="share-button story" onClick={shareStoryImage}>
                <IconStoryImage />
                {t.diagnosis.storyImageButton}
              </button>
            </div>

            <div className="share-icon-row" role="group" aria-label={t.diagnosis.shareAria}>
              <button className="icon-button x" type="button" onClick={shareToX} aria-label={t.diagnosis.shareXAria} title={t.diagnosis.shareXAria}>
                <IconX />
              </button>
              <button className="icon-button line" type="button" onClick={shareToLine} aria-label={t.diagnosis.shareLineAria} title={t.diagnosis.shareLineAria}>
                <IconLine />
              </button>
              <button className="icon-button copy" type="button" onClick={copyShareText} aria-label={t.diagnosis.copyAria} title={t.diagnosis.copyAria}>
                <IconCopy />
              </button>
            </div>

            <AdBanner />

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
                {t.diagnosis.otherDiagnosesButton}
              </button>
              <button className="primary" onClick={() => startDiagnosis(diagnosis.id)}>{t.diagnosis.retryButton}</button>
            </div>
          </section>
        )}
      </main>
    )
  }

  return (
    <main className={`app top-app top-${gateTheme}`}>
      <section className="hero top-hero">
        <LanguageSwitcher language={language} setLanguage={setLanguage} />
        <div className="top-hero-copy">
          <h1>{t.home.heroTitle}</h1>
          <p>{t.home.heroSubtitle}</p>
          <div className="top-hero-actions">
            <button className="primary hero-primary" onClick={() => startDiagnosis('menhera-level')}>{t.home.startPopularButton}</button>
            <button className="share-button" onClick={() => {
              window.history.pushState(null, '', '#guide')
              setShowCharacterGuide(true)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}>{t.home.viewGuideButton}</button>
          </div>
        </div>
        <div className="top-hero-card village-welcome-sign">
          <span>🌿</span>
          <strong>{t.home.welcomeSignTitle}</strong>
          <p>{t.home.welcomeSignText}</p>
        </div>
      </section>

      <section className="home-updates">
        <div className="home-social">
          <span className="home-social-label">{language === 'en' ? 'Follow 診断村' : 'SNSでも診断村'}</span>
          <div className="home-social-icons">
            {SNS_LINKS.map((sns) => (
              <a
                key={sns.id}
                className={sns.id === 'note' ? 'sns-link sns-note' : 'sns-link'}
                href={sns.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={sns.label}
              >
                {sns.id === 'note' ? 'note' : <SnsIcon id={sns.id} />}
              </a>
            ))}
          </div>
        </div>

        {topics.length > 0 && (
          <div className="home-topics">
            <div className="home-topics-head">
              <h2>{language === 'en' ? 'Updates' : '更新情報'}</h2>
              <span className="home-topics-auto">{language === 'en' ? 'auto from note' : 'note 自動更新'}</span>
            </div>
            <ul className="home-topics-list">
              {topics.map((topic) => (
                <li key={topic.url}>
                  <a href={topic.url} target="_blank" rel="noopener noreferrer">
                    <span className="topic-date">{formatTopicDate(topic.date)}</span>
                    <span className="topic-source">{topic.source}</span>
                    <span className="topic-title">{topic.title}</span>
                    {isRecentTopic(topic.date) && <span className="topic-new">NEW</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>


      <section className="panel intro top-intro">
        <h2>{t.home.introTitle}</h2>
        <p>{t.home.introText}</p>
      </section>

      <section className="top-feature-grid">
        <h2 className="top-feature-grid-title">{t.home.situationSearchTitle}</h2>
        {t.home.featureCards.map((card) => (
          <button className="top-feature-card" key={card.diagnosisId} onClick={() => startDiagnosis(card.diagnosisId)}>
            <span>{card.emoji}</span>
            <strong>{card.title}</strong>
            <p>{card.text}</p>
          </button>
        ))}
      </section>

      <section className="popular-ranking-panel">
        <div className="history-head">
          <div>
            <p className="label">{t.home.popularRankingLabel}</p>
            <h2>{t.home.popularRankingTitle}</h2>
          </div>
          <button className="reset" onClick={() => {
            window.history.pushState(null, '', '#guide')
            setShowCharacterGuide(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}>{t.home.viewGuideButton}</button>
        </div>

        <div className="popular-character-list">
          {popularCharacterRanking.map((character, index) => (
            <article className="popular-character-item" key={character.id}>
              <button className="popular-character-main" type="button" onClick={() => startDiagnosis(character.diagnosisId)}>
                <em>{index + 1}</em>
                <img
                  src={toDisplayImage(character.image)}
                  alt={`${character.characterName} - ${character.diagnosisTitle} | ${t.brandName}`}
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="427"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
                <span>
                  <strong>{character.characterName}</strong>
                  <small>{character.diagnosisTitle}</small>
                  <small>{character.likeCount}{t.home.likeCountSuffix}</small>
                </span>
              </button>
              <button
                className={character.isLiked ? 'like-button liked' : 'like-button'}
                type="button"
                onClick={() => toggleCharacterLike(character.id)}
              >
                {character.isLiked ? t.characterGuide.likeOn : t.characterGuide.likeOff}
              </button>
            </article>
          ))}
        </div>
      </section>

      {diagnosisHistory.length > 0 && (
        <section className="history-panel">
          <div className="history-head">
            <div>
              <p className="label">{t.home.historyLabel}</p>
              <h2>{t.home.historyTitle}</h2>
            </div>
            {diagnosisHistory.length > 2 && (
              <button
                className="reset"
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '#history-list')
                  setShowAllHistory(true)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                {t.home.historyMoreButton}
              </button>
            )}
          </div>

          <div className="history-list">
            {diagnosisHistory.slice(0, 2).map((item) => {
              const localizedItem = localizeHistoryEntry(item, language, diagnoses, resultDetails)

              return (
                <button
                  className="history-item"
                  key={item.id}
                  onClick={() => {
                    window.history.pushState(null, '', `#history=${item.id}`)
                    setSelectedHistory(localizedItem)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  {localizedItem.characterImage && (
                    <img
                      src={toDisplayImage(localizedItem.characterImage)}
                      alt={localizedItem.characterName || localizedItem.resultTitle}
                      loading="lazy"
                      decoding="async"
                      width="640"
                      height="427"
                    />
                  )}

                  <span>
                    <small>{localizedItem.diagnosisTitle}</small>
                    <strong>{localizedItem.resultTitle}</strong>
                    {localizedItem.characterName && <em>{localizedItem.characterName}</em>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="filter-panel">
        <div className="filter-block">
          <h2>{t.home.categoryFilterTitle}</h2>
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
          <h2>{t.home.sceneFilterTitle}</h2>
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
          <p className="label">{t.home.listLabel}</p>
          <h2>{t.home.listTitle(filteredDiagnoses.length)}</h2>
        </div>
        <button className="reset" onClick={resetFilters}>{t.home.resetButton}</button>
      </section>

      <section className="grid compact-grid">
        {filteredDiagnoses.map((item) => {
          const cover = coverCharacterByDiagnosis[item.id]
          const liked = cover ? likedCharacterIds.includes(cover.id) : false
          return (
            <article className={`card ${item.id}`} key={item.id}>
              <button className="card-main" type="button" onClick={() => startDiagnosis(item.id)}>
                {cover ? (
                  <img
                    className="card-thumb"
                    src={toDisplayImage(cover.image)}
                    alt={`${item.title} | ${t.brandName}`}
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="427"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="emoji">{item.emoji}</span>
                )}
                <span className="label">{item.category}</span>
                <strong>{item.title}</strong>
              </button>
              {cover && (
                <button
                  className={liked ? 'card-like liked' : 'card-like'}
                  type="button"
                  aria-label={liked ? t.characterGuide.likeOn : t.characterGuide.likeOff}
                  onClick={() => toggleCharacterLike(cover.id)}
                >
                  {liked ? '♥' : '♡'}
                </button>
              )}
            </article>
          )
        })}
      </section>

      {/* SEO用のサイト紹介文(検索エンジン向けの自然なテキスト。デザインは控えめに) */}
      <section className="about-site">
        <h2>{language === 'en' ? 'About Shindan Mura' : '診断村について'}</h2>
        <p>
          {language === 'en'
            ? 'Shindan Mura is a free quiz and personality-test site. Enjoy love quizzes, personality quizzes, and more with cute original characters — just answer a few simple questions to discover your type.'
            : '診断村は、無料で遊べる診断・心理テストのサイトです。恋愛診断、性格診断、こじらせ診断、裏人格診断など、さまざまな診断をかわいいオリジナルキャラクターと一緒に楽しめます。かんたんな質問に答えるだけで、あなたの性格タイプや恋愛傾向をチェックできます。'}
        </p>
      </section>

      <AdBanner />

      <footer className="copyright-footer">
        <nav className="footer-links" aria-label={t.legalNav}>
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '#privacy')
              setLegalPage('privacy')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            {t.footerLinks.privacy}
          </button>
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '#contact')
              setLegalPage('contact')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            {t.footerLinks.contact}
          </button>
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '#operator')
              setLegalPage('operator')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            {t.footerLinks.operator}
          </button>
        </nav>
        <p>{t.footerCopyright}</p>
      </footer>

      <nav className="bottom-nav" aria-label={t.bottomNav.aria}>
        <button type="button" onClick={() => window.history.pushState(null, '', '#home')}><span>🏠</span><strong>{t.bottomNav.home}</strong></button>
        <button type="button" onClick={() => document.querySelector('.filter-panel')?.scrollIntoView({ behavior: 'smooth' })}><span>🔍</span><strong>{t.bottomNav.search}</strong></button>
        <button type="button" className="bottom-nav-main" onClick={() => startDiagnosis('menhera-level')}><span>🧩</span><strong>{t.bottomNav.diagnose}</strong></button>
        <button
          type="button"
          onClick={() => {
            window.history.pushState(null, '', '#guide')
            setShowCharacterGuide(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <span>👤</span><strong>{t.bottomNav.guide}</strong>
        </button>
        <button type="button" onClick={() => document.querySelector('.grid')?.scrollIntoView({ behavior: 'smooth' })}><span>☰</span><strong>{t.bottomNav.menu}</strong></button>
      </nav>
    </main>
  )
}

export default App
// SNS(X)に毎日投稿する「運命数別 今日の運勢ランキング」を作る。
// 日付だけで決まるので、同じ日なら何度作っても同じ順位になる。
import { hashString, seededRandom } from './fortune.js'

export const SITE_NUMBER_URL = 'https://kanteimura.com/#/birthday'
export const HASHTAGS = ['#占い', '#今日の運勢', '#数秘術']

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const COLORS = ['ローズピンク', 'ラベンダー', 'ミントグリーン', 'レモンイエロー', 'スカイブルー', 'ネイビー', 'ホワイト', 'ゴールド', 'シルバー', 'テラコッタ', 'ボルドー', 'ベージュ']

// 順位のグループ(上位・中位・下位)ごとのひとこと。日付で選ぶ
const MESSAGES = {
  top: [
    '思いきった一歩が幸運を呼ぶ日',
    'うれしい知らせが届きそう',
    '直感がさえわたる1日',
    '人とのつながりが運を開く',
    'がんばりが形になりやすい日',
    'ひらめきを行動に移すと吉',
    '笑顔がさらに幸運を引き寄せる',
    '新しいことを始めるのに最適',
  ],
  middle: [
    'いつも通りが一番の開運',
    '小さな親切が返ってくる日',
    '話を聞く側に回ると吉',
    '寄り道で良い発見がありそう',
    '早めの行動で余裕が生まれる',
    '身の回りを整えると運気アップ',
    '好きなものに触れて充電を',
    '感謝を言葉にすると吉',
  ],
  bottom: [
    '無理せずペースを守って',
    '深呼吸で気持ちをリセット',
    '早寝で運気を立て直そう',
    '慎重さが身を守る日',
    '温かい飲み物でひと休みを',
    '焦らず確認を大切に',
    '人に頼るのも立派な開運',
    'ていねいな言葉づかいが吉',
  ],
}

// 下位の人へのラッキーアクション
const ACTIONS = [
  '朝に窓を開けて深呼吸',
  '机の上を5分だけ片付ける',
  '誰かに「ありがとう」を伝える',
  'いつもと違う道を歩く',
  '空を見上げる',
  '水をたくさん飲む',
  '好きな音楽を1曲聴く',
  '早めにお風呂に入る',
]

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)]
}

function group(rank) {
  if (rank <= 3) return 'top'
  if (rank <= 6) return 'middle'
  return 'bottom'
}

// dateText は 'YYYY-MM-DD'
export function dailyRanking(dateText) {
  const rand = seededRandom(hashString(`sns-ranking:${dateText}`))
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
  }
  const used = new Set()
  return numbers.map((number, index) => {
    const rank = index + 1
    const kind = group(rank)
    let message = pick(rand, MESSAGES[kind])
    // 同じひとことが重ならないようにする
    while (used.has(message)) message = pick(rand, MESSAGES[kind])
    used.add(message)
    return {
      rank,
      number,
      stars: rank <= 1 ? 5 : rank <= 3 ? 4 : rank <= 6 ? 3 : 2,
      message,
      color: pick(rand, COLORS),
      action: kind === 'bottom' ? pick(rand, ACTIONS) : null,
    }
  })
}

export function dateLabel(dateText) {
  const [y, m, d] = dateText.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  return `${m}月${d}日(${weekday})`
}

// X の文字数(日本語などは2、英数字は1として数え、280まで)。URLは23として数える
export function xWeightedLength(text) {
  const withoutUrls = text.replace(/https?:\/\/\S+/g, '')
  const urlCount = (text.match(/https?:\/\/\S+/g) || []).length
  let length = urlCount * 23
  for (const ch of withoutUrls) {
    const code = ch.codePointAt(0)
    const light = code <= 0x10ff || (code >= 0x2000 && code <= 0x200d) || (code >= 0x2010 && code <= 0x201f) || (code >= 0x2032 && code <= 0x2037)
    length += light ? 1 : 2
  }
  return length
}

export function postText(dateText, ranking = dailyRanking(dateText)) {
  const medals = ['👑', '🥈', '🥉']
  const last = ranking[ranking.length - 1]
  const lines = [
    `🔮${dateLabel(dateText)} 今日の運勢ランキング`,
    '',
    ...ranking.slice(0, 3).map((r, i) => `${medals[i]}${r.rank}位 運命数${r.number}${i === 0 ? `:${r.message}` : ''}`),
    '',
    `9位の運命数${last.number}さんは「${last.action}」で運気アップ✨`,
    '',
    'あなたの運命数はこちら👇',
    SITE_NUMBER_URL,
    HASHTAGS.join(' '),
  ]
  return lines.join('\n')
}

export function intentUrl(text) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`
}

export const INSTAGRAM_HASHTAGS = ['#占い', '#今日の運勢', '#数秘術', '#運命数', '#開運', '#スピリチュアル', '#運勢', '#占い好きな人と繋がりたい', '#鑑定村']

// Instagram 用の文章。リンクは押せないので、プロフィールのリンクへ案内する
export function instagramText(dateText, ranking = dailyRanking(dateText)) {
  const medals = ['👑', '🥈', '🥉']
  const last = ranking[ranking.length - 1]
  const lines = [
    `🔮${dateLabel(dateText)} 運命数別 今日の運勢`,
    '',
    ...ranking.map((r, i) => `${medals[i] || '・'}${r.rank}位 運命数${r.number}:${r.message}(ラッキーカラー:${r.color})`),
    '',
    `9位の運命数${last.number}さんは「${last.action}」で運気アップ✨`,
    '※運命数11・22・33の人は、2・4・6を見てください',
    '',
    '自分の運命数は、生年月日を足して出す数です。',
    'プロフィールのリンク(鑑定村)から無料で調べられます🔮',
    '毎日ひけるおみくじもあります⛩',
    '',
    INSTAGRAM_HASHTAGS.join(' '),
  ]
  return lines.join('\n')
}

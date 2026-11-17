// X投稿用の「運命数別 今日の運勢ランキング」画像と文章を作るページ(運営者用・日本語のみ)。
// メニューには出さず、kanteimura.com/#/sns で開く。
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatDate } from './fortune'
import { TAROT_ROMAN, dailyRanking, dailyTarotIndex, dateLabel, instagramText, intentUrl, postText, tarotInstagramText, tarotPostText, xWeightedLength } from './sns'

const W = 1080
const H = 1350
const GOLD = '#e8c26a'
const TEXT = '#f5ecd6'
const MUTED = '#b9acd6'
const FONT = '"Hiragino Mincho ProN", "Yu Mincho", "IPAPMincho", "Noto Serif JP", serif'

function addDays(dateText, days) {
  const [y, m, d] = dateText.split('-').map(Number)
  return formatDate(new Date(y, m - 1, d + days))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawStar(ctx, cx, cy, size, fill) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? size : size * 0.45
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
  }
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

function drawRanking(canvas, dateText, ranking) {
  const ctx = canvas.getContext('2d')
  drawBackground(ctx)

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = MUTED
  ctx.font = `600 40px ${FONT}`
  ctx.fillText(dateLabel(dateText), W / 2, 80)
  ctx.fillStyle = GOLD
  ctx.font = `700 70px ${FONT}`
  ctx.fillText('運命数別 今日の運勢', W / 2, 160)

  const top = 230
  const rowH = 108
  ranking.forEach((r, i) => {
    const y = top + i * rowH
    const highlight = r.rank <= 3
    roundRect(ctx, 60, y, W - 120, rowH - 14, 22)
    ctx.fillStyle = highlight ? 'rgba(232,194,106,0.16)' : 'rgba(0,0,0,0.28)'
    ctx.fill()
    if (highlight) {
      ctx.strokeStyle = 'rgba(232,194,106,0.6)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    const cy = y + (rowH - 14) / 2
    // 順位
    ctx.textAlign = 'center'
    ctx.fillStyle = highlight ? GOLD : MUTED
    ctx.font = `700 ${highlight ? 50 : 42}px ${FONT}`
    ctx.fillText(`${r.rank}位`, 140, cy)
    // 運命数
    ctx.textAlign = 'left'
    ctx.fillStyle = TEXT
    ctx.font = `700 46px ${FONT}`
    ctx.fillText(`運命数${r.number}`, 225, cy - 18)
    ctx.fillStyle = MUTED
    ctx.font = `500 30px ${FONT}`
    ctx.fillText(r.message, 225, cy + 26)
    // 星
    for (let s = 0; s < 5; s++) {
      drawStar(ctx, W - 300 + s * 46, cy - 16, 18, s < r.stars ? GOLD : 'rgba(255,255,255,0.18)')
    }
    ctx.textAlign = 'right'
    ctx.fillStyle = MUTED
    ctx.font = `500 26px ${FONT}`
    ctx.fillText(`🎨 ${r.color}`, W - 90, cy + 26)
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = MUTED
  ctx.font = `500 28px ${FONT}`
  ctx.fillText('※運命数11・22・33の人は、2・4・6を見てください', W / 2, H - 120)
  ctx.fillStyle = GOLD
  ctx.font = `700 36px ${FONT}`
  ctx.fillText('自分の運命数は 鑑定村 kanteimura.com', W / 2, H - 62)
}

// 日本語の文章を、幅に合わせて1文字ずつ折り返す
function wrapLines(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawBackground(ctx) {
  const bg = ctx.createRadialGradient(W * 0.3, H * 0.15, 50, W * 0.5, H * 0.5, H)
  bg.addColorStop(0, '#3a2370')
  bg.addColorStop(0.55, '#1b1036')
  bg.addColorStop(1, '#0d0820')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.25 + (i % 5) / 8})`
    ctx.beginPath()
    ctx.arc((i * 137.5) % W, (i * 83.3) % H, (i % 3) + 1, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawTarotPost(canvas, dateText, index, card) {
  const ctx = canvas.getContext('2d')
  drawBackground(ctx)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = MUTED
  ctx.font = `600 40px ${FONT}`
  ctx.fillText(dateLabel(dateText), W / 2, 80)
  ctx.fillStyle = GOLD
  ctx.font = `700 70px ${FONT}`
  ctx.fillText('今日のタロット', W / 2, 160)

  // カード
  const cw = 360
  const ch = 560
  const cx = (W - cw) / 2
  const cy = 230
  roundRect(ctx, cx, cy, cw, ch, 26)
  const cardBg = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch)
  cardBg.addColorStop(0, '#2b1a55')
  cardBg.addColorStop(1, '#140b2e')
  ctx.fillStyle = cardBg
  ctx.fill()
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 6
  ctx.stroke()
  roundRect(ctx, cx + 18, cy + 18, cw - 36, ch - 36, 16)
  ctx.strokeStyle = 'rgba(232,194,106,0.5)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = GOLD
  ctx.font = `700 56px ${FONT}`
  ctx.fillText(TAROT_ROMAN[index], W / 2, cy + 80)
  drawStar(ctx, W / 2, cy + ch / 2 - 10, 90, GOLD)
  ctx.beginPath()
  ctx.arc(W / 2, cy + ch / 2 - 10, 130, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(232,194,106,0.6)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = TEXT
  ctx.font = `700 ${card.name.length > 4 ? 46 : 58}px ${FONT}`
  ctx.fillText(card.name, W / 2, cy + ch - 70)

  // キーワードと意味
  ctx.fillStyle = GOLD
  ctx.font = `600 38px ${FONT}`
  ctx.fillText(card.keywords.join(' ・ '), W / 2, cy + ch + 70)
  ctx.fillStyle = TEXT
  ctx.font = `500 36px ${FONT}`
  const lines = wrapLines(ctx, card.upright, W - 200)
  lines.slice(0, 3).forEach((line, i) => ctx.fillText(line, W / 2, cy + ch + 150 + i * 54))

  // カードからのアドバイス
  const boxY = cy + ch + 150 + Math.min(lines.length, 3) * 54 + 20
  roundRect(ctx, 120, boxY, W - 240, 120, 24)
  ctx.fillStyle = 'rgba(232,194,106,0.14)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(232,194,106,0.55)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = MUTED
  ctx.font = `600 26px ${FONT}`
  ctx.fillText('カードからのアドバイス', W / 2, boxY + 36)
  ctx.fillStyle = GOLD
  ctx.font = `700 36px ${FONT}`
  ctx.fillText(card.advice, W / 2, boxY + 82)

  ctx.fillStyle = GOLD
  ctx.font = `700 36px ${FONT}`
  ctx.fillText('カードの意味は 鑑定村 kanteimura.com', W / 2, H - 62)
}

export default function SnsPage() {
  const today = formatDate(new Date())
  const [dateText, setDateText] = useState(today)
  const [copied, setCopied] = useState(false)
  const [platform, setPlatform] = useState('x')
  const [kind, setKind] = useState('ranking')
  const [tarotCards, setTarotCards] = useState(null)
  const canvasRef = useRef(null)
  const ranking = useMemo(() => dailyRanking(dateText), [dateText])
  const tarotIndex = dailyTarotIndex(dateText)
  const card = tarotCards?.[tarotIndex]

  // タロットの文章は鑑定データから読みこむ
  useEffect(() => {
    import('./readings/data/ja.js').then((m) => setTarotCards(m.default.tarot.cards))
  }, [])

  const text = useMemo(() => {
    if (kind === 'tarot') return card ? (platform === 'x' ? tarotPostText : tarotInstagramText)(dateText, tarotIndex, card) : ''
    return (platform === 'x' ? postText : instagramText)(dateText, ranking)
  }, [kind, platform, dateText, ranking, tarotIndex, card])

  useEffect(() => {
    document.title = 'SNS投稿用｜鑑定村'
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => {
      if (kind === 'tarot') {
        if (card) drawTarotPost(canvas, dateText, tarotIndex, card)
      } else {
        drawRanking(canvas, dateText, ranking)
      }
    }
    draw()
    // フォントの読み込みが終わったら描き直す
    document.fonts?.ready.then(draw)
  }, [kind, dateText, ranking, tarotIndex, card])

  const fileName = `kanteimura-${kind}-${dateText}.png`

  const saveImage = () => {
    canvasRef.current.toBlob(async (blob) => {
      const file = new File([blob], fileName, { type: 'image/png' })
      // スマホは「共有」から写真に保存できる
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] })
          return
        } catch {
          // キャンセルされたときは何もしない
          return
        }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const copyText = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isX = platform === 'x'
  const length = isX ? xWeightedLength(text) : [...text].length
  const limit = isX ? 280 : 2200

  return (
    <main className="page">
      <a className="back" href="#/">← トップへ</a>
      <header className="page-header">
        <h2>SNS投稿用ページ</h2>
        <p className="lead">運営者用のページです。画像を保存して文章をコピーし、XやInstagramに投稿してください。朝は「運勢ランキング」、空いた時間は「今日のタロット」がおすすめです。</p>
      </header>
      <div className="form sns-tools">
        <div className="sns-dates">
          <button type="button" className={kind === 'ranking' ? 'primary' : 'secondary'} onClick={() => setKind('ranking')}>🔢 運勢ランキング</button>
          <button type="button" className={kind === 'tarot' ? 'primary' : 'secondary'} onClick={() => setKind('tarot')}>🃏 今日のタロット</button>
        </div>
        <div className="sns-dates">
          <button type="button" className={dateText === today ? 'primary' : 'secondary'} onClick={() => setDateText(today)}>今日</button>
          <button type="button" className={dateText === addDays(today, 1) ? 'primary' : 'secondary'} onClick={() => setDateText(addDays(today, 1))}>明日</button>
          <input type="date" value={dateText} onChange={(e) => e.target.value && setDateText(e.target.value)} aria-label="日付" />
        </div>
        <div className="sns-dates">
          <button type="button" className={isX ? 'primary' : 'secondary'} onClick={() => setPlatform('x')}>X用</button>
          <button type="button" className={!isX ? 'primary' : 'secondary'} onClick={() => setPlatform('instagram')}>Instagram用</button>
        </div>
      </div>
      <div className="result">
        <canvas ref={canvasRef} width={W} height={H} className="sns-canvas" />
        <button type="button" className="primary" onClick={saveImage}>① 画像を保存する</button>
        <textarea className="sns-text" readOnly value={text} rows={12} />
        <p className="note">文字数:{length} / {limit} {length > limit ? '(多すぎます)' : '(OK)'}</p>
        <button type="button" className="primary" onClick={copyText}>{copied ? 'コピーしました!' : '② 文章をコピーする'}</button>
        {isX ? (
          <>
            <a className="secondary sns-intent" href={intentUrl(text)} target="_blank" rel="noopener">③ Xの投稿画面を開く(文章入り)</a>
            <p className="note">Xの投稿画面で、①で保存した画像を追加してから投稿してください。</p>
          </>
        ) : (
          <p className="note">③ Instagramアプリで①の画像を選び、キャプションに②の文章を貼り付けて投稿してください。</p>
        )}
      </div>
    </main>
  )
}

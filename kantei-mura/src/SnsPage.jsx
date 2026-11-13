// X投稿用の「運命数別 今日の運勢ランキング」画像と文章を作るページ(運営者用・日本語のみ)。
// メニューには出さず、kanteimura.com/#/sns で開く。
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatDate } from './fortune'
import { dailyRanking, dateLabel, intentUrl, postText, xWeightedLength } from './sns'

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
  // 背景(夜空)
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

export default function SnsPage() {
  const today = formatDate(new Date())
  const [dateText, setDateText] = useState(today)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)
  const ranking = useMemo(() => dailyRanking(dateText), [dateText])
  const text = useMemo(() => postText(dateText, ranking), [dateText, ranking])

  useEffect(() => {
    document.title = 'X投稿用ランキング｜鑑定村'
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => drawRanking(canvas, dateText, ranking)
    draw()
    // フォントの読み込みが終わったら描き直す
    document.fonts?.ready.then(draw)
  }, [dateText, ranking])

  const fileName = `kanteimura-ranking-${dateText}.png`

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

  const length = xWeightedLength(text)

  return (
    <main className="page">
      <a className="back" href="#/">← トップへ</a>
      <header className="page-header">
        <h2>X投稿用 今日の運勢ランキング</h2>
        <p className="lead">運営者用のページです。毎朝、画像を保存して文章をコピーし、Xに投稿してください。</p>
      </header>
      <div className="form sns-tools">
        <div className="sns-dates">
          <button type="button" className={dateText === today ? 'primary' : 'secondary'} onClick={() => setDateText(today)}>今日</button>
          <button type="button" className={dateText === addDays(today, 1) ? 'primary' : 'secondary'} onClick={() => setDateText(addDays(today, 1))}>明日</button>
          <input type="date" value={dateText} onChange={(e) => e.target.value && setDateText(e.target.value)} aria-label="日付" />
        </div>
      </div>
      <div className="result">
        <canvas ref={canvasRef} width={W} height={H} className="sns-canvas" />
        <button type="button" className="primary" onClick={saveImage}>① 画像を保存する</button>
        <textarea className="sns-text" readOnly value={text} rows={12} />
        <p className="note">文字数:{length} / 280 {length > 280 ? '(多すぎます)' : '(OK)'}</p>
        <button type="button" className="primary" onClick={copyText}>{copied ? 'コピーしました!' : '② 文章をコピーする'}</button>
        <a className="secondary sns-intent" href={intentUrl(text)} target="_blank" rel="noopener">③ Xの投稿画面を開く(文章入り)</a>
        <p className="note">Xの投稿画面で、①で保存した画像を追加してから投稿してください。</p>
      </div>
    </main>
  )
}

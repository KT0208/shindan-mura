// 相性結果のシェア画像(1080x1920 ストーリーサイズ)を描く。
// 既存の診断結果ストーリー画像と同じパステル調・QR付きのデザインに揃えている。

const W = 1080
const H = 1920
const FONT = 'system-ui, sans-serif'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function drawContain(ctx, image, x, y, w, h) {
  const r = Math.min(w / image.width, h / image.height)
  const dw = image.width * r
  const dh = image.height * r
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

// 幅に収まるまでフォントを小さくして1行で描く
function fitText(ctx, text, x, y, maxWidth, size, weight = 800) {
  let s = size
  do {
    ctx.font = `${weight} ${s}px ${FONT}`
    if (ctx.measureText(text).width <= maxWidth) break
    s -= 2
  } while (s > 18)
  ctx.fillText(text, x, y)
}

// 日本語を1文字ずつ測って折り返す(最大 maxLines 行、あふれたら…)
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
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
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…'
  }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
}

const GRADE_LABEL = { '◎': '高め合うふたり', '○': '分かり合えるふたり', '△': '刺激し合うふたり' }

export async function createCompatStoryBlob({ a, b, result, shareUrl, toDisplayImage }) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#fff4fb')
  bg.addColorStop(1, '#e9ddff')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.roundRect(70, 90, 940, 1740, 56)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#8f4ed8'
  ctx.font = `700 40px ${FONT}`
  ctx.fillText('診断村', 540, 180)
  ctx.fillStyle = '#29183a'
  ctx.font = `800 56px ${FONT}`
  ctx.fillText('住人どうしの相性', 540, 255)

  // 2体のキャラ
  const slots = [
    { m: a, x: 110 },
    { m: b, x: 580 },
  ]
  const images = await Promise.all(slots.map(({ m }) => loadImage(toDisplayImage(m.image)).catch(() => null)))
  slots.forEach(({ m, x }, i) => {
    ctx.fillStyle = '#f7efff'
    ctx.beginPath()
    ctx.roundRect(x, 300, 390, 390, 44)
    ctx.fill()
    if (images[i]) drawContain(ctx, images[i], x + 20, 320, 350, 350)
    ctx.fillStyle = '#29183a'
    fitText(ctx, m.name, x + 195, 750, 400, 42)
    ctx.fillStyle = '#8c7a98'
    fitText(ctx, m.diagnosisTitle, x + 195, 798, 400, 28, 600)
  })

  // 中央の×
  const xg = ctx.createLinearGradient(500, 455, 580, 535)
  xg.addColorStop(0, '#ff4ecd')
  xg.addColorStop(1, '#7c5cff')
  ctx.fillStyle = xg
  ctx.beginPath()
  ctx.arc(540, 495, 44, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `900 48px ${FONT}`
  ctx.fillText('×', 540, 512)

  // スコア
  const sg = ctx.createLinearGradient(340, 880, 740, 1040)
  sg.addColorStop(0, '#ff69ad')
  sg.addColorStop(1, '#8f4ed8')
  ctx.fillStyle = sg
  ctx.font = `900 200px ${FONT}`
  const scoreText = String(result.score)
  const scoreW = ctx.measureText(scoreText).width
  ctx.font = `900 72px ${FONT}`
  const pctW = ctx.measureText('%').width
  const left = 540 - (scoreW + pctW) / 2
  ctx.textAlign = 'left'
  ctx.font = `900 200px ${FONT}`
  ctx.fillText(scoreText, left, 1030)
  ctx.font = `900 72px ${FONT}`
  ctx.fillText('%', left + scoreW + 4, 1030)
  ctx.textAlign = 'center'

  ctx.fillStyle = '#8f4ed8'
  ctx.font = `800 38px ${FONT}`
  ctx.fillText(GRADE_LABEL[result.grade] || '', 540, 1095)

  ctx.fillStyle = '#ff69ad'
  fitText(ctx, `「${result.title}」`, 540, 1190, 860, 64)

  // ひとこと
  ctx.fillStyle = '#fdf0f8'
  ctx.beginPath()
  ctx.roundRect(130, 1240, 820, 250, 32)
  ctx.fill()
  ctx.fillStyle = '#8f4ed8'
  ctx.font = `800 30px ${FONT}`
  ctx.fillText(`なかよくなるコツ`, 540, 1298)
  ctx.fillStyle = '#4a3a58'
  ctx.font = `600 34px ${FONT}`
  wrapText(ctx, result.tip, 540, 1360, 740, 52, 3)

  ctx.fillStyle = '#ff69ad'
  ctx.font = `800 40px ${FONT}`
  ctx.fillText('#診断村 #相性診断', 540, 1565)
  ctx.fillStyle = '#8c7a98'
  ctx.font = `600 28px ${FONT}`
  ctx.fillText('あなたと推しキャラの相性もチェックしてね', 540, 1612)

  try {
    const qr = await loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(shareUrl)}`)
    ctx.drawImage(qr, 475, 1640, 130, 130)
    ctx.fillStyle = '#8f4ed8'
    ctx.font = `700 24px ${FONT}`
    ctx.fillText('この組み合わせを見る', 540, 1806)
  } catch {
    ctx.fillStyle = '#8f4ed8'
    ctx.font = `700 28px ${FONT}`
    ctx.fillText('「診断村」で検索', 540, 1720)
  }

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// 対応端末はOSの共有シート(インスタ等)へ、非対応はダウンロード
export async function shareOrDownload(blob, filename) {
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

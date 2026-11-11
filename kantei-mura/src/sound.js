// おみくじの効果音。音声ファイルは使わず、ブラウザ内(Web Audio)で合成する。
// 音を鳴らす関数は必ずボタン操作の後に呼ぶこと(ブラウザは操作前の再生を禁止しているため)。

let ctx = null

function getContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function noiseBuffer(context, seconds) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
  return buffer
}

// 短いノイズを1回鳴らす(木の棒がぶつかる音・紙の音の素)
function burst(context, { at, duration, freq, q, volume }) {
  const source = context.createBufferSource()
  source.buffer = noiseBuffer(context, duration)
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = q
  const gain = context.createGain()
  gain.gain.setValueAtTime(volume, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + duration)
  source.connect(filter).connect(gain).connect(context.destination)
  source.start(at)
  source.stop(at + duration)
}

function tone(context, { at, freq, duration, volume, type = 'sine', slideTo }) {
  const osc = context.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + duration)
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  osc.connect(gain).connect(context.destination)
  osc.start(at)
  osc.stop(at + duration + 0.02)
}

// 箱の中で棒がカラカラ鳴る音
export function playRattle(seconds = 1.4) {
  const context = getContext()
  if (!context) return
  let t = context.currentTime
  const end = t + seconds
  while (t < end) {
    burst(context, { at: t, duration: 0.035, freq: 1800 + Math.random() * 1600, q: 4, volume: 0.35 })
    tone(context, { at: t, freq: 700 + Math.random() * 500, duration: 0.05, volume: 0.08, type: 'triangle' })
    t += 0.05 + Math.random() * 0.07
  }
}

// 棒が穴から出てくる音
export function playPop() {
  const context = getContext()
  if (!context) return
  const t = context.currentTime
  tone(context, { at: t, freq: 520, slideTo: 1100, duration: 0.14, volume: 0.15, type: 'triangle' })
  burst(context, { at: t, duration: 0.05, freq: 2400, q: 3, volume: 0.25 })
}

// 引き出しを開ける音
export function playDrawer() {
  const context = getContext()
  if (!context) return
  const t = context.currentTime
  burst(context, { at: t, duration: 0.35, freq: 400, q: 1.2, volume: 0.25 })
  tone(context, { at: t + 0.32, freq: 180, duration: 0.12, volume: 0.15, type: 'triangle' })
}

// 紙を開くカサカサ音
export function playRustle() {
  const context = getContext()
  if (!context) return
  const t = context.currentTime
  for (let i = 0; i < 6; i += 1) {
    burst(context, { at: t + i * 0.09 + Math.random() * 0.03, duration: 0.12, freq: 3500 + Math.random() * 2500, q: 0.8, volume: 0.18 })
  }
}

// 良い結果のときの鈴の音
export function playChime() {
  const context = getContext()
  if (!context) return
  const t = context.currentTime
  ;[1318, 1760, 2637].forEach((freq, i) => {
    tone(context, { at: t + i * 0.12, freq, duration: 1.4, volume: 0.09 })
  })
}

// 枝に結ぶときの音
export function playTie() {
  const context = getContext()
  if (!context) return
  const t = context.currentTime
  burst(context, { at: t, duration: 0.2, freq: 2800, q: 1, volume: 0.15 })
  tone(context, { at: t + 0.2, freq: 660, duration: 0.8, volume: 0.08 })
}

export function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern)
}

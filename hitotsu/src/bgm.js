// スライドショー用のBGM。音楽ファイルを使わず、ブラウザの中でその場で音を作る
// (ゆっくりした和音の上に、ピアノのような音がぽつぽつ鳴る静かな曲)。
// ブラウザは「ボタンを押した直後」でないと音を出せないので、必ずクリックの処理の中で呼ぶこと。
const CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 392.0], // G
]
const MELODY = [0, 2, 1, 3, 2, 1] // 和音のどの音を、1拍ずつ順に鳴らすか
const BAR = 6 // 1つの和音の長さ(秒)
const VOLUME = 0.5

export function createBgm() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return { setMuted() {}, stop() {} }
  const ctx = new Ctx()
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 3)
  master.connect(ctx.destination)

  // やまびこ(音に奥行きを出す)
  const delay = ctx.createDelay(1)
  delay.delayTime.value = 0.42
  const feedback = ctx.createGain()
  feedback.gain.value = 0.38
  const wet = ctx.createGain()
  wet.gain.value = 0.4
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(wet)
  wet.connect(master)

  // ぽん、と鳴ってゆっくり消える音
  function pluck(freq, at, length, volume) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
    osc.connect(gain)
    gain.connect(master)
    gain.connect(delay)
    osc.start(at)
    osc.stop(at + length + 0.1)
  }

  // ふわっと広がる持続音
  function pad(freq, at) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.linearRampToValueAtTime(0.035, at + 2)
    gain.gain.linearRampToValueAtTime(0.0001, at + BAR + 1.5)
    osc.connect(gain)
    gain.connect(master)
    osc.start(at)
    osc.stop(at + BAR + 1.6)
  }

  let bar = 0
  let nextBar = ctx.currentTime + 0.1
  function schedule() {
    while (nextBar < ctx.currentTime + 1.5) {
      const chord = CHORDS[bar % CHORDS.length]
      chord.forEach((f) => pad(f / 2, nextBar))
      pluck(chord[0] / 2, nextBar, 5, 0.16)
      MELODY.forEach((n, i) => pluck(chord[n] * 2, nextBar + i, 3, 0.07))
      nextBar += BAR
      bar += 1
    }
  }
  schedule()
  const timer = setInterval(schedule, 500)

  return {
    setMuted(muted) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(muted ? 0 : VOLUME, ctx.currentTime, 0.2)
    },
    stop() {
      clearInterval(timer)
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.8)
      setTimeout(() => ctx.close().catch(() => {}), 4000)
    },
  }
}

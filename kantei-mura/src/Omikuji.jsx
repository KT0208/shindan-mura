import { useEffect, useState } from 'react'
import { omikujiTier, toKanjiNumber } from './fortune'
import { ja } from './i18n'
import { useDictionary } from './i18n/context'
import { playChime, playDrawer, playPop, playRattle, playRustle, playTie, vibrate } from './sound'

// 神社でおみくじを引く流れを再現する。
// idle(箱) → shaking(振る) → flip(逆さにして棒が出る) → stick(番号) → drawer(引き出し) → folded(折った紙) → open(紙を開く) → tied(凶なら枝に結ぶ)
const BOX_STAGES = ['idle', 'shaking', 'flip', 'stick']
const DRAWER_STAGES = ['drawer', 'folded']

const SHAKE_MS = 1500
const FLIP_MS = 1500
const DRAWER_MS = 1300

// スマホのセンサーで「振った」と判定する強さと回数
const SHAKE_THRESHOLD = 25
const SHAKES_NEEDED = 3

function readSoundSetting() {
  try {
    return window.localStorage.getItem('kantei:sound') === 'on'
  } catch {
    return false
  }
}

function isTouchDevice() {
  return typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
}

function needsMotionPermission() {
  return typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function'
}

// 縦書き用: 1文字ずつ縦に積む。CSSの縦書き(writing-mode)はフォントによって
// 文字が重なることがあるため、どの端末でも同じ見た目になるよう自前で並べる。
const VERTICAL_MAP = { 'ー': '｜', '\u3000': '\u00a0', ' ': '\u00a0' }

function VText({ text, className = '' }) {
  return (
    <span className={`vtext ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden="true">{VERTICAL_MAP[ch] || ch}</span>
      ))}
    </span>
  )
}

function startShakeEffects(soundOn) {
  if (soundOn) playRattle(SHAKE_MS / 1000)
  vibrate([40, 60, 40, 60, 40, 60, 40, 60, 40])
}

// 六角形のおみくじ箱(SVGで描画)。棒は箱の上の穴から出てくる。
function OmikujiBox({ stickOut }) {
  return (
    <svg className="omikuji-box-svg" viewBox="0 -60 200 320" aria-hidden="true">
      <defs>
        <linearGradient id="wood-left" x1="0" x2="1">
          <stop offset="0" stopColor="#6b3f1d" />
          <stop offset="1" stopColor="#8a5428" />
        </linearGradient>
        <linearGradient id="wood-center" x1="0" x2="1">
          <stop offset="0" stopColor="#b9773b" />
          <stop offset="0.5" stopColor="#d39a5a" />
          <stop offset="1" stopColor="#b9773b" />
        </linearGradient>
        <linearGradient id="wood-right" x1="0" x2="1">
          <stop offset="0" stopColor="#8a5428" />
          <stop offset="1" stopColor="#5a3418" />
        </linearGradient>
        <clipPath id="above-hole">
          <rect x="0" y="-200" width="200" height="270" />
        </clipPath>
      </defs>
      {/* 箱の側面 */}
      <polygon points="40,70 70,82 70,250 40,238" fill="url(#wood-left)" />
      <polygon points="70,82 130,82 130,250 70,250" fill="url(#wood-center)" />
      <polygon points="130,82 160,70 160,238 130,250" fill="url(#wood-right)" />
      {/* 木目 */}
      <g stroke="rgba(60,30,10,0.25)" strokeWidth="1" fill="none">
        <path d="M78 90 C 82 140, 74 190, 80 245" />
        <path d="M122 90 C 118 150, 126 200, 120 245" />
        <path d="M52 80 C 56 140, 50 190, 55 238" />
        <path d="M148 80 C 144 140, 150 190, 145 238" />
      </g>
      {/* 上面と穴 */}
      <polygon points="40,70 70,58 130,58 160,70 130,82 70,82" fill="#e0ad6c" stroke="#8a5428" strokeWidth="1.5" />
      <ellipse cx="100" cy="70" rx="8" ry="3.5" fill="#2a1508" />
      {/* 白い紙の札と赤い文字 */}
      <rect x="83" y="104" width="34" height="122" rx="2" fill="#fbf6ea" stroke="#b5282a" strokeWidth="1.5" />
      <g fill="#b5282a" fontSize="26" fontWeight="700" textAnchor="middle" fontFamily="'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif">
        <text x="100" y="138">御</text>
        <text x="100" y="175">神</text>
        <text x="100" y="212">籤</text>
      </g>
      {/* 底の縁 */}
      <polygon points="40,238 70,250 130,250 160,238 160,244 130,256 70,256 40,244" fill="#4a2a12" />
      {/* 棒(穴より上だけ見えるように切り抜く) */}
      <g clipPath="url(#above-hole)">
        <g className={`omikuji-stick ${stickOut ? 'out' : ''}`}>
          <rect x="95" y="75" width="10" height="130" rx="2" fill="#f0d9a8" stroke="#a87c3c" strokeWidth="1" />
          <rect x="95" y="75" width="10" height="14" rx="2" fill="#c0392b" />
        </g>
      </g>
    </svg>
  )
}

// 凶のおみくじを結ぶ木の枝
function TreeBranch() {
  const knots = [
    { x: 60, y: 62, r: -8 },
    { x: 105, y: 52, r: 6 },
    { x: 200, y: 50, r: -4 },
    { x: 245, y: 60, r: 10 },
  ]
  return (
    <svg className="tree-branch" viewBox="0 0 300 150" aria-hidden="true">
      <path d="M0 70 C 60 40, 120 60, 160 45 S 260 40, 300 65" stroke="#5a3418" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M120 55 C 130 30, 150 20, 170 15" stroke="#5a3418" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g fill="#3f7d4a">
        <ellipse cx="172" cy="14" rx="9" ry="5" />
        <ellipse cx="30" cy="58" rx="9" ry="5" transform="rotate(-20 30 58)" />
        <ellipse cx="285" cy="58" rx="9" ry="5" transform="rotate(20 285 58)" />
      </g>
      {knots.map((k) => (
        <g key={k.x} transform={`rotate(${k.r} ${k.x} ${k.y})`}>
          <rect x={k.x - 5} y={k.y - 4} width="10" height="34" rx="2" fill="#f5efe0" stroke="#d8ccb0" />
          <rect x={k.x - 7} y={k.y} width="14" height="6" rx="2" fill="#fbf6ea" stroke="#d8ccb0" />
        </g>
      ))}
      <g className="new-knot">
        <rect x="147" y="48" width="12" height="40" rx="2" fill="#fffaf0" stroke="#b5282a" />
        <rect x="144" y="52" width="18" height="7" rx="2" fill="#fffaf0" stroke="#b5282a" />
      </g>
    </svg>
  )
}

// sheet を渡すと、縁結び・金運などテーマ別のおみくじにできる。
// sheet = { title: 紙の見出し(日本語), items: 紙に書く項目(日本語), translatedItems: 訳(日本語ページでは null), message: 紙の下のメッセージ }
export default function Omikuji({ fortune, dateLabel, onOpen, onReset, sheet }) {
  const t = useDictionary()
  const o = t.ui.omikuji
  const [stage, setStage] = useState('idle')
  const [soundOn, setSoundOn] = useState(readSoundSetting)
  const [motionOn, setMotionOn] = useState(() => isTouchDevice() && typeof DeviceMotionEvent !== 'undefined' && !needsMotionPermission())
  const [askMotion] = useState(() => isTouchDevice() && needsMotionPermission())

  const kanjiNumber = toKanjiNumber(fortune.stickNumber)
  const tier = omikujiTier(fortune.omikujiIndex)

  // 段階ごとに、少し待ってから次の段階へ自動で進める
  useEffect(() => {
    let timer
    if (stage === 'shaking') {
      timer = setTimeout(() => {
        setStage('flip')
        if (soundOn) setTimeout(playPop, 750)
      }, SHAKE_MS)
    } else if (stage === 'flip') {
      timer = setTimeout(() => setStage('stick'), FLIP_MS)
    } else if (stage === 'drawer') {
      timer = setTimeout(() => setStage('folded'), DRAWER_MS)
    }
    return () => clearTimeout(timer)
  }, [stage, soundOn])

  // スマホを振ったら引く
  useEffect(() => {
    if (stage !== 'idle' || !motionOn) return undefined
    let last = null
    let count = 0
    let lastShakeAt = 0
    const onMotion = (event) => {
      const a = event.accelerationIncludingGravity
      if (!a || a.x == null) return
      if (last) {
        const delta = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z)
        const now = Date.now()
        if (delta > SHAKE_THRESHOLD) {
          if (now - lastShakeAt > 1500) count = 0
          count += 1
          lastShakeAt = now
          if (count >= SHAKES_NEEDED) {
            startShakeEffects(soundOn)
            setStage('shaking')
          }
        }
      }
      last = { x: a.x, y: a.y, z: a.z }
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [stage, motionOn, soundOn])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    try {
      window.localStorage.setItem('kantei:sound', next ? 'on' : 'off')
    } catch {
      // 保存できない環境では無視
    }
    if (next) playChime()
  }

  const shake = () => {
    if (stage !== 'idle') return
    startShakeEffects(soundOn)
    setStage('shaking')
  }

  // iPhoneはセンサーを使う前に許可が必要
  const enableMotion = async () => {
    try {
      const result = await DeviceMotionEvent.requestPermission()
      if (result === 'granted') setMotionOn(true)
    } catch {
      setMotionOn(false)
    }
  }

  const openDrawer = () => {
    if (soundOn) playDrawer()
    setStage('drawer')
  }

  const openPaper = () => {
    if (soundOn) {
      playRustle()
      if (fortune.omikujiIndex <= 1) setTimeout(playChime, 700)
    }
    vibrate(30)
    setStage('open')
    onOpen?.()
  }

  const tie = () => {
    if (soundOn) playTie()
    vibrate([20, 40, 20])
    setStage('tied')
  }

  const replay = () => {
    setStage('idle')
    onReset?.()
  }

  // 引き出しは、引いた番号を真ん中にして前後の番号を並べる
  const drawerNumbers = Array.from({ length: 9 }, (_, i) => ((fortune.stickNumber - 1 + (i - 4) + 50) % 50) + 1)

  const [numBefore, numStrong, numAfter] = o.stickNumber(kanjiNumber, fortune.stickNumber)
  // 紙そのものは、どの言語でも日本語の縦書き(本物のおみくじらしさを残すため)。訳は紙の下に出す。
  const sheetRank = ja.omikujiRanks[fortune.omikujiIndex]
  const sheetTitle = sheet?.title || 'おみくじ'
  const sheetItems = sheet?.items || ja.omikujiItems
  const translatedItems = sheet ? sheet.translatedItems : (t.code === 'ja' ? null : t.omikujiItems)
  const sheetMessage = sheet?.message || t.omikujiMessages[fortune.omikujiIndex]
  const isKyo = fortune.omikujiIndex === 5

  return (
    <div className="omikuji-stage">
      <div className="omikuji-toolbar">
        <span className="eyebrow">{o.dateLabel(dateLabel)}</span>
        <button type="button" className="sound-toggle" onClick={toggleSound} aria-pressed={soundOn}>
          {soundOn ? o.soundOn : o.soundOff}
        </button>
      </div>

      {BOX_STAGES.includes(stage) && (
        <div className="stage-box">
          <div className={`omikuji-box stage-${stage}`}>
            <OmikujiBox stickOut={stage === 'flip' || stage === 'stick'} />
          </div>
          {stage === 'idle' && (
            <>
              <button type="button" className="primary" onClick={shake}>{o.shake}</button>
              {motionOn && <p className="note">{o.motionHint}</p>}
              {askMotion && !motionOn && (
                <button type="button" className="secondary" onClick={enableMotion}>{o.motionButton}</button>
              )}
            </>
          )}
          {stage === 'shaking' && <p className="stage-caption">{o.shaking}</p>}
          {stage === 'flip' && <p className="stage-caption">{o.stickOut}</p>}
          {stage === 'stick' && (
            <>
              <p className="stick-number">{numBefore}<strong>{numStrong}</strong>{numAfter}</p>
              <p className="note">{o.stickNote}</p>
              <button type="button" className="primary" onClick={openDrawer}>{o.openDrawer(kanjiNumber, fortune.stickNumber)}</button>
            </>
          )}
        </div>
      )}

      {DRAWER_STAGES.includes(stage) && (
        <div className="stage-drawer">
          <div className="drawer-cabinet">
            {drawerNumbers.map((n, i) => (
              <div key={n} className={`drawer ${i === 4 ? 'target' : ''}`}>
                <VText text={toKanjiNumber(n)} />
                <i className="handle" aria-hidden="true" />
              </div>
            ))}
          </div>
          {stage === 'folded' ? (
            <>
              <button type="button" className="folded-paper" onClick={openPaper} aria-label={o.tapToOpen}>
                <VText text="御神籤" />
              </button>
              <p className="stage-caption">{o.tapToOpen}</p>
            </>
          ) : (
            <p className="stage-caption">{o.drawerOpening}</p>
          )}
        </div>
      )}

      {stage === 'open' && (
        <div className="stage-open">
          <div className="omikuji-sheet-wrap">
            <div className={`omikuji-sheet rank-${fortune.omikujiIndex}`} role="img" aria-label={`${t.omikujiRanks[fortune.omikujiIndex]}`}>
              <VText className="sheet-head" text={`${sheetTitle}\u3000第${kanjiNumber}番`} />
              <VText className="sheet-rank" text={sheetRank} />
              {sheetItems.map((item, i) => (
                <span key={item.label} className="sheet-item">
                  <VText className="sheet-label" text={item.label} />
                  <VText text={item.tiers[tier][fortune.itemPicks[i]]} />
                </span>
              ))}
            </div>
          </div>
          {o.translation && translatedItems && (
            <div className="sheet-translation">
              <p className="eyebrow">{o.translation}</p>
              <h4>{sheetRank} — {t.omikujiRanks[fortune.omikujiIndex]}</h4>
              <dl>
                {translatedItems.map((item, i) => (
                  <div key={item.label}>
                    <dt>{sheetItems[i].label} · {item.label}</dt>
                    <dd>{item.tiers[tier][fortune.itemPicks[i]]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <p className="omikuji-message">{sheetMessage}</p>
          {isKyo && (
            <button type="button" className="primary" onClick={tie}>{o.tie}</button>
          )}
          <button type="button" className="link-button" onClick={replay}>{o.replay}</button>
        </div>
      )}

      {stage === 'tied' && (
        <div className="stage-tied">
          <TreeBranch />
          <p className="omikuji-message">{o.tied[0]}<br />{o.tied[1]}</p>
          <button type="button" className="link-button" onClick={replay}>{o.replay}</button>
        </div>
      )}
    </div>
  )
}

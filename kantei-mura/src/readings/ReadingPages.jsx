// 追加の鑑定ページ(15種類)。文章は data/{言語}.js から読み込み、計算は logic.js で行う。
import { useEffect, useState } from 'react'
import { formatDate, parseDate, zodiacIndex, ZODIAC_EMOJI } from '../fortune'
import { formatLongDate, useStoredState } from '../hooks'
import { useDictionary } from '../i18n/context'
import { DateInput, NameInput, Page, ShareButtons, SisterCard, Stars } from '../ui'
import Omikuji from '../Omikuji'
import { track } from '../analytics'
import {
  angelNumberKind, angelNumberParts, celticTreeIndex, CELTIC_KEYS, drawRune, drawTarot, etoIndex, etoPartners, honmeiStar,
  honzonKey, kyuseiOfYear, kyuseiPalace, kyuseiPartners, kyuseiYear, moonAge, moonPhaseIndex, numerologyChart, pastLife,
  personalMonthNumber, swingPendulum, themedFortune, ZODIAC_ELEMENT, zodiacPartners,
} from './logic'

// ---- 文章データの読み込み(その言語のものと、おみくじの紙用の日本語) ----
const dataLoaders = import.meta.glob('./data/*.js')

function useReadingData() {
  const t = useDictionary()
  const [state, setState] = useState({ code: null, data: null, ja: null })
  useEffect(() => {
    let alive = true
    Promise.all([dataLoaders[`./data/${t.code}.js`](), dataLoaders['./data/ja.js']()]).then(([d, j]) => {
      if (alive) setState({ code: t.code, data: d.default, ja: j.default })
    })
    return () => {
      alive = false
    }
  }, [t.code])
  return state.code === t.code ? state : { data: null, ja: null }
}

// データの読み込み中も、ページの見出しは先に出しておく
function ReadingShell({ id, data, children }) {
  return (
    <Page id={id} lead={data ? data[id].lead : ''}>
      {data ? children : <div className="form loading-box" aria-busy="true" />}
    </Page>
  )
}

// 生年月日だけの入力フォーム
function BirthForm({ id, birthText, setBirthText, onSubmit, onChange, children, submitLabel }) {
  const t = useDictionary()
  const birth = parseDate(birthText)
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); if (birth) onSubmit() }}>
      <DateInput id={`birth-${id}`} value={birthText} onChange={(v) => { setBirthText(v); onChange?.() }} />
      {children}
      <button type="submit" className="primary" disabled={!birth}>{submitLabel || t.ui.submit}</button>
    </form>
  )
}

function Keywords({ list }) {
  return <ul className="keywords">{list.map((k) => <li key={k}>{k}</li>)}</ul>
}

function Sections({ items }) {
  return (
    <div className="sections">
      {items.filter((s) => s.text).map((s) => (
        <section key={s.heading}><h4>{s.heading}</h4><p>{s.text}</p></section>
      ))}
    </div>
  )
}

function Chips({ heading, items }) {
  return (
    <div className="chips-box">
      <p className="eyebrow">{heading}</p>
      <ul className="chips">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </div>
  )
}

function ResultHead({ eyebrow, visual, title, sub, keywords }) {
  return (
    <div className="number-card">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="result-visual">{visual}</div>
      {title && <h3>{title}</h3>}
      {sub && <p className="sub-info">{sub}</p>}
      {keywords && <Keywords list={keywords} />}
    </div>
  )
}

const todayParts = () => {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), text: formatDate(d) }
}

// =================== おみくじ(縁結び・金運) ===================
export function ThemedOmikujiPage({ theme }) {
  const t = useDictionary()
  const { data, ja } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [opened, setOpened] = useState(false)
  const birth = parseDate(birthText)
  const today = todayParts()
  if (!data) return <ReadingShell id={theme} data={null} />
  const d = data[theme]
  const f = birth ? themedFortune(theme, birthText, today.text, ja[theme].items.length, d.actions.length) : null
  const sheet = f && {
    title: ja[theme].paperTitle,
    items: ja[theme].items,
    translatedItems: t.code === 'ja' ? null : d.items,
    message: d.messages[f.omikujiIndex],
  }
  return (
    <ReadingShell id={theme} data={data}>
      <div className="form">
        <DateInput id={`birth-${theme}`} value={birthText} onChange={(v) => { setBirthText(v); setOpened(false) }} />
        {!birth && <p className="note">{t.ui.today.needBirth}</p>}
      </div>
      {f && (
        <Omikuji
          key={`${theme}-${birthText}`}
          fortune={f}
          sheet={sheet}
          dateLabel={formatLongDate(t.locale, today.year, today.month, today.day)}
          onOpen={() => { setOpened(true); track('omikuji_draw', { theme, rank: f.omikujiIndex }) }}
          onReset={() => setOpened(false)}
        />
      )}
      {f && opened && (
        <div className="result">
          <table className="score-table">
            <tbody><tr><th>{d.scoreLabel}</th><td><Stars value={f.score} /></td></tr></tbody>
          </table>
          <div className="lucky-grid single">
            <div><span>{d.actionLabel}</span><strong>{d.actions[f.action]}</strong></div>
          </div>
          <p className="note">{t.ui.today.sameDay}</p>
          <ShareButtons text={d.share(t.omikujiRanks[f.omikujiIndex], d.actions[f.action])} />
          <SisterCard page={theme === 'kinun' ? 'today' : 'compat'} />
        </div>
      )}
    </ReadingShell>
  )
}

// =================== 数秘術 ===================
export function ChartPage() {
  const t = useDictionary()
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [name, setName] = useStoredState('kantei:name', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="chart" data={null} />
  const d = data.chart
  const birth = parseDate(birthText)
  const chart = shown && birth ? numerologyChart(birth, name, todayParts()) : null
  const rows = chart ? ['lifePath', 'birthday', 'expression', 'soul', 'personalYear', 'personalMonth'].filter((k) => chart[k]) : []
  const titleOf = (key, n) => {
    if (key === 'personalYear') return t.yearThemes[n].theme
    if (key === 'personalMonth') return data.month.months[n].theme
    return t.numberTypes[n].title
  }
  return (
    <ReadingShell id="chart" data={data}>
      <BirthForm id="chart" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'chart' }) }}>
        <NameInput id="name-chart" label={data.common.nameOptional} value={name} onChange={(v) => { setName(v); setShown(false) }} />
        <p className="note">{d.nameHint}</p>
      </BirthForm>
      {chart && (
        <div className="result">
          <div className="chart-list">
            {rows.map((key) => (
              <div key={key} className="chart-row">
                <div className="chart-number">{chart[key]}</div>
                <div>
                  <p className="eyebrow">{d.numbers[key].label}</p>
                  <strong>{titleOf(key, chart[key])}</strong>
                  <p className="chart-about">{d.numbers[key].about}</p>
                </div>
              </div>
            ))}
          </div>
          <ShareButtons text={d.share(chart.lifePath, chart.birthday)} />
          <SisterCard page="name" />
        </div>
      )}
    </ReadingShell>
  )
}

export function MonthPage() {
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="month" data={null} />
  const d = data.month
  const birth = parseDate(birthText)
  const today = todayParts()
  const next = today.month === 12 ? { year: today.year + 1, month: 1 } : { year: today.year, month: today.month + 1 }
  const pm = shown && birth ? personalMonthNumber(birth, today.year, today.month) : null
  const pmNext = shown && birth ? personalMonthNumber(birth, next.year, next.month) : null
  return (
    <ReadingShell id="month" data={data}>
      <BirthForm id="month" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'month' }) }} />
      {pm && (
        <div className="result">
          <ResultHead eyebrow={d.thisMonth(today.year, today.month)} visual={<div className="big-number">{pm}</div>} title={d.months[pm].theme} />
          <Sections items={[{ heading: d.months[pm].theme, text: d.months[pm].text }, { heading: d.advice, text: d.months[pm].advice }]} />
          <div className="year-box">
            <p className="eyebrow">{d.nextMonth(next.year, next.month)}</p>
            <h4>{pmNext}・{d.months[pmNext].theme}</h4>
            <p>{d.months[pmNext].text}</p>
          </div>
          <ShareButtons text={d.share(d.months[pm].theme)} />
          <SisterCard page="birthday" />
        </div>
      )}
    </ReadingShell>
  )
}

const ANGEL_EXAMPLES = ['111', '222', '333', '444', '555', '777', '888', '1111', '1234']

export function AngelPage() {
  const t = useDictionary()
  const { data } = useReadingData()
  const [input, setInput] = useState('')
  const [shown, setShown] = useState('')
  if (!data) return <ReadingShell id="angel" data={null} />
  const d = data.angel
  const kind = shown ? angelNumberKind(shown) : null
  const parts = kind ? angelNumberParts(kind.digits) : null
  const show = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    setInput(digits)
    setShown(digits)
    if (digits) track('kantei_result', { reading: 'angel' })
  }
  let main = ''
  if (kind?.kind === 'repeat') main = d.repeat[kind.digit]
  if (kind?.kind === 'sequence') main = d.sequence[kind.direction]
  if (kind?.kind === 'mirror') main = d.mirror
  if (kind?.kind === 'mix') main = d.mixIntro
  return (
    <ReadingShell id="angel" data={data}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); show(input) }}>
        <label className="field" htmlFor="angel-number">
          <span>{d.inputLabel}</span>
          <input id="angel-number" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={8} placeholder={d.placeholder} value={input} onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))} />
        </label>
        <p className="eyebrow">{d.examples}</p>
        <div className="example-chips">
          {ANGEL_EXAMPLES.map((n) => <button key={n} type="button" className="chip-button" onClick={() => show(n)}>{n}</button>)}
        </div>
        <button type="submit" className="primary" disabled={!input}>{t.ui.submit}</button>
      </form>
      {kind && (
        <div className="result">
          <ResultHead eyebrow={d.kinds[kind.kind]} visual={<div className="angel-number">{kind.digits}</div>} title={null} />
          <p className="message-box">{main}</p>
          <div className="sections">
            <section>
              <h4>{d.digitsHeading}</h4>
              <ul className="digit-list">
                {parts.unique.map((n) => <li key={n}><b>{n}</b><span>{d.digits[n].keyword}</span><small>{d.digits[n].message}</small></li>)}
              </ul>
            </section>
            <section>
              <h4>{d.totalHeading(parts.total)}</h4>
              <p>{d.digits[parts.total].keyword}:{d.digits[parts.total].message}</p>
            </section>
          </div>
          <ShareButtons text={d.share(kind.digits)} />
          <SisterCard page="birthday" />
        </div>
      )}
    </ReadingShell>
  )
}

// =================== 日本・東アジア ===================
function Lotus() {
  return (
    <svg viewBox="0 0 120 80" className="lotus" aria-hidden="true">
      <circle cx="60" cy="34" r="30" fill="rgba(232,194,106,0.18)" />
      {[-50, -25, 0, 25, 50].map((r) => <ellipse key={r} cx="60" cy="40" rx="11" ry="28" transform={`rotate(${r} 60 62)`} fill={r === 0 ? '#f6b6c8' : '#f0a0b8'} stroke="#c45d7c" strokeWidth="1.5" />)}
      <ellipse cx="60" cy="66" rx="40" ry="8" fill="#3f7d4a" />
    </svg>
  )
}

export function MamoriPage() {
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="mamori" data={null} />
  const d = data.mamori
  const birth = parseDate(birthText)
  const key = shown && birth ? honzonKey(birth) : null
  const h = key && d.types[key]
  return (
    <ReadingShell id="mamori" data={data}>
      <BirthForm id="mamori" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'mamori' }) }}>
        <p className="note">{d.note}</p>
      </BirthForm>
      {h && (
        <div className="result">
          <ResultHead eyebrow={d.resultHeading} visual={<Lotus />} title={h.name} sub={`${d.etoLabel}:${h.eto}`} />
          <Sections items={[{ heading: d.labels.about, text: h.about }, { heading: d.labels.benefit, text: h.benefit }, { heading: d.labels.message, text: h.message }]} />
          <div className="mantra-box">
            <p className="eyebrow">{d.labels.mantra}</p>
            <p className="mantra">{h.mantra}</p>
            <p className="note">{d.mantraNote}</p>
          </div>
          <ShareButtons text={d.share(h.name)} />
          <SisterCard page="name" />
        </div>
      )}
    </ReadingShell>
  )
}

const KYUSEI_COLORS = { 1: '#f4f4f4', 2: '#333', 3: '#3a7bd5', 4: '#3f9d5a', 5: '#e0b13a', 6: '#f4f4f4', 7: '#d2433a', 8: '#f4f4f4', 9: '#8e44ad' }

export function KyuseiPage() {
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="kyusei" data={null} />
  const d = data.kyusei
  const birth = parseDate(birthText)
  const star = shown && birth ? honmeiStar(birth) : null
  const today = todayParts()
  const year = kyuseiYear(today)
  const palace = star ? kyuseiPalace(star, kyuseiOfYear(year)) : null
  const s = star && d.stars[star]
  return (
    <ReadingShell id="kyusei" data={data}>
      <BirthForm id="kyusei" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'kyusei' }) }}>
        <p className="note">{d.note}</p>
      </BirthForm>
      {s && (
        <div className="result">
          <ResultHead eyebrow={d.resultHeading} visual={<div className="star-badge" style={{ '--star': KYUSEI_COLORS[star] }}>{star}</div>} title={s.name} keywords={s.keywords} />
          <Sections items={[{ heading: d.labels.nature, text: s.nature }, { heading: d.labels.love, text: s.love }, { heading: d.labels.work, text: s.work }]} />
          <Chips heading={d.labels.partners} items={kyuseiPartners(star).map((n) => d.stars[n].name)} />
          <div className="year-box">
            <p className="eyebrow">{d.labels.thisYear(year)}</p>
            <h4>{d.palaces[palace].title}</h4>
            <p>{d.palaces[palace].text}</p>
          </div>
          <ShareButtons text={d.share(s.name)} />
          <SisterCard page="birthday" />
        </div>
      )}
    </ReadingShell>
  )
}

const ETO_EMOJI = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐗']

export function EtoPage() {
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="eto" data={null} />
  const d = data.eto
  const birth = parseDate(birthText)
  const index = shown && birth ? etoIndex(birth) : null
  const a = index !== null ? d.animals[index] : null
  const partners = index !== null ? etoPartners(index) : null
  return (
    <ReadingShell id="eto" data={data}>
      <BirthForm id="eto" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'eto' }) }}>
        <p className="note">{d.note}</p>
      </BirthForm>
      {a && (
        <div className="result">
          <ResultHead eyebrow={d.resultHeading} visual={<div className="emoji-visual">{ETO_EMOJI[index]}</div>} title={a.name} keywords={a.keywords} />
          <Sections items={[{ heading: d.labels.nature, text: a.nature }, { heading: d.labels.love, text: a.love }, { heading: d.labels.work, text: a.work }]} />
          <Chips heading={d.labels.sango} items={partners.sango.map((i) => d.animals[i].name)} />
          <Chips heading={d.labels.rokugo} items={[d.animals[partners.rokugo].name]} />
          <ShareButtons text={d.share(a.name)} />
          <SisterCard page="name" />
        </div>
      )}
    </ReadingShell>
  )
}

// =================== 西洋 ===================
export function ZodiacPage() {
  const t = useDictionary()
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="zodiac" data={null} />
  const d = data.zodiac
  const birth = parseDate(birthText)
  const index = shown && birth ? zodiacIndex(birth) : null
  const sign = index !== null ? d.signs[index] : null
  const stone = birth ? d.birthstones[birth.month - 1] : null
  return (
    <ReadingShell id="zodiac" data={data}>
      <BirthForm id="zodiac" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'zodiac' }) }} />
      {sign && (
        <div className="result">
          <ResultHead eyebrow={d.resultHeading} visual={<div className="emoji-visual zodiac-glyph">{ZODIAC_EMOJI[index]}</div>} title={t.zodiac[index]} sub={`${d.labels.element}:${d.elements[ZODIAC_ELEMENT[index]]}`} keywords={sign.keywords} />
          <Sections items={[{ heading: d.labels.nature, text: sign.nature }, { heading: d.labels.love, text: sign.love }, { heading: d.labels.work, text: sign.work }]} />
          <Chips heading={d.labels.partners} items={zodiacPartners(index).map((i) => t.zodiac[i])} />
          <div className="year-box">
            <p className="eyebrow">{d.labels.birthstone(birth.month)}</p>
            <h4>💎 {stone.name}</h4>
            <p>{stone.meaning}</p>
          </div>
          <ShareButtons text={d.share(t.zodiac[index])} />
          <SisterCard page="compat" />
        </div>
      )}
    </ReadingShell>
  )
}

// 月の形を描く(age=月齢)
function MoonImage({ age, size = 120 }) {
  const f = age / 29.530588853
  const k = Math.cos(2 * Math.PI * f)
  const r = 40
  const rx = Math.abs(k) * r
  const waxing = f < 0.5
  const lit = `M60 ${60 - r} A ${r} ${r} 0 0 1 60 ${60 + r} A ${rx} ${r} 0 0 ${k > 0 ? 0 : 1} 60 ${60 - r} Z`
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="moon-img" aria-hidden="true">
      <circle cx="60" cy="60" r={r + 10} fill="rgba(232,194,106,0.08)" />
      <circle cx="60" cy="60" r={r} fill="#2b2448" />
      <g transform={waxing ? '' : 'translate(120 0) scale(-1 1)'}>
        <path d={lit} fill="#f6e7b0" />
      </g>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(246,231,176,0.35)" />
    </svg>
  )
}

export function MoonPage() {
  const t = useDictionary()
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="moon" data={null} />
  const d = data.moon
  const birth = parseDate(birthText)
  const today = todayParts()
  const idx = shown && birth ? moonPhaseIndex(birth) : null
  const p = idx !== null ? d.phases[idx] : null
  const todayIdx = moonPhaseIndex(today)
  return (
    <ReadingShell id="moon" data={data}>
      <BirthForm id="moon" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'moon' }) }} />
      {p && (
        <div className="result">
          <ResultHead eyebrow={d.yourMoon} visual={<MoonImage age={moonAge(birth)} />} title={p.name} sub={`${formatLongDate(t.locale, birth.year, birth.month, birth.day)} / ${d.age(moonAge(birth).toFixed(1))}`} keywords={p.keywords} />
          <Sections items={[{ heading: d.labels.nature, text: p.nature }, { heading: d.labels.love, text: p.love }, { heading: d.labels.advice, text: p.advice }]} />
          <div className="year-box today-moon">
            <MoonImage age={moonAge(today)} size={64} />
            <div>
              <p className="eyebrow">{d.todayMoon}</p>
              <h4>{d.phases[todayIdx].name}</h4>
              <p>{d.age(moonAge(today).toFixed(1))}</p>
            </div>
          </div>
          <ShareButtons text={d.share(p.name)} />
          <SisterCard page="name" />
        </div>
      )}
    </ReadingShell>
  )
}

export function CelticPage() {
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="celtic" data={null} />
  const d = data.celtic
  const birth = parseDate(birthText)
  const tree = shown && birth ? d.trees[CELTIC_KEYS[celticTreeIndex(birth)]] : null
  return (
    <ReadingShell id="celtic" data={data}>
      <BirthForm id="celtic" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'celtic' }) }} />
      {tree && (
        <div className="result">
          <ResultHead eyebrow={d.resultHeading} visual={<div className="emoji-visual">🌳</div>} title={tree.name} sub={`${d.labels.period}:${tree.period}`} keywords={tree.keywords} />
          <Sections items={[{ heading: d.labels.nature, text: tree.nature }, { heading: d.labels.love, text: tree.love }, { heading: d.labels.advice, text: tree.advice }]} />
          <ShareButtons text={d.share(tree.name)} />
          <SisterCard page="birthday" />
        </div>
      )}
    </ReadingShell>
  )
}

// タロットのカード(大アルカナ22枚)の絵柄
const TAROT_ICONS = ['🎒', '🪄', '📜', '👑', '🏰', '🔑', '💞', '🐎', '🦁', '🏮', '☸️', '⚖️', '🙃', '🦋', '🏺', '⛓️', '⚡', '⭐', '🌙', '☀️', '📯', '🌍']
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']

function TarotCard({ index, name, reversed, faceUp, onClick }) {
  return (
    <button type="button" className={`tarot-card ${faceUp ? 'face-up' : ''}`} onClick={onClick} disabled={!onClick} aria-label={faceUp ? name : 'card'}>
      <span className="tarot-inner">
        <span className="tarot-back" aria-hidden="true">✦</span>
        <span className={`tarot-front ${reversed ? 'reversed' : ''}`}>
          <span className="tarot-roman">{ROMAN[index]}</span>
          <span className="tarot-icon">{TAROT_ICONS[index]}</span>
          <span className="tarot-name">{name}</span>
        </span>
      </span>
    </button>
  )
}

export function TarotPage() {
  const { data } = useReadingData()
  const [stage, setStage] = useState('idle')
  const [draw, setDraw] = useState(null)
  useEffect(() => {
    if (stage !== 'shuffle') return undefined
    const timer = setTimeout(() => setStage('back'), 1300)
    return () => clearTimeout(timer)
  }, [stage])
  if (!data) return <ReadingShell id="tarot" data={null} />
  const d = data.tarot
  const start = () => { setDraw(drawTarot()); setStage('shuffle') }
  const card = draw && d.cards[draw.card]
  const pos = draw && (draw.reversed ? d.labels.reversed : d.labels.upright)
  return (
    <ReadingShell id="tarot" data={data}>
      <div className="form draw-stage">
        {stage === 'idle' && (
          <>
            <p className="note">{d.hint}</p>
            <div className="deck" aria-hidden="true"><span /><span /><span /></div>
            <button type="button" className="primary" onClick={start}>{d.draw}</button>
          </>
        )}
        {stage === 'shuffle' && (
          <>
            <div className="deck shuffling" aria-hidden="true"><span /><span /><span /></div>
            <p className="stage-caption">{d.shuffle}</p>
          </>
        )}
        {(stage === 'back' || stage === 'open') && card && (
          <>
            <TarotCard index={draw.card} name={card.name} reversed={draw.reversed} faceUp={stage === 'open'} onClick={stage === 'back' ? () => { setStage('open'); track('kantei_result', { reading: 'tarot', card: draw.card }) } : null} />
            {stage === 'back' && <p className="stage-caption">{d.tapToFlip}</p>}
          </>
        )}
      </div>
      {stage === 'open' && card && (
        <div className="result">
          <ResultHead eyebrow={pos} visual={null} title={`${ROMAN[draw.card]}. ${card.name}`} keywords={card.keywords} />
          <Sections items={[{ heading: `${d.labels.meaning}(${pos})`, text: draw.reversed ? card.reversed : card.upright }, { heading: d.labels.advice, text: card.advice }]} />
          <button type="button" className="secondary" onClick={() => setStage('idle')}>{d.labels.again}</button>
          <ShareButtons text={d.share(card.name, pos)} />
          <SisterCard page="compat" />
        </div>
      )}
    </ReadingShell>
  )
}

// ルーン文字(60×100の枠に線で描く)
const RUNE_LINES = [
  ['20,10 20,90', '20,32 45,14', '20,52 45,34'],
  ['15,90 15,12 45,34 45,90'],
  ['20,10 20,90', '20,34 42,50 20,66'],
  ['20,10 20,90', '20,14 45,34', '20,34 45,54'],
  ['20,90 20,10 42,30 20,50 45,90'],
  ['42,20 18,50 42,80'],
  ['15,15 45,85', '45,15 15,85'],
  ['20,90 20,10 42,30 20,50'],
  ['15,10 15,90', '45,10 45,90', '15,40 45,60'],
  ['30,10 30,90', '15,40 45,60'],
  ['30,10 30,90'],
  ['26,22 12,38 26,54', '34,46 48,62 34,78'],
  ['30,10 30,90', '30,10 44,24', '30,90 16,76'],
  ['15,10 15,90', '15,12 32,28 45,12', '15,88 32,72 45,88'],
  ['30,10 30,90', '30,42 14,14', '30,42 46,14'],
  ['42,10 18,40 42,60 18,90'],
  ['30,12 30,90', '14,34 30,12 46,34'],
  ['15,90 15,10 42,30 15,50 42,70 15,90'],
  ['15,90 15,10 30,32 45,10 45,90'],
  ['15,90 15,10 45,42 45,10 15,42', '45,42 45,90'],
  ['20,90 20,10 44,32'],
  ['30,18 48,50 30,82 12,50 30,18'],
  ['12,15 12,85 48,15 48,85 12,15'],
  ['12,36 30,10 48,36', '12,36 46,90', '48,36 14,90'],
]

function RuneStone({ index }) {
  return (
    <svg viewBox="0 0 120 140" className="rune-stone" aria-hidden="true">
      <path d="M20 30 Q 22 8 60 6 Q 100 8 102 34 Q 112 80 98 116 Q 84 136 58 134 Q 26 134 16 108 Q 8 70 20 30 Z" fill="#6b6478" stroke="#3d3747" strokeWidth="3" />
      <path d="M30 26 Q 40 16 64 16" stroke="rgba(255,255,255,0.25)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g transform="translate(30 22)">
        {RUNE_LINES[index].map((pts) => <polyline key={pts} points={pts} fill="none" stroke="#f3d48a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />)}
      </g>
    </svg>
  )
}

export function RunePage() {
  const { data } = useReadingData()
  const [stage, setStage] = useState('idle')
  const [rune, setRune] = useState(null)
  useEffect(() => {
    if (stage !== 'drawing') return undefined
    const timer = setTimeout(() => { setStage('open'); track('kantei_result', { reading: 'rune' }) }, 1200)
    return () => clearTimeout(timer)
  }, [stage])
  if (!data) return <ReadingShell id="rune" data={null} />
  const d = data.rune
  const r = rune !== null ? d.runes[rune] : null
  return (
    <ReadingShell id="rune" data={data}>
      <div className="form draw-stage">
        {stage === 'idle' && (
          <>
            <p className="note">{d.hint}</p>
            <div className="rune-bag" aria-hidden="true">👝</div>
            <button type="button" className="primary" onClick={() => { setRune(drawRune().rune); setStage('drawing') }}>{d.draw}</button>
          </>
        )}
        {stage === 'drawing' && (
          <>
            <div className="rune-bag shaking" aria-hidden="true">👝</div>
            <p className="stage-caption">{d.drawing}</p>
          </>
        )}
        {stage === 'open' && r && <div className="rune-reveal"><RuneStone index={rune} /></div>}
      </div>
      {stage === 'open' && r && (
        <div className="result">
          <ResultHead eyebrow={d.labels.meaning} visual={null} title={r.name} keywords={r.keywords} />
          <p className="message-box">{r.message}</p>
          <button type="button" className="secondary" onClick={() => setStage('idle')}>{d.labels.again}</button>
          <ShareButtons text={d.share(r.name)} />
          <SisterCard page="today" />
        </div>
      )}
    </ReadingShell>
  )
}

export function PendulumPage() {
  const { data } = useReadingData()
  const [question, setQuestion] = useState('')
  const [stage, setStage] = useState('idle')
  const [answer, setAnswer] = useState(null)
  useEffect(() => {
    if (stage !== 'swinging') return undefined
    const timer = setTimeout(() => { setStage('open'); track('kantei_result', { reading: 'pendulum' }) }, 2600)
    return () => clearTimeout(timer)
  }, [stage])
  if (!data) return <ReadingShell id="pendulum" data={null} />
  const d = data.pendulum
  const a = answer !== null ? d.answers[answer] : null
  const swingClass = stage === 'swinging' ? 'swinging' : stage === 'open' ? `answer-${answer}` : ''
  return (
    <ReadingShell id="pendulum" data={data}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); setAnswer(swingPendulum()); setStage('swinging') }}>
        <label className="field" htmlFor="pendulum-q">
          <span>{d.questionLabel}</span>
          <input id="pendulum-q" type="text" maxLength={80} placeholder={d.placeholder} value={question} onChange={(e) => { setQuestion(e.target.value); setStage('idle') }} autoComplete="off" />
        </label>
        <p className="note">{d.note}</p>
        <div className="pendulum-stage" aria-hidden="true">
          <svg viewBox="0 0 120 170" className={`pendulum ${swingClass}`}>
            <circle cx="60" cy="8" r="5" fill="#e8c26a" />
            <line x1="60" y1="8" x2="60" y2="128" stroke="#e8c26a" strokeWidth="1.5" />
            <path d="M60 126 L72 142 L60 166 L48 142 Z" fill="#b9a7ff" stroke="#e8c26a" strokeWidth="1.5" />
          </svg>
        </div>
        {stage === 'swinging'
          ? <p className="stage-caption">{d.swinging}</p>
          : <button type="submit" className="primary" disabled={!question.trim()}>{stage === 'open' ? d.again : d.swing}</button>}
      </form>
      {stage === 'open' && a && (
        <div className="result">
          <ResultHead eyebrow={question} visual={null} title={a.title} />
          <p className="message-box">{a.text}</p>
          <ShareButtons text={d.share(a.title)} />
          <SisterCard page="today" />
        </div>
      )}
    </ReadingShell>
  )
}

export function PastLifePage() {
  const { data } = useReadingData()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [name, setName] = useStoredState('kantei:name', '')
  const [shown, setShown] = useState(false)
  if (!data) return <ReadingShell id="pastlife" data={null} />
  const d = data.pastlife
  const birth = parseDate(birthText)
  const pl = shown && birth ? pastLife(birthText, birth, name) : null
  const world = pl && d.worlds[pl.world]
  const job = pl && d.jobs[pl.job]
  return (
    <ReadingShell id="pastlife" data={data}>
      <BirthForm id="pastlife" birthText={birthText} setBirthText={setBirthText} onChange={() => setShown(false)} onSubmit={() => { setShown(true); track('kantei_result', { reading: 'pastlife' }) }}>
        <NameInput id="name-pastlife" label={data.common.nameOptional} value={name} onChange={(v) => { setName(v); setShown(false) }} />
      </BirthForm>
      {pl && (
        <div className="result">
          <ResultHead eyebrow={d.resultHeading} visual={<div className="emoji-visual">🕰️</div>} title={job.name} sub={world.name} />
          <p className="message-box">{d.story(world, job)}</p>
          <Sections items={[{ heading: d.labels.world, text: world.name }, { heading: d.labels.job, text: `${job.name}:${job.trait}` }, { heading: d.labels.lesson, text: d.lessons[pl.lesson] }]} />
          <ShareButtons text={d.share(world.name, job.name)} />
          <SisterCard page="name" />
        </div>
      )}
    </ReadingShell>
  )
}

export function EnmusubiPage() {
  return <ThemedOmikujiPage theme="enmusubi" />
}

export function KinunPage() {
  return <ThemedOmikujiPage theme="kinun" />
}

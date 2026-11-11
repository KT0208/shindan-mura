import { useEffect, useState } from 'react'
import {
  compatibility,
  containsHan,
  dailyFortune,
  formatDate,
  lifePathNumber,
  loadStrokeTable,
  nameNumber,
  normalizeName,
  parseDate,
  personalYearNumber,
  soulNumber,
  zodiacIndex,
  ZODIAC_EMOJI,
} from './fortune'
import { loadDictionary, ja } from './i18n'
import { DictionaryContext, useDictionary } from './i18n/context'
import { LANGUAGES, LANGUAGE_SUGGESTIONS, languageFromPath, languagePath, preferredLanguage } from './i18n/languages'
import Omikuji from './Omikuji'

const MENU_IDS = [
  { id: 'birthday', emoji: '🎂' },
  { id: 'name', emoji: '🖋️' },
  { id: 'today', emoji: '⛩️' },
  { id: 'compat', emoji: '💞' },
]

// URLのハッシュ(#/birthday など)でページを切り替える。サーバー設定なしで静的ホスティングできる。
function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '') || 'home'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onChange = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

// 生年月日などはブラウザ内(localStorage)にだけ保存し、次回の入力を省略する。
function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return window.localStorage.getItem(key) ?? initial
    } catch {
      return initial
    }
  })
  const update = (next) => {
    setValue(next)
    try {
      window.localStorage.setItem(key, next)
    } catch {
      // 保存できない環境(プライベートモード等)では無視
    }
  }
  return [value, update]
}

// 漢字の名前が入っていたら画数表を読み込む。読み込み中は false。
function useStrokesReady(...names) {
  const needed = names.some((n) => containsHan(n))
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!needed || loaded) return
    let alive = true
    loadStrokeTable().then(() => alive && setLoaded(true))
    return () => {
      alive = false
    }
  }, [needed, loaded])
  return !needed || loaded
}

function formatLongDate(locale, year, month, day) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))
}

function Stars({ value }) {
  const t = useDictionary()
  return (
    <span className="stars" role="img" aria-label={t.ui.stars(value)}>
      {'★'.repeat(value)}
      <span className="stars-off">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

function ShareButtons({ text }) {
  const t = useDictionary()
  const [copied, setCopied] = useState(false)
  const url = window.location.href
  const fullText = `${text}\n${t.ui.share.hashtag}`
  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(url)}`
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(fullText)}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${fullText}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="share">
      <a className="share-btn share-x" href={xUrl} target="_blank" rel="noopener noreferrer">{t.ui.share.x}</a>
      <a className="share-btn share-line" href={lineUrl} target="_blank" rel="noopener noreferrer">{t.ui.share.line}</a>
      <button type="button" className="share-btn share-copy" onClick={copy}>{copied ? t.ui.share.copied : t.ui.share.copy}</button>
    </div>
  )
}

function DateInput({ id, value, onChange }) {
  const t = useDictionary()
  return (
    <label className="field" htmlFor={id}>
      <span>{t.ui.birthDate}</span>
      <input id={id} type="date" min="1900-01-01" max={formatDate(new Date())} value={value} onChange={(e) => onChange(e.target.value)} required />
    </label>
  )
}

function NameInput({ id, label, value, onChange, required = false }) {
  const t = useDictionary()
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} type="text" inputMode="text" maxLength={40} placeholder={t.ui.name.placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  )
}

function NumberCard({ number, heading }) {
  const t = useDictionary()
  const info = t.numberTypes[number]
  return (
    <div className="number-card">
      <p className="eyebrow">{heading}</p>
      <div className="big-number">{number}</div>
      <h3>{info.title}</h3>
      <ul className="keywords">
        {info.keywords.map((k) => <li key={k}>{k}</li>)}
      </ul>
    </div>
  )
}

function ReadingSections({ number }) {
  const t = useDictionary()
  const info = t.numberTypes[number]
  const s = t.ui.sections
  return (
    <div className="sections">
      <section><h4>{s.nature}</h4><p>{info.nature}</p></section>
      <section><h4>{s.love}</h4><p>{info.love}</p></section>
      <section><h4>{s.work}</h4><p>{info.work}</p></section>
      <section><h4>{s.advice}</h4><p>{info.advice}</p></section>
    </div>
  )
}

// ---- 各鑑定ページ ----

function BirthdayPage() {
  const t = useDictionary()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [submitted, setSubmitted] = useState(false)
  const birth = parseDate(birthText)
  const thisYear = new Date().getFullYear()

  let result = null
  if (submitted && birth) {
    const lp = lifePathNumber(birth)
    const py = personalYearNumber(birth, thisYear)
    const z = zodiacIndex(birth)
    result = (
      <div className="result">
        <NumberCard number={lp} heading={t.ui.birthday.numberHeading} />
        <p className="sub-info">{ZODIAC_EMOJI[z]} {t.zodiac[z]} / {t.ui.birthday.born(formatLongDate(t.locale, birth.year, birth.month, birth.day))}</p>
        <ReadingSections number={lp} />
        <div className="year-box">
          <p className="eyebrow">{t.ui.birthday.yearHeading(thisYear, py)}</p>
          <h4>{t.yearThemes[py].theme}</h4>
          <p>{t.yearThemes[py].text}</p>
        </div>
        <ShareButtons text={t.ui.birthday.share(lp, t.numberTypes[lp].title, thisYear, t.yearThemes[py].theme)} />
      </div>
    )
  }

  return (
    <Page id="birthday" lead={t.ui.birthday.lead}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
        <DateInput id="birth" value={birthText} onChange={(v) => { setBirthText(v); setSubmitted(false) }} />
        <button type="submit" className="primary" disabled={!birth}>{t.ui.submit}</button>
      </form>
      {result}
    </Page>
  )
}

function NamePage() {
  const t = useDictionary()
  const [name, setName] = useStoredState('kantei:name', '')
  const [submitted, setSubmitted] = useState(false)
  const strokesReady = useStrokesReady(name)
  const valid = normalizeName(name).length > 0
  let result = null
  if (submitted && valid && strokesReady) {
    const n = nameNumber(name)
    const s = soulNumber(name)
    const parts = t.ui.name.summary(name.trim(), t.numberTypes[n].title, t.numberTypes[s].title)
    result = (
      <div className="result">
        <div className="number-pair">
          <NumberCard number={n} heading={t.ui.name.outer} />
          <NumberCard number={s} heading={t.ui.name.inner} />
        </div>
        <p className="sub-info">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}
        </p>
        <ReadingSections number={n} />
        <div className="year-box">
          <p className="eyebrow">{t.ui.name.innerHeading}</p>
          <h4>{t.numberTypes[s].title}</h4>
          <p>{t.numberTypes[s].nature}</p>
        </div>
        <ShareButtons text={t.ui.name.share(t.numberTypes[n].title, t.numberTypes[s].title)} />
      </div>
    )
  }
  return (
    <Page id="name" lead={t.ui.name.lead}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
        <NameInput id="name" label={t.ui.name.label} value={name} onChange={(v) => { setName(v); setSubmitted(false) }} required />
        <button type="submit" className="primary" disabled={!valid}>{t.ui.submit}</button>
      </form>
      {result}
    </Page>
  )
}

function TodayPage() {
  const t = useDictionary()
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [opened, setOpened] = useState(false)
  const birth = parseDate(birthText)
  const todayText = formatDate(new Date())
  const [y, m, d] = todayText.split('-').map(Number)
  const f = birth ? dailyFortune(birthText, todayText) : null
  const tt = t.ui.today

  return (
    <Page id="today" lead={tt.lead}>
      <div className="form">
        <DateInput id="birth-today" value={birthText} onChange={(v) => { setBirthText(v); setOpened(false) }} />
        {!birth && <p className="note">{tt.needBirth}</p>}
      </div>
      {f && (
        <Omikuji
          key={birthText}
          fortune={f}
          dateLabel={formatLongDate(t.locale, y, m, d)}
          onOpen={() => setOpened(true)}
          onReset={() => setOpened(false)}
        />
      )}
      {f && opened && (
        <div className="result">
          <table className="score-table">
            <tbody>
              {['total', 'love', 'money', 'work', 'health'].map((key) => (
                <tr key={key}><th>{tt.scores[key]}</th><td><Stars value={f.scores[key]} /></td></tr>
              ))}
            </tbody>
          </table>
          <div className="lucky-grid">
            <div><span>{tt.lucky.color}</span><strong>{t.luckyColors[f.luckyColor]}</strong></div>
            <div><span>{tt.lucky.item}</span><strong>{t.luckyItems[f.luckyItem]}</strong></div>
            <div><span>{tt.lucky.number}</span><strong>{f.luckyNumber}</strong></div>
            <div><span>{tt.lucky.action}</span><strong>{t.luckyActions[f.luckyAction]}</strong></div>
          </div>
          <p className="note">{tt.sameDay}</p>
          <ShareButtons text={tt.share(t.omikujiRanks[f.omikujiIndex], t.luckyItems[f.luckyItem])} />
        </div>
      )}
    </Page>
  )
}

function compatCommentIndex(percent) {
  if (percent >= 90) return 0
  if (percent >= 80) return 1
  if (percent >= 70) return 2
  if (percent >= 60) return 3
  return 4
}

function CompatPage() {
  const t = useDictionary()
  const tc = t.ui.compat
  const [birthA, setBirthA] = useStoredState('kantei:birth', '')
  const [nameA, setNameA] = useState('')
  const [birthB, setBirthB] = useState('')
  const [nameB, setNameB] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const strokesReady = useStrokesReady(nameA, nameB)
  const a = parseDate(birthA)
  const b = parseDate(birthB)
  const reset = (setter) => (v) => { setter(v); setSubmitted(false) }

  let result = null
  if (submitted && a && b && strokesReady) {
    const c = compatibility(
      { birth: a, birthText: birthA, name: nameA },
      { birth: b, birthText: birthB, name: nameB },
    )
    const rel = t.relationTexts[c.relation]
    const labelA = nameA.trim() || tc.you
    const labelB = nameB.trim() || tc.partner
    result = (
      <div className="result">
        <div className="compat-meter">
          <p className="eyebrow">{labelA} × {labelB}</p>
          <div className="percent">{c.percent}<small>%</small></div>
          <div className="meter"><div className="meter-fill" style={{ width: `${c.percent}%` }} /></div>
          <p>{t.compatComments[compatCommentIndex(c.percent)]}</p>
        </div>
        <div className="number-pair">
          <div className="mini-card"><span>{tc.lifePathOf(labelA)}</span><strong>{c.lifePaths[0]}</strong><em>{t.numberTypes[c.lifePaths[0]].title}</em></div>
          <div className="mini-card"><span>{tc.lifePathOf(labelB)}</span><strong>{c.lifePaths[1]}</strong><em>{t.numberTypes[c.lifePaths[1]].title}</em></div>
        </div>
        <div className="sections">
          <section><h4>💞 {rel.title}</h4><p>{rel.text}</p></section>
        </div>
        <table className="score-table">
          <tbody>
            {['talk', 'heart', 'future'].map((key) => (
              <tr key={key}><th>{tc.subs[key]}</th><td><Stars value={c.sub[key]} /></td></tr>
            ))}
          </tbody>
        </table>
        <ShareButtons text={tc.share(labelA, labelB, c.percent, rel.title)} />
      </div>
    )
  }

  return (
    <Page id="compat" lead={tc.lead}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
        <fieldset>
          <legend>{tc.you}</legend>
          <DateInput id="birth-a" value={birthA} onChange={reset(setBirthA)} />
          <NameInput id="name-a" label={tc.nameOptional} value={nameA} onChange={reset(setNameA)} />
        </fieldset>
        <fieldset>
          <legend>{tc.partner}</legend>
          <DateInput id="birth-b" value={birthB} onChange={reset(setBirthB)} />
          <NameInput id="name-b" label={tc.nameOptional} value={nameB} onChange={reset(setNameB)} />
        </fieldset>
        <button type="submit" className="primary" disabled={!a || !b}>{tc.submit}</button>
      </form>
      {result}
    </Page>
  )
}

// ---- レイアウト ----

function Page({ id, lead, children }) {
  const t = useDictionary()
  const menu = MENU_IDS.find((m) => m.id === id)
  const title = t.ui.menus[id].title
  useEffect(() => {
    document.title = `${title}｜${t.siteName}`
  }, [title, t.siteName])
  return (
    <main className="page">
      <a className="back" href="#/">{t.ui.back}</a>
      <header className="page-header">
        <div className="page-emoji">{menu.emoji}</div>
        <h2>{title}</h2>
        <p>{lead}</p>
      </header>
      {children}
      <OtherMenus />
    </main>
  )
}

function OtherMenus() {
  const t = useDictionary()
  return (
    <nav className="other-menus" aria-label={t.ui.otherMenus}>
      <p className="eyebrow">{t.ui.otherMenus}</p>
      <div className="menu-grid compact">
        {MENU_IDS.map((menu) => (
          <a key={menu.id} className="menu-card" href={`#/${menu.id}`}>
            <span className="menu-emoji">{menu.emoji}</span>
            <strong>{t.ui.menus[menu.id].title}</strong>
          </a>
        ))}
      </div>
    </nav>
  )
}

function Home() {
  const t = useDictionary()
  useEffect(() => {
    document.title = t.meta.title
  }, [t.meta.title])
  return (
    <main>
      <header className="hero">
        <p className="eyebrow">{t.ui.heroEyebrow}</p>
        <h1>鑑定村</h1>
        {t.siteName !== '鑑定村' && <p className="hero-sub">{t.siteName}</p>}
        <p>{t.ui.heroText}</p>
      </header>
      <div className="menu-grid">
        {MENU_IDS.map((menu) => (
          <a key={menu.id} className="menu-card" href={`#/${menu.id}`}>
            <span className="menu-emoji">{menu.emoji}</span>
            <strong>{t.ui.menus[menu.id].title}</strong>
            <span>{t.ui.menus[menu.id].text}</span>
          </a>
        ))}
      </div>
    </main>
  )
}

// 言語の切り替え。選ぶと /en/ などその言語のページへ移動する(今見ている鑑定のページはそのまま)。
function LanguageSwitcher({ current }) {
  const t = useDictionary()
  const change = (e) => {
    const lang = LANGUAGES.find((l) => l.code === e.target.value)
    window.location.href = languagePath(lang) + window.location.hash
  }
  return (
    <label className="language-switcher">
      <span aria-hidden="true">🌐</span>
      <select value={current.code} onChange={change} aria-label={t.ui.language}>
        {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
      </select>
    </label>
  )
}

// 日本語のトップで、ブラウザの言語が別の言語なら、その言語のページを案内する
function LanguageSuggestion({ current }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem('kantei:lang-suggest') === 'off'
    } catch {
      return false
    }
  })
  const suggestion = current.code === 'ja' ? preferredLanguage(navigator.languages || [navigator.language]) : null
  if (dismissed || !suggestion || suggestion.code === 'ja') return null
  const close = () => {
    setDismissed(true)
    try {
      window.localStorage.setItem('kantei:lang-suggest', 'off')
    } catch {
      // 無視
    }
  }
  return (
    <div className="lang-suggest" lang={suggestion.code}>
      <a href={languagePath(suggestion) + window.location.hash}>🌐 {LANGUAGE_SUGGESTIONS[suggestion.code]} →</a>
      <button type="button" onClick={close} aria-label="×">×</button>
    </div>
  )
}

const currentLanguage = languageFromPath(window.location.pathname)

export default function App() {
  const route = useHashRoute()
  const [dictionary, setDictionary] = useState(currentLanguage.code === 'ja' ? ja : null)

  useEffect(() => {
    document.documentElement.lang = currentLanguage.code
    if (currentLanguage.code === 'ja') return
    let alive = true
    loadDictionary(currentLanguage.code).then((dict) => alive && setDictionary(dict))
    return () => {
      alive = false
    }
  }, [])

  if (!dictionary) return <div className="app loading" aria-busy="true" />

  const pages = { birthday: BirthdayPage, name: NamePage, today: TodayPage, compat: CompatPage }
  const Current = pages[route] || Home
  return (
    <DictionaryContext.Provider value={dictionary}>
      <div className="app">
        <div className="sky" aria-hidden="true" />
        <div className="topbar">
          <LanguageSwitcher current={currentLanguage} />
        </div>
        <LanguageSuggestion current={currentLanguage} />
        <Current />
        <footer className="footer">
          {dictionary.ui.footer.map((line) => <p key={line}>{line}</p>)}
          <p>© {dictionary.siteName}</p>
        </footer>
      </div>
    </DictionaryContext.Provider>
  )
}

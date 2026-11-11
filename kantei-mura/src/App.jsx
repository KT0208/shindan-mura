import { useEffect, useState } from 'react'
import {
  compatibility,
  dailyFortune,
  formatDate,
  lifePathNumber,
  nameNumber,
  normalizeName,
  parseDate,
  personalYearNumber,
  soulNumber,
  zodiacSign,
} from './fortune'
import { compatComment, numberTypes, relationTexts, yearThemes } from './readings'
import Omikuji from './Omikuji'

const SITE_NAME = '鑑定村'

const MENUS = [
  { id: 'birthday', emoji: '🎂', title: '誕生日鑑定', text: '生年月日から運命数と今年のテーマを鑑定' },
  { id: 'name', emoji: '🖋️', title: '名前鑑定', text: '名前に宿る数から、あなたの本質と内面を読み解く' },
  { id: 'today', emoji: '⛩️', title: '今日の運勢・おみくじ', text: '毎日変わる運勢とラッキーアイテム' },
  { id: 'compat', emoji: '💞', title: '2人の相性鑑定', text: '2人の誕生日と名前から相性を％で鑑定' },
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

// 生年月日はブラウザ内(localStorage)にだけ保存し、次回の入力を省略する。
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

function Stars({ value }) {
  return (
    <span className="stars" aria-label={`5段階中${value}`}>
      {'★'.repeat(value)}
      <span className="stars-off">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

function ShareButtons({ text }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href
  const fullText = `${text}\n#鑑定村`
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
      <a className="share-btn share-x" href={xUrl} target="_blank" rel="noopener noreferrer">Xでシェア</a>
      <a className="share-btn share-line" href={lineUrl} target="_blank" rel="noopener noreferrer">LINEで送る</a>
      <button type="button" className="share-btn share-copy" onClick={copy}>{copied ? 'コピーしました' : '結果をコピー'}</button>
    </div>
  )
}

function DateInput({ id, label, value, onChange }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} type="date" min="1900-01-01" max={formatDate(new Date())} value={value} onChange={(e) => onChange(e.target.value)} required />
    </label>
  )
}

function NameInput({ id, label, value, onChange, required = false }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} type="text" inputMode="text" maxLength={30} placeholder="例: やまだ はなこ" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  )
}

function NumberCard({ number, heading }) {
  const info = numberTypes[number]
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
  const info = numberTypes[number]
  return (
    <div className="sections">
      <section><h4>🔮 性格・本質</h4><p>{info.nature}</p></section>
      <section><h4>💗 恋愛</h4><p>{info.love}</p></section>
      <section><h4>💼 仕事・才能</h4><p>{info.work}</p></section>
      <section><h4>🍀 開運アドバイス</h4><p>{info.advice}</p></section>
    </div>
  )
}

// ---- 各鑑定ページ ----

function BirthdayPage() {
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [submitted, setSubmitted] = useState(false)
  const birth = parseDate(birthText)
  const showResult = submitted && birth
  const thisYear = new Date().getFullYear()

  let result = null
  if (showResult) {
    const lp = lifePathNumber(birth)
    const py = personalYearNumber(birth, thisYear)
    const sign = zodiacSign(birth)
    result = (
      <div className="result">
        <NumberCard number={lp} heading="あなたの運命数" />
        <p className="sub-info">{sign.emoji} {sign.name} / {birth.year}年{birth.month}月{birth.day}日生まれ</p>
        <ReadingSections number={lp} />
        <div className="year-box">
          <p className="eyebrow">{thisYear}年のあなた(個人年数 {py})</p>
          <h4>{yearThemes[py].theme}</h4>
          <p>{yearThemes[py].text}</p>
        </div>
        <ShareButtons text={`私の運命数は「${lp}・${numberTypes[lp].title}」でした。${thisYear}年は「${yearThemes[py].theme}」🎂`} />
      </div>
    )
  }

  return (
    <Page title="誕生日鑑定" emoji="🎂" lead="生年月日のすべての数字を足して導く「運命数」は、あなたが生まれ持った性質と人生のテーマを表します。">
      <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
        <DateInput id="birth" label="生年月日" value={birthText} onChange={(v) => { setBirthText(v); setSubmitted(false) }} />
        <button type="submit" className="primary" disabled={!birth}>鑑定する</button>
      </form>
      {result}
    </Page>
  )
}

function NamePage() {
  const [name, setName] = useStoredState('kantei:name', '')
  const [submitted, setSubmitted] = useState(false)
  const valid = normalizeName(name).length > 0
  let result = null
  if (submitted && valid) {
    const n = nameNumber(name)
    const s = soulNumber(name)
    result = (
      <div className="result">
        <div className="number-pair">
          <NumberCard number={n} heading="名前の数(外から見たあなた)" />
          <NumberCard number={s} heading="魂の数(心の奥のあなた)" />
        </div>
        <p className="sub-info">
          「{name.trim()}」さんは、周りからは<strong>{numberTypes[n].title}</strong>のように見られ、
          心の奥には<strong>{numberTypes[s].title}</strong>の願いを秘めています。
        </p>
        <ReadingSections number={n} />
        <div className="year-box">
          <p className="eyebrow">心の奥の願い</p>
          <h4>{numberTypes[s].title}</h4>
          <p>{numberTypes[s].nature}</p>
        </div>
        <ShareButtons text={`名前鑑定の結果、私は「${numberTypes[n].title}」、魂の数は「${numberTypes[s].title}」でした🖋️`} />
      </div>
    )
  }
  return (
    <Page title="名前鑑定" emoji="🖋️" lead="名前の一文字一文字には数が宿っています。ひらがな・カタカナ・ローマ字で入力すると、名前全体の数と、母音から導く「魂の数」を鑑定します。">
      <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
        <NameInput id="name" label="お名前(ひらがな推奨)" value={name} onChange={(v) => { setName(v); setSubmitted(false) }} required />
        <button type="submit" className="primary" disabled={!valid}>鑑定する</button>
      </form>
      {result}
    </Page>
  )
}

function TodayPage() {
  const [birthText, setBirthText] = useStoredState('kantei:birth', '')
  const [opened, setOpened] = useState(false)
  const birth = parseDate(birthText)
  const todayText = formatDate(new Date())
  const [y, m, d] = todayText.split('-').map(Number)
  const f = birth ? dailyFortune(birthText, todayText) : null

  return (
    <Page title="今日の運勢・おみくじ" emoji="⛩️" lead="神社と同じように、箱を振っておみくじを引いてみましょう。生年月日と今日の日付から、あなただけの運勢が出ます。毎日0時に新しくなります。">
      <div className="form">
        <DateInput id="birth-today" label="生年月日" value={birthText} onChange={(v) => { setBirthText(v); setOpened(false) }} />
        {!birth && <p className="note">生年月日を入れると、おみくじの箱が出てきます。</p>}
      </div>
      {f && (
        <Omikuji
          key={birthText}
          fortune={f}
          dateLabel={`${y}年${m}月${d}日`}
          onOpen={() => setOpened(true)}
          onReset={() => setOpened(false)}
        />
      )}
      {f && opened && (
        <div className="result">
          <table className="score-table">
            <tbody>
              <tr><th>総合運</th><td><Stars value={f.scores.total} /></td></tr>
              <tr><th>恋愛運</th><td><Stars value={f.scores.love} /></td></tr>
              <tr><th>金運</th><td><Stars value={f.scores.money} /></td></tr>
              <tr><th>仕事運</th><td><Stars value={f.scores.work} /></td></tr>
              <tr><th>健康運</th><td><Stars value={f.scores.health} /></td></tr>
            </tbody>
          </table>
          <div className="lucky-grid">
            <div><span>ラッキーカラー</span><strong>{f.luckyColor}</strong></div>
            <div><span>ラッキーアイテム</span><strong>{f.luckyItem}</strong></div>
            <div><span>ラッキーナンバー</span><strong>{f.luckyNumber}</strong></div>
            <div><span>開運アクション</span><strong>{f.luckyAction}</strong></div>
          </div>
          <p className="note">同じ日は何回引いても同じ結果です。日付が変わると新しいおみくじになります。</p>
          <ShareButtons text={`今日のおみくじは【${f.omikuji}】!ラッキーアイテムは「${f.luckyItem}」⛩️`} />
        </div>
      )}
    </Page>
  )
}

function CompatPage() {
  const [birthA, setBirthA] = useStoredState('kantei:birth', '')
  const [nameA, setNameA] = useState('')
  const [birthB, setBirthB] = useState('')
  const [nameB, setNameB] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const a = parseDate(birthA)
  const b = parseDate(birthB)
  const reset = (setter) => (v) => { setter(v); setSubmitted(false) }

  let result = null
  if (submitted && a && b) {
    const c = compatibility(
      { birth: a, birthText: birthA, name: nameA },
      { birth: b, birthText: birthB, name: nameB },
    )
    const rel = relationTexts[c.relation]
    const labelA = nameA.trim() || 'あなた'
    const labelB = nameB.trim() || 'お相手'
    result = (
      <div className="result">
        <div className="compat-meter">
          <p className="eyebrow">{labelA} × {labelB}</p>
          <div className="percent">{c.percent}<small>%</small></div>
          <div className="meter"><div className="meter-fill" style={{ width: `${c.percent}%` }} /></div>
          <p>{compatComment(c.percent)}</p>
        </div>
        <div className="number-pair">
          <div className="mini-card"><span>{labelA}の運命数</span><strong>{c.lifePaths[0]}</strong><em>{numberTypes[c.lifePaths[0]].title}</em></div>
          <div className="mini-card"><span>{labelB}の運命数</span><strong>{c.lifePaths[1]}</strong><em>{numberTypes[c.lifePaths[1]].title}</em></div>
        </div>
        <div className="sections">
          <section><h4>💞 {rel.title}</h4><p>{rel.text}</p></section>
        </div>
        <table className="score-table">
          <tbody>
            <tr><th>会話の相性</th><td><Stars value={c.sub.talk} /></td></tr>
            <tr><th>心の相性</th><td><Stars value={c.sub.heart} /></td></tr>
            <tr><th>将来の相性</th><td><Stars value={c.sub.future} /></td></tr>
          </tbody>
        </table>
        <ShareButtons text={`${labelA}と${labelB}の相性は${c.percent}%!「${rel.title}」でした💞`} />
      </div>
    )
  }

  return (
    <Page title="2人の相性鑑定" emoji="💞" lead="2人の運命数の関係から相性を鑑定します。名前も入れると、より詳しく占えます(名前は任意)。">
      <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
        <fieldset>
          <legend>あなた</legend>
          <DateInput id="birth-a" label="生年月日" value={birthA} onChange={reset(setBirthA)} />
          <NameInput id="name-a" label="名前(任意)" value={nameA} onChange={reset(setNameA)} />
        </fieldset>
        <fieldset>
          <legend>お相手</legend>
          <DateInput id="birth-b" label="生年月日" value={birthB} onChange={reset(setBirthB)} />
          <NameInput id="name-b" label="名前(任意)" value={nameB} onChange={reset(setNameB)} />
        </fieldset>
        <button type="submit" className="primary" disabled={!a || !b}>相性を鑑定する</button>
      </form>
      {result}
    </Page>
  )
}

// ---- レイアウト ----

function Page({ title, emoji, lead, children }) {
  useEffect(() => {
    document.title = `${title}｜${SITE_NAME}`
  }, [title])
  return (
    <main className="page">
      <a className="back" href="#/">← 村の入口へ</a>
      <header className="page-header">
        <div className="page-emoji">{emoji}</div>
        <h2>{title}</h2>
        <p>{lead}</p>
      </header>
      {children}
      <OtherMenus />
    </main>
  )
}

function OtherMenus() {
  return (
    <nav className="other-menus" aria-label="ほかの鑑定">
      <p className="eyebrow">ほかの鑑定もどうぞ</p>
      <div className="menu-grid compact">
        {MENUS.map((menu) => (
          <a key={menu.id} className="menu-card" href={`#/${menu.id}`}>
            <span className="menu-emoji">{menu.emoji}</span>
            <strong>{menu.title}</strong>
          </a>
        ))}
      </div>
    </nav>
  )
}

function Home() {
  useEffect(() => {
    document.title = `${SITE_NAME}｜無料の誕生日鑑定・名前鑑定・今日の運勢・相性占い`
  }, [])
  return (
    <main>
      <header className="hero">
        <p className="eyebrow">無料・登録不要の占いの村</p>
        <h1>鑑定村</h1>
        <p>生年月日や名前に宿る「数」から、あなたの本質・今日の運気・大切な人との相性を読み解きます。</p>
      </header>
      <div className="menu-grid">
        {MENUS.map((menu) => (
          <a key={menu.id} className="menu-card" href={`#/${menu.id}`}>
            <span className="menu-emoji">{menu.emoji}</span>
            <strong>{menu.title}</strong>
            <span>{menu.text}</span>
          </a>
        ))}
      </div>
    </main>
  )
}

export default function App() {
  const route = useHashRoute()
  const pages = { birthday: BirthdayPage, name: NamePage, today: TodayPage, compat: CompatPage }
  const Current = pages[route] || Home
  return (
    <div className="app">
      <div className="sky" aria-hidden="true" />
      <Current />
      <footer className="footer">
        <p>※ 鑑定結果は数秘術をもとにしたエンターテインメントです。大切な判断はご自身の意思で行ってください。</p>
        <p>入力内容はお使いのブラウザ内でのみ処理され、サーバーには送信されません。</p>
        <p>© {SITE_NAME}</p>
      </footer>
    </div>
  )
}

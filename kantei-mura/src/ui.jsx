// 画面の部品(複数の鑑定ページで使う)
import { useEffect, useState } from 'react'
import { formatDate } from './fortune'
import { useDictionary } from './i18n/context'
import { MENU_ITEMS, menuEmoji } from './menus'
import { shindanUrl } from './sisterSite'
import { amazonEnabled, amazonSearchUrl } from './amazon'
import { track } from './analytics'

export function Stars({ value }) {
  const t = useDictionary()
  return (
    <span className="stars" role="img" aria-label={t.ui.stars(value)}>
      {'★'.repeat(value)}
      <span className="stars-off">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

export function ShareButtons({ text }) {
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

export function DateInput({ id, value, onChange }) {
  const t = useDictionary()
  return (
    <label className="field" htmlFor={id}>
      <span>{t.ui.birthDate}</span>
      <input id={id} type="date" min="1900-01-01" max={formatDate(new Date())} value={value} onChange={(e) => onChange(e.target.value)} required />
    </label>
  )
}

export function NameInput({ id, label, value, onChange, required = false }) {
  const t = useDictionary()
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} type="text" inputMode="text" maxLength={40} placeholder={t.ui.name.placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  )
}

// ラッキーアイテムなどの下に出す「Amazonで見る」リンク(日本語ページだけ)
export function AmazonLink({ keyword, label = 'Amazonで見る', place }) {
  const t = useDictionary()
  const url = amazonEnabled(t.code) ? amazonSearchUrl(keyword) : null
  if (!url) return null
  return (
    <a className="amazon-link" href={url} target="_blank" rel="sponsored noopener" onClick={() => track('amazon_click', { place })}>
      <span className="pr-label">PR</span> {label} →
    </a>
  )
}

// 結果の下に出す、姉妹サイト「診断村」の案内カード(1つだけ)
export function SisterCard({ page }) {
  const t = useDictionary()
  const sister = t.ui.sister
  const item = sister.pages[page]
  return (
    <a className="sister-card" href={shindanUrl(t.code, page, `result_${page}`)} target="_blank" rel="noopener">
      <span className="sister-label">{sister.label} 🧩 診断村</span>
      <span className="sister-body">
        <span className="sister-emoji" aria-hidden="true">{item.emoji}</span>
        <span>
          <strong>{item.title}</strong>
          <small>{item.text}</small>
        </span>
      </span>
      <span className="sister-button">{sister.button} →</span>
    </a>
  )
}

export function NumberCard({ number, heading }) {
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

export function ReadingSections({ number }) {
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

export function Page({ id, lead, children }) {
  const t = useDictionary()
  const title = t.ui.menus[id].title
  useEffect(() => {
    document.title = `${title}｜${t.siteName}`
  }, [title, t.siteName])
  return (
    <main className="page">
      <a className="back" href="#/">{t.ui.back}</a>
      <header className="page-header">
        <div className="page-emoji">{menuEmoji(id)}</div>
        <h2>{title}</h2>
        <p>{lead}</p>
      </header>
      {children}
      <OtherMenus currentId={id} />
    </main>
  )
}

// ページの下の「ほかの鑑定」。今のページ以外から、おすすめを6つ並べる(同じカテゴリを先に)
export function OtherMenus({ currentId }) {
  const t = useDictionary()
  const others = MENU_ITEMS.filter((m) => m.id !== currentId)
  const start = Math.max(0, MENU_ITEMS.findIndex((m) => m.id === currentId))
  const picks = [...others.slice(start), ...others.slice(0, start)].slice(0, 6)
  return (
    <nav className="other-menus" aria-label={t.ui.otherMenus}>
      <p className="eyebrow">{t.ui.otherMenus}</p>
      <div className="menu-grid compact">
        {picks.map((menu) => (
          <a key={menu.id} className="menu-card" href={`#/${menu.id}`}>
            <span className="menu-emoji">{menu.emoji}</span>
            <strong>{t.ui.menus[menu.id].title}</strong>
          </a>
        ))}
      </div>
      <a className="detail-link" href="#/">{t.ui.allMenus}</a>
    </nav>
  )
}
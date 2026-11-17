import { useEffect, useRef, useState } from 'react'
import { SITE } from './site.js'
import { createBgm } from './bgm.js'

const API = '/api'
// お試し版(友人に見せる用)。サーバーなしで動き、AI・支払い・メール送信は行わない
const DEMO = import.meta.env.VITE_DEMO === '1'
const MY_GIFTS_KEY = 'hitotsu.myGifts'

const RELATIONS = [
  ['partner', '恋人・パートナー'],
  ['friend', '友人'],
  ['family', '家族'],
  ['coworker', '職場の方'],
  ['new', '最近知り合った方'],
]
const TONES = [
  ['sweet', 'やさしく、あたたかく'],
  ['funny', '明るく、楽しく'],
  ['thanks', '丁寧に、感謝をこめて'],
  ['casual', '気軽に、さりげなく'],
]
const OCCASIONS = [
  ['birthday', '誕生日'],
  ['anniversary', '記念日'],
  ['thanks', '感謝を伝えたい'],
  ['farewell', '門出・お別れ'],
  ['valentine', 'バレンタイン・ホワイトデー'],
  ['none', '特になし'],
]
const MEMORY_HINTS = [
  '例：初めて会ったのは、大学のサークルの新歓だった',
  '例：去年の夏、ふたりで花火を見に行った',
  '例：落ち込んだとき、いつも黙って隣にいてくれる',
  '例：これからも、毎年いっしょに桜を見たい',
]
const CHAPTERS = ['一', '二', '三', '四']

const ERRORS = {
  invalid_input: '入力が足りない項目があります。お名前と、思い出を2つ以上ご記入ください。',
  too_many_requests: '短い時間に多くの贈り物が作成されました。少し時間をおいてから、もう一度お試しください。',
  not_found: 'この贈り物は見つかりませんでした。リンクが正しいかご確認ください。',
  bot_check_failed: 'ロボットでないことの確認ができませんでした。もう一度お試しください。',
  invalid_delivery: 'メールアドレスか日時が正しくありません。日時は、今より先で1年以内を指定してください。',
  payment_unavailable: 'お支払いページを開けませんでした。少し時間をおいてお試しください。',
}

function errorText(code) {
  return ERRORS[code] || '通信がうまくいきませんでした。時間をおいて、もう一度お試しください。'
}

async function api(path, options) {
  if (DEMO) return (await import('./demo-api.js')).demoApi(path, options)
  const res = await fetch(`${API}/${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'network')
  return data
}

function readMyGifts() {
  try {
    return JSON.parse(localStorage.getItem(MY_GIFTS_KEY) || '[]')
  } catch {
    return []
  }
}

function rememberGift(entry) {
  try {
    const list = readMyGifts().filter((g) => g.id !== entry.id)
    localStorage.setItem(MY_GIFTS_KEY, JSON.stringify([{ ...entry, at: Date.now() }, ...list].slice(0, 20)))
  } catch {
    // 保存できなくても続ける(プライベートモードなど)
  }
}

const giftUrl = (id) => `${window.location.origin}/?id=${id}`
const ownerUrl = (id, key) => `/?id=${id}&key=${key}`
// 日付入力(<input type="date">)用の YYYY-MM-DD。days 日後の日付を返す
function dateInput(days = 0) {
  const d = new Date(Date.now() + days * 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// '2027-03-01 00:00:00' → '2027年3月1日 0:00'
function formatSchedule(at) {
  const [date, time] = at.split(/[ T]/)
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':')
  return `${y}年${m}月${d}日 ${Number(h)}:${min}`
}

const yen = (n) => `${Number(n).toLocaleString('ja-JP')}円`

// 写真を送る前に、長い辺 1400px の JPEG に縮める(通信量と保存容量を抑える)
async function resizePhoto(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const key = params.get('key')

  return (
    <>
      {DEMO && (
        <p className="demo-bar">
          これは公開前のお試し版です。お支払いは発生せず、メールも送られません。文章は仮のもので、作った贈り物はこの端末の中にだけ保存されます。
        </p>
      )}
      <header className="site-header">
        <a className="logo" href="/">
          {SITE.name}
          <small>{SITE.nameLatin}</small>
        </a>
      </header>
      <main>
        {!id && <CreatePage />}
        {id && key && <OwnerPage id={id} editKey={key} justPaid={params.get('paid') === '1'} />}
        {id && !key && <RecipientPage id={id} />}
      </main>
      <footer className="site-footer">
        <nav>
          <a href="/tokushoho/">特定商取引法に基づく表記</a>
          <a href="/privacy/">プライバシーポリシー</a>
          <a href="/terms/">利用規約</a>
        </nav>
        <p>&copy; {SITE.name}</p>
      </footer>
    </>
  )
}

// Cloudflare Turnstile(ロボットよけ)。確認が済むと onToken に合言葉が渡る。
// 作成のたびに AI の利用料がかかるので、自動プログラムによる連打を防ぐために入れている。
let turnstileScript
function loadTurnstile() {
  if (!turnstileScript) {
    turnstileScript = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => resolve(window.turnstile)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  return turnstileScript
}

function Turnstile({ onToken }) {
  const box = useRef(null)
  useEffect(() => {
    let widgetId
    let cancelled = false
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return
        widgetId = turnstile.render(box.current, {
          sitekey: SITE.turnstileKey,
          language: 'ja',
          callback: onToken,
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        })
      })
      .catch(() => onToken(''))
    return () => {
      cancelled = true
      if (widgetId !== undefined) window.turnstile?.remove(widgetId)
    }
  }, [onToken])
  return <div ref={box} className="turnstile" />
}

function Ornament() {
  return <div className="ornament" aria-hidden="true"><span /></div>
}

/* ---------- トップ・作成 ---------- */

function CreatePage() {
  const [form, setForm] = useState({
    plan: 'standard',
    extraPhotos: [],
    recipientName: '',
    senderName: '',
    relation: 'friend',
    tone: 'sweet',
    occasion: 'birthday',
    memories: [0, 1, 2, 3].map(() => ({ text: '', photo: null })),
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // ロボットよけの確認が済むと入る合言葉(1回の送信にしか使えない)
  const [botToken, setBotToken] = useState('')
  const needsBotCheck = !DEMO && SITE.turnstileKey !== ''
  const myGifts = readMyGifts()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const plan = SITE.plans[form.plan]
  const memories = form.memories.slice(0, plan.chapters)
  // 写真の読み込み中に入力が進んでも消えないよう、最新の状態をもとに更新する
  const setMemory = (i, patch) => {
    setForm((f) => ({ ...f, memories: f.memories.map((m, j) => (j === i ? { ...m, ...patch } : m)) }))
  }
  async function addExtras(files) {
    setError('')
    for (const file of [...files]) {
      try {
        const photo = await resizePhoto(file)
        setForm((f) => (f.extraPhotos.length < plan.extra ? { ...f, extraPhotos: [...f.extraPhotos, photo] } : f))
      } catch {
        setError('読み込めない写真がありました。別の写真（JPEG・PNG）でお試しください。')
      }
    }
  }
  async function pickPhoto(i, file) {
    if (!file) return
    setError('')
    try {
      setMemory(i, { photo: await resizePhoto(file) })
    } catch {
      setError('この写真は読み込めませんでした。別の写真（JPEG・PNG）でお試しください。')
    }
  }
  const filled = memories.filter((m) => m.text.trim()).length
  const canSubmit = form.recipientName.trim() && filled >= 2 && !loading && (!needsBotCheck || botToken)

  async function submit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    setBotToken('')
    window.scrollTo(0, 0)
    try {
      const data = await api('create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          memories: memories.filter((m) => m.text.trim()),
          extraPhotos: form.extraPhotos.slice(0, plan.extra),
          turnstileToken: botToken,
        }),
      })
      rememberGift({ id: data.id, key: data.key, to: form.recipientName.trim() })
      window.location.assign(ownerUrl(data.id, data.key))
    } catch (err) {
      setError(errorText(err.message))
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="panel narrow center wrapping">
        <div className="loader" aria-hidden="true" />
        <p className="serif large">{form.recipientName}さんへの贈り物を、<br />お包みしています。</p>
        <p className="muted">30秒ほどお待ちください。</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">A gift made for only one</p>
        <h1>
          世界にひとつの、
          <br />
          贈り物を。
        </h1>
        <Ornament />
        <p className="lead">
          <span>ふたりの思い出と写真を、</span><span>その人のためだけのゲームに。</span>
          <br />
          <span>最後に、音楽とともに</span><span>写真と言葉が届きます。</span>
        </p>
        <a className="button primary" href="#create">贈り物をつくる</a>
        <p className="hero-note">作成と試し遊びは無料です</p>
      </section>

      <section className="section">
        <h2 className="section-title"><span>How it works</span>贈り物ができるまで</h2>
        <ol className="steps">
          <li>
            <b>01</b>
            <h3>思い出を書く</h3>
            <p>ふたりだけが知っている思い出を三つ。それぞれに写真を一枚ずつ添えられます。プレミアムなら四つ、写真は十枚まで。</p>
          </li>
          <li>
            <b>02</b>
            <h3>試しに遊ぶ</h3>
            <p>思い出が、章立てのゲームになります。どの答えを選んでも、あなたの気持ちが言葉になって返ります。</p>
          </li>
          <li>
            <b>03</b>
            <h3>リンクで贈る</h3>
            <p>リンクを LINE やメールで送るだけ。章を終えるたびに写真が開き、最後はスライドショーに。</p>
          </li>
        </ol>
      </section>

      <section className="section" id="create">
        <h2 className="section-title"><span>Create</span>贈り物をつくる</h2>
        <form className="panel form" onSubmit={submit}>
          <fieldset>
            <legend>プラン</legend>
            <div className="plans">
              {Object.entries(SITE.plans).map(([id, p]) => (
                <button type="button" key={id} className={id === form.plan ? 'plan on' : 'plan'} aria-pressed={id === form.plan} onClick={() => setForm({ ...form, plan: id })}>
                  <b>{p.label}</b>
                  <span className="plan-price">{yen(p.price)}</span>
                  <span>{p.chapters}章・写真{p.chapters + p.extra}枚まで</span>
                </button>
              ))}
            </div>
            <p className="hint plan-hint">どちらも、作成と試し遊びは無料です。あとからプランは変えられないため、写真をたくさん贈りたい場合はプレミアムをお選びください。</p>
          </fieldset>

          <div className="field-row">
            <label>
              <span>贈る相手のお名前<em>必須</em></span>
              <input value={form.recipientName} onChange={set('recipientName')} maxLength={20} placeholder="例：さき" required />
            </label>
            <label>
              <span>あなたのお名前<i>相手に表示されます</i></span>
              <input value={form.senderName} onChange={set('senderName')} maxLength={20} placeholder="例：たろう" />
            </label>
          </div>

          <ChoiceGroup label="お相手との関係" options={RELATIONS} value={form.relation} onChange={(v) => setForm({ ...form, relation: v })} />
          <ChoiceGroup label="贈り物の雰囲気" options={TONES} value={form.tone} onChange={(v) => setForm({ ...form, tone: v })} />
          <ChoiceGroup label="贈るきっかけ" options={OCCASIONS} value={form.occasion} onChange={(v) => setForm({ ...form, occasion: v })} />

          <fieldset>
            <legend>{plan.chapters === 4 ? '四つ' : '三つ'}の思い出<em>2つ以上</em></legend>
            <p className="hint">
              思い出ひとつが、ゲームの一章になります。写真を添えると、その章を終えたときに一枚ずつ開き、最後に音楽つきのスライドショーになります。
            </p>
            {memories.map((m, i) => (
              <div className="memory" key={i}>
                <p className="memory-no">第{CHAPTERS[i]}章{i >= 2 && <i>なくても作れます</i>}</p>
                <input value={m.text} onChange={(e) => setMemory(i, { text: e.target.value })} maxLength={120} placeholder={MEMORY_HINTS[i]} aria-label={`思い出 ${i + 1}`} />
                {m.photo ? (
                  <div className="memory-photo">
                    <img src={m.photo} alt="" />
                    <button type="button" className="text-button" onClick={() => setMemory(i, { photo: null })}>写真を外す</button>
                  </div>
                ) : (
                  <label className="photo-picker">
                    <input type="file" accept="image/*" onChange={(e) => pickPhoto(i, e.target.files[0])} />
                    ＋ 写真を添える
                  </label>
                )}
              </div>
            ))}
          </fieldset>

          {plan.extra > 0 && (
            <fieldset>
              <legend>スライドショーだけの写真<i>最大{plan.extra}枚</i></legend>
              <p className="hint">ゲームの途中では見せず、最後のスライドショーで初めて流れる写真です。</p>
              <div className="extras">
                {form.extraPhotos.slice(0, plan.extra).map((src, i) => (
                  <div className="extra" key={i}>
                    <img src={src} alt="" />
                    <button type="button" aria-label="この写真を外す" onClick={() => setForm((f) => ({ ...f, extraPhotos: f.extraPhotos.filter((_, j) => j !== i) }))}>×</button>
                  </div>
                ))}
                {form.extraPhotos.length < plan.extra && (
                  <label className="photo-picker">
                    <input type="file" accept="image/*" multiple onChange={(e) => { addExtras(e.target.files); e.target.value = '' }} />
                    ＋ 写真を追加
                  </label>
                )}
              </div>
            </fieldset>
          )}

          <label>
            <span>最後に届けるメッセージ<i>空欄の場合は、思い出をもとに作成します</i></span>
            <textarea value={form.message} onChange={set('message')} maxLength={400} rows={4} placeholder="例：誕生日おめでとう。今年もたくさん笑って過ごそうね。" />
          </label>

          <p className="hint">ご住所や電話番号など、知られたくない個人情報は書かないでください。</p>
          {needsBotCheck && <Turnstile onToken={setBotToken} />}
          {error && <p className="error">{error}</p>}
          <button className="button primary wide" type="submit" disabled={!canSubmit}>
            無料でつくってみる
          </button>
          <p className="price-note">作成と試し遊びは無料。贈るときだけ {yen(plan.price)}（税込）です。</p>
        </form>
      </section>

      {myGifts.length > 0 && (
        <section className="section">
          <h2 className="section-title"><span>Your gifts</span>あなたがつくった贈り物</h2>
          <ul className="panel my-gifts">
            {myGifts.map((g) => (
              <li key={g.id}>
                <a href={ownerUrl(g.id, g.key)}>{g.to}さんへ</a>
                <time>{new Date(g.at).toLocaleDateString('ja-JP')}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section-title"><span>Q &amp; A</span>よくあるご質問</h2>
        <dl className="faq">
          <dt>料金はいつかかりますか？</dt>
          <dd>作成と試し遊びは無料です。内容を確かめて、相手に贈るときにだけお支払いいただきます。スタンダード（3章・写真3枚まで）は {yen(SITE.plans.standard.price)}、プレミアム（4章・写真10枚まで）は {yen(SITE.plans.premium.price)} です（いずれも税込）。</dd>
          <dt>写真は入れなくても作れますか？</dt>
          <dd>作れます。写真がない章は、言葉だけで進みます。添えた写真は相手に見せるためだけに使い、AI には送りません。</dd>
          <dt>誕生日の0時ちょうどに届けられますか？</dt>
          <dd>はい。お支払いの前に「日時を予約する」を選ぶと、決めた日時にメールで自動的にお届けします。1年先まで予約できます。</dd>
          <dt>相手は何か準備が必要ですか？</dt>
          <dd>必要ありません。届いたリンクをスマートフォンで開くだけで遊べます。アプリや会員登録はいりません。</dd>
          <dt>どんな支払い方法が使えますか？</dt>
          <dd>クレジットカード、Apple Pay、Google Pay をご利用いただけます。お支払いは Stripe の決済ページで行われます。</dd>
        </dl>
      </section>
    </>
  )
}

function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <div className="chips">
        {options.map(([v, text]) => (
          <button type="button" key={v} className={v === value ? 'chip on' : 'chip'} aria-pressed={v === value} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/* ---------- 作った人のページ(試し遊び・支払い・共有) ---------- */

function useGift(id, editKey) {
  const [state, setState] = useState({ loading: true })
  useEffect(() => {
    const q = new URLSearchParams({ id })
    if (editKey) q.set('key', editKey)
    api(`get.php?${q}`)
      .then((gift) => setState({ gift }))
      .catch((err) => setState({ error: errorText(err.message) }))
  }, [id, editKey])
  return [state, setState]
}

function OwnerPage({ id, editKey, justPaid }) {
  const [state, setState] = useGift(id, editKey)
  const [playing, setPlaying] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  // 届け方: link = 自分でリンクを送る / email = 日時を指定してメールで届ける
  const [delivery, setDelivery] = useState({ mode: 'link', email: '', date: '', time: '00:00' })

  if (state.loading) return <Loading />
  if (state.error) return <ErrorPanel text={state.error} />
  const { gift } = state

  if (playing) return <GamePlayer gift={gift} preview onExit={() => setPlaying(false)} />

  async function pay() {
    setPaying(true)
    setPayError('')
    try {
      const data = await api('checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          key: editKey,
          delivery: delivery.mode === 'email' ? { mode: 'email', email: delivery.email.trim(), at: `${delivery.date}T${delivery.time}` } : { mode: 'link' },
        }),
      })
      if (data.url) {
        window.location.href = data.url
        return
      }
      setState({ gift: { ...gift, status: data.status, deliverAt: data.deliverAt, deliverEmail: data.deliverEmail } })
    } catch (err) {
      setPayError(errorText(err.message))
    }
    setPaying(false)
  }

  const paid = gift.status === 'paid'
  const scheduleReady = delivery.mode === 'link' || (delivery.email.trim() && delivery.date && delivery.time)

  return (
    <section className="panel narrow center">
      <p className="eyebrow">For {gift.recipientName}</p>
      <h1 className="panel-title">{gift.game.title}</h1>
      <Ornament />

      {paid ? (
        <SharePanel gift={gift} justPaid={justPaid} />
      ) : (
        <>
          <p className="serif">
            贈り物ができあがりました。
            <br />
            まずはご自身で遊んで、内容をお確かめください。
          </p>
          {justPaid && <p className="notice">お支払いの確認がまだ取れていません。少し待ってから、ページを読み込み直してください。</p>}
          <ul className="summary">
            <li><span>章</span>{gift.game.stages.length}章</li>
            <li><span>写真</span>{gift.game.stages.filter((st) => st.photo).length + (gift.game.album?.length || 0)}枚</li>
            <li><span>プラン</span>{SITE.plans[gift.plan]?.label}（{yen(gift.price)}）</li>
            <li><span>贈る称号</span>{gift.game.badge.name}</li>
          </ul>
          <button className="button secondary wide" onClick={() => setPlaying(true)}>
            試しに遊んでみる（無料）
          </button>
          <fieldset className="delivery">
            <legend>届け方</legend>
            <div className="plans">
              <button type="button" className={delivery.mode === 'link' ? 'plan on' : 'plan'} aria-pressed={delivery.mode === 'link'} onClick={() => setDelivery({ ...delivery, mode: 'link' })}>
                <b>自分で送る</b>
                <span>リンクを LINE などで、好きなときに送ります</span>
              </button>
              <button type="button" className={delivery.mode === 'email' ? 'plan on' : 'plan'} aria-pressed={delivery.mode === 'email'} onClick={() => setDelivery({ ...delivery, mode: 'email' })}>
                <b>日時を予約する</b>
                <span>決めた日時に、メールで自動的にお届けします</span>
              </button>
            </div>
            {delivery.mode === 'email' && (
              <div className="form schedule">
                <label>
                  <span>お相手のメールアドレス</span>
                  <input type="email" value={delivery.email} onChange={(e) => setDelivery({ ...delivery, email: e.target.value })} placeholder="例：saki@example.com" autoComplete="off" />
                </label>
                <div className="field-row">
                  <label>
                    <span>届ける日</span>
                    <input type="date" value={delivery.date} min={dateInput()} max={dateInput(SITE.scheduleMaxDays)} onChange={(e) => setDelivery({ ...delivery, date: e.target.value })} />
                  </label>
                  <label>
                    <span>時刻<i>日本時間</i></span>
                    <input type="time" value={delivery.time} onChange={(e) => setDelivery({ ...delivery, time: e.target.value })} />
                  </label>
                </div>
                <p className="hint">
                  1年先まで予約できます。メールは指定の時刻から数分以内に送られます。迷惑メールに振り分けられる場合に備えて、お支払い後に表示されるリンクも控えておくと安心です。
                </p>
              </div>
            )}
          </fieldset>
          <button className="button primary wide" onClick={pay} disabled={paying || !scheduleReady}>
            {paying ? 'お支払いページを開いています…' : delivery.mode === 'email' ? `${yen(gift.price)}で予約する` : `${yen(gift.price)}で${gift.recipientName}さんに贈る`}
          </button>
          {payError && <p className="error">{payError}</p>}
          <p className="hint">
            お支払いは Stripe の決済ページで行います（カード・Apple Pay・Google Pay）。
            完了すると、相手に送るリンクが表示されます。
          </p>
          <p className="hint">このページはあなた専用です。あとで開けるよう、ブックマークをおすすめします。</p>
          <a className="text-button" href="/">別の贈り物をつくる</a>
        </>
      )}
    </section>
  )
}

function SharePanel({ gift, justPaid }) {
  const [copied, setCopied] = useState(false)
  const url = giftUrl(gift.id)
  const text = `${gift.recipientName}さんへ、贈り物が届いています。`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('このリンクをコピーしてください', url)
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ text, url })
    } catch {
      // キャンセルされたときは何もしない
    }
  }

  return (
    <>
      {gift.deliverAt ? (
        <>
          <p className="serif">
            {gift.deliveredAt ? `${formatSchedule(gift.deliveredAt)} に、メールでお届けしました。` : 'ご予約を承りました。'}
          </p>
          <ul className="summary">
            <li><span>届ける日時</span>{formatSchedule(gift.deliverAt)}</li>
            <li><span>宛先</span>{gift.deliverEmail}</li>
          </ul>
          <p className="hint">下のリンクからも同じ贈り物を開けます。メールが届かなかったときのために、控えておいてください。</p>
        </>
      ) : (
        <p className="serif">
          {justPaid ? 'ありがとうございます。贈り物の準備が整いました。' : '贈り物の準備は整っています。'}
          <br />
          下のリンクを、{gift.recipientName}さんにお送りください。
        </p>
      )}
      <div className="share-url">{url}</div>
      <button className="button primary wide" onClick={copy}>{copied ? 'コピーしました' : 'リンクをコピー'}</button>
      <a className="button line wide" href={`https://line.me/R/msg/text/?${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noreferrer">
        LINEで送る
      </a>
      {typeof navigator !== 'undefined' && navigator.share && (
        <button className="button secondary wide" onClick={nativeShare}>ほかのアプリで送る</button>
      )}
      <p className="hint">リンクを知っている方なら、どなたでも開けます。送り先をお確かめください。</p>
      <a className="text-button" href="/">別の贈り物をつくる</a>
    </>
  )
}

/* ---------- 受け取った人のページ ---------- */

function RecipientPage({ id }) {
  const [state] = useGift(id, null)
  const [opened, setOpened] = useState(false)

  if (state.loading) return <Loading />
  if (state.error) return <ErrorPanel text={state.error} />
  const { gift } = state

  if (opened) return <GamePlayer gift={gift} />

  return (
    <section className="panel narrow center arrival">
      <button className="envelope" onClick={() => setOpened(true)} aria-label="贈り物を開ける">
        <span className="envelope-flap" />
        <span className="envelope-seal" />
      </button>
      <p className="eyebrow">{gift.senderName ? `From ${gift.senderName}` : 'A gift for you'}</p>
      <h1 className="panel-title">
        {gift.recipientName}さんへ
        <br />
        贈り物が届いています
      </h1>
      <Ornament />
      <button className="button primary wide" onClick={() => setOpened(true)}>開けてみる</button>
    </section>
  )
}

/* ---------- ゲーム本体 ---------- */

function GamePlayer({ gift, preview = false, onExit }) {
  const { game } = gift
  // 進み方: intro(1行ずつ) → 章(問いかけ → 言葉と写真) → ending(1行ずつ) → スライドショー → 手紙
  const [phase, setPhase] = useState('intro')
  const [line, setLine] = useState(0)
  const [stage, setStage] = useState(0)
  const [picked, setPicked] = useState(null)
  const bgm = useRef(null)

  const intro = game.intro.length ? game.intro : [`${gift.recipientName}さん、贈り物をお届けにまいりました。`]
  const ending = game.ending.length ? game.ending : ['それでは、贈り物をお渡しします。']
  const current = game.stages[stage]
  const hasPhotos = game.stages.some((s) => s.photo)

  // ページを離れるときは音を止める
  useEffect(() => () => bgm.current?.stop(), [])

  function nextLine(lines, after) {
    if (line + 1 < lines.length) setLine(line + 1)
    else {
      setLine(0)
      after()
    }
  }

  function nextStage() {
    setPicked(null)
    if (stage + 1 < game.stages.length) setStage(stage + 1)
    else setPhase('ending')
  }

  // 音はボタンを押した直後にしか鳴らせないので、ここ(クリックの処理の中)で始める
  function startShow() {
    bgm.current?.stop()
    bgm.current = createBgm()
    setPhase('show')
  }

  function endShow() {
    bgm.current?.stop()
    bgm.current = null
    setPhase('open')
  }

  if (phase === 'show') return <Slideshow gift={gift} onMute={(m) => bgm.current?.setMuted(m)} onDone={endShow} />

  return (
    <section className="panel narrow game">
      {preview && (
        <div className="preview-bar">
          試し遊び中（相手にはこのように見えます）
          <button className="text-button" onClick={onExit}>終了</button>
        </div>
      )}

      {phase === 'intro' && (
        <div className="scene center" key={`i${line}`}>
          <Ornament />
          <p className="narration">{intro[line]}</p>
          <button className="button primary wide" onClick={() => nextLine(intro, () => setPhase('stage'))}>
            {line + 1 < intro.length ? '次へ' : 'はじめる'}
          </button>
        </div>
      )}

      {phase === 'stage' && (
        <div className="scene" key={`s${stage}`}>
          {hasPhotos && (
            <div className="frames" aria-hidden="true">
              {game.stages.map((s, i) => {
                const open = i < stage || (i === stage && picked !== null)
                return <span key={i} className={open ? 'open' : ''} style={open && s.photo ? { backgroundImage: `url("${s.photo}")` } : undefined} />
              })}
            </div>
          )}
          <p className="chapter">第{CHAPTERS[stage]}章</p>
          <h2 className="question">{current.question}</h2>

          {picked === null ? (
            <div className="choices">
              {current.choices.map((c, i) => (
                <button key={i} className="choice" onClick={() => setPicked(i)}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="reveal">
              <p className="picked">{current.choices[picked].label}</p>
              <p className="reply">{current.choices[picked].reply}</p>
              {current.photo && (
                <figure className="photo">
                  <img src={current.photo} alt="" />
                  {current.caption && <figcaption>{current.caption}</figcaption>}
                </figure>
              )}
              <button className="button primary wide" onClick={nextStage}>
                {stage + 1 < game.stages.length ? '次の章へ' : '最後まで読みました'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'ending' && (
        <div className="scene center" key={`e${line}`}>
          <Ornament />
          <p className="narration">{ending[line]}</p>
          <button className="button primary wide" onClick={() => nextLine(ending, startShow)}>
            {line + 1 < ending.length ? '次へ' : '贈り物を受け取る'}
          </button>
          {line + 1 === ending.length && <p className="hint center-hint">音楽が流れます</p>}
        </div>
      )}

      {phase === 'open' && <OpenedGift gift={gift} preview={preview} onExit={onExit} onReplay={startShow} />}
    </section>
  )
}

/* ---------- 音楽つきスライドショー ---------- */

function Slideshow({ gift, onMute, onDone }) {
  const { game } = gift
  const slides = [
    { kind: 'title', seconds: 5 },
    ...game.stages.map((s) => ({ kind: 'memory', photo: s.photo, caption: s.caption, seconds: 7 })),
    // スライドショーだけに出る写真(プレミアム)
    ...(game.album || []).map((photo) => ({ kind: 'memory', photo, caption: '', seconds: 5 })),
    { kind: 'message', seconds: 11 },
  ]
  const [index, setIndex] = useState(0)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index + 1 < slides.length) setIndex(index + 1)
      else onDone()
    }, slides[index].seconds * 1000)
    return () => clearTimeout(timer)
    // slides と onDone は毎回作り直されるが、中身は変わらないので index だけ見る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function next() {
    if (index + 1 < slides.length) setIndex(index + 1)
    else onDone()
  }

  function toggleMute(e) {
    e.stopPropagation()
    onMute(!muted)
    setMuted(!muted)
  }

  return (
    <div className="show" onClick={next} role="presentation">
      {slides.map((s, i) => (
        <div key={i} className={`slide ${s.kind} ${i === index ? 'on' : ''}`} aria-hidden={i !== index}>
          {s.kind === 'title' && (
            <>
              <p className="eyebrow">{gift.senderName ? `From ${gift.senderName}` : 'A gift for you'}</p>
              <p className="show-title">{gift.recipientName}さんへ</p>
              <Ornament />
            </>
          )}
          {s.kind === 'memory' && (
            <>
              {s.photo && <div className="show-photo"><img src={s.photo} alt="" /></div>}
              {s.caption && <p className={s.photo ? 'show-caption' : 'show-caption alone'}>{s.caption}</p>}
            </>
          )}
          {s.kind === 'message' && (
            <>
              <p className="show-message">{game.message}</p>
              {gift.senderName && <p className="show-from">{gift.senderName}より</p>}
            </>
          )}
        </div>
      ))}
      <div className="show-bar">
        {slides.map((_, i) => (
          <span key={i} className={i < index ? 'done' : i === index ? 'now' : ''} style={i === index ? { animationDuration: `${slides[i].seconds}s` } : undefined} />
        ))}
      </div>
      <div className="show-controls">
        <button onClick={toggleMute}>{muted ? '音を出す' : '音を消す'}</button>
        <button onClick={(e) => { e.stopPropagation(); onDone() }}>スキップ</button>
      </div>
    </div>
  )
}

function OpenedGift({ gift, preview, onExit, onReplay }) {
  const { game } = gift
  return (
    <div className="opened">
      <div className="letter">
        <p className="letter-to">{gift.recipientName}さんへ</p>
        <p className="letter-body">{game.message}</p>
        {gift.senderName && <p className="letter-from">{gift.senderName}より</p>}
      </div>
      <div className="badge-card">
        <p className="eyebrow">あなたに贈られた称号</p>
        <p className="badge-name">{game.badge.name}</p>
        {game.badge.description && <p className="badge-desc">{game.badge.description}</p>}
      </div>
      <button className="button secondary wide" onClick={onReplay}>スライドショーをもう一度見る</button>
      {preview ? (
        <button className="button secondary wide" onClick={onExit}>試し遊びを終える</button>
      ) : (
        <div className="after center">
          <Ornament />
          <p className="serif">あなたも大切な方へ、<br />世界にひとつの贈り物を。</p>
          <a className="button primary wide" href="/">贈り物をつくる</a>
        </div>
      )}
    </div>
  )
}

function Loading() {
  return (
    <section className="panel narrow center">
      <div className="loader" aria-label="読み込み中" />
    </section>
  )
}

function ErrorPanel({ text }) {
  return (
    <section className="panel narrow center">
      <p className="serif">{text}</p>
      <a className="text-button" href="/">トップへ戻る</a>
    </section>
  )
}

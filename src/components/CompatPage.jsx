// 全キャラ相性診断ページ(#compat)。
// 村の住人(全診断のキャラ)から2体を選ぶと、属性の組み合わせから相性を出す。
// URL: #compat=<診断ID>:<imageKey>+<診断ID>:<imageKey> で結果を共有できる。
import { useEffect, useMemo, useState } from 'react'
import * as characterData from '../characterData'
import { characterAttributes } from '../compat/characterAttributes'
import { getCompat } from '../compat/compat'
import { createCompatStoryBlob, shareOrDownload } from '../compat/compatShareImage'
import './CompatPage.css'

// characterData の export 名(xxxCharacters)を、キャラ表の中身から引けるようにする
const setNameByCharacters = new Map(
  Object.entries(characterData)
    .filter(([key]) => key.endsWith('Characters'))
    .map(([key, value]) => [value, key.replace(/Characters$/, '')]),
)

function buildRoster(collections, diagnoses) {
  const roster = []
  for (const diagnosis of diagnoses) {
    const collection = collections[diagnosis.id]
    if (!collection) continue
    const setName = setNameByCharacters.get(collection.characters)
    const attrs = setName && characterAttributes[setName]
    if (!attrs) continue
    const members = Object.entries(collection.characters)
      .filter(([type]) => attrs[type])
      .map(([type, character]) => ({
        id: `${diagnosis.id}:${character.imageKey}`,
        diagnosisId: diagnosis.id,
        diagnosisTitle: diagnosis.title,
        set: setName,
        type,
        name: character.characterName,
        role: character.role,
        code: attrs[type],
        image: `/characters/${collection.basePath}/${character.imageKey}.webp`,
      }))
    if (members.length) roster.push({ diagnosis, members })
  }
  return roster
}

function parseHash(hash) {
  if (!hash.startsWith('#compat=')) return []
  return decodeURIComponent(hash.slice('#compat='.length)).split('+')
}

export default function CompatPage({ collections, diagnoses, toDisplayImage, onBack, historyItems = [] }) {
  const roster = useMemo(() => buildRoster(collections, diagnoses), [collections, diagnoses])
  const byId = useMemo(() => new Map(roster.flatMap((g) => g.members.map((m) => [m.id, m]))), [roster])
  const total = byId.size

  const [picked, setPicked] = useState(() => {
    const [a, b] = parseHash(window.location.hash)
    return [byId.get(a) || null, byId.get(b) || null]
  })
  const [pickingSlot, setPickingSlot] = useState(null) // 0 | 1 | null
  const [pickerDiagnosisId, setPickerDiagnosisId] = useState(null)
  const [showResult, setShowResult] = useState(() => parseHash(window.location.hash).length === 2)
  const [copied, setCopied] = useState(false)
  const [imageState, setImageState] = useState({ busy: false, url: '', pair: '' })

  // 診断済みのキャラ(自分の分身)を先頭に出す
  const myMembers = useMemo(() => {
    const seen = new Set()
    const list = []
    for (const item of historyItems) {
      const group = roster.find((g) => g.diagnosis.id === item.diagnosisId)
      const member = group?.members.find((m) => m.type === item.resultTitle)
      if (member && !seen.has(member.id)) {
        seen.add(member.id)
        list.push(member)
      }
    }
    return list.slice(0, 8)
  }, [historyItems, roster])

  // ページを開いたまま別の共有リンクに移ったときも、そのペアを表示する
  useEffect(() => {
    const onHashChange = () => {
      const [x, y] = parseHash(window.location.hash)
      if (byId.get(x) && byId.get(y)) {
        setPicked([byId.get(x), byId.get(y)])
        setPickingSlot(null)
        setShowResult(true)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [byId])

  const [a, b] = picked
  const result = a && b ? getCompat(a, b) : null

  useEffect(() => {
    const hash = showResult && a && b ? `#compat=${a.id}+${b.id}` : '#compat'
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
  }, [showResult, a, b])

  // 画像プレビューは作ったときのペアでだけ表示する
  const pairKey = a && b ? `${a.id}+${b.id}` : ''
  const previewUrl = imageState.pair === pairKey ? imageState.url : ''

  const makeImage = async () => {
    if (!result || imageState.busy) return
    setImageState((s) => ({ ...s, busy: true }))
    try {
      const blob = await createCompatStoryBlob({ a, b, result, shareUrl, toDisplayImage })
      if (!blob) throw new Error('no blob')
      setImageState((s) => {
        if (s.url) URL.revokeObjectURL(s.url)
        return { busy: false, url: URL.createObjectURL(blob), pair: pairKey }
      })
      await shareOrDownload(blob, `shindanmura-compat-${result.score}.png`)
    } catch {
      setImageState((s) => ({ ...s, busy: false }))
    }
  }

  const choose = (member) => {
    setPicked((current) => {
      const next = [...current]
      next[pickingSlot] = member
      return next
    })
    setPickingSlot(null)
    setPickerDiagnosisId(null)
    setShowResult(false)
  }

  const randomMember = () => {
    const all = [...byId.values()]
    return all[Math.floor(Math.random() * all.length)]
  }

  const openPicker = (slot) => {
    setPickingSlot(slot)
    setPickerDiagnosisId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const shareUrl = a && b ? `${window.location.origin}/#compat=${encodeURIComponent(`${a.id}+${b.id}`)}` : ''
  const shareText = result
    ? `${a.name} × ${b.name} の相性は ${result.score}%！\n「${result.title}」\n#診断村 #相性診断`
    : ''

  // ---- キャラ選択画面 ----
  if (pickingSlot !== null) {
    const group = roster.find((g) => g.diagnosis.id === pickerDiagnosisId)
    return (
      <main className="app compat-page">
        <button className="back" onClick={() => (group ? setPickerDiagnosisId(null) : setPickingSlot(null))}>
          {group ? '← 診断をえらびなおす' : '← もどる'}
        </button>
        <section className="hero detail compat-hero">
          <p className="label">{pickingSlot === 0 ? 'ひとりめ' : 'ふたりめ'}をえらぶ</p>
          <h1>{group ? group.diagnosis.title : 'どの診断の住人にする？'}</h1>
          {!group && <p>{roster.length}の診断から、{total}体の住人をえらべます。</p>}
        </section>

        {!group && (
          <>
            <button className="compat-random" onClick={() => choose(randomMember())}>🎲 ランダムでえらぶ</button>
            {myMembers.length > 0 && (
              <section className="compat-block">
                <h2>あなたの診断結果から</h2>
                <div className="compat-grid">
                  {myMembers.map((m) => (
                    <CharacterTile key={m.id} member={m} toDisplayImage={toDisplayImage} onClick={() => choose(m)} showDiagnosis />
                  ))}
                </div>
              </section>
            )}
            <section className="compat-block">
              <h2>診断からえらぶ</h2>
              <div className="compat-diagnosis-list">
                {roster.map((g) => (
                  <button key={g.diagnosis.id} className="compat-diagnosis" onClick={() => setPickerDiagnosisId(g.diagnosis.id)}>
                    <img src={toDisplayImage(g.members[0].image)} alt="" loading="lazy" />
                    <span>{g.diagnosis.title}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {group && (
          <div className="compat-grid">
            {group.members.map((m) => (
              <CharacterTile key={m.id} member={m} toDisplayImage={toDisplayImage} onClick={() => choose(m)} />
            ))}
          </div>
        )}
      </main>
    )
  }

  // ---- メイン(2体を並べる / 結果) ----
  return (
    <main className="app compat-page">
      <button className="back" onClick={onBack}>← 村にもどる</button>

      <section className="hero detail compat-hero">
        <p className="label">全住人相性診断</p>
        <h1>村の住人どうしの相性は？</h1>
        <p>{total}体の住人から2体をえらぶと、ふたりの相性がわかります。自分の診断結果のキャラと、好きなキャラを組み合わせてみてね。</p>
      </section>

      <section className="compat-pair">
        {[0, 1].map((slot) => {
          const m = picked[slot]
          return (
            <button key={slot} className={`compat-slot ${m ? 'filled' : ''}`} onClick={() => openPicker(slot)}>
              {m ? (
                <>
                  <img src={toDisplayImage(m.image)} alt={m.name} />
                  <strong>{m.name}</strong>
                  <small>{m.diagnosisTitle}</small>
                </>
              ) : (
                <>
                  <span className="compat-slot-plus">＋</span>
                  <strong>{slot === 0 ? 'ひとりめ' : 'ふたりめ'}をえらぶ</strong>
                </>
              )}
            </button>
          )
        })}
        <span className="compat-x" aria-hidden="true">×</span>
      </section>

      {!showResult && (
        <button className="primary" disabled={!a || !b} onClick={() => setShowResult(true)}>
          {a && b ? '相性をみる' : '2体えらんでね'}
        </button>
      )}

      {showResult && result && (
        <section className="result compat-result">
          <p className="compat-score"><span>{result.score}</span>%</p>
          <p className="compat-grade">{result.grade === '◎' ? '高め合うふたり' : result.grade === '○' ? '分かり合えるふたり' : '刺激し合うふたり'}</p>
          <h2>「{result.title}」</h2>
          <p className="compat-types">{a.name}：{result.baseNames[0]} ／ {b.name}：{result.baseNames[1]}</p>

          <div className="compat-section">
            <h3>ふたりの空気感 ─ {result.elementTitle}</h3>
            <p>{result.elementText}</p>
          </div>
          <div className="compat-section">
            <h3>ふたりの間で起きること</h3>
            <p>{result.baseText}</p>
          </div>
          <div className="compat-section compat-tip">
            <h3>なかよくなるコツ</h3>
            <p>{result.tip}</p>
          </div>
          {result.sameVillage && <p className="compat-note">同じ診断の住人どうし。ふだんから顔なじみです。</p>}

          <div className="compat-actions">
            <button className="share-button compat-image-button" onClick={makeImage} disabled={imageState.busy}>
              {imageState.busy ? '画像をつくっています…' : '📸 画像でシェア'}
            </button>
            <a
              className="share-button"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Xでシェア
            </a>
            <button
              className="share-button"
              onClick={() => {
                navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`).then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1800)
                }).catch(() => {})
              }}
            >
              {copied ? 'コピーしました' : 'リンクをコピー'}
            </button>
            <button className="share-button" onClick={() => { setPicked([a, randomMember()]); setShowResult(true) }}>
              🎲 相手を変える
            </button>
          </div>
          {previewUrl && (
            <figure className="compat-preview">
              <img src={previewUrl} alt={`${a.name}と${b.name}の相性画像`} />
              <figcaption>保存できないときは、画像を長押しして保存してね。</figcaption>
            </figure>
          )}
        </section>
      )}
    </main>
  )
}

function CharacterTile({ member, toDisplayImage, onClick, showDiagnosis = false }) {
  return (
    <button className="compat-tile" onClick={onClick}>
      <img src={toDisplayImage(member.image)} alt={member.name} loading="lazy" />
      <strong>{member.name}</strong>
      <small>{showDiagnosis ? member.diagnosisTitle : member.role}</small>
    </button>
  )
}

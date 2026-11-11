import { kanteiUrl, sisterPageForDiagnosis, sisterTexts } from '../sisterSite'

// 診断結果の下に出す、姉妹サイト「鑑定村」の案内カード(1つだけ)
export default function SisterSiteCard({ language, diagnosisId }) {
  const text = sisterTexts(language)
  const page = sisterPageForDiagnosis(diagnosisId)
  const item = text.pages[page]
  return (
    <a
      className="sister-card"
      href={kanteiUrl(language, page, `result_${diagnosisId}`)}
      target="_blank"
      rel="noopener"
    >
      <span className="sister-label">{text.label} 🔮 鑑定村</span>
      <span className="sister-body">
        <span className="sister-emoji" aria-hidden="true">{item.emoji}</span>
        <span>
          <strong>{item.title}</strong>
          <small>{item.text}</small>
        </span>
      </span>
      <span className="sister-button">{text.button} →</span>
    </a>
  )
}

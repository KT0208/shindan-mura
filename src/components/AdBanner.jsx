// A8.net の広告バナー。
// - diagnosisId が渡され、その診断に専用広告(adsConfig)が割り当てられていれば、その広告を表示。
// - 割り当てが無い / diagnosisId 無し(ホーム等)の場合は、従来の汎用バナー(PC728×90 / スマホ300×250)を表示。
// 診断中の質問・回答画面には表示しないこと。
import { useMemo } from 'react'
import { getAdForDiagnosis, getDefaultAd } from '../adsConfig'
import { trackEvent } from '../analytics'

export default function AdBanner({ diagnosisId }) {
  // ランダム出し分けが再描画のたびに変わらないよう、診断IDごとに一度だけ選ぶ。
  // 割り当てが無い診断・ホームは「安全なデフォルト広告」から選ぶ(ちょびリッチ固定をやめ、出会い系も出さない)。
  const matched = useMemo(() => (diagnosisId ? getAdForDiagnosis(diagnosisId) : null) || getDefaultAd(), [diagnosisId])

  if (matched) {
    const { banner, text } = matched
    return (
      <div className="ad-banner ad-matched" aria-label="広告">
        <span className="ad-pr-label">PR</span>
        {banner && (
          <>
            <a
              href={banner.href}
              rel="nofollow sponsored noopener noreferrer"
              target="_blank"
              onClick={() => trackEvent('ad_click', { ad: banner.alt, placement: 'banner', diagnosis_id: diagnosisId })}
            >
              <img
                width={banner.width}
                height={banner.height}
                alt={banner.alt || '広告'}
                src={banner.img}
                loading="lazy"
              />
            </a>
            {banner.pixel && <img width="1" height="1" src={banner.pixel} alt="" />}
          </>
        )}
        {text && (
          <>
            <a
              className="ad-matched-text"
              href={text.href}
              rel="nofollow sponsored noopener noreferrer"
              target="_blank"
              onClick={() => trackEvent('ad_click', { ad: banner?.alt, placement: 'text', diagnosis_id: diagnosisId })}
            >
              {text.label}
            </a>
            {text.pixel && <img width="1" height="1" src={text.pixel} alt="" />}
          </>
        )}
      </div>
    )
  }

  // ここに来るのは getDefaultAd が null の時だけ(通常は到達しない)。ちょびリッチ固定はやめたので何も出さない。
  return null
}

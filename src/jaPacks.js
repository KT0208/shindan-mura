// 日本語の診断別データパック(結果詳細+ランダムコメント)の遅延読み込み。
// 英語のlangPacks.jsと同じ思想: 読み込み前はundefinedを返し、各所のガード/フォールバックが効く。
import { diagnoses } from './diagnosisData.js'

const store = {}
const loading = {}

export function loadJaPack(diagnosisId) {
  if (!diagnosisId) return Promise.resolve()
  if (loading[diagnosisId]) return loading[diagnosisId]
  loading[diagnosisId] = import(`./packs/${diagnosisId}.js`)
    .then((mod) => {
      store[diagnosisId] = mod
    })
    .catch(() => {
      // 読み込み失敗時はフォールバック(詳細なし表示)のまま進める
      delete loading[diagnosisId]
    })
  return loading[diagnosisId]
}

// resultDetails / randomCommentPools と同じ形で参照できるビュー(getterで遅延解決)
const detailsView = {}
const commentsView = {}
for (const diagnosisItem of diagnoses) {
  Object.defineProperty(detailsView, diagnosisItem.id, {
    get: () => store[diagnosisItem.id]?.details,
    enumerable: true,
  })
  Object.defineProperty(commentsView, diagnosisItem.id, {
    get: () => store[diagnosisItem.id]?.comments,
    enumerable: true,
  })
}

export { detailsView as jaResultDetails, commentsView as jaRandomCommentPools }

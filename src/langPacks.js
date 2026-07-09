// 英語データパックの遅延読み込み管理。
// 初期バンドルには日本語のみを含め、英語は言語切替時に初めてダウンロードする。
// これにより初回ロードのJSサイズを大幅に削減できる。

let enPack = null
let enPackPromise = null

// 読み込み済みの英語パックを同期的に返す(未読み込みなら null)
export function getEnPack() {
  return enPack
}

// 英語パックを読み込む(2回目以降は即解決)
export function loadEnPack() {
  if (enPack) return Promise.resolve(enPack)
  if (!enPackPromise) {
    enPackPromise = import('./enData.js').then((mod) => {
      enPack = mod
      return mod
    })
  }
  return enPackPromise
}

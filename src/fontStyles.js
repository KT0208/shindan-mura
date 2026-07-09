// 返信タイプ診断: 結果タイプ名を「実際にそのフォントで」表示するためのスタイル対応表。
// キーはキャラのimageKey。App.jsx(結果画面)と scripts/generate-character-pages.mjs で使う。
// OS内蔵フォントのみを使い、無い環境では自然にフォールバックする。

export const replyTypeFontStyles = {
  'font-gokuboso-mincho': { fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif", fontWeight: '200' },
  'font-kaku-gothic': { fontFamily: "'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Noto Sans JP', sans-serif", fontWeight: '600' },
  'font-hikkitai': { fontFamily: "'Klee', 'Bradley Hand', 'Segoe Script', cursive", fontWeight: '400', fontStyle: 'italic' },
  'font-funwari-marumoji': { fontFamily: "'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif", fontWeight: '300' },
  'font-yawaraka-mincho': { fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif", fontWeight: '300' },
  'font-maru-gothic': { fontFamily: "'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif", fontWeight: '500' },
  'font-craft-moji': { fontFamily: "'Klee', 'Hiragino Maru Gothic ProN', sans-serif", fontWeight: '600' },
  'font-marumoji': { fontFamily: "'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif", fontWeight: '600' },
  'font-mincho': { fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif", fontWeight: '600' },
  'font-futomaru-gothic': { fontFamily: "'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif", fontWeight: '800' },
  'font-tegaki': { fontFamily: "'Klee', 'Bradley Hand', cursive", fontWeight: '600' },
  'font-pop': { fontFamily: "'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif", fontWeight: '800' },
  'font-kyokasho': { fontFamily: "'YuKyokasho', 'Klee', 'Hiragino Mincho ProN', serif", fontWeight: '500' },
  'font-gokubuto-gothic': { fontFamily: "'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif", fontWeight: '900' },
  'font-kaisho': { fontFamily: "'YuKyokasho', 'Hiragino Mincho ProN', serif", fontWeight: '700' },
  'font-deco-moji': { fontFamily: "'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif", fontWeight: '800', fontStyle: 'italic' },
}

// 結果画面用: imageKeyからスタイルを返す(該当なしはundefined)
export function getReplyTypeFontStyle(imageKey) {
  return replyTypeFontStyles[imageKey]
}

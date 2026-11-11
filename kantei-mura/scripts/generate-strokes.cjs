// 名前鑑定(漢字の名前)用の画数表 src/strokes-data.js を作るスクリプト。
// 一度生成した表はリポジトリに保存してあるので、通常は実行不要。
// 作り直すときだけ、cnchar(MITライセンス)を一時的に入れて実行する:
//   npm install --no-save cnchar cnchar-trad && node scripts/generate-strokes.cjs
// 対象: 簡体字(GB2312 第1・第2水準) + 繁体字(Big5 常用字) + 日本の漢字(JIS第1水準)
const fs = require('node:fs')
const path = require('node:path')

const cnchar = require(process.env.CNCHAR_PATH || 'cnchar')
cnchar.use(require(process.env.CNCHAR_TRAD_PATH || 'cnchar-trad'))

const chars = new Set()
const add = (encoding, ranges) => {
  const decoder = new TextDecoder(encoding)
  for (const [hiStart, hiEnd, lows] of ranges) {
    for (let hi = hiStart; hi <= hiEnd; hi += 1) {
      for (const lo of lows) {
        const ch = decoder.decode(new Uint8Array([hi, lo]))
        if ([...ch].length === 1 && /\p{Script=Han}/u.test(ch)) chars.add(ch)
      }
    }
  }
}
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
add('gb18030', [[0xb0, 0xf7, range(0xa1, 0xfe)]])
add('big5', [[0xa4, 0xc6, [...range(0x40, 0x7e), ...range(0xa1, 0xfe)]]])
add('shift_jis', [[0x88, 0x98, [...range(0x40, 0x7e), ...range(0x80, 0xfc)]]])

const byStroke = new Map()
let missing = 0
for (const ch of chars) {
  const n = cnchar.stroke(ch)
  if (!(n > 0)) {
    missing += 1
    continue
  }
  if (!byStroke.has(n)) byStroke.set(n, [])
  byStroke.get(n).push(ch)
}
const encoded = [...byStroke.keys()]
  .sort((a, b) => a - b)
  .map((n) => `${n}:${byStroke.get(n).join('')}`)
  .join('|')

const out = `// 自動生成ファイル(scripts/generate-strokes.cjs)。手で編集しないこと。
// 漢字の画数表。形式: "画数:その画数の漢字…|画数:…"
// 画数データの出典: cnchar / cnchar-trad (MIT License, https://github.com/theajack/cnchar)
export default ${JSON.stringify(encoded)}
`
fs.writeFileSync(path.join(__dirname, '..', 'src', 'strokes-data.js'), out)
console.log(`chars: ${chars.size}, written: ${chars.size - missing}, missing: ${missing}, bytes: ${Buffer.byteLength(out)}`)

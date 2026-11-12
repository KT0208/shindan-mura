// YouTube Shorts自動生成用のキャラデータをJSONに書き出す
// 使い方: node scripts/export-shorts-data.mjs → data/shorts-data.json
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { diagnoses } from '../src/diagnosisData.js'
import { resultDetails } from '../src/resultDetails.js'
import { characterCollections } from './generate-share-pages.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const entries = []
for (const diagnosis of diagnoses) {
  if (diagnosis.hidden) continue
  const collection = characterCollections[diagnosis.id]
  if (!collection) continue
  for (const [resultTitle, character] of Object.entries(collection.characters)) {
    const detail = resultDetails[diagnosis.id]?.[resultTitle] || {}
    const imagePath = `public/characters/${collection.basePath}/${character.imageKey}.webp`
    if (!fs.existsSync(path.join(ROOT, imagePath))) continue
    entries.push({
      diagnosisId: diagnosis.id,
      diagnosisTitle: diagnosis.title,
      resultTitle,
      characterName: character.characterName,
      role: character.role || '',
      description: detail.description || '',
      imagePath,
      characterUrl: `https://shindanmura.com/c/${character.imageKey}/`,
      diagnosisUrl: `https://shindanmura.com/#diagnosis=${diagnosis.id}`,
    })
  }
}

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true })
fs.writeFileSync(path.join(ROOT, 'data/shorts-data.json'), JSON.stringify(entries, null, 2))
console.log(`shorts-data.json: ${entries.length}キャラ書き出し`)

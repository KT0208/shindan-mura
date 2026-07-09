// 英語データの集約モジュール。langPacks.js の loadEnPack() 経由で遅延読み込みされる。
// このファイルを App.jsx から直接 import しないこと(初期バンドルに含まれてしまう)。

import {
  hiddenPersonalityCharactersEn,
  loveComplicatedCharactersEn,
  menheraLevelCharactersEn,
  snsApprovalCharactersEn,
  dangerousManCharactersEn,
  darkFallCharactersEn,
  popularitySeasonCharactersEn,
  moneyLuckCharactersEn,
  workStyleCharactersEn,
  lifeBugCharactersEn,
  loveComplicatedResultTypesEn,
  hiddenPersonalityResultTypesEn,
  menheraLevelResultTypesEn,
  snsApprovalResultTypesEn,
  dangerousManResultTypesEn,
  darkFallResultTypesEn,
  popularitySeasonResultTypesEn,
  moneyLuckResultTypesEn,
  workStyleResultTypesEn,
  lifeBugResultTypesEn,
  oshikatsuCharactersEn,
  oshikatsuResultTypesEn,
  replyTypeCharactersEn,
  replyTypeResultTypesEn,
  crushMisreadCharactersEn,
  crushMisreadResultTypesEn,
  darkDepthCharactersEn,
  darkDepthResultTypesEn,
} from './characterData.en.js'
import { resultDetailsEn } from './resultDetails.en.js'
import { randomCommentPoolsEn } from './randomComments.en.js'
import { categoriesEn, scenesEn, sceneSetsEn, diagnosesEn, optionsEn } from './diagnosisData.en.js'

export { uiTextEn, legalPagesEn, answerCommentsEn } from './i18n.en.js'

export const dataEn = {
  categories: categoriesEn,
  scenes: scenesEn,
  sceneSets: sceneSetsEn,
  diagnoses: diagnosesEn,
  options: optionsEn,
  resultDetails: resultDetailsEn,
  randomCommentPools: randomCommentPoolsEn,
}

export const resultTypesByDiagnosisEn = {
  'love-complicated': loveComplicatedResultTypesEn,
  'hidden-personality': hiddenPersonalityResultTypesEn,
  'menhera-level': menheraLevelResultTypesEn,
  'sns-approval': snsApprovalResultTypesEn,
  'dangerous-man': dangerousManResultTypesEn,
  'dark-fall': darkFallResultTypesEn,
  'popularity-season': popularitySeasonResultTypesEn,
  'money-luck': moneyLuckResultTypesEn,
  'work-style': workStyleResultTypesEn,
  'life-bug': lifeBugResultTypesEn,
  'oshikatsu-type': oshikatsuResultTypesEn,
  'reply-type': replyTypeResultTypesEn,
  'crush-misread': crushMisreadResultTypesEn,
  'dark-depth': darkDepthResultTypesEn,
}

export const characterCollectionsEn = {
  'love-complicated': { basePath: 'love', characters: loveComplicatedCharactersEn },
  'hidden-personality': { basePath: 'hidden-personality', characters: hiddenPersonalityCharactersEn },
  'menhera-level': { basePath: 'menheraLevelCharacters', characters: menheraLevelCharactersEn },
  'sns-approval': { basePath: 'snsApprovalCharacters', characters: snsApprovalCharactersEn },
  'dangerous-man': { basePath: 'dangerousManCharacters', characters: dangerousManCharactersEn },
  'dark-fall': { basePath: 'darkFallCharacters', characters: darkFallCharactersEn },
  'popularity-season': { basePath: 'popularitySeasonCharacters', characters: popularitySeasonCharactersEn },
  'money-luck': { basePath: 'moneyLuckCharacters', characters: moneyLuckCharactersEn },
  'work-style': { basePath: 'workStyleCharacters', characters: workStyleCharactersEn },
  'life-bug': { basePath: 'lifeBugCharacters', characters: lifeBugCharactersEn },
  'oshikatsu-type': { basePath: 'oshikatsuCharacters', characters: oshikatsuCharactersEn },
  'reply-type': { basePath: 'fontCharacters', characters: replyTypeCharactersEn },
  'crush-misread': { basePath: 'crushFoxCharacters', characters: crushMisreadCharactersEn },
  'dark-depth': { basePath: 'abyssClioneCharacters', characters: darkDepthCharactersEn },
}

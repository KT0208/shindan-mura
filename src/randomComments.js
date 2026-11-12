// 診断別パック(src/packs/)のアグリゲータ。Node製スクリプト用。
// アプリ本体は src/jaPacks.js の遅延読み込みを使う(このファイルをimportしない)。
import { comments as p_hidden_personality } from './packs/hidden-personality.js'
import { comments as p_love_complicated } from './packs/love-complicated.js'
import { comments as p_menhera_level } from './packs/menhera-level.js'
import { comments as p_dangerous_man } from './packs/dangerous-man.js'
import { comments as p_popularity_season } from './packs/popularity-season.js'
import { comments as p_sns_approval } from './packs/sns-approval.js'
import { comments as p_dark_fall } from './packs/dark-fall.js'
import { comments as p_money_luck } from './packs/money-luck.js'
import { comments as p_work_style } from './packs/work-style.js'
import { comments as p_life_bug } from './packs/life-bug.js'
import { comments as p_oshikatsu_type } from './packs/oshikatsu-type.js'
import { comments as p_reply_type } from './packs/reply-type.js'
import { comments as p_crush_misread } from './packs/crush-misread.js'
import { comments as p_dark_depth } from './packs/dark-depth.js'
import { comments as p_holiday_style } from './packs/holiday-style.js'
import { comments as p_emo_nostalgia } from './packs/emo-nostalgia.js'
import { comments as p_sleep_type } from './packs/sleep-type.js'
import { comments as p_bind_level } from './packs/bind-level.js'
import { comments as p_my_pace } from './packs/my-pace.js'
import { comments as p_isekai_position } from './packs/isekai-position.js'
import { comments as p_procrastination } from './packs/procrastination.js'
import { comments as p_past_life } from './packs/past-life.js'
import { comments as p_self_esteem } from './packs/self-esteem.js'
import { comments as p_stress_level } from './packs/stress-level.js'
import { comments as p_animal_type } from './packs/animal-type.js'
import { comments as p_anger_style } from './packs/anger-style.js'
import { comments as p_shyness } from './packs/shyness.js'
import { comments as p_spending_type } from './packs/spending-type.js'
import { comments as p_scaredy_level } from './packs/scaredy-level.js'
import { comments as p_dream_type } from './packs/dream-type.js'
import { comments as p_hidden_talent } from './packs/hidden-talent.js'
import { comments as p_lending_type } from './packs/lending-type.js'

export const randomCommentPools = {
  'hidden-personality': p_hidden_personality,
  'love-complicated': p_love_complicated,
  'menhera-level': p_menhera_level,
  'dangerous-man': p_dangerous_man,
  'popularity-season': p_popularity_season,
  'sns-approval': p_sns_approval,
  'dark-fall': p_dark_fall,
  'money-luck': p_money_luck,
  'work-style': p_work_style,
  'life-bug': p_life_bug,
  'oshikatsu-type': p_oshikatsu_type,
  'reply-type': p_reply_type,
  'crush-misread': p_crush_misread,
  'dark-depth': p_dark_depth,
  'holiday-style': p_holiday_style,
  'emo-nostalgia': p_emo_nostalgia,
  'sleep-type': p_sleep_type,
  'bind-level': p_bind_level,
  'my-pace': p_my_pace,
  'isekai-position': p_isekai_position,
  'procrastination': p_procrastination,
  'past-life': p_past_life,
  'self-esteem': p_self_esteem,
  'stress-level': p_stress_level,
  'animal-type': p_animal_type,
  'anger-style': p_anger_style,
  'shyness': p_shyness,
  'spending-type': p_spending_type,
  'scaredy-level': p_scaredy_level,
  'dream-type': p_dream_type,
  'hidden-talent': p_hidden_talent,
  'lending-type': p_lending_type,
}

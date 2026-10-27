// 診断ごとに出し分ける A8 広告の「定義」と「割り当て」。
// 新しい広告をもらったら:
//   1) adCreatives に1つ追加(banner と text のコードを貼る)
//   2) diagnosisAdMap で対象の診断IDに割り当てる(複数割り当てるとランダムで出し分け)
// 割り当てが無い診断は、AdBanner の「汎用バナー(デフォルト)」が出る。

export const adCreatives = {
  // ※出会い系/マッチング広告(otofy-photo / pappy)はブランド安全性・AdSense審査のため完全撤去

  // グッズ・ノベルティ制作【オリジナルファクトリー】1個から / 高品質
  'oshi-goods': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BCMO2+8VPSMQ+5KE6+5YZ75',
      img: 'https://www24.a8.net/svt/bgt?aid=260929730537&wid=001&eno=01&mid=s00000025971001003000&mc=1',
      pixel: 'https://www17.a8.net/0.gif?a8mat=4BCMO2+8VPSMQ+5KE6+5YZ75',
      width: 300,
      height: 250,
      alt: 'グッズ・ノベルティ制作【オリジナルファクトリー】',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BCMO2+8VPSMQ+5KE6+5YJRM',
      label: '推しグッズを1個から！高品質グッズ・ノベルティ制作【オリジナルファクトリー】',
      pixel: 'https://www13.a8.net/0.gif?a8mat=4BCMO2+8VPSMQ+5KE6+5YJRM',
    },
  },

  // 伝え方コミュニケーション検定(3時間で履歴書に書ける資格)
  'comm-cert': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BCMO2+7NNPV6+4K7E+C7LM9',
      img: 'https://www29.a8.net/svt/bgt?aid=260929730463&wid=001&eno=01&mid=s00000021281002051000&mc=1',
      pixel: 'https://www14.a8.net/0.gif?a8mat=4BCMO2+7NNPV6+4K7E+C7LM9',
      width: 300,
      height: 250,
      alt: '伝え方コミュニケーション検定',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BCMO2+7NNPV6+4K7E+BX3J6',
      label: '外出せず3時間で履歴書に書ける資格！伝え方コミュニケーション検定',
      pixel: 'https://www14.a8.net/0.gif?a8mat=4BCMO2+7NNPV6+4K7E+BX3J6',
    },
  },

  // サプリメント総合通販【リアルメイト健康WEB通販】/ 株式会社リアルメイト
  'realmate-supp': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+43NISY+D6Q+1TQWC1',
      img: 'https://www21.a8.net/svt/bgt?aid=261002760248&wid=001&eno=01&mid=s00000001709011043000&mc=1',
      pixel: 'https://www13.a8.net/0.gif?a8mat=4BE70O+43NISY+D6Q+1TQWC1',
      width: 300,
      height: 250,
      alt: 'サプリメント総合通販【リアルメイト健康WEB通販】',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+43NISY+D6Q+1THW9E',
      label: '安全安心のサプリメント総合サイト【リアルメイト健康WEB通販】',
      pixel: 'https://www10.a8.net/0.gif?a8mat=4BE70O+43NISY+D6Q+1THW9E',
    },
  },

  // 朝サプリ【Morning Booster】起きてすぐ行動できる朝 / 株式会社Mikai
  'morning-booster': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+3ZHHKI+5VP4+5ZMCH',
      img: 'https://www21.a8.net/svt/bgt?aid=261002760241&wid=001&eno=01&mid=s00000027436001006000&mc=1',
      pixel: 'https://www15.a8.net/0.gif?a8mat=4BE70O+3ZHHKI+5VP4+5ZMCH',
      width: 300,
      height: 250,
      alt: '起きてすぐ行動できる朝をつくる【Morning Booster】',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+3ZHHKI+5VP4+5YJRM',
      label: '起きてすぐ行動できる朝をつくる【Morning Booster】',
      pixel: 'https://www18.a8.net/0.gif?a8mat=4BE70O+3ZHHKI+5VP4+5YJRM',
    },
  },

  // 証券【旬の厳選10銘柄】株式投資のプロが高騰期待銘柄を厳選 / 株式会社FPO
  'fpo-stock': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+3YW1YQ+ONS+TUGK1',
      img: 'https://www24.a8.net/svt/bgt?aid=261002760240&wid=001&eno=01&mid=s00000003196005013000&mc=1',
      pixel: 'https://www19.a8.net/0.gif?a8mat=4BE70O+3YW1YQ+ONS+TUGK1',
      width: 300,
      height: 250,
      alt: '株式投資のプロが高騰期待銘柄を厳選【旬の厳選10銘柄】',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+3YW1YQ+ONS+TXW0I',
      label: '株式投資が一変するかも?プロが選ぶ【旬の厳選10銘柄】',
      pixel: 'https://www11.a8.net/0.gif?a8mat=4BE70O+3YW1YQ+ONS+TXW0I',
    },
  },

  // クレジット【クレカリ賃貸】家賃をクレカ払いに / 株式会社クレカリ
  'kurekari-credit': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+2M2ICY+532U+62ENL',
      img: 'https://www20.a8.net/svt/bgt?aid=261002760158&wid=001&eno=01&mid=s00000023727001019000&mc=1',
      pixel: 'https://www17.a8.net/0.gif?a8mat=4BE70O+2M2ICY+532U+62ENL',
      width: 300,
      height: 250,
      alt: '家賃をクレカ払いにできる【クレカリ賃貸】',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+2M2ICY+532U+64C3M',
      label: '家賃をクレカ払いにしてポイントを貯める【クレカリ賃貸】',
      pixel: 'https://www17.a8.net/0.gif?a8mat=4BE70O+2M2ICY+532U+64C3M',
    },
  },

  // 電話占い【ココナラ】初回最大30分無料・3,000円クーポン / 株式会社ココナラ
  'cocosapli-uranai': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+3I7X0Y+2PEO+C4LLD',
      img: 'https://www25.a8.net/svt/bgt?aid=261002760212&wid=001&eno=01&mid=s00000012624002037000&mc=1',
      pixel: 'https://www10.a8.net/0.gif?a8mat=4BE70O+3I7X0Y+2PEO+C4LLD',
      width: 300,
      height: 250,
      alt: '電話占い【ココナラ】初回最大30分無料',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BE70O+3I7X0Y+2PEO+C3BAQ',
      label: '電話占い【ココナラ】新規登録で3,000円無料クーポン',
      pixel: 'https://www19.a8.net/0.gif?a8mat=4BE70O+3I7X0Y+2PEO+C3BAQ',
    },
  },

  // 電話占い【ヴェルニ】全国の有名占い師が悩みを解決 / 株式会社ファンフィール
  'vernis-uranai': {
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BCMO2+81Y4DU+2H0Q+TUVZL',
      img: 'https://www28.a8.net/svt/bgt?aid=260929730487&wid=001&eno=01&mid=s00000011537005015000&mc=1',
      pixel: 'https://www17.a8.net/0.gif?a8mat=4BCMO2+81Y4DU+2H0Q+TUVZL',
      width: 300,
      height: 250,
      alt: '電話占いヴェルニ｜全国の有名占い師が悩みを解決',
    },
    text: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BCMO2+81Y4DU+2H0Q+U6W36',
      label: '変わりゆく価値観に寄り添い、最善の答えへ。電話占いするなら【ヴェルニ】',
      pixel: 'https://www14.a8.net/0.gif?a8mat=4BCMO2+81Y4DU+2H0Q+U6W36',
    },
  },
}

// 電話占い2社(ココナラ / ヴェルニ)をローテーションで出す。占い・性格・ネタ系で使う。
const URANAI = ['cocosapli-uranai', 'vernis-uranai']

// 診断ID → 広告ID(配列にすると、その中からランダムで1つ表示)。
export const diagnosisAdMap = {
  // ❤️ 恋愛系 → 電話占い(恋愛相談)。※出会い系/マッチング(pappy・otofy)はブランド安全性・AdSense審査のため不使用
  'love-complicated': URANAI, // 恋愛こじらせ診断
  'crush-misread': URANAI, // 脈あり勘違い診断
  'bind-level': URANAI, // 束縛度診断
  'popularity-season': URANAI, // モテ期診断
  'dangerous-man': URANAI, // 危ない男診断

  // ⭐ 推し活 → グッズ制作【オリジナルファクトリー】
  'oshikatsu-type': 'oshi-goods', // 推し活タイプ診断

  // 💼 仕事・コミュ → 伝え方コミュニケーション検定
  'work-style': 'comm-cert', // 仕事向き診断
  'shyness': 'comm-cert', // 人見知り度診断
  'procrastination': ['comm-cert', 'morning-booster'], // 先延ばし癖診断(すぐ行動=朝サプリも)

  // 😴 睡眠・朝 → サプリ(リアルメイト / Morning Booster)をローテ
  'sleep-type': ['realmate-supp', 'morning-booster'], // 睡眠タイプ診断

  // 💰 お金 → 証券 / 家賃クレカ をローテ
  'money-luck': ['fpo-stock', 'kurekari-credit'], // 金運タイプ診断

  // 🔮 メンタル・闇・性格・自分探し・ネタ系 → 電話占い(ココナラ / ヴェルニ をローテ)
  'menhera-level': URANAI, // メンヘラ度診断
  'dark-fall': URANAI, // 闇落ち度診断
  'dark-depth': URANAI, // 性格の闇深度診断
  'hidden-personality': URANAI, // 裏人格診断
  'self-esteem': URANAI, // 自己肯定感タイプ診断
  'my-pace': URANAI, // マイペース度診断
  'anger-style': URANAI, // キレ方診断
  'past-life': URANAI, // 前世診断(前世×占いドンピシャ)
  'isekai-position': URANAI, // 異世界転生ポジション診断
  'emo-nostalgia': URANAI, // エモ懐古度診断
  'life-bug': URANAI, // 人生バグり度診断
  'holiday-style': URANAI, // 休日の過ごし方診断
  'sns-approval': URANAI, // SNS承認欲求診断
  'reply-type': URANAI, // 返信タイプ診断

  // 🎈 その他(旧・未割り当て=デフォルトちょびリッチだった分を明示割当)
  'stress-level': ['realmate-supp', 'cocosapli-uranai'], // ストレス限界度診断(サプリ/占い)
  'animal-type': 'oshi-goods', // 動物タイプ診断(グッズ)
  'spending-type': ['fpo-stock', 'kurekari-credit'], // お金の使い方診断(証券/クレカ)
}

export function getAdForDiagnosis(diagnosisId) {
  const value = diagnosisAdMap[diagnosisId]
  if (!value) return null
  const ids = Array.isArray(value) ? value : [value]
  const pick = ids[Math.floor(Math.random() * ids.length)]
  return adCreatives[pick] || null
}

// バナーの割り当てが無い診断・ホーム用の「安全なデフォルト広告」プール(出会い系は入れない)。
const SAFE_DEFAULT = ['cocosapli-uranai', 'vernis-uranai', 'comm-cert', 'oshi-goods', 'realmate-supp']
export function getDefaultAd() {
  const pick = SAFE_DEFAULT[Math.floor(Math.random() * SAFE_DEFAULT.length)]
  return adCreatives[pick] || null
}

// 「おすすめ」ブロック(RecommendPick)のローテ用プール(日本語のみ・ブランド安全な一般アフィリ)。
// fromText を指定した項目は adCreatives[...].text の href/pixel を流用する。
export const recommendPicks = [
  {
    id: 'chobirich',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B7SGX+FHV6LU+389A+67RK1',
    pixel: 'https://www11.a8.net/0.gif?a8mat=4B7SGX+FHV6LU+389A+67RK1',
    title: 'スキマ時間にポイ活',
    description: 'アンケートに答えるだけでポイントが貯まる、運営20年・500万人が使う「ちょびリッチ」。診断のついでにチェックしてみて。',
    buttonLabel: 'ちょびリッチを見てみる',
  },
  {
    id: 'uranai', fromText: 'cocosapli-uranai',
    title: '気になるアレコレ、占ってみる？',
    description: '当たると評判の電話占い。恋も仕事も、プロに相談してスッキリ。初回特典あり。',
    buttonLabel: '占いを見てみる',
  },
  {
    id: 'supp', fromText: 'realmate-supp',
    title: '最近、なんだか疲れ気味？',
    description: '毎日のコンディションを整える機能性サプリ。無理なく続けたい人に。',
    buttonLabel: 'サプリを見てみる',
  },
  {
    id: 'cert', fromText: 'comm-cert',
    title: '3時間で履歴書に書ける資格',
    description: '外出せず、たった3時間。自己PRにも効く「伝え方コミュニケーション検定」。',
    buttonLabel: '資格を見てみる',
  },
  {
    id: 'goods', fromText: 'oshi-goods',
    title: '推しグッズ、1個から作れる',
    description: '高品質グッズ・ノベルティを1個から。オリジナルファクトリー。',
    buttonLabel: 'グッズを見てみる',
  },
]

// adCreative(バナー)id → recommendPick id の対応。同じ診断でバナーと同一広告主が二重に出るのを防ぐ。
const CREATIVE_TO_PICK = {
  'cocosapli-uranai': 'uranai', 'vernis-uranai': 'uranai',
  'realmate-supp': 'supp', 'morning-booster': 'supp',
  'comm-cert': 'cert', 'oshi-goods': 'goods',
}

// 診断IDから決定的に1つ選ぶ(診断ごとに固定・サイト全体では分散)。その診断のバナー広告主とは被らせない。
export function getRecommendPick(diagnosisId) {
  const banner = diagnosisAdMap[diagnosisId]
  const bannerIds = banner ? (Array.isArray(banner) ? banner : [banner]) : []
  const excluded = new Set(bannerIds.map((id) => CREATIVE_TO_PICK[id]).filter(Boolean))
  let pool = recommendPicks.filter((p) => !excluded.has(p.id))
  if (!pool.length) pool = recommendPicks
  let idx
  if (diagnosisId) {
    let h = 0
    for (let i = 0; i < diagnosisId.length; i++) h = (h * 31 + diagnosisId.charCodeAt(i)) >>> 0
    idx = h % pool.length
  } else {
    idx = Math.floor(Date.now() / 86400000) % pool.length
  }
  const p = pool[idx]
  const src = p.fromText ? adCreatives[p.fromText]?.text : null
  return {
    badge: 'PR',
    title: p.title,
    description: p.description,
    buttonLabel: p.buttonLabel,
    href: p.href || src?.href,
    pixel: p.pixel || src?.pixel,
  }
}

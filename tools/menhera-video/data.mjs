// メンヘラクラゲ動画の素材データ。重症度順(軽→重)。
export const jellies = [
  ['menhera-sorry-rabbit-jelly', 'ごめんねうさぎクラゲ', '余裕。むしろ相手を癒す'],
  ['menhera-shutdown-jelly', 'ひとり時間クラゲ', 'ひとりの時間が好き'],
  ['menhera-soft-receiver-jelly', 'ふわ受信クラゲ', '愛され上手な自然体'],
  ['menhera-guardian-jelly', 'おねだり守護クラゲ', '甘えるのが得意'],
  ['menhera-like-monster-jelly', '既読もんすたークラゲ', '既読、ちょっと気になる'],
  ['menhera-attention-jelly', 'かまってクラゲ', 'ねぇ、かまって'],
  ['menhera-hope-star-jelly', '通知待機クラゲ', '通知、まだ…？'],
  ['menhera-smile-mask-jelly', '笑顔マスククラゲ', '平気なフリが得意'],
  ['menhera-labyrinth-jelly', '迷宮クラゲ', '「。」の意味、考えすぎ'],
  ['menhera-dont-leave-jelly', '行かないでクラゲ', '試しちゃう、ごめん'],
  ['menhera-watch-jealous-jelly', 'ヤキモチ監視クラゲ', 'その「いいね」誰…？'],
  ['menhera-yami-angel-jelly', 'やみえんじぇるクラゲ', '情緒、ジェットコースター'],
  ['menhera-heart-meter-jelly', '愛情メータークラゲ', 'ねぇ、私のこと好き？'],
  ['menhera-dependent-jelly', '依存クラゲ', 'あなたが、私の世界'],
  ['menhera-memory-collector-jelly', '思い出収集クラゲ', '過去を手放せない'],
  ['menhera-ending-queen-jelly', '愛の支配者クラゲ', '全部、私のものにしたい'],
]

// 4コマ漫画の脚本。panels=[{img, text}] 4つ + punchlineは4コマ目。
// 病み可愛い・重め路線。主役は1体の「メンヘラちゃん」=表情(expr)だけが変わる。
// 彼や状況は type:'narr'(状況ナレ)で表現。expr=表情(smile/deadpan/despair/joy/teary/yandere/anxious/suspicious)。
// mood=コマ背景の演出、type='say'(本人のセリフ)|'narr'(状況)、big=特大セリフ。
export const fourKoma = [
  {
    id: 'three-min',
    title: '返信3分ルール',
    panels: [
      { expr: 'anxious', text: '彼からの返信、3分こない…', mood: 'wait', type: 'say' },
      { expr: 'despair', text: '嫌われた？ブロック？事故った！？', mood: 'dark', type: 'say' },
      { expr: 'joy', text: '返信きた♡ 世界が輝いてる!!', mood: 'joy', type: 'say' },
      { expr: 'anxious', text: '……また3分、こない', mood: 'wait', type: 'say' },
    ],
  },
  {
    id: 'self-contradict',
    title: '既読でいいよ、の嘘',
    panels: [
      { expr: 'smile', text: '既読でいいよ〜無理しないで😊', mood: 'sweet', type: 'say' },
      { expr: 'suspicious', text: '彼、0.1秒で既読。返信なし。', mood: 'calm', type: 'narr' },
      { expr: 'deadpan', text: 'は？', mood: 'shock', type: 'say', big: true },
      { expr: 'despair', text: '……自分で言ったのに', mood: 'dark', type: 'say' },
    ],
  },
  {
    id: 'heavy-love',
    title: 'いってらっしゃいの裏側',
    panels: [
      { expr: 'deadpan', text: '彼「今日は友達と飲み会ー」', mood: 'calm', type: 'narr' },
      { expr: 'smile', text: 'いってらっしゃい😊 楽しんでね♡', mood: 'sweet', type: 'say' },
      { expr: 'suspicious', text: '5分後、位置情報・SNS・足跡を全監視', mood: 'dark', type: 'narr' },
      { expr: 'yandere', text: 'どこにいても、わかるよ？', mood: 'smug', type: 'say' },
    ],
  },
  {
    id: 'unread-hell',
    title: '未読地獄',
    panels: [
      { expr: 'anxious', text: '送ったLINE、3時間 未読のまま', mood: 'wait', type: 'say' },
      { expr: 'suspicious', text: '彼のストーリーは さっき更新', mood: 'calm', type: 'narr' },
      { expr: 'despair', text: '見れるのに、私のは未読…？', mood: 'dark', type: 'say' },
      { expr: 'yandere', text: 'ねえ、なんで？', mood: 'smug', type: 'say' },
    ],
  },
  {
    id: 'im-fine',
    title: '「大丈夫」の嘘',
    panels: [
      { expr: 'smile', text: '大丈夫、気にしてないよ😊', mood: 'sweet', type: 'say' },
      { expr: 'teary', text: '…ほんとは、ちょっと寂しい', mood: 'dark', type: 'say' },
      { expr: 'deadpan', text: '察してほしかっただけ', mood: 'calm', type: 'say' },
      { expr: 'yandere', text: '…って言わせないでよ？', mood: 'smug', type: 'say' },
    ],
  },
  {
    id: 'show-phone',
    title: 'スマホ見せて？',
    panels: [
      { expr: 'smile', text: 'スマホ、ちょっと見せて〜♡', mood: 'sweet', type: 'say' },
      { expr: 'suspicious', text: '彼、一瞬かたまる', mood: 'calm', type: 'narr' },
      { expr: 'deadpan', text: '…なんで固まるの？', mood: 'shock', type: 'say' },
      { expr: 'yandere', text: 'やましいこと、あるんだ？', mood: 'dark', type: 'say' },
    ],
  },
  {
    id: 'detective',
    title: '匂わせ探偵',
    panels: [
      { expr: 'suspicious', text: '彼のSNSに、知らない手元が', mood: 'calm', type: 'narr' },
      { expr: 'despair', text: 'このネイル、誰の…！？', mood: 'dark', type: 'say' },
      { expr: 'deadpan', text: 'よく見たら自分の手だった', mood: 'calm', type: 'narr' },
      { expr: 'teary', text: '…探偵、卒業します', mood: 'sweet', type: 'say' },
    ],
  },
]

// montage の冒頭フック(テロップ)バリエーション。毎回同じにならないよう複数から選ぶ。
export const montageHooks = [
  { sub: 'メンヘラ度診断', title: ['あなたのメンヘラ度', 'どこまで沈む？'], note: '軽い順に、いくよ 🪼' },
  { sub: '#メンヘラあるある', title: ['好きが重い人、', 'あつまれ〜🪼'], note: '16段階、あなたはどこ？' },
  { sub: 'メンヘラ度診断', title: ['返信こないだけで', '情緒崩壊する人↓'], note: 'あなたは何クラゲ？' },
  { sub: '病み可愛い度チェック', title: ['あなたのメンヘラ、', '何クラゲ？'], note: '下にいくほど重い…🪼' },
]

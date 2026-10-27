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
export const fourKoma = [
  {
    id: 'kidoku',
    title: '既読スルーの夜',
    panels: [
      { img: 'menhera-like-monster-jelly', text: '彼に「おやすみ💤」送信' },
      { img: 'menhera-hope-star-jelly', text: '既読ついた。…返信は、ない' },
      { img: 'menhera-labyrinth-jelly', text: '寝た？ブロック？嫌われた…？' },
      { img: 'menhera-sorry-rabbit-jelly', text: '彼、ただの充電切れでした' },
    ],
  },
  {
    id: 'yakimochi',
    title: 'その「いいね」誰？',
    panels: [
      { img: 'menhera-watch-jealous-jelly', text: '彼のいいね欄をチェック…' },
      { img: 'menhera-watch-jealous-jelly', text: '知らない女子に いいね発見' },
      { img: 'menhera-yami-angel-jelly', text: '情緒、ジェットコースター点火' },
      { img: 'menhera-dependent-jelly', text: '…元同僚のおばさまでした' },
    ],
  },
  {
    id: 'tameshi',
    title: '試しちゃう',
    panels: [
      { img: 'menhera-dont-leave-jelly', text: '「もう別れる」と送ってみた' },
      { img: 'menhera-dont-leave-jelly', text: '引き止めてほしいだけなのに' },
      { img: 'menhera-heart-meter-jelly', text: '彼「わかった」と即返信' },
      { img: 'menhera-ending-queen-jelly', text: 'ちがう！そうじゃない！！' },
    ],
  },
]

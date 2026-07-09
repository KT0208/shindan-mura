import { getEnPack } from './langPacks.js'

export const uiText = {
  ja: {
    brandName: '診断村',
    hashtag: '#診断村',
    gate: {
      enterButton: '診断村に入る',
      caption: '恋愛・性格・闇属性・仕事・お金・SNSまで、あなたにぴったりの診断が見つかる村。',
    },
    languageSwitcher: {
      label: '言語',
      aria: '言語を選択',
    },
    backToVillage: '← 診断村に戻る',
    backToHistory: '← 診断履歴に戻る',
    legalNav: 'フッターリンク',
    footerLinks: {
      privacy: 'プライバシーポリシー',
      contact: 'お問い合わせ',
      operator: '運営者情報',
    },
    footerCopyright: '© 2026 Katsuya Ohara / 診断村. All Rights Reserved.',
    bottomNav: {
      aria: '診断村メニュー',
      home: 'ホーム',
      search: 'さがす',
      diagnose: '診断する',
      guide: '図鑑',
      menu: 'メニュー',
    },
    characterGuide: {
      label: '診断村キャラ図鑑',
      title: '村人図鑑',
      lead: '診断村に登場するキャラクターたちを一覧で見られます。気になるキャラから診断を始めてみてください。',
      startButton: 'この診断をやる',
      likeOn: '♥ 好き',
      likeOff: '♡ 好き',
    },
    history: {
      label: '診断履歴',
      resultLine: (diagnosisTitle, resultTitle) => `あなたは「${diagnosisTitle}」で、${resultTitle}でした。`,
      characterLabel: '診断キャラクター',
      savedNote: '過去に保存された診断結果です。',
      resultSentence: (diagnosisTitle, resultTitle) => `私は「${diagnosisTitle}」で「${resultTitle}」でした。`,
      copyAlert: '履歴の結果文をコピーしました。',
      backButton: '診断村に戻る',
    },
    historyList: {
      label: '診断履歴',
      title: 'これまでの診断結果',
      empty: 'まだ診断履歴がありません。',
    },
    diagnosis: {
      resultHeading: '診断結果',
      progress: (answered, total) => `${answered} / ${total} 問回答済み`,
      seeResultButton: '診断結果を見る',
      scoreLabel: (score, maxScore) => `スコア ${score} / ${maxScore}`,
      resultLine: (diagnosisTitle, resultTitle) => `あなたは「${diagnosisTitle}」で、${resultTitle}でした。`,
      characterLabel: '診断キャラクター',
      resultSentence: (diagnosisTitle, resultTitle) => `私は「${diagnosisTitle}」で「${resultTitle}」でした。`,
      characterLinePrefix: '診断キャラ：',
      storyImageButton: 'ストーリー画像を作る',
      shareAria: 'SNSでシェア',
      shareXAria: 'Xでシェア',
      shareLineAria: 'LINEでシェア',
      copyAria: '結果文をコピー',
      otherDiagnosesButton: '他の診断も見る',
      retryButton: 'もう一度診断する',
      imageFailAlert: '画像の作成に失敗しました。',
      storyImageFailAlert: 'ストーリー画像の作成に失敗しました。',
      copyAlert: '結果文をコピーしました。X・LINE・Instagramなど好きな場所に貼り付けてシェアできます。',
    },
    recommend: {
      badge: 'PR',
      title: 'スキマ時間にポイ活',
      description: 'アンケートに答えるだけでポイントが貯まる、運営20年・500万人が使う「ちょびリッチ」。診断のついでにチェックしてみて。',
      buttonLabel: 'ちょびリッチを見てみる',
    },
    home: {
      heroTitle: '診断村',
      heroSubtitle: 'あなたにぴったりの診断が見つかる場所',
      startPopularButton: '人気診断をはじめる',
      viewGuideButton: '村人図鑑を見る',
      welcomeSignTitle: 'ようこそ診断村へ',
      welcomeSignText: '気になる診断を探して、あなたにぴったりのキャラに出会いましょう。',
      introTitle: 'あなたはどの村へ行く？',
      introText: '気分・シーン・キャラから診断を選べます。結果はキャラ付きで保存され、あとからInstagram用画像としてシェアできます。',
      situationSearchTitle: 'シチュエーション検索',
      featureCards: [
        { emoji: '💗', title: '恋愛診断', text: '恋の傾向をチェック', diagnosisId: 'love-complicated' },
        { emoji: '👻', title: '性格診断', text: 'あなたの性格をまるっと診断', diagnosisId: 'hidden-personality' },
        { emoji: '⭐', title: '関係性診断', text: 'あの人との関係を診断', diagnosisId: 'dangerous-man' },
        { emoji: '💼', title: '仕事診断', text: '向いている仕事を見つけよう', diagnosisId: 'work-style' },
        { emoji: '💬', title: 'SNS診断', text: 'SNSでのあなたは？', diagnosisId: 'sns-approval' },
      ],
      popularRankingLabel: '人気キャラランキング',
      popularRankingTitle: '今見られている診断キャラ',
      likeCountSuffix: 'いいね',
      historyLabel: '診断履歴',
      historyTitle: '最近の診断結果',
      historyMoreButton: 'すべて見る',
      categoryFilterTitle: 'カテゴリーで選ぶ',
      sceneFilterTitle: 'シーンで選ぶ',
      listLabel: '診断一覧',
      listTitle: (count) => `${count}個の診断が見つかりました`,
      resetButton: '絞り込みをリセット',
    },
  },
  // 英語は enData.js(遅延読み込み)から取得。未読み込み時はundefinedになり、
  // 呼び出し側の `|| ja` フォールバックで日本語が表示される。
  get en() {
    return getEnPack()?.uiTextEn
  },
}

export const legalPagesByLanguage = {
  ja: {
    privacy: {
      label: 'Privacy Policy',
      title: 'プライバシーポリシー',
      lead: '診断村では、ユーザーの安心と安全を大切にし、個人情報や端末内データの取り扱いについて以下の通り定めます。',
      sections: [
        { heading: '取得する情報について', body: '診断村では、氏名、住所、電話番号など、個人を直接特定する情報を原則として取得しません。診断結果、診断履歴、好きボタンの情報は、サービス体験向上のために利用されます。' },
        { heading: '端末内に保存される情報について', body: '診断履歴、好きボタン、入口画面の通過状態などは、ユーザーの端末内のlocalStorageに保存されます。これらの情報は、同じ端末・同じブラウザで表示を便利にするために利用されます。' },
        { heading: '広告配信について', body: '診断村では、Google AdSenseなどの第三者配信事業者による広告を掲載する場合があります。広告配信事業者は、Cookie等を使用して、ユーザーの興味に応じた広告を表示する場合があります。' },
        { heading: 'アクセス解析について', body: '診断村では、サービス改善のためにGoogle Analytics等のアクセス解析ツールを利用する場合があります。これらのツールはCookie等を使用して匿名の利用状況データを収集することがあります。' },
        { heading: 'Cookieについて', body: 'ユーザーはブラウザの設定によりCookieを無効にすることができます。ただし、Cookieを無効にした場合、一部の機能が正しく動作しない場合があります。' },
        { heading: '免責事項', body: '診断村の診断結果はエンターテインメントを目的としたものであり、医学的、心理学的、法律的、金融的な助言を行うものではありません。診断結果の利用により生じた損害について、運営者は責任を負いかねます。' },
        { heading: '著作権について', body: '診断村に掲載される文章、画像、キャラクター、デザイン等の著作権は、運営者または正当な権利者に帰属します。無断転載、無断使用、二次配布を禁止します。' },
        { heading: '改定について', body: '本ポリシーは、必要に応じて予告なく変更される場合があります。変更後の内容は、本ページに掲載された時点で有効となります。' },
      ],
    },
    contact: {
      label: 'Contact',
      title: 'お問い合わせ',
      lead: '診断村に関するお問い合わせは、下記メールアドレスまでお願いいたします。',
      sections: [
        { heading: 'お問い合わせ先', body: 'katuya0208@gmail.com' },
      ],
    },
    operator: {
      label: 'Operator',
      title: '運営者情報',
      lead: '診断村の運営者情報です。',
      sections: [
        { heading: 'サイト名', body: '診断村' },
        { heading: '運営者', body: 'Katsuya Ohara' },
        { heading: 'サイト内容', body: '恋愛、性格、仕事、お金、SNSなどをテーマにしたキャラクター診断コンテンツを提供しています。診断結果はエンターテインメントを目的としています。' },
        { heading: '著作権表記', body: '© 2026 Katsuya Ohara / 診断村. All Rights Reserved.' },
      ],
    },
  },
  // 英語は enData.js(遅延読み込み)から取得。未読み込み時はundefinedになり、
  // 呼び出し側の `|| ja` フォールバックで日本語が表示される。
  get en() {
    return getEnPack()?.legalPagesEn
  },
}

export const answerCommentsByLanguage = {
  ja: {
    'hidden-personality': [
      'まだ村人モードです。今のところ裏の顔は控えめで、かなり平和に見えています。',
      '少しだけ裏の顔が見えています。笑っている時でも、頭の中ではちゃんと観察しているタイプです。',
      'かなり裏人格が出ています。優しそうに見えて、実は相手の違和感をかなり見抜いています。',
      'これはもう裏ボス級です。表では穏やかでも、心の中では全部見透かしている可能性があります。',
    ],
    'love-complicated': [
      '今のところ恋愛はわりと素直です。まだこじらせ村の入口には立っていません。',
      '少しこじらせています。好きな人の一言で、心の中の会議が始まりがちです。',
      'かなりこじらせています。返信ひとつで感情が動くタイプなので、相手は責任重大です。',
      'これは恋愛沼の住人です。好きなのに強がる、気になるのに冷静ぶる、全部セットで出ています。',
    ],
    'menhera-level': [
      '今のところ安定寄りです。愛情確認はそこまで強くありません。',
      '少し不安になりやすいタイプです。平気なふりをしていても、内心はちゃんと気にしています。',
      'かなり感情が揺れやすいです。相手のテンションひとつで、心の天気が変わりがちです。',
      'これは愛情確認モードが強めです。大丈夫と言いながら、全然大丈夫じゃない可能性があります。',
    ],
    'dangerous-man': [
      'まだ安全圏です。危ない雰囲気より、普通にいい人感が勝っています。',
      '少しミステリアスです。何を考えているか分からない感じが、ちょっと気にならせます。',
      'かなり危ない魅力が出ています。近づきにくいのに気になる、少し沼らせるタイプです。',
      'これは深沼の支配者感があります。優しさと距離感のギャップで、相手を強く惹きつけがちです。',
    ],
    'popularity-season': [
      'まだ小さなつぼみ状態です。今は無理に咲こうとせず、自分の魅力を育てる時期です。',
      '少しずつ花びらが開き始めています。自分では気づかなくても、雰囲気はちゃんと変わっています。',
      'モテ期の風が近づいています。最近の変化に、周りが少しずつ気づき始めているかもしれません。',
      'かなり満開寄りです。変に遠慮せず、堂々としていた方が魅力がきれいに出ます。',
    ],
    'sns-approval': [
      'SNSとはほどよい距離感です。反応に振り回されすぎないタイプです。',
      '少し気にしています。投稿後に反応を見に行く回数が、ちょっと多めかもしれません。',
      'かなり承認欲求が出ています。見てほしい人に向けた投稿、心当たりがありそうです。',
      'これはSNS村の住人です。いいね、閲覧者、匂わせ、全部ちゃんと気にしています。',
    ],
    'dark-fall': [
      'まだ光側です。多少疲れていても、心の闇はそこまで濃くありません。',
      '少し闇が出ています。笑っていても、内心では冷静に距離を測っているかもしれません。',
      'かなり闇落ちに近いです。期待しないようにしているのは、過去に疲れた証拠かもしれません。',
      'これは深淵に近い状態です。優しさの奥に、なかなか強めの黒い感情が眠っています。',
    ],
    'money-luck': [
      'お金との距離感はかなり安定しています。無理な勝負より堅実寄りです。',
      '少しお金に気持ちが動きやすいです。欲しいものと将来不安の間で揺れがちです。',
      'かなりお金に反応するタイプです。稼ぐ話や増やす話に、ついアンテナが立ちます。',
      'これは財運マスター候補です。大きく稼ぐ話やお金のチャンスにワクワクする才能があります。',
    ],
    'work-style': [
      '安定運用タイプです。決まった流れの中で、落ち着いて力を出せます。',
      '少し自由度がほしいタイプです。ルールが多すぎると、やる気が削られやすいです。',
      'かなり自走型です。言われたことだけより、自分で考えて動く方が向いています。',
      'これはビジネス覇者寄りです。型にはめられるより、自分のやり方で突破するタイプです。',
    ],
    'life-bug': [
      'まだ正常プレイです。人生のバグは少なめで、比較的まともなルートを歩いています。',
      '少しバグっています。普通にしているのに、なぜか変なイベントに巻き込まれがちです。',
      'かなりイベント多めです。人生の脚本を書いている人が、少しふざけている可能性があります。',
      'これはカオスプレイヤー感があります。何が起きても、なんだかんだ生き残る謎の運があります。',
    ],
    'oshikatsu-type': [
      'まだ見守りモードです。推しとの距離感はかなり健全です。',
      '少しオタクの芽が出ています。気づいたら推しの動画を連続再生していませんか。',
      'かなり本格的な推し活です。財布と相談する回数が増えてきている頃です。',
      'これは限界オタクの領域です。推しがいない人生はもう考えられない可能性があります。',
    ],
  'reply-type': [
      '返信はかなりマイペース。未読の山も、あなたにとっては風景の一部です。',
      'ゆっくりだけど、ちゃんと返すタイプ。文面に人柄がにじみます。',
      '気分が乗れば速い。あなたの返信速度は天気と同じで予報が難しいです。',
      'ほぼ即レス。あなたのスマホ、体の一部になっていませんか。',
    ],
  'crush-misread': [
      'かなり冷静です。恋のサインを審査する側の人ですね。',
      '少し期待しがちな気配。でもまだ健全な範囲です。',
      'だいぶ受信感度が高めです。営業スマイルにはお気をつけて。',
      'アンテナ全開です。世界のすべてが脈ありに見えていませんか。',
    ],
  'dark-depth': [
      '水面付近を漂っています。心が透明で、闇の気配はほぼありません。',
      '少し潜り始めました。内心のツッコミと小さなメモが増えてきています。',
      'かなり深いところにいます。発光を始めた本音にお気をつけて。',
      '海溝レベルです。あなたの静けさの下に、壮大な世界が広がっていそうです。',
    ],
  },
  // 英語は enData.js(遅延読み込み)から取得。未読み込み時はundefinedになり、
  // 呼び出し側の `|| ja` フォールバックで日本語が表示される。
  get en() {
    return getEnPack()?.answerCommentsEn
  },
}

// AI もサーバーも使わない「仮のゲーム作り」。次の2か所で共有する:
//   - dev-api.mjs  … 開発サーバー(npm run dev)用の仮API
//   - demo-api.js  … お試し版(VITE_DEMO=1 でビルドしたもの)。ブラウザの中だけで動く
// 本番は server/api/*.php が同じ形のデータを返す。

export const PLANS = {
  standard: { price: 500, chapters: 3, extra: 0 },
  premium: { price: 1000, chapters: 4, extra: 6 },
}

// 作成フォームの入力を整える。足りなければ null
export function parseInput(body) {
  const plan = PLANS[body.plan] ? body.plan : 'standard'
  const memories = (body.memories || [])
    .map((m) => ({ text: String(m?.text || '').trim(), photo: m?.photo || null }))
    .filter((m) => m.text)
    .slice(0, PLANS[plan].chapters)
  const recipientName = String(body.recipientName || '').trim()
  if (!recipientName || memories.length < 2) return null
  return {
    plan,
    recipientName,
    senderName: String(body.senderName || '').trim(),
    memories,
    extraPhotos: (body.extraPhotos || []).slice(0, PLANS[plan].extra),
    message: String(body.message || '').trim(),
  }
}

export function templateGame(input) {
  const name = input.recipientName
  const from = input.senderName ? `${input.senderName}さん` : 'ある方'
  return {
    title: `${name}さんへの贈り物`,
    intro: [`${name}さん、こんにちは。`, `${from}から、あなたのためだけの贈り物をお預かりしています。`, '思い出をひとつずつ、たどってみてください。'],
    stages: input.memories.map((memory) => ({
      question: `「${memory.text}」——このこと、覚えていますか。`,
      choices: [
        { label: 'はっきり覚えている', reply: `覚えていてくれて、うれしいです。${from}にとっても、ずっと大切にしている思い出です。` },
        { label: 'なんとなく覚えている', reply: `おぼろげでも、心のどこかに残っていたのですね。${from}は、今もあざやかに覚えています。` },
        { label: 'もう一度、思い出したい', reply: `それなら、いま一緒に思い出しましょう。${from}が、あなたに伝えたかった思い出です。` },
      ],
      caption: memory.text,
      // 本番はサーバーに保存してURLを返す。仮の版はブラウザから来た画像データをそのまま使う
      photo: memory.photo || null,
    })),
    ending: ['すべての思い出をたどり終えました。', 'それでは、贈り物をお渡しします。'],
    message: input.message || `${name}さん、いつもありがとう。これからもよろしくね。`,
    badge: { name: 'かけがえのない人', description: `${from}にとって、世界にひとりだけの大切な人。` },
    album: input.extraPhotos,
  }
}

// 予約送信の指定を確かめる。自分で送るなら {}、おかしければ null
export function parseDelivery(d) {
  if (d?.mode !== 'email') return {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '') || !(new Date(d.at) > new Date())) return null
  return { deliverAt: `${d.at.replace('T', ' ')}:00`, deliverEmail: `${d.email.slice(0, 2)}***@${d.email.split('@')[1]}` }
}

// 画面に返す形。予約の情報は作った人にだけ返す
export function viewGift(gift, owner) {
  return {
    id: gift.id,
    status: gift.status,
    owner,
    recipientName: gift.input.recipientName,
    senderName: gift.input.senderName,
    game: gift.game,
    plan: gift.input.plan,
    price: PLANS[gift.input.plan].price,
    deliverAt: owner ? gift.deliverAt || null : null,
    deliverEmail: owner ? gift.deliverEmail || null : null,
    deliveredAt: null,
  }
}

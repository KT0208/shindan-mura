// 開発サーバー(npm run dev)専用の、APIの仮実装。
// 本番は server/api/*.php が動く。ここはデータをメモリに置くだけで、
// AIも支払いも使わず「Stripe未設定」のときと同じ動き(支払いボタンで即送れる)をする。
import { randomBytes } from 'node:crypto'

const gifts = new Map()
const PLANS = { standard: { price: 500, chapters: 3, extra: 0 }, premium: { price: 1000, chapters: 4, extra: 6 } }

function templateGame(input) {
  const name = input.recipientName
  const from = input.senderName ? `${input.senderName}さん` : 'ある方'
  const stages = input.memories.map((memory) => ({
    question: `「${memory.text}」——このこと、覚えていますか。`,
    choices: [
      { label: 'はっきり覚えている', reply: `覚えていてくれて、うれしいです。${from}にとっても、ずっと大切にしている思い出です。` },
      { label: 'なんとなく覚えている', reply: `おぼろげでも、心のどこかに残っていたのですね。${from}は、今もあざやかに覚えています。` },
      { label: 'もう一度、思い出したい', reply: `それなら、いま一緒に思い出しましょう。${from}が、あなたに伝えたかった思い出です。` },
    ],
    caption: memory.text,
    // 本番はサーバーに保存してURLを返す。開発用はブラウザから来た画像データをそのまま返す
    photo: memory.photo || null,
  }))
  return {
    title: `${name}さんへの贈り物`,
    intro: [`${name}さん、こんにちは。`, `${from}から、あなたのためだけの贈り物をお預かりしています。`, '思い出をひとつずつ、たどってみてください。'],
    stages,
    ending: ['すべての思い出をたどり終えました。', 'それでは、贈り物をお渡しします。'],
    message: input.message || `${name}さん、いつもありがとう。これからもよろしくね。`,
    badge: { name: 'かけがえのない人', description: `${from}にとって、世界にひとりだけの大切な人。` },
    album: input.extraPhotos,
  }
}

function send(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

async function readJson(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function view(gift, owner) {
  return {
    id: gift.id,
    status: gift.status,
    owner,
    recipientName: gift.input.recipientName,
    senderName: gift.input.senderName,
    game: gift.game,
    plan: gift.input.plan,
    price: PLANS[gift.input.plan].price,
  }
}

export function devApi() {
  return {
    name: 'hitotsu-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.pathname === '/create.php' && req.method === 'POST') {
          const body = await readJson(req)
          const planId = PLANS[body.plan] ? body.plan : 'standard'
          const plan = PLANS[planId]
          const memories = (body.memories || []).map((m) => ({ text: String(m?.text || '').trim(), photo: m?.photo || null })).filter((m) => m.text).slice(0, plan.chapters)
          if (!String(body.recipientName || '').trim() || memories.length < 2) return send(res, 400, { error: 'invalid_input' })
          const input = { ...body, plan: planId, extraPhotos: (body.extraPhotos || []).slice(0, plan.extra), recipientName: String(body.recipientName).trim(), senderName: String(body.senderName || '').trim(), memories, message: String(body.message || '').trim() }
          const gift = { id: randomBytes(6).toString('hex'), key: randomBytes(16).toString('hex'), status: 'draft', input, game: templateGame(input) }
          gifts.set(gift.id, gift)
          await new Promise((r) => setTimeout(r, 1200)) // AIの待ち時間のかわり
          return send(res, 200, { id: gift.id, key: gift.key, status: 'draft', source: 'template', game: gift.game, plan: planId, price: plan.price })
        }
        if (url.pathname === '/get.php') {
          const gift = gifts.get(url.searchParams.get('id'))
          const owner = !!gift && url.searchParams.get('key') === gift.key
          if (!gift || (!owner && gift.status !== 'paid')) return send(res, 404, { error: 'not_found' })
          return send(res, 200, view(gift, owner))
        }
        if (url.pathname === '/checkout.php' && req.method === 'POST') {
          const body = await readJson(req)
          const gift = gifts.get(body.id)
          if (!gift || body.key !== gift.key) return send(res, 404, { error: 'not_found' })
          gift.status = 'paid'
          return send(res, 200, { status: 'paid', free: true })
        }
        return send(res, 404, { error: 'not_found' })
      })
    },
  }
}

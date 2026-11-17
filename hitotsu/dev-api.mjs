// 開発サーバー(npm run dev)専用の、APIの仮実装。
// 本番は server/api/*.php が動く。ここはデータをメモリに置くだけで、
// AIも支払いも使わず「Stripe未設定」のときと同じ動き(支払いボタンで即送れる)をする。
import { randomBytes } from 'node:crypto'

const gifts = new Map()

function templateGame(input) {
  const name = input.recipientName
  const decoys = ['月まで歩いて行ったことがある', '猫と会話ができる', '一晩で本を百冊読んだ', '雲の上で昼寝をしたことがある', 'くじらに乗ったことがある', '虹の根元を見つけた']
  const stages = input.memories.map((memory, i) => {
    const choices = [memory, decoys[(i * 2) % 6], decoys[(i * 2 + 1) % 6]].sort(() => Math.random() - 0.5)
    return {
      question: `${name}さんについて、本当なのはどれでしょう。`,
      choices,
      answer: choices.indexOf(memory),
      correct: '正解です。よく覚えていらっしゃいますね。',
      wrong: `惜しい。答えは「${memory}」でした。`,
    }
  })
  const from = input.senderName ? `${input.senderName}さん` : 'ある方'
  return {
    title: `${name}さんへの贈り物`,
    intro: [`${name}さん、こんにちは。`, `${from}から、あなたのためだけの贈り物をお預かりしています。`, 'いくつかの問いに答えて、贈り物を開けてみてください。'],
    stages,
    ending: ['すべての問いが終わりました。', 'それでは、贈り物をお渡しします。'],
    message: input.message || `${name}さん、いつもありがとう。これからもよろしくね。`,
    badge: { name: 'かけがえのない人', description: `${from}にとって、世界にひとりだけの大切な人。` },
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
    price: 500,
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
          const memories = (body.memories || []).map((m) => String(m).trim()).filter(Boolean).slice(0, 5)
          if (!String(body.recipientName || '').trim() || memories.length < 2) return send(res, 400, { error: 'invalid_input' })
          const input = { ...body, recipientName: String(body.recipientName).trim(), senderName: String(body.senderName || '').trim(), memories, message: String(body.message || '').trim() }
          const gift = { id: randomBytes(6).toString('hex'), key: randomBytes(16).toString('hex'), status: 'draft', input, game: templateGame(input) }
          gifts.set(gift.id, gift)
          await new Promise((r) => setTimeout(r, 1200)) // AIの待ち時間のかわり
          return send(res, 200, { id: gift.id, key: gift.key, status: 'draft', source: 'template', game: gift.game, price: 500 })
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

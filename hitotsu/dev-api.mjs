// 開発サーバー(npm run dev)専用の、APIの仮実装。
// 本番は server/api/*.php が動く。ここはデータをメモリに置くだけで、
// AIも支払いも使わず「Stripe未設定」のときと同じ動き(支払いボタンで即送れる)をする。
import { randomBytes } from 'node:crypto'
import { PLANS, parseInput, templateGame, parseDelivery, viewGift } from './src/template.js'

const gifts = new Map()

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

export function devApi() {
  return {
    name: 'hitotsu-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.pathname === '/create.php' && req.method === 'POST') {
          const input = parseInput(await readJson(req))
          if (!input) return send(res, 400, { error: 'invalid_input' })
          const gift = { id: randomBytes(6).toString('hex'), key: randomBytes(16).toString('hex'), status: 'draft', input, game: templateGame(input) }
          gifts.set(gift.id, gift)
          await new Promise((r) => setTimeout(r, 1200)) // AIの待ち時間のかわり
          return send(res, 200, { id: gift.id, key: gift.key, status: 'draft', source: 'template', game: gift.game, plan: input.plan, price: PLANS[input.plan].price })
        }
        if (url.pathname === '/get.php') {
          const gift = gifts.get(url.searchParams.get('id'))
          const owner = !!gift && url.searchParams.get('key') === gift.key
          if (!gift || (!owner && gift.status !== 'paid')) return send(res, 404, { error: 'not_found' })
          return send(res, 200, viewGift(gift, owner))
        }
        if (url.pathname === '/checkout.php' && req.method === 'POST') {
          const body = await readJson(req)
          const gift = gifts.get(body.id)
          if (!gift || body.key !== gift.key) return send(res, 404, { error: 'not_found' })
          // 予約の内容を覚えるだけで、メールは送らない
          const delivery = parseDelivery(body.delivery)
          if (!delivery) return send(res, 400, { error: 'invalid_delivery' })
          Object.assign(gift, delivery, { status: 'paid' })
          return send(res, 200, { status: 'paid', free: true, deliverAt: gift.deliverAt || null, deliverEmail: gift.deliverEmail || null })
        }
        return send(res, 404, { error: 'not_found' })
      })
    },
  }
}

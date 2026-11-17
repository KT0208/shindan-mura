// お試し版(VITE_DEMO=1 でビルドしたもの)専用。サーバーの代わりに、ブラウザの中だけで動く仮API。
// 作った贈り物はその端末のブラウザ内(IndexedDB)にだけ保存される。
// そのため、贈り物のリンクを別の端末で開いても見つからない。AI・支払い・メール送信は行わない。
import { PLANS, parseInput, templateGame, parseDelivery, viewGift } from './template.js'

const STORE = 'gifts'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('hitotsu-demo', 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run(mode, action) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = action(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const load = (id) => run('readonly', (store) => store.get(id || ''))
const save = (gift) => run('readwrite', (store) => store.put(gift))
const randomHex = (bytes) => [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, '0')).join('')
const fail = (code) => {
  throw new Error(code)
}

export async function demoApi(path, options) {
  const [name, query] = path.split('?')
  const params = new URLSearchParams(query)
  const body = options?.body ? JSON.parse(options.body) : {}

  if (name === 'create.php') {
    const input = parseInput(body)
    if (!input) fail('invalid_input')
    const gift = { id: randomHex(6), key: randomHex(16), status: 'draft', input, game: templateGame(input) }
    await save(gift)
    await new Promise((r) => setTimeout(r, 1800)) // AIの待ち時間のかわり
    return { id: gift.id, key: gift.key, status: 'draft', source: 'template', game: gift.game, plan: input.plan, price: PLANS[input.plan].price }
  }
  if (name === 'get.php') {
    const gift = await load(params.get('id'))
    const owner = !!gift && params.get('key') === gift.key
    if (!gift || (!owner && gift.status !== 'paid')) fail('not_found')
    return viewGift(gift, owner)
  }
  if (name === 'checkout.php') {
    const gift = await load(body.id)
    if (!gift || body.key !== gift.key) fail('not_found')
    const delivery = parseDelivery(body.delivery)
    if (!delivery) fail('invalid_delivery')
    Object.assign(gift, delivery, { status: 'paid' })
    await save(gift)
    return { status: 'paid', free: true, deliverAt: gift.deliverAt || null, deliverEmail: gift.deliverEmail || null }
  }
  return fail('not_found')
}

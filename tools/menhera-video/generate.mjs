// メンヘラクラゲ動画 生成器。 node generate.mjs --format <montage|4koma|aruaru|random> [--jelly N] [--koma id] [--seed N]
import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { jellies, fourKoma, montageHooks } from './data.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const W = 1080, H = 1920

// ---- args ----
const args = process.argv.slice(2)
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d }
let format = getArg('--format', 'random')
const seed = parseInt(getArg('--seed', String(Date.now() % 100000)), 10)
let rng = seed
const rand = () => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff }

// 手動指定(--hook / --jelly / --koma)
const PICK = { hook: 0, jelly: null, koma: null }
const _h = parseInt(getArg('--hook', '-1'), 10); if (_h >= 0) PICK.hook = _h % montageHooks.length
const _j = parseInt(getArg('--jelly', '-1'), 10); if (_j >= 0) PICK.jelly = _j
const _k = getArg('--koma', ''); if (_k) PICK.koma = _k

// 完全ランダム: 全バリアント(montageフック×4 / 4コマ全話 / aruaru全クラゲ)のプールから、
// 履歴(.history.json)の直近と被らないように1つ選ぶ。
if (format === 'random') {
  const pool = []
  montageHooks.forEach((_, i) => pool.push({ format: 'montage', hook: i }))
  fourKoma.forEach((k) => pool.push({ format: '4koma', koma: k.id }))
  jellies.forEach((_, j) => pool.push({ format: 'aruaru', jelly: j }))
  const keyOf = (v) => `${v.format}:${v.koma ?? ''}:${v.jelly ?? ''}:${v.hook ?? ''}`
  const HIST = join(__dir, '.history.json')
  let hist = []
  try { hist = JSON.parse(readFileSync(HIST, 'utf8')) } catch { hist = [] }
  const avoidN = Math.min(hist.length, Math.floor(pool.length * 0.7))
  const recent = new Set(hist.slice(-avoidN))
  let avail = pool.filter((v) => !recent.has(keyOf(v)))
  if (!avail.length) avail = pool
  const chosen = avail[Math.floor(Math.random() * avail.length)]
  format = chosen.format
  if (chosen.hook != null) PICK.hook = chosen.hook
  if (chosen.koma != null) PICK.koma = chosen.koma
  if (chosen.jelly != null) PICK.jelly = chosen.jelly
  hist.push(keyOf(chosen))
  try { writeFileSync(HIST, JSON.stringify(hist.slice(-40))) } catch {}
}

const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const BASE_STYLE = `
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:${W}px; height:${H}px; overflow:hidden; background:#0a0618; }
  #root { position:relative; width:100%; height:100%; overflow:hidden; font-family: sans-serif;
    background: radial-gradient(130% 80% at 50% 8%, #3a2170 0%, #1a1038 45%, #0a0618 100%); color:#fff; }
  .bub { position:absolute; border-radius:50%; background:radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(180,150,255,0.08)); opacity:.5; }
  .clip { position:absolute; inset:0; }
`
const BUBBLES = `
    <div class="bub" style="width:120px;height:120px;left:120px;top:300px"></div>
    <div class="bub" style="width:70px;height:70px;left:880px;top:520px"></div>
    <div class="bub" style="width:46px;height:46px;left:220px;top:1500px"></div>
    <div class="bub" style="width:90px;height:90px;left:840px;top:1400px"></div>
    <div class="bub" style="width:36px;height:36px;left:520px;top:220px"></div>
`
const doc = ({ dur, style, body, tl }) => `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<title>メンヘラクラゲ Short</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>${BASE_STYLE}${style}</style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${dur.toFixed(2)}">
${BUBBLES}
${body}
  </div>
  <script>
    const tl = gsap.timeline({ paused:true });
${tl}
    window.__timelines["main"] = tl;
  </script>
</body>
</html>
`

// ===================== MONTAGE (30s, 16種メーター上昇) =====================
function buildMontage() {
  const HOOK = 2.6, JD = 1.4, CTA = 5.0
  const ctaStart = HOOK + jellies.length * JD
  const total = ctaStart + CTA
  const hk = montageHooks[PICK.hook] || montageHooks[0]
  let body = `
  <section class="clip hook" data-start="0" data-duration="${(HOOK + 0.22).toFixed(2)}">
    <div class="hook-inner">
      <div class="hook-sub" id="hook-sub">${esc(hk.sub)}</div>
      <div class="hook-title" id="hook-title"><div>${esc(hk.title[0])}</div><div>${esc(hk.title[1])}</div></div>
      <img class="hook-jelly" id="hook-jelly" src="assets/jelly/menhera-labyrinth-jelly.webp" alt="" />
      <div class="hook-note" id="hook-note">${esc(hk.note)}</div>
    </div>
  </section>`
  jellies.forEach(([key, name, line], i) => {
    const st = (HOOK + i * JD).toFixed(2)
    body += `
  <section class="clip jelly" data-start="${st}" data-duration="${(JD + 0.22).toFixed(2)}">
    <div class="jl-lv" id="jl-lv-${i}">メンヘラ度 Lv.${i + 1}<span>/16</span></div>
    <div class="jl-imgwrap" id="jl-img-${i}"><img class="jl-img" src="assets/jelly/${key}.webp" alt="" /></div>
    <div class="jl-name" id="jl-name-${i}">${esc(name)}</div>
    <div class="jl-line" id="jl-line-${i}">${esc(line)}</div>
  </section>`
  })
  body += `
  <section class="clip cta" data-start="${ctaStart.toFixed(2)}" data-duration="${CTA}">
    <div class="cta-inner">
      <div class="cta-q" id="cta-q">あなたはどのクラゲ？</div>
      <img class="cta-jelly" id="cta-jelly" src="assets/jelly/menhera-ending-queen-jelly.webp" alt="" />
      <div class="cta-btn" id="cta-btn">▶ 無料で診断する</div>
      <div class="cta-brand" id="cta-brand">診断村</div>
      <div class="cta-url" id="cta-url">shindanmura.com</div>
    </div>
  </section>
  <div id="meter"><div id="meter-label">メンヘラ度メーター</div><div id="meter-track"><div id="meter-fill"></div></div></div>`

  let tl = `
  tl.fromTo('#hook-sub',{y:40,opacity:0},{y:0,opacity:1,duration:0.4,ease:'power3.out'},0.1);
  tl.fromTo('#hook-title',{scale:0.8,opacity:0},{scale:1,opacity:1,duration:0.55,ease:'back.out(1.6)'},0.3);
  tl.fromTo('#hook-jelly',{y:60,opacity:0,scale:0.7},{y:0,opacity:1,scale:1,duration:0.6,ease:'power3.out'},0.55);
  tl.fromTo('#hook-note',{opacity:0},{opacity:1,duration:0.4},1.1);
  tl.to('#hook-jelly',{y:-18,duration:0.9,ease:'sine.inOut',yoyo:true,repeat:1},0.9);
  tl.to(['#hook-sub','#hook-title','#hook-jelly','#hook-note'],{opacity:0,duration:0.22,ease:'power1.in'},${HOOK});
  tl.fromTo('#meter',{opacity:0,y:30},{opacity:1,y:0,duration:0.4,ease:'power2.out'},${HOOK});
  tl.to('#meter',{opacity:0,duration:0.4,ease:'power2.in'},${ctaStart.toFixed(2)});
`
  jellies.forEach((j, i) => {
    const st = (HOOK + i * JD)
    const fillPct = ((i + 1) / jellies.length * 100).toFixed(1)
    tl += `
  tl.fromTo('#jl-img-${i}',{scale:0.6,opacity:0,y:40},{scale:1,opacity:1,y:0,duration:0.42,ease:'back.out(1.8)'},${st.toFixed(2)});
  tl.to('#jl-img-${i}',{y:-14,duration:${(JD - 0.42).toFixed(2)},ease:'sine.inOut'},${(st + 0.42).toFixed(2)});
  tl.fromTo('#jl-name-${i}',{y:34,opacity:0},{y:0,opacity:1,duration:0.36,ease:'power3.out'},${(st + 0.12).toFixed(2)});
  tl.fromTo('#jl-line-${i}',{opacity:0},{opacity:1,duration:0.34},${(st + 0.26).toFixed(2)});
  tl.fromTo('#jl-lv-${i}',{opacity:0,x:30},{opacity:1,x:0,duration:0.3},${(st + 0.1).toFixed(2)});
  tl.to('#meter-fill',{width:'${fillPct}%',duration:0.45,ease:'power2.out'},${st.toFixed(2)});
  tl.to(['#jl-img-${i}','#jl-name-${i}','#jl-line-${i}','#jl-lv-${i}'],{opacity:0,duration:0.22,ease:'power1.in'},${(HOOK + (i + 1) * JD).toFixed(2)});
`
  })
  const lastSt = (HOOK + (jellies.length - 1) * JD)
  tl += `
  tl.fromTo('#jl-name-${jellies.length - 1}',{scale:1},{scale:1.08,duration:0.18,yoyo:true,repeat:3,ease:'power1.inOut'},${(lastSt + 0.4).toFixed(2)});
  tl.fromTo('#cta-q',{y:40,opacity:0},{y:0,opacity:1,duration:0.5,ease:'power3.out'},${(ctaStart + 0.15).toFixed(2)});
  tl.fromTo('#cta-jelly',{scale:0.6,opacity:0},{scale:1,opacity:1,duration:0.6,ease:'back.out(1.7)'},${(ctaStart + 0.3).toFixed(2)});
  tl.fromTo('#cta-btn',{scale:0.8,opacity:0},{scale:1,opacity:1,duration:0.45,ease:'back.out(2)'},${(ctaStart + 0.7).toFixed(2)});
  tl.to('#cta-btn',{scale:1.05,duration:0.6,ease:'sine.inOut',yoyo:true,repeat:3},${(ctaStart + 1.2).toFixed(2)});
  tl.fromTo('#cta-brand',{opacity:0,y:20},{opacity:1,y:0,duration:0.4},${(ctaStart + 1.0).toFixed(2)});
  tl.fromTo('#cta-url',{opacity:0},{opacity:1,duration:0.4},${(ctaStart + 1.3).toFixed(2)});
  tl.to('#cta-jelly',{y:-16,duration:1.0,ease:'sine.inOut',yoyo:true,repeat:2},${(ctaStart + 1.2).toFixed(2)});
`
  const style = `
  .hook-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 70px; }
  .hook-sub { font-size:52px; font-weight:800; color:#ff8fd0; letter-spacing:.06em; text-shadow:0 0 24px rgba(255,120,200,.6); }
  .hook-title { font-size:96px; font-weight:900; line-height:1.2; margin-top:22px; text-shadow:0 6px 30px rgba(120,60,220,.8); }
  .hook-jelly { width:560px; height:560px; object-fit:contain; margin:26px 0; filter:drop-shadow(0 16px 40px rgba(120,60,220,.7)); }
  .hook-note { font-size:50px; font-weight:800; color:#d8c9ff; }
  .jl-lv { position:absolute; top:150px; right:70px; font-size:46px; font-weight:900; color:#fff; background:linear-gradient(90deg,#7a4bff,#ff4e86); padding:14px 30px; border-radius:999px; box-shadow:0 8px 26px rgba(0,0,0,.4); }
  .jl-lv span { font-size:30px; opacity:.85; }
  .jl-imgwrap { position:absolute; top:270px; left:0; right:0; height:820px; display:flex; align-items:center; justify-content:center; }
  .jl-img { width:820px; height:820px; object-fit:contain; filter:drop-shadow(0 20px 50px rgba(120,60,220,.7)); }
  .jl-name { position:absolute; top:1150px; left:0; right:0; text-align:center; font-size:88px; font-weight:900; padding:0 50px; text-shadow:0 6px 28px rgba(120,40,200,.85); }
  .jl-line { position:absolute; top:1300px; left:0; right:0; text-align:center; font-size:66px; font-weight:800; color:#ffd9f2; padding:0 60px; text-shadow:0 4px 18px rgba(0,0,0,.5); }
  #meter { position:absolute; left:70px; right:70px; bottom:210px; opacity:0; }
  #meter-label { font-size:40px; font-weight:800; color:#e9ddff; margin-bottom:16px; text-align:center; letter-spacing:.04em; }
  #meter-track { height:56px; border-radius:999px; background:rgba(255,255,255,.14); overflow:hidden; border:3px solid rgba(255,255,255,.25); }
  #meter-fill { width:0%; height:100%; border-radius:999px; background:linear-gradient(90deg,#5ee7a0 0%, #ffd34e 45%, #ff7a3c 72%, #ff3d6e 100%); }
  .cta-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 70px; }
  .cta-q { font-size:88px; font-weight:900; text-shadow:0 6px 30px rgba(120,60,220,.8); }
  .cta-jelly { width:520px; height:520px; object-fit:contain; margin:30px 0; filter:drop-shadow(0 16px 44px rgba(255,70,120,.6)); }
  .cta-btn { font-size:72px; font-weight:900; color:#1a0a2e; background:linear-gradient(90deg,#ffe16a,#ff9ed2); padding:30px 60px; border-radius:999px; box-shadow:0 12px 40px rgba(255,120,200,.5); }
  .cta-brand { margin-top:40px; font-size:72px; font-weight:900; color:#ff8fd0; letter-spacing:.08em; text-shadow:0 0 24px rgba(255,120,200,.6); }
  .cta-url { font-size:48px; font-weight:800; color:#cdbaff; margin-top:8px; }
`
  return { html: doc({ dur: total, style, body, tl }), meta: { format: 'montage', dur: total } }
}

// ===================== ARUARU (約9s, 1体ループ短尺) =====================
function buildAruaru() {
  let idx = PICK.jelly
  if (!(idx >= 0 && idx < jellies.length)) idx = Math.floor(Math.random() * jellies.length)
  const [key, name, line] = jellies[idx]
  const dur = 9.0
  const body = `
  <section class="clip" data-start="0" data-duration="${dur.toFixed(2)}">
    <div class="a-sub" id="a-sub">#メンヘラあるある</div>
    <div class="a-imgwrap" id="a-img"><img class="a-img" src="assets/jelly/${key}.webp" alt="" /></div>
    <div class="a-name" id="a-name">${esc(name)}</div>
    <div class="a-line" id="a-line">${esc(line)}</div>
    <div class="a-cta" id="a-cta">あなたは何クラゲ？ → 診断村</div>
  </section>`
  const tl = `
  tl.fromTo('#a-sub',{y:-30,opacity:0},{y:0,opacity:1,duration:0.4,ease:'power2.out'},0.1);
  tl.fromTo('#a-img',{scale:0.7,opacity:0},{scale:1,opacity:1,duration:0.6,ease:'back.out(1.7)'},0.25);
  tl.to('#a-img',{y:-24,duration:1.3,ease:'sine.inOut',yoyo:true,repeat:4},0.9);
  tl.fromTo('#a-name',{y:40,opacity:0},{y:0,opacity:1,duration:0.45,ease:'power3.out'},0.6);
  tl.fromTo('#a-line',{opacity:0},{opacity:1,duration:0.5},1.0);
  tl.fromTo('#a-cta',{opacity:0,y:20},{opacity:1,y:0,duration:0.5},1.6);
  tl.to('#a-cta',{scale:1.05,duration:0.7,ease:'sine.inOut',yoyo:true,repeat:5},2.3);
`
  const style = `
  .a-sub { position:absolute; top:150px; left:0; right:0; text-align:center; font-size:56px; font-weight:900; color:#ff8fd0; text-shadow:0 0 24px rgba(255,120,200,.6); }
  .a-imgwrap { position:absolute; top:330px; left:0; right:0; height:860px; display:flex; align-items:center; justify-content:center; }
  .a-img { width:900px; height:900px; object-fit:contain; filter:drop-shadow(0 20px 54px rgba(120,60,220,.7)); }
  .a-name { position:absolute; top:1230px; left:0; right:0; text-align:center; font-size:92px; font-weight:900; padding:0 50px; text-shadow:0 6px 28px rgba(120,40,200,.85); }
  .a-line { position:absolute; top:1390px; left:0; right:0; text-align:center; font-size:68px; font-weight:800; color:#ffd9f2; padding:0 60px; }
  .a-cta { position:absolute; bottom:200px; left:0; right:0; text-align:center; font-size:58px; font-weight:900; color:#1a0a2e; }
  .a-cta { background:linear-gradient(90deg,#ffe16a,#ff9ed2); margin:0 120px; padding:26px 20px; border-radius:999px; left:0; right:0; }
`
  return { html: doc({ dur, style, body, tl }), meta: { format: 'aruaru', jelly: idx, dur } }
}

// ===================== 4KOMA (約14s, 4コマ漫画) =====================
function buildFourKoma() {
  const id = PICK.koma || ''
  let koma = fourKoma.find((k) => k.id === id) || fourKoma[Math.floor(Math.random() * fourKoma.length)]
  const PANEL_IN = 1.05, HOLD = 3.4, CTA = 2.6
  const n = koma.panels.length
  const total = 0.45 + n * PANEL_IN + HOLD + CTA
  const ctaStart = 0.45 + n * PANEL_IN + HOLD
  let panelsHtml = ''
  koma.panels.forEach((p, i) => {
    const mood = p.mood || 'calm'
    panelsHtml += `
    <div class="pnl pnl-${mood}${p.big ? ' pnl-big' : ''}" id="pnl-${i}">
      <div class="pnl-fx"></div>
      <div class="pnl-no">${i + 1}</div>
      <div class="pnl-imgwrap"><img class="pnl-img" src="assets/menhera-chan/${p.expr}.webp" alt="" /></div>
      <div class="pnl-bubble ${p.type === 'narr' ? 'b-narr' : 'b-say'}"><span>${esc(p.text)}</span></div>
    </div>`
  })
  const body = `
  <section class="clip" data-start="0" data-duration="${total.toFixed(2)}">
    <div class="k-title" id="k-title"><div class="k-tag">メンヘラあるある4コマ</div><div class="k-sub">「${esc(koma.title)}」</div></div>
    <div class="k-grid">${panelsHtml}</div>
    <div class="k-cta" id="k-cta">あなたは何クラゲ？ → 診断村</div>
  </section>`
  let tl = `
  tl.fromTo('#k-title',{y:-28,opacity:0},{y:0,opacity:1,duration:0.4,ease:'power2.out'},0.05);
`
  koma.panels.forEach((p, i) => {
    const st = 0.45 + i * PANEL_IN
    tl += `
  tl.fromTo('#pnl-${i}',{opacity:0,x:${i % 2 === 0 ? -70 : 70},scale:0.92},{opacity:1,x:0,scale:1,duration:0.5,ease:'back.out(1.6)'},${st.toFixed(2)});`
    if (p.big) tl += `
  tl.fromTo('#pnl-${i} .pnl-bubble span',{scale:0.4},{scale:1,duration:0.45,ease:'back.out(3)'},${(st + 0.2).toFixed(2)});
  tl.to('#pnl-${i}',{x:-6,duration:0.05,yoyo:true,repeat:5,ease:'none'},${(st + 0.22).toFixed(2)});`
  })
  tl += `
  tl.fromTo('#k-cta',{opacity:0,y:24},{opacity:1,y:0,duration:0.5,ease:'power3.out'},${(ctaStart + 0.2).toFixed(2)});
  tl.to('#k-cta',{scale:1.04,duration:0.7,ease:'sine.inOut',yoyo:true,repeat:2},${(ctaStart + 0.9).toFixed(2)});
`
  const style = `
  .k-title { position:absolute; top:66px; left:0; right:0; text-align:center; }
  .k-tag { display:inline-block; font-size:44px; font-weight:900; color:#1a0a2e; background:linear-gradient(90deg,#ffe16a,#ff9ed2); padding:10px 34px; border-radius:999px; box-shadow:0 6px 18px rgba(0,0,0,.3); }
  .k-sub { font-size:62px; font-weight:900; color:#fff; margin-top:16px; text-shadow:2px 2px 0 #b060e0, 0 4px 18px rgba(120,60,220,.8); }
  .k-grid { position:absolute; top:250px; left:46px; right:46px; bottom:200px; display:grid; grid-template-rows:repeat(4,1fr); gap:20px; }
  .pnl { position:relative; display:flex; align-items:center; gap:16px; border:4px solid #241a38; border-radius:22px; padding:14px 26px 14px 30px; overflow:hidden; box-shadow:0 10px 26px rgba(0,0,0,.4); }
  .pnl-fx { position:absolute; inset:0; pointer-events:none; }
  .pnl-no { position:absolute; top:10px; left:10px; z-index:3; width:56px; height:56px; border-radius:50%; background:#241a38; color:#fff; font-size:34px; font-weight:900; display:flex; align-items:center; justify-content:center; border:3px solid #fff; }
  .pnl-imgwrap { position:relative; z-index:2; flex:none; width:238px; height:238px; display:flex; align-items:center; justify-content:center; }
  .pnl-img { width:238px; height:238px; object-fit:contain; filter:drop-shadow(0 6px 14px rgba(0,0,0,.4)); }
  .pnl-bubble { position:relative; z-index:2; flex:1; padding:16px 24px; }
  .b-say { background:#fff; border:3px solid #241a38; border-radius:18px; }
  .b-say::before { content:""; position:absolute; left:-22px; top:52px; width:0; height:0; border:14px solid transparent; border-right-color:#241a38; }
  .b-say::after { content:""; position:absolute; left:-15px; top:54px; width:0; height:0; border:12px solid transparent; border-right-color:#fff; }
  .b-narr { background:#241a38; border:3px solid #7a5a9a; border-radius:9px; }
  .pnl-bubble.b-narr span { color:#fff; font-weight:700; }
  .b-narr::before { content:"状況"; position:absolute; left:16px; top:-22px; background:#7a5a9a; color:#fff; font-size:26px; font-weight:900; padding:3px 16px; border-radius:9px; }
  .pnl-bubble span { font-size:46px; font-weight:800; color:#241a38; line-height:1.26; }
  .pnl-big .pnl-bubble span { display:block; text-align:center; font-size:104px; font-weight:900; color:#d61f5a; }
  /* moods */
  .pnl-sweet { background:#fff2f8; } .pnl-sweet .pnl-fx { background-image:radial-gradient(circle, rgba(255,120,180,.3) 2px, transparent 2px); background-size:17px 17px; }
  .pnl-calm { background:#f2f2f8; } .pnl-calm .pnl-fx { background-image:radial-gradient(circle, rgba(120,120,155,.22) 1.6px, transparent 1.6px); background-size:15px 15px; }
  .pnl-wait { background:#eef3fb; } .pnl-wait .pnl-fx { background-image:radial-gradient(circle, rgba(90,140,220,.25) 1.8px, transparent 1.8px); background-size:16px 16px; }
  .pnl-joy { background:#fffbe6; } .pnl-joy .pnl-fx { background-image:radial-gradient(circle, rgba(255,200,60,.5) 2.6px, transparent 2.6px); background-size:24px 24px; }
  .pnl-shock { background:#fafafa; } .pnl-shock .pnl-fx { background:repeating-conic-gradient(from 0deg at 28% 50%, rgba(0,0,0,.16) 0deg 1.3deg, transparent 1.3deg 7deg); }
  .pnl-dark { background:radial-gradient(circle at 50% 50%, #3a1c5e, #170c2b); border-color:#c84ad8; } .pnl-dark .pnl-fx { background:radial-gradient(circle at 22% 50%, rgba(155,70,235,.55), transparent 55%), radial-gradient(circle at 72% 28%, rgba(95,45,165,.45), transparent 42%); }
  .pnl-smug { background:linear-gradient(135deg,#2a1442,#50236e); border-color:#e9b84a; } .pnl-smug .pnl-fx { background-image:radial-gradient(circle, rgba(255,205,110,.35) 2px, transparent 2px); background-size:27px 27px; }
  .k-cta { position:absolute; bottom:104px; left:0; right:0; text-align:center; font-size:48px; font-weight:900; color:#1a0a2e; background:linear-gradient(90deg,#ffe16a,#ff9ed2); margin:0 90px; padding:24px 20px; border-radius:999px; box-shadow:0 10px 30px rgba(255,120,200,.5); }
`
  return { html: doc({ dur: total, style, body, tl }), meta: { format: '4koma', koma: koma.id, dur: total } }
}

// ---- dispatch ----
const builders = { montage: buildMontage, aruaru: buildAruaru, '4koma': buildFourKoma }
const b = builders[format]
if (!b) { console.error('unknown format:', format); process.exit(1) }
const { html, meta } = b()
writeFileSync(join(__dir, 'index.html'), html)
writeFileSync(join(__dir, '.lastmeta.json'), JSON.stringify(meta))
console.log('generated:', JSON.stringify(meta))

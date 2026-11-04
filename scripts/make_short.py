# 診断村 YouTube Shorts 自動生成
# 使い方: python3 scripts/make_short.py            → ローテーションで次のキャラを選んで生成
#         python3 scripts/make_short.py --image-key menhera-labyrinth-jelly  → キャラ指定
# 出力: videos/shorts/<日付>_<imageKey>.mp4 と 同名 .json(アップロード用メタデータ)
import argparse
import json
import os
import random
import subprocess
import sys
import tempfile
from datetime import date

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'shorts-data.json')
STATE = os.path.join(ROOT, 'data', 'shorts-state.json')
OUTDIR = os.path.join(ROOT, 'videos', 'shorts')

# フレームは1350x2400で作り、zoompanで1080x1920に(ふんわりズーム用の余白)
FW, FH = 1350, 2400
FPS = 30
FADE = 0.5  # クロスフェード秒
DUR = [2.6, 4.2, 3.4, 2.8]  # 各シーン秒(合計約12秒: 短いほど視聴維持率が高い傾向)

# 「映える」キャラを優先的に出す(分析: 見た目のインパクトが強いキャラほど再生数が伸びた)
FEATURED_PREFIXES = (
    'menhera-', 'abyss-', 'crush-', 'mypace-', 'isekai-', 'holiday-', 'animal-',
)

# ---------- フォント(自動検出: Mac / Linux) ----------
FONT_CANDIDATES = [
    '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc',
    '/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc',
    '/System/Library/Fonts/Hiragino Sans GB.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
]

def find_font():
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return p
    sys.exit('日本語フォントが見つかりません。FONT_CANDIDATESにパスを追加してください。')

FONT_PATH = find_font()

def font(size):
    from PIL import ImageFont
    return ImageFont.truetype(FONT_PATH, size)

# ---------- 描画部品 ----------
BG_TOP = (42, 27, 61)      # 深い紫
BG_MID = (74, 43, 95)
BG_BOTTOM = (58, 32, 78)
WHITE = (245, 238, 255)
PINK = (255, 126, 179)
LILAC = (182, 136, 255)

def gradient_bg():
    im = Image.new('RGB', (FW, FH))
    px = im.load()
    for y in range(FH):
        t = y / FH
        if t < 0.5:
            a, b, tt = BG_TOP, BG_MID, t / 0.5
        else:
            a, b, tt = BG_MID, BG_BOTTOM, (t - 0.5) / 0.5
        px_row = tuple(int(a[i] + (b[i] - a[i]) * tt) for i in range(3))
        for x in range(FW):
            px[x, y] = px_row
    return im

def add_sparkles(im, n=60, seed=1):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(im, 'RGBA')
    for _ in range(n):
        x, y = rnd.randint(0, FW), rnd.randint(0, FH)
        r = rnd.choice([2, 2, 3, 3, 4, 6])
        alpha = rnd.randint(60, 190)
        color = rnd.choice([(255, 255, 255, alpha), (255, 200, 230, alpha), (200, 180, 255, alpha)])
        d.ellipse([x - r, y - r, x + r, y + r], fill=color)
    return im

def wrap(text, per_line):
    lines, cur = [], ''
    for ch in text:
        cur += ch
        if len(cur) >= per_line and ch in '、。！？」)】':
            lines.append(cur); cur = ''
        elif len(cur) >= per_line + 2:
            lines.append(cur); cur = ''
    if cur:
        lines.append(cur)
    return lines

def center_text(d, y, text, f, fill, stroke=None, stroke_w=0):
    w = d.textlength(text, font=f)
    d.text(((FW - w) / 2, y), text, font=f, fill=fill,
           stroke_fill=stroke, stroke_width=stroke_w)
    return y + f.size + 14

def pill(d, cy, text, f, fg, bg):
    w = d.textlength(text, font=f)
    pad_x, pad_y = 60, 28
    x0 = (FW - w) / 2 - pad_x
    x1 = (FW + w) / 2 + pad_x
    d.rounded_rectangle([x0, cy, x1, cy + f.size + pad_y * 2], radius=(f.size + pad_y * 2) / 2, fill=bg)
    d.text(((FW - w) / 2, cy + pad_y), text, font=f, fill=fg)
    return cy + f.size + pad_y * 2

def paste_character(im, char_im, width, cy):
    ratio = width / char_im.width
    c = char_im.resize((width, int(char_im.height * ratio)), Image.LANCZOS)
    # ふんわり光背
    glow = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gx, gy = FW // 2, cy + c.height // 2
    gr = int(width * 0.52)
    gd.ellipse([gx - gr, gy - gr * 0.8, gx + gr, gy + gr * 0.8], fill=(255, 220, 245, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    im.paste(Image.alpha_composite(im.convert('RGBA'), glow).convert('RGB'), (0, 0))
    im.paste(c, ((FW - width) // 2, cy), c)
    return cy + c.height

# ---------- 4シーン ----------
def scene_hook(e):
    im = add_sparkles(gradient_bg(), 70, seed=11)
    d = ImageDraw.Draw(im)
    center_text(d, 330, '診 断 村', font(64), LILAC)
    y = 900
    title_lines = wrap(e['diagnosisTitle'], 8)
    for ln in title_lines:
        y = center_text(d, y, ln, font(150), WHITE, stroke=(30, 15, 50), stroke_w=8)
    y += 60
    center_text(d, y, 'あなたはどのタイプ？', font(84), PINK)
    return im

def scene_reveal(e, char_im):
    im = add_sparkles(gradient_bg(), 55, seed=22)
    d = ImageDraw.Draw(im)
    center_text(d, 260, 'こんな村人がいます', font(66), LILAC)
    bottom = paste_character(im, char_im, 1150, 560)
    d = ImageDraw.Draw(im)
    y = bottom + 70
    y = center_text(d, y, e['characterName'], font(110), WHITE, stroke=(30, 15, 50), stroke_w=7)
    y += 40
    pill(d, y, e['resultTitle'], font(64), (60, 30, 80), (255, 210, 235))
    return im

def scene_desc(e, char_im):
    im = add_sparkles(gradient_bg(), 45, seed=33)
    d = ImageDraw.Draw(im)
    bottom = paste_character(im, char_im, 760, 220)
    d = ImageDraw.Draw(im)
    y = bottom + 50
    y = center_text(d, y, e['characterName'], font(84), WHITE, stroke=(30, 15, 50), stroke_w=6)
    y += 50
    for ln in wrap(e['description'], 15):
        y = center_text(d, y, ln, font(58), (232, 220, 250))
    return im

def scene_cta(e):
    im = add_sparkles(gradient_bg(), 80, seed=44)
    d = ImageDraw.Draw(im)
    y = 620
    y = center_text(d, y, 'あなたは', font(96), WHITE)
    y = center_text(d, y, 'どのタイプ？', font(96), WHITE)
    y += 90
    y = pill(d, y, f'{e["diagnosisTitle"]}はこちら', font(66), (255, 255, 255), (219, 39, 119))
    y += 80
    y = center_text(d, y, '無料・登録なし・1分で診断', font(56), (232, 220, 250))
    y += 60
    center_text(d, y, '検索:「 診断村 」', font(72), PINK)
    return im

# ---------- ffmpeg ----------
# プルプル(zoompanの整数px制約)対策: 2倍解像度でズーム→lanczos縮小。
# 重いのでシーンごとに分割レンダリング(中断しても再実行で続きから)。
def render_scene(frame_png, dur, seg_mp4):
    frames_n = int(dur * FPS)
    vf = (
        # 入力を3倍に拡大してからzoompan(整数px制約が出力上で1/3px以下になりプルプルしない)
        f"scale={FW * 3}:{FH * 3}:flags=lanczos,"
        f"zoompan=z='min(zoom+0.00035,1.06)':d={frames_n}:"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},"
        f"format=yuv420p"
    )
    tmp = seg_mp4 + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-y', '-loop', '1', '-t', '0.05', '-i', frame_png,
                    '-vf', vf, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
                    '-t', f'{dur:.2f}', tmp], check=True, capture_output=True)
    os.replace(tmp, seg_mp4)  # 中断で壊れたファイルを残さない

def build_video(frames, out_mp4, work):
    import time
    os.makedirs(work, exist_ok=True)
    deadline = float(os.environ.get('SHORTS_DEADLINE', '0'))  # サンドボックス用(0=無制限)
    t0 = time.time()
    n = len(frames)
    segs = []
    for i, (png, dur) in enumerate(zip(frames, DUR)):
        seg = os.path.join(work, f'seg{i}.mp4')
        segs.append(seg)
        if os.path.exists(seg):
            continue
        if deadline and time.time() - t0 > deadline:
            print(f'時間切れ: シーン{i}まで完了。再実行で続きから。')
            sys.exit(2)
        print(f'  シーン{i + 1}/{n} レンダリング中...')
        render_scene(png, dur, seg)
    # 結合(xfade連鎖+フェードイン/アウト)
    offsets = []
    acc = 0
    for k in range(n - 1):
        acc += DUR[k]
        offsets.append(acc - (k + 1) * FADE)
    parts = []
    cur = '0:v'
    for k in range(n - 1):
        nxt = f'x{k}' if k < n - 2 else 'vout'
        parts.append(f"[{cur}][{k+1}:v]xfade=transition=fade:duration={FADE}:offset={offsets[k]:.3f}[{nxt}];")
        cur = f'[{nxt}]'.strip('[]')
    total = sum(DUR) - (n - 1) * FADE
    parts.append(f"[vout]fade=t=in:st=0:d=0.5,fade=t=out:st={total-0.5:.2f}:d=0.5,format=yuv420p[final]")
    inputs = []
    for s in segs:
        inputs += ['-i', s]
    with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as tf:
        tf.write(''.join(parts))
        script_path = tf.name
    subprocess.run(['ffmpeg', '-y', *inputs, '-filter_complex_script', script_path,
                    '-map', '[final]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21',
                    '-movflags', '+faststart', out_mp4], check=True, capture_output=True)
    os.unlink(script_path)
    import shutil
    shutil.rmtree(work, ignore_errors=True)

# ---------- ローテーション ----------
def pick_entry(entries, image_key=None):
    if image_key:
        for e in entries:
            if e['imagePath'].endswith(f'/{image_key}.webp'):
                return e
        sys.exit(f'キャラが見つかりません: {image_key}')
    state = {'used': []}
    if os.path.exists(STATE):
        state = json.load(open(STATE))
    unused = [e for e in entries if e['imagePath'] not in state['used']]
    if not unused:
        state['used'] = []
        unused = entries
    # 映えキャラ(FEATURED)で未消化のものがあれば、そこから優先的に選ぶ
    def is_featured(entry):
        key = os.path.basename(entry['imagePath'])
        return key.startswith(FEATURED_PREFIXES)
    featured_unused = [e for e in unused if is_featured(e)]
    pool = featured_unused if featured_unused else unused
    e = random.choice(pool)
    state['used'].append(e['imagePath'])
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    json.dump(state, open(STATE, 'w'), ensure_ascii=False, indent=1)
    return e

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--image-key')
    args = ap.parse_args()

    entries = json.load(open(DATA))
    e = pick_entry(entries, args.image_key)
    key = os.path.basename(e['imagePath']).replace('.webp', '')
    print(f"生成: {e['characterName']}({e['resultTitle']} / {e['diagnosisTitle']})")

    char_im = Image.open(os.path.join(ROOT, e['imagePath'])).convert('RGBA')
    char_im = char_im.crop(char_im.getbbox())

    os.makedirs(OUTDIR, exist_ok=True)
    work = os.path.join(OUTDIR, f'.work_{key}')
    os.makedirs(work, exist_ok=True)
    frames = []
    for i, im in enumerate([scene_hook(e), scene_reveal(e, char_im),
                            scene_desc(e, char_im), scene_cta(e)]):
        p = os.path.join(work, f'f{i}.png')
        if not os.path.exists(p):
            im.save(p)
        frames.append(p)
    out = os.path.join(OUTDIR, f"{date.today().isoformat()}_{key}.mp4")
    build_video(frames, out, work)

    meta = {
        'videoFile': out,
        'title': f"あなたはどのタイプ？{e['characterName']}｜{e['diagnosisTitle']} #shorts",
        'description': (
            f"{e['characterName']}({e['resultTitle']})\n{e['description']}\n\n"
            f"▶ 無料で診断する: {e['diagnosisUrl']}\n"
            f"▶ このキャラのページ: {e['characterUrl']}\n\n"
            f"診断村は無料で遊べる恋愛診断・性格診断・心理テストのサイトです。\n"
            f"https://shindanmura.com\n\n"
            f"#診断村 #{e['diagnosisTitle'].replace(' ', '')} #性格診断 #心理テスト #shorts"
        ),
        'tags': ['診断村', e['diagnosisTitle'], '性格診断', '心理テスト', '診断', 'shorts'],
    }
    meta_path = out.replace('.mp4', '.json')
    json.dump(meta, open(meta_path, 'w'), ensure_ascii=False, indent=1)
    print(f'完了: {out}')
    print(f'メタデータ: {meta_path}')

if __name__ == '__main__':
    main()

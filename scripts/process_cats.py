# マイペース猫16匹: 白背景flood透過 + 足元の影除去 → 1100x733配置
import os, sys, time
import numpy as np, cv2
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f'{ROOT}/new-characters/my-pace'
DST = f'{ROOT}/public/characters/myPaceCatCharacters'
SMALL = f'{ROOT}/public/characters-small/myPaceCatCharacters'

MAPPING = {
    1: 'mypace-ragdoll-cat', 2: 'mypace-amesho-cat', 3: 'mypace-hachiware-cat', 4: 'mypace-munchkin-cat',
    5: 'mypace-scottish-cat', 6: 'mypace-mike-cat', 7: 'mypace-kijitora-cat', 8: 'mypace-bengal-cat',
    9: 'mypace-chatora-cat', 10: 'mypace-sabi-cat', 11: 'mypace-russianblue-cat', 12: 'mypace-mainecoon-cat',
    13: 'mypace-persian-cat', 14: 'mypace-siamese-cat', 15: 'mypace-kuroneko-cat', 16: 'mypace-sphynx-cat',
}

def cut(im):
    rgb = np.asarray(im.convert('RGB'))
    h, w = rgb.shape[:2]
    near_white = (rgb >= 246).all(axis=2).astype(np.uint8)
    mask = np.zeros((h + 2, w + 2), np.uint8)
    ff = near_white.copy()
    for x in list(range(0, w, 40)) + [w - 1]:
        for y in (0, h - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    for y in list(range(0, h, 40)) + [h - 1]:
        for x in (0, w - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    fg = ((ff != 2)).astype(np.uint8) * 255

    # ---- 足元の影除去 ----
    # 影の特徴: 明るい(min>=200)・低彩度・青紫寄り(B-R>=-12)・図形の下部・背景と接している
    r = rgb[..., 0].astype(int); g = rgb[..., 1].astype(int); b = rgb[..., 2].astype(int)
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
    pale = (mn >= 195) & ((mx - mn) <= 30) & ((b - r) >= -22)
    cand = (pale & (fg > 0)).astype(np.uint8) * 255
    # 背景に接している成分だけ(体内部の白い毛は消さない)
    bg = (fg == 0).astype(np.uint8)
    bg_d = cv2.dilate(bg, np.ones((5, 5), np.uint8))
    ys, xs = np.where(fg > 0)
    if len(ys):
        top, bottom = ys.min(), ys.max()
        cut_y = top + int((bottom - top) * 0.55)  # 図形の下側だけ対象
        floor_y = bottom - int((bottom - top) * 0.14)  # 影は最下部に達している
        n, labels, stats, _ = cv2.connectedComponentsWithStats(cand)
        for i in range(1, n):
            t_, l_ = stats[i, cv2.CC_STAT_TOP], stats[i, cv2.CC_STAT_LEFT]
            hgt, wid = stats[i, cv2.CC_STAT_HEIGHT], stats[i, cv2.CC_STAT_WIDTH]
            if t_ < cut_y:
                continue  # 上の方(体の白毛)は守る
            if t_ + hgt < floor_y:
                continue  # 最下部に達していない(=体の模様)は守る
            if wid < hgt * 1.3:
                continue  # 横長の"水たまり"形だけ消す(縦長=毛は守る)
            comp = labels == i
            if not (comp & (bg_d > 0)).any():
                continue  # 背景に接していない(=体内部)は守る
            fg[comp] = 0

    # 小ゴミ除去(キラキラは残す: 50px以上を維持)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(fg)
    clean = np.zeros_like(fg)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= 50:
            clean[labels == i] = 255
    clean = cv2.erode(clean, np.ones((3, 3), np.uint8), iterations=1)
    alpha = Image.fromarray(clean, 'L').filter(ImageFilter.GaussianBlur(1.0))
    rgba = im.convert('RGBA')
    rgba.putalpha(alpha)
    return rgba

def compose(rgba):
    content = rgba.crop(rgba.getbbox())
    TW, TH, MW, MH = 1100, 733, 1040, 700
    scale = min(MW / content.width, MH / content.height)
    content = content.resize((int(content.width * scale), int(content.height * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    canvas.paste(content, ((TW - content.width) // 2, (TH - content.height) // 2), content)
    return canvas

os.makedirs(DST, exist_ok=True)
os.makedirs(SMALL, exist_ok=True)
files = {}
for f in os.listdir(SRC):
    if f.lower().endswith('.png'):
        num = f.split('.')[0].translate(str.maketrans('０１２３４５６７８９', '0123456789'))
        files[int(num)] = f

deadline = time.time() + 34
done = skipped = 0
for num in range(1, 17):
    key = MAPPING[num]
    out = f'{DST}/{key}.webp'
    if os.path.exists(out):
        skipped += 1
        continue
    if time.time() > deadline:
        print(f'時間切れ: {done}枚。再実行で続きから。')
        sys.exit(0)
    im = Image.open(f'{SRC}/{files[num]}')
    canvas = compose(cut(im))
    tmp = out + '.tmp.webp'
    canvas.save(tmp, 'WEBP', quality=90, method=4)
    os.replace(tmp, out)
    canvas.resize((640, 427), Image.LANCZOS).save(f'{SMALL}/{key}.webp', 'WEBP', quality=80, method=4)
    done += 1
    print(f'{key} OK')
print(f'完了: {done}枚 / {skipped}枚スキップ')

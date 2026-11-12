# 才能の精16体: 白背景flood透過 + 足元の影除去(色不問) → 1100x733透過webp配置
import os, sys, time
import numpy as np, cv2
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f'{ROOT}/new-characters/hiddenTalent'
DST = f'{ROOT}/public/characters/hiddenTalentCharacters'
SMALL = f'{ROOT}/public/characters-small/hiddenTalentCharacters'

MAPPING = {
    1: '01-listener', 2: '02-softener', 3: '03-attentive', 4: '04-leader',
    5: '05-idea', 6: '06-expression', 7: '07-intuition', 8: '08-dexterous',
    9: '09-steady', 10: '10-analyst', 11: '11-action', 12: '12-learner',
    13: '13-healer', 14: '14-negotiator', 15: '15-moodmaker', 16: '16-supporter',
}

def cut(im):
    rgb = np.asarray(im.convert('RGB'))
    h, w = rgb.shape[:2]
    near_white = (rgb >= 246).all(axis=2).astype(np.uint8)
    mask = np.zeros((h + 2, w + 2), np.uint8)
    ff = near_white.copy()
    # 四隅・縁から白地をflood(内側の白=体や光は enclosed なので残る)
    for x in list(range(0, w, 30)) + [w - 1]:
        for y in (0, h - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    for y in list(range(0, h, 30)) + [h - 1]:
        for x in (0, w - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    fg = ((ff != 2)).astype(np.uint8) * 255

    # ---- 足元の淡い影除去(色は問わない: 明るく低彩度・下部・背景接触・横長) ----
    r = rgb[..., 0].astype(int); g = rgb[..., 1].astype(int); b = rgb[..., 2].astype(int)
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
    pale = (mn >= 200) & ((mx - mn) <= 30)
    cand = (pale & (fg > 0)).astype(np.uint8) * 255
    bg = (fg == 0).astype(np.uint8)
    bg_d = cv2.dilate(bg, np.ones((5, 5), np.uint8))
    ys, xs = np.where(fg > 0)
    if len(ys):
        top, bottom = ys.min(), ys.max()
        cut_y = top + int((bottom - top) * 0.62)      # 下側だけ対象(グロウ本体を守る)
        floor_y = bottom - int((bottom - top) * 0.12)  # 影は最下部に達している
        n, labels, stats, _ = cv2.connectedComponentsWithStats(cand)
        for i in range(1, n):
            t_ = stats[i, cv2.CC_STAT_TOP]
            hgt, wid = stats[i, cv2.CC_STAT_HEIGHT], stats[i, cv2.CC_STAT_WIDTH]
            if t_ < cut_y:
                continue  # 上側(本体・光)は守る
            if t_ + hgt < floor_y:
                continue  # 最下部に達していない模様は守る
            if wid < hgt * 1.4:
                continue  # 横長の"影"形だけ消す(縦長の光は守る)
            comp = labels == i
            if not (comp & (bg_d > 0)).any():
                continue  # 背景に接していない内部は守る
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
    return rgba, (clean > 0).mean()

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

deadline = time.time() + 120
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
    rgba, ratio = cut(im)
    if not (0.08 < ratio < 0.9):
        print(f'⚠️ {key}: 切り抜き異常({ratio*100:.0f}%)スキップ')
        continue
    canvas = compose(rgba)
    tmp = out + '.tmp.webp'
    canvas.save(tmp, 'WEBP', quality=90, method=4)
    os.replace(tmp, out)
    canvas.resize((640, 427), Image.LANCZOS).save(f'{SMALL}/{key}.webp', 'WEBP', quality=80, method=4)
    done += 1
    print(f'{key} OK ({ratio*100:.0f}%)')
print(f'完了: {done}枚 / {skipped}枚スキップ')

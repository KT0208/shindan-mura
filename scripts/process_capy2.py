# 新カピバラ16体: GrabCutで雰囲気背景を除去 → 1100x733透過webp配置
import os, sys, time
import numpy as np, cv2
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f'{ROOT}/new-characters/カピパラ'
DST = f'{ROOT}/public/characters/holidayCapybaraCharacters'
SMALL = f'{ROOT}/public/characters-small/holidayCapybaraCharacters'

MAPPING = {
    1: 'holiday-bed-capy', 2: 'holiday-cushion-capy', 3: 'holiday-book-capy', 4: 'holiday-oke-capy',
    5: 'holiday-cake-capy', 6: 'holiday-bag-capy', 7: 'holiday-shoe-capy', 8: 'holiday-picnic-capy',
    9: 'holiday-bucket-capy', 10: 'holiday-tong-capy', 11: 'holiday-ukiwa-capy', 12: 'holiday-tent-capy',
    13: 'holiday-kayak-capy', 14: 'holiday-hat-capy', 15: 'holiday-rucksack-capy', 16: 'holiday-mountain-capy',
}

def grabcut(im, iters=4):
    rgb_full = np.asarray(im.convert('RGB'))
    H, W = rgb_full.shape[:2]
    # 速度のため縮小してGrabCut→マスクを原寸に戻す
    scale = min(1.0, 1000 / max(H, W))
    rgb = cv2.resize(rgb_full, (int(W*scale), int(H*scale)), interpolation=cv2.INTER_AREA) if scale < 1 else rgb_full
    h, w = rgb.shape[:2]
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    mask = np.zeros((h, w), np.uint8)
    rect = (int(w*0.04), int(h*0.04), int(w*0.92), int(h*0.92))
    bgd, fgd = np.zeros((1,65), np.float64), np.zeros((1,65), np.float64)
    cv2.grabCut(bgr, mask, rect, bgd, fgd, iters, cv2.GC_INIT_WITH_RECT)
    fg = np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    if scale < 1:
        fg = cv2.resize(fg, (W, H), interpolation=cv2.INTER_LINEAR)
        fg = (fg > 127).astype(np.uint8) * 255
    h, w = H, W
    n, labels, stats, _ = cv2.connectedComponentsWithStats(fg)
    clean = np.zeros_like(fg)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 3000:
            clean[labels==i] = 255
    ff = clean.copy(); m = np.zeros((h+2, w+2), np.uint8)
    cv2.floodFill(ff, m, (0,0), 255)
    clean[ff==0] = 255
    rgba = im.convert('RGBA')
    rgba.putalpha(Image.fromarray(clean, 'L').filter(ImageFilter.GaussianBlur(1.2)))
    return rgba, (clean>0).mean()

def compose(rgba):
    content = rgba.crop(rgba.getbbox())
    TW, TH, MW, MH = 1100, 733, 1040, 700
    scale = min(MW / content.width, MH / content.height)
    content = content.resize((int(content.width * scale), int(content.height * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    canvas.paste(content, ((TW - content.width) // 2, (TH - content.height) // 2), content)
    return canvas

z = str.maketrans('0123456789', '０１２３４５６７８９')
deadline = time.time() + 33
done = skipped = 0
for num in range(1, 17):
    key = MAPPING[num]
    out = f'{DST}/{key}.webp'
    if os.path.exists(out):
        skipped += 1
        continue
    if time.time() > deadline:
        print(f'時間切れ: ここまで{done}枚。再実行で続きから。')
        sys.exit(0)
    im = Image.open(f'{SRC}/{str(num).translate(z)}.png')
    rgba, ratio = grabcut(im)
    if not (0.1 < ratio < 0.85):
        print(f'⚠️ {key}: 切り抜き異常({ratio*100:.0f}%)スキップ')
        continue
    canvas = compose(rgba)
    tmp = out + '.tmp.webp'
    canvas.save(tmp, 'WEBP', quality=90, method=4)
    os.replace(tmp, out)
    canvas.resize((640, 427), Image.LANCZOS).save(f'{SMALL}/{key}.webp', 'WEBP', quality=80, method=4)
    done += 1
    print(f'{key} OK ({ratio*100:.0f}%)')
print(f'完了: {done}枚 / スキップ{skipped}枚')

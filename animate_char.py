# キャラ透過画像の擬似アニメ化(メッシュワープ)
# 呼吸・体のうねり・左右の傾き・腕(下部)のゆらぎを付ける。
# 使い方: python3 animate_char.py <入力webp/png> <出力mp4> [秒数]
import sys
import os
import numpy as np
import cv2

FPS = 30

def build_maps(h, w, t, bbox):
    """時刻tでの変形マップを作る。上(頭)は動かさず、下にいくほど大きく揺れる。"""
    x0, y0, x1, y1 = bbox
    ch, cw = y1 - y0, x1 - x0
    cx = (x0 + x1) / 2

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    # 体内での縦位置(0=頭頂, 1=足元)。範囲外は0/1にクリップ
    v = np.clip((yy - y0) / max(ch, 1), 0, 1)

    # 1) 呼吸: 全体をゆっくり縦に伸縮(中心から)
    breath = 1.0 + 0.012 * np.sin(2 * np.pi * t / 3.2)
    # 2) うねり: 下にいくほど横に大きく揺れる(位相を縦方向にずらして波にする)
    sway = (14.0 * v ** 1.6) * np.sin(2 * np.pi * t / 2.6 - v * 2.2)
    # 3) 上下のふわふわ
    float_y = 6.0 * np.sin(2 * np.pi * t / 2.9)
    # 4) 全体の傾き(頭を支点に)
    tilt = np.deg2rad(1.8 * np.sin(2 * np.pi * t / 4.3))

    # 逆写像(出力→入力)を作る
    src_x = xx - sway - float_y * 0.0
    src_y = (yy - float_y - y0) / breath + y0

    # 傾き(頭上を軸に回転)
    ox, oy = cx, y0
    dx, dy = src_x - ox, src_y - oy
    cos_t, sin_t = np.cos(-tilt), np.sin(-tilt)
    src_x = ox + dx * cos_t - dy * sin_t
    src_y = oy + dx * sin_t + dy * cos_t

    return src_x.astype(np.float32), src_y.astype(np.float32)

def blink_mask(rgba, eye_boxes, amount):
    """目領域を上下に潰してまばたきを表現(amount: 0=開, 1=閉)"""
    if amount <= 0.01 or not eye_boxes:
        return rgba
    out = rgba.copy()
    for (ex0, ey0, ex1, ey1) in eye_boxes:
        patch = rgba[ey0:ey1, ex0:ex1]
        if patch.size == 0:
            continue
        ph = patch.shape[0]
        new_h = max(1, int(ph * (1 - amount * 0.85)))
        squeezed = cv2.resize(patch, (patch.shape[1], new_h), interpolation=cv2.INTER_AREA)
        # 上まぶたが下りてくるように、下端を合わせる
        top = ey1 - new_h
        # 潰した分の隙間は、目の上のピクセル(肌/髪)で埋める
        fill_row = rgba[max(ey0 - 3, 0):ey0 - 2, ex0:ex1]
        if fill_row.shape[0] > 0:
            fill = np.repeat(fill_row, top - ey0, axis=0) if top > ey0 else None
            if fill is not None and fill.shape[0] == top - ey0:
                out[ey0:top, ex0:ex1] = fill
        out[top:ey1, ex0:ex1] = squeezed
    return out

def main():
    src_path = sys.argv[1]
    out_path = sys.argv[2]
    duration = float(sys.argv[3]) if len(sys.argv) > 3 else 4.0
    eye_arg = os.environ.get('EYES', '')  # "x0,y0,x1,y1;x0,y0,x1,y1"
    eye_boxes = []
    for part in eye_arg.split(';'):
        if part.count(',') == 3:
            eye_boxes.append(tuple(int(v) for v in part.split(',')))

    rgba = cv2.imread(src_path, cv2.IMREAD_UNCHANGED)
    if rgba is None:
        sys.exit(f'読めません: {src_path}')
    if rgba.shape[2] == 3:
        rgba = cv2.cvtColor(rgba, cv2.COLOR_BGR2BGRA)
    h, w = rgba.shape[:2]

    alpha = rgba[..., 3]
    ys, xs = np.where(alpha > 128)
    bbox = (xs.min(), ys.min(), xs.max(), ys.max())

    # 背景(診断村カラーのグラデ)
    bg = np.zeros((h, w, 3), np.uint8)
    top_c, bottom_c = (61, 27, 42), (78, 32, 58)  # BGR
    for y in range(h):
        f = y / h
        bg[y, :] = [int(top_c[i] + (bottom_c[i] - top_c[i]) * f) for i in range(3)]

    frames = int(duration * FPS)
    tmp = out_path + '.tmp.mp4'
    writer = cv2.VideoWriter(tmp, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (w, h))

    # まばたきのタイミング(2.2秒ごと、0.18秒かけて閉じ開き)
    for i in range(frames):
        t = i / FPS
        phase = (t % 2.2)
        if phase < 0.18:
            amount = np.sin(np.pi * phase / 0.18)
        else:
            amount = 0.0

        frame_rgba = blink_mask(rgba, eye_boxes, amount)
        mx, my = build_maps(h, w, t, bbox)
        warped = cv2.remap(frame_rgba, mx, my, interpolation=cv2.INTER_LINEAR,
                           borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))

        a = (warped[..., 3:4].astype(np.float32) / 255.0)
        comp = (warped[..., :3].astype(np.float32) * a + bg.astype(np.float32) * (1 - a))
        writer.write(comp.astype(np.uint8))

    writer.release()
    # H.264に変換(ブラウザ再生対応)
    os.system(f'ffmpeg -y -i "{tmp}" -c:v libx264 -pix_fmt yuv420p -crf 20 "{out_path}" -loglevel error')
    os.remove(tmp)
    print('完了:', out_path)

if __name__ == '__main__':
    main()

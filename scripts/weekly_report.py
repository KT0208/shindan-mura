# 診断村 週次レポート
# YouTube再生数・診断人気(いいね)・投稿活動・コンテンツ状況を1枚にまとめる。
# 使い方: python3 scripts/weekly_report.py
# 出力: videos/reports/report_<日付>.md と .html(コンソールにも要約を表示)
#
# 各セクションは独立。1つ失敗しても他は出る設計。
import json
import os
import sys
import urllib.request
from datetime import datetime, date, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
OUTDIR = os.path.join(ROOT, 'videos', 'reports')
JST = timezone(timedelta(hours=9))

def load(name, fallback):
    p = os.path.join(DATA, name)
    try:
        return json.load(open(p, encoding='utf-8'))
    except Exception:
        return fallback

# ---------------- YouTube 再生数 ----------------
def youtube_stats():
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
    except Exception:
        return None, 'ライブラリ未導入(pip install google-api-python-client google-auth-oauthlib)'
    token = os.path.join(DATA, 'youtube-token.json')
    if not os.path.exists(token):
        return None, 'youtube-token.json がありません'
    try:
        creds = Credentials.from_authorized_user_file(token, ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'])
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            open(token, 'w').write(creds.to_json())
        yt = build('youtube', 'v3', credentials=creds)
        uploaded = load('shorts-uploaded.json', [])
        ids = [u['videoId'] for u in uploaded if u.get('videoId')]
        if not ids:
            return {'videos': [], 'total_views': 0}, None
        videos = []
        for i in range(0, len(ids), 50):
            res = yt.videos().list(part='snippet,statistics', id=','.join(ids[i:i+50])).execute()
            for it in res.get('items', []):
                st = it.get('statistics', {})
                videos.append({
                    'id': it['id'],
                    'title': it['snippet']['title'],
                    'published': it['snippet']['publishedAt'],
                    'views': int(st.get('viewCount', 0)),
                    'likes': int(st.get('likeCount', 0)),
                    'comments': int(st.get('commentCount', 0)),
                })
        videos.sort(key=lambda v: -v['views'])
        return {'videos': videos, 'total_views': sum(v['views'] for v in videos)}, None
    except Exception as e:
        return None, f'取得エラー: {e}'

# ---------------- 診断人気(いいねDB) ----------------
def diagnosis_popularity():
    # character_id = "<diagnosisId>-<resultTitle>" 形式。diagnosisIdでまとめる。
    shorts = load('shorts-data.json', [])
    id2title = {}
    diag_ids = set()
    for e in shorts:
        diag_ids.add(e['diagnosisId'])
        id2title[e['diagnosisId']] = e['diagnosisTitle']
    # 長いID優先で前方一致(my-pace が ma より先に当たるように)
    ordered = sorted(diag_ids, key=len, reverse=True)
    try:
        req = urllib.request.Request('https://shindanmura.com/api/likes.php',
                                     headers={'Referer': 'https://shindanmura.com/', 'User-Agent': 'shindanmura-report'})
        rows = json.load(urllib.request.urlopen(req, timeout=15))
    except Exception as e:
        return None, f'いいねDB取得エラー: {e}'
    # APIの返却形式が (A)配列[{character_id,like_count}] でも (B){character_id: count} でも動くようにする
    pairs = []
    if isinstance(rows, dict):
        pairs = list(rows.items())
    elif isinstance(rows, list):
        for row in rows:
            if isinstance(row, dict):
                pairs.append((row.get('character_id') or row.get('id') or '',
                              row.get('like_count') or row.get('likeCount') or row.get('count') or 0))
            elif isinstance(row, (list, tuple)) and len(row) >= 2:
                pairs.append((row[0], row[1]))
    agg = {}
    for cid, cnt in pairs:
        cid = str(cid)
        try:
            cnt = int(cnt)
        except Exception:
            cnt = 0
        for did in ordered:
            if cid.startswith(did + '-'):
                agg[did] = agg.get(did, 0) + cnt
                break
    ranked = sorted(agg.items(), key=lambda kv: -kv[1])
    total = sum(agg.values())
    return {'ranked': [(id2title.get(d, d), c) for d, c in ranked], 'total': total}, None

# ---------------- 投稿活動(直近7日) ----------------
def posting_activity():
    now = datetime.now(JST)
    week_ago = now - timedelta(days=7)
    def within(iso):
        try:
            dt = datetime.fromisoformat(iso.replace('Z', '+00:00'))
            return dt.astimezone(JST) >= week_ago
        except Exception:
            return False
    hist = load('social-history.json', [])
    x_week = [h for h in hist if within(h.get('postedAt', ''))]
    ann = load('shorts-announced.json', [])
    ann_week = [a for a in ann if within(a.get('postedAt', ''))]
    uploaded = load('shorts-uploaded.json', [])
    return {
        'x_posts_week': len(x_week),
        'x_total': len(hist),
        'shorts_announced_week': len(ann_week),
        'shorts_total': len(uploaded),
    }

# ---------------- コンテンツ状況 ----------------
def content_status():
    shorts = load('shorts-data.json', [])
    diag_ids = set(e['diagnosisId'] for e in shorts)
    return {'public_diagnoses': len(diag_ids), 'characters': len(shorts)}

# ---------------- レポート組み立て ----------------
def build():
    today = datetime.now(JST).strftime('%Y-%m-%d')
    yt, yt_err = youtube_stats()
    try:
        pop, pop_err = diagnosis_popularity()
    except Exception as e:
        pop, pop_err = None, f'集計エラー: {e}'
    act = posting_activity()
    cont = content_status()

    lines = [f'# 診断村 週次レポート({today})', '']

    lines.append('## 📊 サマリー')
    if yt:
        lines.append(f'- YouTube Shorts 総再生数: **{yt["total_views"]:,}回**({len(yt["videos"])}本)')
    lines.append(f'- 公開診断数: **{cont["public_diagnoses"]}本** / キャラ {cont["characters"]}体')
    lines.append(f'- 今週のX投稿: {act["x_posts_week"]}件 / Shorts告知: {act["shorts_announced_week"]}件')
    lines.append('')

    lines.append('## 🎬 YouTube Shorts')
    if yt:
        lines.append(f'総再生 {yt["total_views"]:,}回 / アップ {len(yt["videos"])}本\n')
        lines.append('**再生数トップ5**')
        lines.append('')
        lines.append('| 順位 | 動画 | 再生 | 高評価 |')
        lines.append('|---|---|---|---|')
        for i, v in enumerate(yt['videos'][:5], 1):
            title = v['title'].split('｜')[0].split('#')[0].strip()[:24]
            lines.append(f'| {i} | {title} | {v["views"]:,} | {v["likes"]} |')
    else:
        lines.append(f'⚠️ 取得できませんでした（{yt_err}）')
    lines.append('')

    lines.append('## 🏆 人気診断ランキング(いいね合計)')
    if pop and pop['ranked']:
        lines.append('')
        lines.append('| 順位 | 診断 | いいね |')
        lines.append('|---|---|---|')
        for i, (title, cnt) in enumerate(pop['ranked'][:8], 1):
            lines.append(f'| {i} | {title} | {cnt} |')
        lines.append(f'\n合計いいね: {pop["total"]}')
    else:
        lines.append(f'⚠️ {pop_err if pop_err else "まだいいねデータがありません"}')
    lines.append('')

    lines.append('## 📣 投稿活動(直近7日)')
    lines.append(f'- X自動投稿: {act["x_posts_week"]}件(累計 {act["x_total"]}件)')
    lines.append(f'- Shorts告知: {act["shorts_announced_week"]}件(累計アップ {act["shorts_total"]}本)')
    lines.append('')
    lines.append('※ Xのインプレッション・フォロワー数はX Analyticsで手動確認してください(API読取は課金のため非対応)')
    lines.append('')

    lines.append('## 💡 今週の着眼点')
    tips = []
    if yt and yt['videos']:
        top = yt['videos'][0]
        tips.append(f'再生トップは「{top["title"].split("｜")[0][:20]}」({top["views"]:,}回)。このキャラ系統を優先的にShorts化すると伸びやすい。')
    if pop and pop['ranked']:
        tips.append(f'一番いいねが多い診断は「{pop["ranked"][0][0]}」。noteやコラムの記事化はここから始めると読まれやすい。')
    if not tips:
        tips.append('データが溜まってきたら、ここに自動で着眼点が出ます。')
    for t in tips:
        lines.append(f'- {t}')

    md = '\n'.join(lines)
    os.makedirs(OUTDIR, exist_ok=True)
    md_path = os.path.join(OUTDIR, f'report_{today}.md')
    open(md_path, 'w', encoding='utf-8').write(md)

    # HTML版(見やすい)
    html = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>診断村 週次レポート {today}</title>
<style>
body{{font-family:system-ui,-apple-system,'Hiragino Sans',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#faf6ff;color:#2c1a44;line-height:1.7}}
h1{{font-size:22px;border-bottom:3px solid #ff8fd0;padding-bottom:8px}}
h2{{font-size:17px;color:#61487f;margin-top:28px;border-left:5px solid #c9a6ef;padding-left:10px}}
table{{width:100%;border-collapse:collapse;margin:10px 0;font-size:14px}}
th,td{{border:1px solid #e5d6f5;padding:7px 10px;text-align:left}}
th{{background:#f6ecff;color:#61487f}}
strong{{color:#c2358f}}
li{{margin:4px 0}}
</style></head><body>
{md_to_html(md)}
</body></html>'''
    html_path = os.path.join(OUTDIR, f'report_{today}.html')
    open(html_path, 'w', encoding='utf-8').write(html)

    print(md)
    print(f'\n保存: {md_path}\n保存: {html_path}')
    return html_path

def md_to_html(md):
    out = []
    in_table = False
    for line in md.split('\n'):
        s = line.rstrip()
        if s.startswith('| '):
            cells = [c.strip() for c in s.strip('|').split('|')]
            if set(''.join(cells)) <= set('-: '):
                continue
            if not in_table:
                out.append('<table>'); in_table = True
                out.append('<tr>' + ''.join(f'<th>{c}</th>' for c in cells) + '</tr>')
            else:
                out.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
            continue
        if in_table:
            out.append('</table>'); in_table = False
        s = s.replace('**', '§')
        while '§' in s:
            s = s.replace('§', '<strong>', 1).replace('§', '</strong>', 1)
        if s.startswith('# '):
            out.append(f'<h1>{s[2:]}</h1>')
        elif s.startswith('## '):
            out.append(f'<h2>{s[3:]}</h2>')
        elif s.startswith('- '):
            out.append(f'<li>{s[2:]}</li>')
        elif s.strip():
            out.append(f'<p>{s}</p>')
    if in_table:
        out.append('</table>')
    return '\n'.join(out)

if __name__ == '__main__':
    build()

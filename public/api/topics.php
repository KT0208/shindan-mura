<?php
// 診断村: 更新情報(トピックス)API。
// note の公開RSSを取得して、サイトの「更新情報」欄に出すためのJSONを返す。
// ブラウザから直接 note のRSSは読めない(CORS)ため、サーバー側で取得して中継する。
// DB不要・独立スクリプト。取得結果は一時ファイルに30分キャッシュして note への負荷を抑える。
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=1800');

$feedUrl  = 'https://note.com/shindanmura/rss';
$maxItems = 6;
$cacheTtl = 1800; // 30分
$cacheFile = sys_get_temp_dir() . '/shindanmura_topics_cache.json';

// キャッシュが新しければそのまま返す。
if (is_readable($cacheFile) && (time() - (int) filemtime($cacheFile)) < $cacheTtl) {
    echo file_get_contents($cacheFile);
    exit;
}

// note のRSSを取得(curl優先、無ければ file_get_contents)。
function fetch_feed(string $url): ?string {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_USERAGENT      => 'ShindanMuraTopicsBot/1.0 (+https://shindanmura.com)',
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body !== false && $code >= 200 && $code < 300) {
            return (string) $body;
        }
        return null;
    }
    $ctx = stream_context_create(['http' => ['timeout' => 8, 'user_agent' => 'ShindanMuraTopicsBot/1.0']]);
    $body = @file_get_contents($url, false, $ctx);
    return $body === false ? null : $body;
}

$items = [];
$raw = fetch_feed($feedUrl);
if ($raw !== null) {
    $prev = libxml_use_internal_errors(true);
    $xml = simplexml_load_string($raw);
    libxml_use_internal_errors($prev);

    if ($xml !== false && isset($xml->channel->item)) {
        foreach ($xml->channel->item as $item) {
            $title = trim((string) $item->title);
            $link  = trim((string) $item->link);
            $ts    = strtotime((string) $item->pubDate) ?: time();
            if ($title === '' || $link === '') {
                continue;
            }
            $items[] = [
                'source' => 'note',
                'title'  => $title,
                'url'    => $link,
                'date'   => date('Y-m-d', $ts),
            ];
            if (count($items) >= $maxItems) {
                break;
            }
        }
    }
}

$payload = json_encode(['items' => $items], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (count($items) > 0) {
    // 取得成功 → キャッシュ更新して返す。
    @file_put_contents($cacheFile, $payload);
    echo $payload;
} elseif (is_readable($cacheFile)) {
    // 取得失敗でも古いキャッシュがあればそれを返す(欄が空になるのを防ぐ)。
    echo file_get_contents($cacheFile);
} else {
    // 何も無ければ空配列。フロント側は「SNSリンクのみ」を表示する。
    echo $payload;
}

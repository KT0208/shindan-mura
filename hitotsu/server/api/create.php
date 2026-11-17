<?php
// POST {recipientName, senderName, relation, tone, occasion, memories[{text, photo}], message}
// -> AIでゲームを作って保存し {id, key, game, status} を返す。作成とプレビューは無料。
declare(strict_types=1);
require __DIR__ . '/lib.php';

[$input, $photos] = gift_parse_input(gift_require_post());
$config = gift_config();
$ip = gift_client_ip();

$stmt = gift_db()->prepare('SELECT COUNT(*) FROM gifts WHERE creator_ip = ? AND created_at > (NOW() - INTERVAL 1 HOUR)');
$stmt->execute([$ip]);
if ((int) $stmt->fetchColumn() >= (int) ($config['create_limit_per_hour'] ?? 6)) {
    gift_fail(429, 'too_many_requests');
}

$game = gift_generate_with_claude($input);
$source = 'ai';
if ($game === null) {
    $game = gift_generate_template($input);
    $source = 'template';
}

$id = gift_random(6);
$key = gift_random(16);
// 写真は同じ番号の章で開く。保存できなかった写真は「写真なし」として続ける
foreach ($game['stages'] as $i => $stage) {
    $game['stages'][$i]['photo'] = gift_save_photo($photos[$i] ?? '', $id);
}
gift_db()->prepare('INSERT INTO gifts (id, edit_key, status, input_json, game_json, source, creator_ip) VALUES (?, ?, ?, ?, ?, ?, ?)')
    ->execute([$id, $key, 'draft', json_encode($input, JSON_UNESCAPED_UNICODE), json_encode($game, JSON_UNESCAPED_UNICODE), $source, $ip]);

gift_ok(['id' => $id, 'key' => $key, 'status' => 'draft', 'source' => $source, 'game' => $game, 'price' => (int) $config['price_jpy']]);

<?php
// GET ?id=...            -> 受け取った人用。支払い済みのギフトだけ返す。
// GET ?id=...&key=...    -> 作った人用。下書きでも返し、支払いが済んでいれば paid に更新する。
declare(strict_types=1);
require __DIR__ . '/lib.php';

$gift = gift_find((string) ($_GET['id'] ?? ''));
if ($gift === null) {
    gift_fail(404, 'not_found');
}
$owner = gift_owns($gift, (string) ($_GET['key'] ?? ''));

if ($owner) {
    gift_sync_payment($gift);
} elseif ($gift['status'] !== 'paid') {
    gift_fail(404, 'not_found');
} else {
    gift_db()->prepare('UPDATE gifts SET opened_count = opened_count + 1 WHERE id = ?')->execute([$gift['id']]);
}

$input = json_decode($gift['input_json'], true);
gift_ok([
    'id' => $gift['id'],
    'status' => $gift['status'],
    'owner' => $owner,
    'recipientName' => $input['recipientName'] ?? '',
    'senderName' => $input['senderName'] ?? '',
    'game' => json_decode($gift['game_json'], true),
    'price' => (int) gift_config()['price_jpy'],
]);

<?php
// POST {id, key, delivery?} -> Stripe の支払いページURLを返す。
// delivery = {mode: 'email', email, at} なら、支払い後に指定の日時でメールを送る(予約送信)。
// Stripe の鍵が未設定なら(動作確認用)支払いなしで送れる状態にする。
declare(strict_types=1);
require __DIR__ . '/lib.php';

$body = gift_require_post();
$gift = gift_find((string) ($body['id'] ?? ''));
if ($gift === null || !gift_owns($gift, (string) ($body['key'] ?? ''))) {
    gift_fail(404, 'not_found');
}
if (gift_sync_payment($gift)) {
    gift_ok(['status' => 'paid']);
}

// 届け方を保存する(支払い前なら何度でも選び直せる)
$delivery = gift_parse_delivery($body['delivery'] ?? null);
gift_db()->prepare('UPDATE gifts SET deliver_email = ?, deliver_at = ? WHERE id = ?')
    ->execute([$delivery['email'] ?? null, $delivery['at'] ?? null, $gift['id']]);

$config = gift_config();
if ((string) ($config['stripe_secret_key'] ?? '') === '') {
    gift_mark_paid($gift);
    gift_ok(['status' => 'paid', 'free' => true, 'deliverAt' => $delivery['at'] ?? null, 'deliverEmail' => $delivery ? gift_mask_email($delivery['email']) : null]);
}

// 前に作った支払いページがまだ使えるならそれを返す(二重の支払いページで入金を見失わないように)
if (!empty($gift['stripe_session_id'])) {
    $existing = gift_stripe('GET', 'checkout/sessions/' . rawurlencode($gift['stripe_session_id']));
    if (($existing['status'] ?? '') === 'open' && !empty($existing['url'])) {
        gift_ok(['status' => 'draft', 'url' => $existing['url']]);
    }
}

$input = json_decode($gift['input_json'], true);
$back = rtrim($config['site_url'], '/') . '/?id=' . $gift['id'] . '&key=' . $gift['edit_key'];
$session = gift_stripe('POST', 'checkout/sessions', [
    'mode' => 'payment',
    'line_items' => [[
        'quantity' => 1,
        'price_data' => [
            'currency' => 'jpy',
            'unit_amount' => gift_price($input['plan'] ?? 'standard'),
            'product_data' => ['name' => ($config['site_name'] ?? 'ひとつ') . ' 贈り物ゲーム(' . ($input['recipientName'] ?? '') . 'さんへ)'],
        ],
    ]],
    'metadata' => ['gift_id' => $gift['id']],
    'success_url' => $back . '&paid=1',
    'cancel_url' => $back,
    'locale' => 'ja',
]);
if ($session === null || empty($session['url'])) {
    gift_fail(502, 'payment_unavailable');
}
gift_db()->prepare('UPDATE gifts SET stripe_session_id = ? WHERE id = ?')->execute([$session['id'], $gift['id']]);
gift_ok(['status' => 'draft', 'url' => $session['url']]);

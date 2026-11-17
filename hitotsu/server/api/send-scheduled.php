<?php
// 予約送信: 指定の日時を過ぎた贈り物のメールを送る。サーバーの cron から数分おきに動かす。
//   例) */5 * * * * /usr/bin/php8.3 /home/ユーザー名/ドメイン/public_html/api/send-scheduled.php
// cron が使えない場合は、外部の定期アクセスサービスから ?token=(config の cron_token) 付きで呼ぶ。
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (PHP_SAPI !== 'cli') {
    $token = (string) (gift_config()['cron_token'] ?? '');
    if ($token === '' || !hash_equals($token, (string) ($_GET['token'] ?? ''))) {
        gift_fail(403, 'forbidden');
    }
}

$stmt = gift_db()->prepare(
    'SELECT * FROM gifts WHERE deliver_at IS NOT NULL AND delivered_at IS NULL AND deliver_at <= ? AND deliver_attempts < 5 ORDER BY deliver_at LIMIT 20'
);
$stmt->execute([date('Y-m-d H:i:s')]);

$sent = 0;
$failed = 0;
foreach ($stmt->fetchAll() as $gift) {
    // 支払ったあと自分のページに戻らなかった人の分も、ここで支払いを確認する。未払いは送らない
    if (!gift_sync_payment($gift)) {
        continue;
    }
    if (gift_send_delivery_mail($gift)) {
        gift_db()->prepare('UPDATE gifts SET delivered_at = ? WHERE id = ?')->execute([date('Y-m-d H:i:s'), $gift['id']]);
        $sent++;
    } else {
        gift_db()->prepare('UPDATE gifts SET deliver_attempts = deliver_attempts + 1 WHERE id = ?')->execute([$gift['id']]);
        $failed++;
    }
}
gift_ok(['sent' => $sent, 'failed' => $failed]);

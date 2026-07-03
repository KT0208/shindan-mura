<?php
// 診断村: キャラクター「いいね」の全員分集計API。
// GET  -> 全キャラクターのいいね数をまとめて返す
// POST -> 指定キャラクターのいいね数を +1 / -1 して、更新後の値を返す
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$allowedHost = 'shindanmura.com';
$method = $_SERVER['REQUEST_METHOD'];

// 同一サイトからのリクエストかどうかの簡易チェック。
// (厳密な不正防止にはならないが、雑な外部からの直叩きをある程度防ぐ)
if ($method === 'POST') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $sourceHeader = $origin !== '' ? $origin : $referer;

    if ($sourceHeader !== '' && strpos($sourceHeader, $allowedHost) === false) {
        http_response_code(403);
        echo json_encode(['error' => 'forbidden']);
        exit;
    }
}

$config = require __DIR__ . '/config.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}",
        $config['user'],
        $config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'db_connection_failed']);
    exit;
}

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT character_id, like_count FROM character_likes');
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    echo json_encode($rows, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $characterId = is_array($body) && isset($body['characterId']) ? (string) $body['characterId'] : '';
    $action = is_array($body) && isset($body['action']) ? (string) $body['action'] : '';

    if ($characterId === '' || mb_strlen($characterId) > 200 || !in_array($action, ['like', 'unlike'], true)) {
        http_response_code(400);
        echo json_encode(['error' => 'invalid_request']);
        exit;
    }

    $delta = $action === 'like' ? 1 : -1;

    try {
        $pdo->beginTransaction();

        $insert = $pdo->prepare(
            'INSERT INTO character_likes (character_id, like_count) VALUES (:id, GREATEST(0, :delta))
             ON DUPLICATE KEY UPDATE like_count = GREATEST(0, like_count + :delta2)'
        );
        $insert->execute([
            ':id' => $characterId,
            ':delta' => $delta,
            ':delta2' => $delta,
        ]);

        $select = $pdo->prepare('SELECT like_count FROM character_likes WHERE character_id = :id');
        $select->execute([':id' => $characterId]);
        $likeCount = (int) $select->fetchColumn();

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'update_failed']);
        exit;
    }

    echo json_encode(['characterId' => $characterId, 'likeCount' => $likeCount], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'method_not_allowed']);

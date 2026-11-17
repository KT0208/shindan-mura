<?php
// 贈り物サイト「ひとつ」の共通処理。各APIファイルから require する。
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const GIFT_RELATIONS = ['partner' => '恋人・パートナー', 'friend' => '友だち', 'family' => '家族', 'coworker' => '職場の人', 'new' => '最近知り合った人'];
const GIFT_TONES = ['sweet' => '甘くてやさしい', 'funny' => 'わいわい楽しい', 'thanks' => 'まじめに感謝', 'casual' => 'ゆるくて気楽'];
const GIFT_OCCASIONS = ['birthday' => '誕生日', 'anniversary' => '記念日', 'thanks' => 'ありがとう', 'farewell' => 'おわかれ・門出', 'valentine' => 'バレンタイン・ホワイトデー', 'none' => '特になし'];

function gift_config(): array
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/config.php';
        if (!is_file($path)) {
            gift_fail(500, 'not_configured');
        }
        $config = require $path;
    }
    return $config;
}

function gift_fail(int $status, string $error): void
{
    http_response_code($status);
    echo json_encode(['error' => $error]);
    exit;
}

function gift_ok(array $data): void
{
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function gift_db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $db = gift_config()['db'];
        try {
            $pdo = new PDO(
                "mysql:host={$db['host']};dbname={$db['dbname']};charset={$db['charset']}",
                $db['user'],
                $db['password'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
            );
        } catch (PDOException $e) {
            gift_fail(500, 'db_connection_failed');
        }
    }
    return $pdo;
}

// 同じサイトからの POST だけ受け付ける(雑な外部からの直叩き対策)
function gift_require_post(): array
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        gift_fail(405, 'method_not_allowed');
    }
    $host = parse_url(gift_config()['site_url'], PHP_URL_HOST);
    $source = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
    if ($source !== '' && $host && parse_url($source, PHP_URL_HOST) !== $host) {
        gift_fail(403, 'forbidden');
    }
    $body = json_decode((string) file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function gift_client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 64);
}

function gift_random(int $bytes): string
{
    return bin2hex(random_bytes($bytes));
}

function gift_clean(mixed $value, int $max): string
{
    $s = trim(preg_replace('/\s+/u', ' ', (string) $value) ?? '');
    return mb_substr($s, 0, $max);
}

// 作成フォームの入力を検証して整える。問題があれば 400 を返して終わる。
function gift_parse_input(array $body): array
{
    $input = [
        'recipientName' => gift_clean($body['recipientName'] ?? '', 20),
        'senderName' => gift_clean($body['senderName'] ?? '', 20),
        'relation' => (string) ($body['relation'] ?? ''),
        'tone' => (string) ($body['tone'] ?? ''),
        'occasion' => (string) ($body['occasion'] ?? 'none'),
        'memories' => [],
        'message' => mb_substr(trim((string) ($body['message'] ?? '')), 0, 400),
    ];
    foreach (array_slice((array) ($body['memories'] ?? []), 0, 5) as $m) {
        $m = gift_clean($m, 120);
        if ($m !== '') {
            $input['memories'][] = $m;
        }
    }
    if ($input['recipientName'] === '' || !isset(GIFT_RELATIONS[$input['relation']]) || !isset(GIFT_TONES[$input['tone']])
        || !isset(GIFT_OCCASIONS[$input['occasion']]) || count($input['memories']) < 2) {
        gift_fail(400, 'invalid_input');
    }
    return $input;
}

// ゲームJSONの形。Claude の structured outputs にもそのまま渡す。
function gift_game_schema(): array
{
    $str = ['type' => 'string'];
    return [
        'type' => 'object',
        'additionalProperties' => false,
        'required' => ['title', 'intro', 'stages', 'ending', 'message', 'badge'],
        'properties' => [
            'title' => $str,
            'intro' => ['type' => 'array', 'items' => $str],
            'stages' => [
                'type' => 'array',
                'items' => [
                    'type' => 'object',
                    'additionalProperties' => false,
                    'required' => ['question', 'choices', 'answer', 'correct', 'wrong'],
                    'properties' => [
                        'question' => $str,
                        'choices' => ['type' => 'array', 'items' => $str],
                        'answer' => ['type' => 'integer'],
                        'correct' => $str,
                        'wrong' => $str,
                    ],
                ],
            ],
            'ending' => ['type' => 'array', 'items' => $str],
            'message' => $str,
            'badge' => [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['name', 'description'],
                'properties' => ['name' => $str, 'description' => $str],
            ],
        ],
    ];
}

// AIが返したゲームを表示できる形に整える。壊れていれば null。
function gift_normalize_game(mixed $game, array $input): ?array
{
    if (!is_array($game) || !is_array($game['stages'] ?? null)) {
        return null;
    }
    $lines = fn ($v) => array_values(array_filter(array_map(fn ($s) => mb_substr(trim((string) $s), 0, 160), array_slice((array) $v, 0, 4)), fn ($s) => $s !== ''));
    $stages = [];
    foreach (array_slice($game['stages'], 0, 6) as $s) {
        $choices = array_values(array_filter(array_map(fn ($c) => mb_substr(trim((string) $c), 0, 60), array_slice((array) ($s['choices'] ?? []), 0, 4)), fn ($c) => $c !== ''));
        $answer = (int) ($s['answer'] ?? -1);
        if (count($choices) < 2 || $answer < 0 || $answer >= count($choices) || trim((string) ($s['question'] ?? '')) === '') {
            continue;
        }
        $stages[] = [
            'question' => mb_substr(trim((string) $s['question']), 0, 120),
            'choices' => $choices,
            'answer' => $answer,
            'correct' => mb_substr(trim((string) ($s['correct'] ?? '')), 0, 160),
            'wrong' => mb_substr(trim((string) ($s['wrong'] ?? '')), 0, 160),
        ];
    }
    if (count($stages) < 2) {
        return null;
    }
    return [
        'title' => mb_substr(trim((string) ($game['title'] ?? '')), 0, 40) ?: "{$input['recipientName']}さんへの贈り物",
        'intro' => $lines($game['intro'] ?? []),
        'stages' => $stages,
        'ending' => $lines($game['ending'] ?? []),
        // 作った人が書いたメッセージがあれば必ずそれを使う
        'message' => $input['message'] !== '' ? $input['message'] : mb_substr(trim((string) ($game['message'] ?? '')), 0, 400),
        'badge' => [
            'name' => mb_substr(trim((string) ($game['badge']['name'] ?? '')), 0, 30) ?: 'かけがえのない人',
            'description' => mb_substr(trim((string) ($game['badge']['description'] ?? '')), 0, 160),
        ],
    ];
}

// Claude でゲームを作る。失敗したら null(呼び出し側でテンプレートに切り替える)。
function gift_generate_with_claude(array $input): ?array
{
    $config = gift_config();
    $key = (string) ($config['anthropic_api_key'] ?? '');
    if ($key === '' || !function_exists('curl_init')) {
        return null;
    }

    $system = <<<TXT
あなたは、贈り物サービスの「案内人」です。贈り主から預かった思い出をもとに、たった一人の相手のためだけの短いクイズゲームを作ります。
ゲームは相手のスマホで遊ばれ、最後に贈り主からのメッセージが届きます。上品で落ち着いた、丁寧な言葉づかいにしてください。

ルール:
- 贈り主が書いた「思い出・相手のこと」だけを事実として使う。書かれていない出来事を事実のように作らない。
- 問題は4〜5問。各問の選択肢は3〜4個で、正解は思い出から作り、ほかの選択肢はありそうだけど違うものにする。正解の位置はばらばらにする。
- answer は正解の選択肢の番号(0始まり)。
- correct/wrong は案内人が相手に話しかける一言(各40字以内)。wrong でも責めず、正解をやさしく伝える。
- intro は2〜3行、ending は2〜3行。案内人の口調で、相手の名前を呼ぶ。絵文字は使わない。
- message は贈り主から相手への締めのメッセージ(120字以内、贈り主の一人称)。
- badge は相手に贈る称号(name は15字以内、description は60字以内)。からかいすぎず、もらってうれしいものにする。
- 指定された雰囲気と関係性に合わせる。恋人以外に恋愛っぽい言い回しは使わない。
TXT;

    $memories = implode("\n", array_map(fn ($m) => "- {$m}", $input['memories']));
    $user = "相手の名前: {$input['recipientName']}\n"
        . '贈り主の名前: ' . ($input['senderName'] !== '' ? $input['senderName'] : '(なし。「贈り主」と呼ぶ)') . "\n"
        . '関係: ' . GIFT_RELATIONS[$input['relation']] . "\n"
        . '雰囲気: ' . GIFT_TONES[$input['tone']] . "\n"
        . 'きっかけ: ' . GIFT_OCCASIONS[$input['occasion']] . "\n"
        . "思い出・相手のこと:\n{$memories}";

    $payload = [
        'model' => (string) ($config['anthropic_model'] ?? 'claude-opus-5-5'),
        'max_tokens' => 16000,
        'system' => $system,
        'messages' => [['role' => 'user', 'content' => $user]],
        'output_config' => [
            'effort' => 'low',
            'format' => ['type' => 'json_schema', 'schema' => gift_game_schema()],
        ],
        // 安全分類器が誤って断ったときに別モデルで作り直す
        'fallbacks' => 'default',
    ];

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 90,
        CURLOPT_HTTPHEADER => [
            'content-type: application/json',
            'x-api-key: ' . $key,
            'anthropic-version: 2026-10-21',
            'anthropic-beta: server-side-fallback-2026-07-01',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw === false || $status !== 200) {
        error_log("gift: claude api failed status={$status} body=" . substr((string) $raw, 0, 500));
        return null;
    }
    $response = json_decode((string) $raw, true);
    if (($response['stop_reason'] ?? '') !== 'end_turn') {
        error_log('gift: claude stop_reason=' . ($response['stop_reason'] ?? 'unknown'));
        return null;
    }
    $text = '';
    foreach ((array) ($response['content'] ?? []) as $block) {
        if (($block['type'] ?? '') === 'text') {
            $text .= $block['text'];
        }
    }
    return gift_normalize_game(json_decode($text, true), $input);
}

// AIが使えないときのテンプレート版。思い出1つにつき1問、正解は本物の思い出。
function gift_generate_template(array $input): array
{
    $name = $input['recipientName'];
    $decoys = [
        '月まで歩いて行ったことがある', '猫と会話ができる', '一晩で本を百冊読んだ', '雲の上で昼寝をしたことがある',
        'くじらに乗ったことがある', '虹の根元を見つけた', '星をひとつ持っている', '風船で空を飛んだことがある',
    ];
    shuffle($decoys);
    $stages = [];
    foreach ($input['memories'] as $i => $memory) {
        $choices = [$memory, $decoys[$i * 2 % 8], $decoys[($i * 2 + 1) % 8]];
        shuffle($choices);
        $stages[] = [
            'question' => "{$name}さんについて、本当なのはどれでしょう。",
            'choices' => $choices,
            'answer' => array_search($memory, $choices, true),
            'correct' => '正解です。よく覚えていらっしゃいますね。',
            'wrong' => "惜しい。答えは「{$memory}」でした。",
        ];
    }
    $from = $input['senderName'] !== '' ? "{$input['senderName']}さん" : 'ある方';
    return [
        'title' => "{$name}さんへの贈り物",
        'intro' => ["{$name}さん、こんにちは。", "{$from}から、あなたのためだけの贈り物をお預かりしています。", 'いくつかの問いに答えて、贈り物を開けてみてください。'],
        'stages' => $stages,
        'ending' => ['すべての問いが終わりました。', 'それでは、贈り物をお渡しします。'],
        'message' => $input['message'] !== '' ? $input['message'] : "{$name}さん、いつもありがとう。これからもよろしくね。",
        'badge' => ['name' => 'かけがえのない人', 'description' => "{$from}にとって、世界にひとりだけの大切な人。"],
    ];
}

function gift_find(string $id): ?array
{
    if (!preg_match('/^[a-f0-9]{12}$/', $id)) {
        return null;
    }
    $stmt = gift_db()->prepare('SELECT * FROM gifts WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function gift_owns(array $gift, string $key): bool
{
    return $key !== '' && hash_equals($gift['edit_key'], $key);
}

// Stripe API を叩く(SDKを入れずに curl で呼ぶ)
function gift_stripe(string $method, string $path, array $params = []): ?array
{
    $secret = (string) (gift_config()['stripe_secret_key'] ?? '');
    $url = 'https://api.stripe.com/v1/' . $path;
    $ch = curl_init($method === 'GET' && $params ? $url . '?' . http_build_query($params) : $url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERPWD => $secret . ':',
    ];
    if ($method === 'POST') {
        $opts[CURLOPT_POST] = true;
        $opts[CURLOPT_POSTFIELDS] = http_build_query($params);
    }
    curl_setopt_array($ch, $opts);
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($raw === false || $status >= 300) {
        error_log("gift: stripe {$path} failed status={$status} body=" . substr((string) $raw, 0, 500));
        return null;
    }
    return json_decode((string) $raw, true);
}

// 支払いが済んでいれば paid にする。済んだら true。
function gift_sync_payment(array &$gift): bool
{
    if ($gift['status'] === 'paid') {
        return true;
    }
    if (empty($gift['stripe_session_id'])) {
        return false;
    }
    $session = gift_stripe('GET', 'checkout/sessions/' . rawurlencode($gift['stripe_session_id']));
    if (($session['payment_status'] ?? '') !== 'paid' || ($session['metadata']['gift_id'] ?? '') !== $gift['id']) {
        return false;
    }
    gift_mark_paid($gift);
    return true;
}

function gift_mark_paid(array &$gift): void
{
    gift_db()->prepare("UPDATE gifts SET status = 'paid', paid_at = NOW() WHERE id = ? AND status <> 'paid'")->execute([$gift['id']]);
    $gift['status'] = 'paid';
}

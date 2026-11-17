<?php
// 贈り物サイト「ひとつ」の共通処理。各APIファイルから require する。
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const GIFT_RELATIONS = ['partner' => '恋人・パートナー', 'friend' => '友だち', 'family' => '家族', 'coworker' => '職場の人', 'new' => '最近知り合った人'];
const GIFT_TONES = ['sweet' => '甘くてやさしい', 'funny' => 'わいわい楽しい', 'thanks' => 'まじめに感謝', 'casual' => 'ゆるくて気楽'];
// プラン: chapters = 章の数(= 思い出の数の上限)、extra = スライドショーだけに出る写真の枚数
const GIFT_PLANS = ['standard' => ['chapters' => 3, 'extra' => 0], 'premium' => ['chapters' => 4, 'extra' => 6]];
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

// プランごとの価格(円)。設定ファイルに無ければ 500円 / 1000円
function gift_price(string $plan): int
{
    $config = gift_config();
    return $plan === 'premium' ? (int) ($config['price_premium_jpy'] ?? 1000) : (int) ($config['price_standard_jpy'] ?? 500);
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

// 作成フォームの入力を検証して整える。[入力, 章の写真(dataURL), スライドショー専用の写真(dataURL)] を返す。
// 問題があれば 400 で終わる。1つの思い出が1つの章になり、写真は同じ番号の章で開く。
function gift_parse_input(array $body): array
{
    $plan = isset(GIFT_PLANS[$body['plan'] ?? '']) ? (string) $body['plan'] : 'standard';
    $input = [
        'plan' => $plan,
        'recipientName' => gift_clean($body['recipientName'] ?? '', 20),
        'senderName' => gift_clean($body['senderName'] ?? '', 20),
        'relation' => (string) ($body['relation'] ?? ''),
        'tone' => (string) ($body['tone'] ?? ''),
        'occasion' => (string) ($body['occasion'] ?? 'none'),
        'memories' => [],
        'message' => mb_substr(trim((string) ($body['message'] ?? '')), 0, 400),
    ];
    $photos = [];
    foreach (array_slice((array) ($body['memories'] ?? []), 0, GIFT_PLANS[$plan]['chapters']) as $m) {
        $text = gift_clean(is_array($m) ? ($m['text'] ?? '') : $m, 120);
        if ($text === '') {
            continue;
        }
        $input['memories'][] = $text;
        $photos[] = is_array($m) ? (string) ($m['photo'] ?? '') : '';
    }
    if ($input['recipientName'] === '' || !isset(GIFT_RELATIONS[$input['relation']]) || !isset(GIFT_TONES[$input['tone']])
        || !isset(GIFT_OCCASIONS[$input['occasion']]) || count($input['memories']) < 2) {
        gift_fail(400, 'invalid_input');
    }
    $extras = array_map('strval', array_slice((array) ($body['extraPhotos'] ?? []), 0, GIFT_PLANS[$plan]['extra']));
    return [$input, $photos, $extras];
}

// 写真(ブラウザ側で縮小済みの JPEG dataURL)を uploads/ に保存してURLを返す。保存できなければ null。
// 写真は AI には送らない。
function gift_save_photo(string $dataUrl, string $giftId): ?string
{
    $prefix = 'data:image/jpeg;base64,';
    if (strncmp($dataUrl, $prefix, strlen($prefix)) !== 0) {
        return null;
    }
    $bin = base64_decode(substr($dataUrl, strlen($prefix)), true);
    if ($bin === false || strlen($bin) > 1500000) {
        return null;
    }
    $info = @getimagesizefromstring($bin);
    if (!$info || $info[2] !== IMAGETYPE_JPEG || $info[0] > 4000 || $info[1] > 4000) {
        return null;
    }
    $dir = dirname(__DIR__) . '/uploads';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
        // 万一おかしなファイルが置かれても、プログラムとして動かないようにする
        file_put_contents($dir . '/.htaccess', "<FilesMatch \"\\.(php|phtml|cgi)$\">\n  Require all denied\n</FilesMatch>\n");
    }
    // 推測できないファイル名にする(リンクを知らない人に写真を見られないように)
    $name = $giftId . '-' . gift_random(8) . '.jpg';
    $path = $dir . '/' . $name;
    if (function_exists('imagecreatefromstring') && ($img = @imagecreatefromstring($bin))) {
        // 描き直して保存する(画像に埋め込まれた位置情報などを落とす)
        $ok = imagejpeg($img, $path, 85);
        imagedestroy($img);
    } else {
        $ok = file_put_contents($path, $bin) !== false;
    }
    return $ok ? '/uploads/' . $name : null;
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
                    'required' => ['question', 'choices', 'caption'],
                    'properties' => [
                        'question' => $str,
                        'choices' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'additionalProperties' => false,
                                'required' => ['label', 'reply'],
                                'properties' => ['label' => $str, 'reply' => $str],
                            ],
                        ],
                        'caption' => $str,
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
    $cut = fn ($v, int $max) => mb_substr(trim((string) $v), 0, $max);
    $lines = fn ($v) => array_values(array_filter(array_map(fn ($s) => $cut($s, 160), array_slice((array) $v, 0, 4)), fn ($s) => $s !== ''));
    $stages = [];
    // 章の数は思い出の数に合わせる(写真は同じ番号の章で開くため)
    foreach (array_slice($game['stages'], 0, count($input['memories'])) as $s) {
        $choices = [];
        foreach (array_slice((array) ($s['choices'] ?? []), 0, 4) as $c) {
            $label = $cut($c['label'] ?? '', 40);
            $reply = $cut($c['reply'] ?? '', 200);
            if ($label !== '' && $reply !== '') {
                $choices[] = ['label' => $label, 'reply' => $reply];
            }
        }
        if (count($choices) < 2 || $cut($s['question'] ?? '', 1) === '') {
            return null;
        }
        $stages[] = ['question' => $cut($s['question'], 120), 'choices' => $choices, 'caption' => $cut($s['caption'] ?? '', 60)];
    }
    if (count($stages) < count($input['memories'])) {
        return null;
    }
    return [
        'title' => $cut($game['title'] ?? '', 40) ?: "{$input['recipientName']}さんへの贈り物",
        'intro' => $lines($game['intro'] ?? []),
        'stages' => $stages,
        'ending' => $lines($game['ending'] ?? []),
        // 作った人が書いたメッセージがあれば必ずそれを使う
        'message' => $input['message'] !== '' ? $input['message'] : $cut($game['message'] ?? '', 400),
        'badge' => [
            'name' => $cut($game['badge']['name'] ?? '', 30) ?: 'かけがえのない人',
            'description' => $cut($game['badge']['description'] ?? '', 160),
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
あなたは、贈り物サービスの「案内人」です。贈り主から預かった思い出をもとに、たった一人の相手のためだけの短い物語のようなゲームを作ります。
ゲームは相手のスマホで遊ばれます。思い出ひとつが一つの「章」になり、章を終えるたびに贈り主が選んだ写真が一枚ずつ開きます。すべての章を終えると、写真のスライドショーと贈り主のメッセージが届きます。

いちばん大切なこと: このゲームに不正解はありません。相手がどの選択肢を選んでも、贈り主の気持ちが伝わる、あたたかい言葉が返るようにしてください。相手を試したり、間違いを指摘したりしません。

ルール:
- 贈り主が書いた「思い出・相手のこと」だけを事実として使う。書かれていない出来事を事実のように作らない。
- stages は、渡された思い出と同じ数・同じ順番で作る(1番目の思い出が1章)。
- question は、その思い出について相手の気持ちや記憶をたずねる、やわらかい問いかけ(60字以内)。答えがひとつに決まるクイズにしない。
- choices は3個。label は相手が選ぶ短い答え(20字以内)で、どれも自然にありえる答えにする。
- reply は、その label を選んだ相手への言葉(80字以内)。選んだ答えを受けとめたうえで、その思い出にこめた贈り主の気持ちへつなげる。3つの reply はそれぞれ違う文章にし、どれを読んでも胸があたたかくなるようにする。大げさな美辞麗句や決まり文句は避け、その思い出ならではの具体的な言葉にする。
- caption は、その章で開く写真に添える短い一行(25字以内)。写真の中身は分からないので、思い出そのものを言葉にする。
- intro は2〜3行、ending は2〜3行。案内人の丁寧で落ち着いた口調で、相手の名前を呼ぶ。絵文字は使わない。
- message は贈り主から相手への締めのメッセージ(120字以内、贈り主の一人称)。
- badge は相手に贈る称号(name は15字以内、description は60字以内)。もらってうれしいものにする。
- 指定された雰囲気と関係性に合わせる。恋人以外に恋愛っぽい言い回しは使わない。
TXT;

    $memories = implode("\n", array_map(fn ($m, $i) => ($i + 1) . ". {$m}", $input['memories'], array_keys($input['memories'])));
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
            'effort' => 'medium',
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

// AIが使えないときのテンプレート版。思い出1つにつき1章。どれを選んでもあたたかい言葉が返る。
function gift_generate_template(array $input): array
{
    $name = $input['recipientName'];
    $from = $input['senderName'] !== '' ? "{$input['senderName']}さん" : 'ある方';
    $stages = [];
    foreach ($input['memories'] as $memory) {
        $stages[] = [
            'question' => "「{$memory}」——このこと、覚えていますか。",
            'choices' => [
                ['label' => 'はっきり覚えている', 'reply' => "覚えていてくれて、うれしいです。{$from}にとっても、ずっと大切にしている思い出です。"],
                ['label' => 'なんとなく覚えている', 'reply' => "おぼろげでも、心のどこかに残っていたのですね。{$from}は、今もあざやかに覚えています。"],
                ['label' => 'もう一度、思い出したい', 'reply' => "それなら、いま一緒に思い出しましょう。{$from}が、あなたに伝えたかった思い出です。"],
            ],
            'caption' => $memory,
        ];
    }
    return [
        'title' => "{$name}さんへの贈り物",
        'intro' => ["{$name}さん、こんにちは。", "{$from}から、あなたのためだけの贈り物をお預かりしています。", '思い出をひとつずつ、たどってみてください。'],
        'stages' => $stages,
        'ending' => ['すべての思い出をたどり終えました。', 'それでは、贈り物をお渡しします。'],
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

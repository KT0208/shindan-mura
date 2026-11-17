<?php
// 贈り物サイト「ひとつ」のサーバー設定。
// このファイルをコピーして同じフォルダに config.php を作り、実際の値を入れてください。
// config.php は .gitignore 済み(鍵を含むため絶対にコミットしない)。
return [
    // データベース(MySQL)
    'db' => [
        'host' => 'localhost',
        'dbname' => 'your-database-name',
        'user' => 'your-mysql-username',
        'password' => 'your-mysql-password',
        'charset' => 'utf8mb4',
    ],

    // サイト名(支払いページの商品名に出る)とURL(支払い後に戻ってくる先)。ドメインが決まったら書き換える
    'site_name' => 'ひとつ',
    'site_url' => 'https://hitotsu.gift',

    // Claude API キー(console.anthropic.com で発行)。空なら AI を使わずテンプレートでゲームを作る。
    'anthropic_api_key' => '',
    'anthropic_model' => 'claude-opus-5-5',

    // Stripe のシークレットキー。最初はテストモードの sk_test_... を入れる。
    // 空なら支払いをスキップして無料で送れる状態になる(動作確認用。本番では必ず入れる)。
    'stripe_secret_key' => '',

    // 価格(円)。スタンダード = 3章・写真3枚まで / プレミアム = 4章・写真10枚まで
    'price_standard_jpy' => 500,
    'price_premium_jpy' => 1000,

    // 1つのIPアドレスから1時間に作れるゲームの数(AI 代の使いすぎ防止)
    'create_limit_per_hour' => 6,
];

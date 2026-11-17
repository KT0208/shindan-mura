-- 贈り物サイト「ひとつ」: 贈り物ゲームのテーブル
-- phpMyAdmin の「SQL」タブに貼り付けて実行してください。
CREATE TABLE IF NOT EXISTS gifts (
  id VARCHAR(16) NOT NULL PRIMARY KEY,
  edit_key CHAR(32) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'draft',
  input_json MEDIUMTEXT NOT NULL,
  game_json MEDIUMTEXT NOT NULL,
  source VARCHAR(16) NOT NULL DEFAULT 'ai',
  stripe_session_id VARCHAR(255) NULL,
  creator_ip VARCHAR(64) NOT NULL DEFAULT '',
  opened_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  KEY idx_ip_created (creator_ip, created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

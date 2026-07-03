-- 診断村: キャラクター「いいね」の全員分集計テーブル
-- phpMyAdmin の「SQL」タブに貼り付けて実行してください。
CREATE TABLE IF NOT EXISTS character_likes (
  character_id VARCHAR(191) NOT NULL PRIMARY KEY,
  like_count INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

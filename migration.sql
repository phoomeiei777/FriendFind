USE study_match_db;

-- Create user_images table for multiple photos
CREATE TABLE IF NOT EXISTS user_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order TINYINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_images_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Add image_url to messages for chat photos
-- We check if the column exists first by attempting to add it and ignoring error or using a more robust way
-- But in a simple script, we can just try to add it.
ALTER TABLE messages ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER content;
ALTER TABLE messages MODIFY content TEXT DEFAULT NULL;

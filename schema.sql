-- FriendFind MySQL schema
-- Uses database name expected by backend: study_match_db

CREATE DATABASE IF NOT EXISTS study_match_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE study_match_db;

DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS study_groups;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS user_subjects;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  faculty VARCHAR(120),
  `year` TINYINT UNSIGNED,
  interests TEXT,
  profile_image_url VARCHAR(500),
  pronouns VARCHAR(50) DEFAULT NULL,
  gender VARCHAR(50) DEFAULT NULL,
  study_goal VARCHAR(255) DEFAULT NULL,
  looking_for VARCHAR(255) DEFAULT NULL,
  study_style VARCHAR(255) DEFAULT NULL,
  study_time VARCHAR(255) DEFAULT NULL,
  study_location VARCHAR(255) DEFAULT NULL,
  study_vibe VARCHAR(255) DEFAULT NULL,
  strength VARCHAR(255) DEFAULT NULL,
  weakness VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE subjects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subjects_code (subject_code)
) ENGINE=InnoDB;

CREATE TABLE user_subjects (
  user_id BIGINT UNSIGNED NOT NULL,
  subject_id BIGINT UNSIGNED NOT NULL,
  section VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, subject_id),
  KEY idx_user_subjects_subject (subject_id),
  CONSTRAINT fk_user_subjects_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_user_subjects_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE matches (
  swiper_id BIGINT UNSIGNED NOT NULL,
  target_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'liked', 'matched', 'rejected', 'blocked') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (swiper_id, target_id),
  KEY idx_matches_target (target_id),
  CONSTRAINT fk_matches_swiper
    FOREIGN KEY (swiper_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_matches_target
    FOREIGN KEY (target_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE study_groups (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  creator_id BIGINT UNSIGNED NOT NULL,
  subject_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  member_limit INT UNSIGNED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_study_groups_subject (subject_id),
  KEY idx_study_groups_creator (creator_id),
  CONSTRAINT fk_study_groups_creator
    FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_study_groups_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE group_members (
  group_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
  join_status ENUM('pending', 'approved', 'rejected', 'left') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id),
  KEY idx_group_members_user (user_id),
  CONSTRAINT fk_group_members_group
    FOREIGN KEY (group_id) REFERENCES study_groups(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_group_members_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order TINYINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_images_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(100) NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NOT NULL,
  reported_id BIGINT UNSIGNED NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

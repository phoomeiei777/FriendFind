-- FriendFind: เพิ่ม messages table และ dummy data เพิ่มเติม
-- รัน: docker exec -i friendfind-mysql mysql -u root -pfriendfind_root study_match_db < seed_extra.sql

USE study_match_db;

-- ============================================================
-- 1. Messages Table (สำหรับ real-time chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(200) NOT NULL COMMENT 'private:{uid1}_{uid2} or group:{group_id}',
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_messages_room (room_id),
  KEY idx_messages_sender (sender_id),
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 2. Dummy Users (เพิ่ม)
-- ============================================================
INSERT IGNORE INTO users (id, username, email, phone, password_hash, faculty, `year`, interests, profile_image_url) VALUES
(201, 'Olivia Park',   'olivia@example.com',  '0812345678', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engineering',  2, 'AI, Robotics',        'https://i.pravatar.cc/300?img=47'),
(202, 'Ethan Lee',     'ethan@example.com',   '0823456789', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Science',       3, 'Math, Chess',         'https://i.pravatar.cc/300?img=68'),
(203, 'Mia Tanaka',    'mia@example.com',     '0834567890', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arts',          1, 'Music, Drawing',      'https://i.pravatar.cc/300?img=44'),
(204, 'Noah Kim',      'noah@example.com',    '0845678901', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Business',      4, 'Finance, Travel',     'https://i.pravatar.cc/300?img=60'),
(205, 'Sophia Chen',   'sophia@example.com',  '0856789012', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Science',       2, 'Biology, Yoga',       'https://i.pravatar.cc/300?img=49'),
(206, 'Lucas Brown',   'lucas@example.com',   '0867890123', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engineering',   1, 'Electronics, Gaming', 'https://i.pravatar.cc/300?img=67'),
(207, 'Isabella Roy',  'isabella@example.com','0878901234', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arts',          3, 'Photography, Dance',  'https://i.pravatar.cc/300?img=56'),
(208, 'James Wilson',  'james@example.com',   '0889012345', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Business',      2, 'Marketing, Sports',   'https://i.pravatar.cc/300?img=70'),
(209, 'Ava Martinez',  'ava@example.com',     '0890123456', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Science',       4, 'Chemistry, Cooking',  'https://i.pravatar.cc/300?img=41'),
(210, 'Ryan Davis',    'ryan@example.com',    '0801234567', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engineering',   3, 'Coding, Running',     'https://i.pravatar.cc/300?img=65');

-- ============================================================
-- 3. Subjects เพิ่มเติม
-- ============================================================
INSERT IGNORE INTO subjects (id, subject_code, subject_name) VALUES
(4,  '1101201', 'Algorithms & Data'),
(5,  '1101301', 'Database Systems'),
(6,  '1101401', 'Software Engineering'),
(7,  '1102101', 'Physics I'),
(8,  '1102201', 'Linear Algebra'),
(9,  '1103101', 'English for Communication'),
(10, '1104101', 'Introduction to Economics');

-- ============================================================
-- 4. User-Subject links (ใหม่)
-- ============================================================
INSERT IGNORE INTO user_subjects (user_id, subject_id, section, is_active) VALUES
-- Subject 1 (Intro CS)
(201, 1, '01', 1), (202, 1, '01', 1), (203, 1, '02', 1),
-- Subject 2 (Data Structures)
(204, 2, '01', 1), (205, 2, '01', 1), (206, 2, '01', 1),
-- Subject 4 (Algorithms)
(201, 4, '01', 1), (202, 4, '01', 1), (210, 4, '01', 1),
-- Subject 5 (Database)
(103, 5, '01', 1), (201, 5, '01', 1), (210, 5, '01', 1),
-- Subject 6 (Software Eng)
(103, 6, '01', 1), (202, 6, '01', 1), (207, 6, '01', 1),
-- Subject 7 (Physics)
(205, 7, '01', 1), (209, 7, '01', 1),
-- Subject 8 (Linear Algebra)
(202, 8, '01', 1), (206, 8, '01', 1), (210, 8, '01', 1),
-- Subject 9 (English)
(203, 9, '01', 1), (204, 9, '01', 1), (207, 9, '01', 1), (208, 9, '01', 1),
-- Subject 10 (Economics)
(204, 10, '01', 1), (208, 10, '01', 1), (209, 10, '01', 1);

-- ============================================================
-- 5. Study Groups เพิ่มเติม
-- ============================================================
INSERT IGNORE INTO study_groups (id, creator_id, subject_id, title, description, member_limit) VALUES
(2, 201, 1, 'Intro CS Crew',       'เรียนและทำโปรเจกต์ CS ด้วยกัน',  6),
(3, 202, 4, 'Algorithm Busters',   'แก้โจทย์ Algorithm ทุกวันศุกร์',  4),
(4, 103, 5, 'DB Design Team',      'ออกแบบฐานข้อมูลร่วมกัน',          5),
(5, 205, 7, 'Physics Study Hub',   'เตรียมสอบ Physics',               4),
(6, 204, 9, 'English Speaking',    'ฝึกพูดภาษาอังกฤษทุกอังคาร',      8);

-- ============================================================
-- 6. Group Members
-- ============================================================
INSERT IGNORE INTO group_members (group_id, user_id, role, join_status) VALUES
-- Group 2
(2, 201, 'owner',  'approved'),
(2, 202, 'member', 'approved'),
(2, 203, 'member', 'approved'),
-- Group 3
(3, 202, 'owner',  'approved'),
(3, 201, 'member', 'approved'),
(3, 210, 'member', 'approved'),
-- Group 4
(4, 103, 'owner',  'approved'),
(4, 201, 'member', 'approved'),
-- Group 5
(5, 205, 'owner',  'approved'),
(5, 209, 'member', 'approved'),
-- Group 6
(6, 204, 'owner',  'approved'),
(6, 208, 'member', 'approved'),
(6, 207, 'member', 'approved');

-- ============================================================
-- 7. Sample matches
-- ============================================================
INSERT IGNORE INTO matches (swiper_id, target_id, status) VALUES
(201, 202, 'matched'),
(202, 201, 'matched'),
(201, 203, 'liked'),
(203, 201, 'matched'),
(202, 203, 'matched'),
(203, 202, 'matched'),
(204, 205, 'liked'),
(205, 204, 'liked');

-- fix status to matched where mutual
UPDATE matches SET status='matched' WHERE
  (swiper_id=201 AND target_id=203) OR (swiper_id=203 AND target_id=201) OR
  (swiper_id=204 AND target_id=205) OR (swiper_id=205 AND target_id=204);

-- ============================================================
-- 8. Sample messages
-- ============================================================
INSERT IGNORE INTO messages (room_id, sender_id, content) VALUES
('private:201_202', 201, 'สวัสดีครับ Ethan!'),
('private:201_202', 202, 'Hi! มาเรียน Intro CS ด้วยกันไหม?'),
('private:201_202', 201, 'ได้เลย! พรุ่งนี้ว่างไหม?'),
('private:201_202', 202, 'ว่างครับ นัดที่ห้องสมุดเลย'),
('group:2', 201, 'ทุกคน เริ่ม project กันได้เลยนะ'),
('group:2', 202, 'โอเค จะทำส่วน backend'),
('group:2', 203, 'ฉันทำ UI ให้นะ');

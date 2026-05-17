-- Insert dummy users
INSERT IGNORE INTO users (id, username, email, password_hash, faculty, `year`, interests, profile_image_url) VALUES
(101, 'Nico O''Reilly', 'nico@example.com', '$2b$10$Qf6EpWJW2zFP9UCmDcgBoey7cbDn8xxCt5McgCl75/sCmfx2zYCv6', 'Manchester, England', 1, 'Football', 'https://i.pravatar.cc/300?img=11'),
(102, 'Sarah Smith', 'sarah@example.com', '$2b$10$Qf6EpWJW2zFP9UCmDcgBoey7cbDn8xxCt5McgCl75/sCmfx2zYCv6', 'Engineering', 2, 'Coding, Music', 'https://i.pravatar.cc/300?img=5'),
(103, 'John Doe', 'john@example.com', '$2b$10$Qf6EpWJW2zFP9UCmDcgBoey7cbDn8xxCt5McgCl75/sCmfx2zYCv6', 'Science', 3, 'Reading, Gaming', 'https://i.pravatar.cc/300?img=33'),
(104, 'Emma Watson', 'emma@example.com', '$2b$10$Qf6EpWJW2zFP9UCmDcgBoey7cbDn8xxCt5McgCl75/sCmfx2zYCv6', 'Arts', 4, 'Acting, Reading', 'https://i.pravatar.cc/300?img=9'),
(105, 'Liam Johnson', 'liam@example.com', '$2b$10$Qf6EpWJW2zFP9UCmDcgBoey7cbDn8xxCt5McgCl75/sCmfx2zYCv6', 'Business', 1, 'Investing, Sports', 'https://i.pravatar.cc/300?img=12');

-- Make sure subjects exist
INSERT IGNORE INTO subjects (id, subject_code, subject_name) VALUES
(1, '1101280', 'Intro to Computer Science'),
(2, '1101281', 'Data Structures'),
(3, '1101101', 'Calculus I');

-- Link users to subjects
INSERT IGNORE INTO user_subjects (user_id, subject_id, section, is_active) VALUES
(101, 1, '01', 1),
(102, 1, '01', 1),
(103, 1, '02', 1),
(104, 2, '01', 1),
(105, 2, '01', 1),
(101, 2, '01', 1),
(102, 3, '01', 1);

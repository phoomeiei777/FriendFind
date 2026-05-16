const db = require("../config/db");

const createUser = async (userData) => {
  const { username, email, phone, passwordHash, faculty, year, interests, profileImageUrl, firebase_uid } = userData;

  const [result] = await db.execute(
    `INSERT INTO users
      (username, email, phone, password_hash, faculty, \`year\`, interests, profile_image_url, firebase_uid)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, email, phone || null, passwordHash, faculty || null, year || null, interests || null, profileImageUrl || null, firebase_uid || null]
  );

  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.execute(`
    SELECT id, username, email, phone, faculty, \`year\`, interests, profile_image_url, password_hash,
           pronouns, gender, study_goal, looking_for, study_style, study_time, study_location, study_vibe, strength, weakness
    FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
};

const findUserByUsernameOrEmail = async (username, email) => {
  const [rows] = await db.execute(
    "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
    [username, email]
  );
  return rows[0] || null;
};

const fetchUsersByActiveSubject = async (subjectCode, excludeId) => {
  let query = `SELECT
       u.id, u.username, u.email, u.faculty, u.\`year\`, u.interests, u.profile_image_url,
       u.pronouns, u.gender, u.study_goal, u.looking_for, u.study_style, u.study_time, u.study_location, u.study_vibe, u.strength, u.weakness,
       (SELECT GROUP_CONCAT(image_url ORDER BY display_order ASC SEPARATOR '|') FROM user_images WHERE user_id = u.id) as additional_images
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     JOIN subjects s ON s.id = e.subject_id
     WHERE e.status = 'approved'
       AND s.subject_code = ?`;
  const params = [subjectCode];

  if (excludeId) {
    query += ` AND u.id != ?`;
    params.push(excludeId);
  }

  query += ` ORDER BY u.username ASC`;

  const [rows] = await db.execute(query, params);
  return rows.map(row => ({
    ...row,
    images: row.additional_images 
      ? [row.profile_image_url, ...row.additional_images.split('|')] 
      : [row.profile_image_url].filter(Boolean)
  }));
};

const fetchAllUsers = async (excludeId) => {
  let query = `
    SELECT u.id, u.username, u.email, u.phone, u.faculty, u.\`year\`, u.interests, u.profile_image_url,
           u.pronouns, u.gender, u.study_goal, u.looking_for, u.study_style, u.study_time, u.study_location, u.study_vibe, u.strength, u.weakness,
           (SELECT GROUP_CONCAT(image_url ORDER BY display_order ASC SEPARATOR '|') FROM user_images WHERE user_id = u.id) as additional_images
    FROM users u
  `;
  const params = [];
  if (excludeId) {
    query += ` WHERE u.id != ?`;
    params.push(excludeId);
  }
  query += ` ORDER BY RAND() LIMIT 100`;

  const [rows] = await db.execute(query, params);
  return rows.map(row => ({
    ...row,
    images: row.additional_images 
      ? [row.profile_image_url, ...row.additional_images.split('|')] 
      : [row.profile_image_url].filter(Boolean)
  }));
};

const updateUser = async (userId, userData) => {
  let { profile_image_url } = userData;
  const { username, faculty, year, interests, images,
          pronouns, gender, study_goal, looking_for, study_style, study_time, study_location, study_vibe, strength, weakness } = userData;
  const fields = [];
  const params = [];

  if (username !== undefined) { fields.push("username = ?"); params.push(username); }
  if (faculty !== undefined)  { fields.push("faculty = ?");  params.push(faculty); }
  if (year !== undefined)     { fields.push("`year` = ?");   params.push(year); }
  if (interests !== undefined){ fields.push("interests = ?");params.push(interests); }
  
  if (pronouns !== undefined) { fields.push("pronouns = ?"); params.push(pronouns); }
  if (gender !== undefined)   { fields.push("gender = ?");   params.push(gender); }
  if (study_goal !== undefined) { fields.push("study_goal = ?"); params.push(study_goal); }
  if (looking_for !== undefined) { fields.push("looking_for = ?"); params.push(looking_for); }
  if (study_style !== undefined) { fields.push("study_style = ?"); params.push(study_style); }
  if (study_time !== undefined) { fields.push("study_time = ?"); params.push(study_time); }
  if (study_location !== undefined) { fields.push("study_location = ?"); params.push(study_location); }
  if (study_vibe !== undefined) { fields.push("study_vibe = ?"); params.push(study_vibe); }
  if (strength !== undefined) { fields.push("strength = ?"); params.push(strength); }
  if (weakness !== undefined) { fields.push("weakness = ?"); params.push(weakness); }
  
  // ถ้ามีการส่ง images มาเป็น array
  if (images && Array.isArray(images) && images.length > 0) {
    // รูปแรกคือ profile image
    profile_image_url = images[0];
    fields.push("profile_image_url = ?");
    params.push(profile_image_url);
    
    // รูปที่เหลือ (1-5) ลง user_images
    await updateUserImages(userId, images.slice(1));
  } else if (profile_image_url !== undefined) {
    fields.push("profile_image_url = ?");
    params.push(profile_image_url);
  }

  if (fields.length > 0) {
    params.push(userId);
    await db.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
  }

  const [rows] = await db.execute(
    `SELECT u.id, u.username, u.email, u.phone, u.faculty, u.\`year\`, u.interests, u.profile_image_url,
            u.pronouns, u.gender, u.study_goal, u.looking_for, u.study_style, u.study_time, u.study_location, u.study_vibe, u.strength, u.weakness,
            (SELECT GROUP_CONCAT(image_url ORDER BY display_order ASC SEPARATOR '|') FROM user_images WHERE user_id = u.id) as additional_images
     FROM users u WHERE u.id = ?`,
    [userId]
  );
  
  const user = rows[0];
  if (!user) return null;

  const additional = user.additional_images ? user.additional_images.split('|') : [];
  return {
    ...user,
    images: [user.profile_image_url, ...additional].filter(Boolean)
  };
};

const updateUserImages = async (userId, images) => {
  // ลบรูปเดิมออกก่อน (สำหรับความง่าย)
  await db.execute("DELETE FROM user_images WHERE user_id = ?", [userId]);
  
  // เพิ่มรูปใหม่
  for (let i = 0; i < images.length; i++) {
    if (images[i]) {
      await db.execute(
        "INSERT INTO user_images (user_id, image_url, display_order) VALUES (?, ?, ?)",
        [userId, images[i], i + 1]
      );
    }
  }
};

const updatePasswordByIdentity = async (identity, passwordHash) => {
  const [result] = await db.execute(
    "UPDATE users SET password_hash = ? WHERE email = ? OR phone = ?",
    [passwordHash, identity, identity]
  );
  return result.affectedRows > 0;
};

const deleteUser = async (userId) => {
  const [result] = await db.execute("DELETE FROM users WHERE id = ?", [userId]);
  return result.affectedRows > 0;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsernameOrEmail,
  fetchUsersByActiveSubject,
  fetchAllUsers,
  updateUser,
  updateUserImages,
  updatePasswordByIdentity,
  deleteUser,
};

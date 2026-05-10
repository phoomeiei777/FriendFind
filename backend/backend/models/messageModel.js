const db = require("../config/db");

/**
 * สร้าง room_id สำหรับ private chat (เรียงลำดับ ID เพื่อให้ทั้งคู่ได้ห้องเดียวกัน)
 */
function privateRoomId(uid1, uid2) {
  const [a, b] = [Number(uid1), Number(uid2)].sort((x, y) => x - y);
  return `private:${a}_${b}`;
}

/**
 * ส่งข้อความใหม่
 */
const sendMessage = async (roomId, senderId, content, imageUrl = null) => {
  const [result] = await db.execute(
    `INSERT INTO messages (room_id, sender_id, content, image_url) VALUES (?, ?, ?, ?)`,
    [roomId, senderId, content || null, imageUrl]
  );
  const [rows] = await db.execute(
    `SELECT m.id, m.room_id, m.sender_id, m.content, m.image_url, m.created_at,
            u.username, u.profile_image_url
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.id = ?`,
    [result.insertId]
  );
  return rows[0];
};

/**
 * ดึงข้อความในห้อง (เรียงจากเก่าไปใหม่)
 */
const getMessages = async (roomId, limit = 100) => {
  const [rows] = await db.execute(
    `SELECT m.id, m.room_id, m.sender_id, m.content, m.image_url, m.created_at,
            u.username, u.profile_image_url
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.room_id = ?
     ORDER BY m.created_at ASC
     LIMIT ${parseInt(limit, 10)}`,
    [roomId]
  );
  return rows;
};

module.exports = { sendMessage, getMessages, privateRoomId };

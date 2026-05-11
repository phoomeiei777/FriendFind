const db = require("../config/db");

/**
 * บันทึกการปัด (like หรือ reject)
 * - ถ้าปัด right (like): insert หรือ update status เป็น 'liked'
 * - ถ้าทั้งคู่ต่างปัด right กันแล้ว → status เปลี่ยนเป็น 'matched' ทั้งสองฝั่ง
 * returns: { matched: boolean }
 */
const recordSwipe = async (swiperId, targetId, direction) => {
  const status = direction === "right" ? "liked" : "rejected";

  // Upsert ฝั่งของ swiper
  await db.execute(
    `INSERT INTO matches (swiper_id, target_id, status)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
    [swiperId, targetId, status]
  );

  if (direction !== "right") {
    return { matched: false };
  }

  // ตรวจว่าอีกฝั่งเคย like กลับมาหรือยัง
  const [rows] = await db.execute(
    `SELECT status FROM matches WHERE swiper_id = ? AND target_id = ? LIMIT 1`,
    [targetId, swiperId]
  );

  if (rows[0] && (rows[0].status === "liked" || rows[0].status === "matched")) {
    // Match! อัปเดตทั้งสองแถวให้เป็น 'matched'
    await db.execute(
      `UPDATE matches SET status = 'matched', updated_at = CURRENT_TIMESTAMP
       WHERE (swiper_id = ? AND target_id = ?) OR (swiper_id = ? AND target_id = ?)`,
      [swiperId, targetId, targetId, swiperId]
    );
    return { matched: true };
  }

  return { matched: false };
};

/**
 * ดึงรายชื่อคนที่ match กันแล้ว (status = 'matched') ของ userId
 * returns: array of user objects
 */
const getMatches = async (userId) => {
  // ดึงทุก matched pair ที่ userId เป็น swiper ฝั่งใดฝั่งหนึ่ง
  const [rows] = await db.execute(
    `SELECT DISTINCT
       u.id,
       u.username,
       u.email,
       u.faculty,
       u.\`year\`,
       u.interests,
       u.profile_image_url,
       m.updated_at AS matched_at
     FROM matches m
     JOIN users u ON u.id = IF(m.swiper_id = ?, m.target_id, m.swiper_id)
     WHERE (m.swiper_id = ? OR m.target_id = ?)
       AND m.status = 'matched'
     ORDER BY m.updated_at DESC`,
    [userId, userId, userId]
  );
  return rows;
};

/**
 * ดึง IDs ของคนที่เคยถูกปัดแล้ว (เพื่อกรองออกจาก swipe feed)
 */
const getSwipedIds = async (userId) => {
  const [rows] = await db.execute(
    `SELECT target_id FROM matches WHERE swiper_id = ?`,
    [userId]
  );
  return rows.map((r) => r.target_id);
};
/**
 * ยกเลิกการ Match (ลบข้อมูลออกจากตารางเพื่อให้สามารถวนมาเจอกันได้อีก)
 */
const unmatchUser = async (userId, targetId) => {
  const [result] = await db.execute(
    `DELETE FROM matches 
     WHERE (swiper_id = ? AND target_id = ?) OR (swiper_id = ? AND target_id = ?)`,
    [userId, targetId, targetId, userId]
  );
  return result.affectedRows > 0;
};

module.exports = { recordSwipe, getMatches, getSwipedIds, unmatchUser };

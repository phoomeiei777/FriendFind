const db = require("../config/db");

const createNotification = async ({ userId, type, content, metadata }) => {
  const [result] = await db.execute(
    `INSERT INTO notifications (user_id, type, content, metadata, is_read, created_at)
     VALUES (?, ?, ?, ?, 0, NOW())`,
    [userId, type, content, metadata ? JSON.stringify(metadata) : null]
  );
  return result.insertId;
};

const getNotifications = async (userId) => {
  const [rows] = await db.execute(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [userId]
  );
  return rows.map(row => ({
    ...row,
    metadata: row.metadata || null
  }));
};

const markAsRead = async (notificationId, userId) => {
  await db.execute(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

const deleteNotification = async (notificationId, userId) => {
  await db.execute(
    `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
};

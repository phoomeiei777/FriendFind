const { getNotifications, markAsRead, deleteNotification } = require('../models/notificationModel');
const db = require('../config/db');

const listNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await getNotifications(userId);

    // Merge pending join requests as virtual notifications for group owners
    const [pendingRequests] = await db.execute(`
      SELECT
        gm.user_id  AS requesterId,
        u.username  AS requesterName,
        g.id        AS groupId,
        g.title     AS groupTitle,
        gm.created_at
      FROM group_members gm
      JOIN study_groups g ON g.id = gm.group_id
      JOIN users      u ON u.id = gm.user_id
      WHERE g.creator_id = ? AND gm.join_status = 'pending'
    `, [userId]);

    const pendingNotis = pendingRequests.map(p => ({
      id:         `pending-${p.groupId}-${p.requesterId}`,
      user_id:    userId,
      type:       'join_request',
      content:    `${p.requesterName} ขอเข้าร่วมกลุ่ม ${p.groupTitle}`,
      metadata:   { groupId: p.groupId, requesterId: p.requesterId },
      is_read:    0,
      created_at: p.created_at,
    }));

    const combined = [...pendingNotis, ...notifications]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ count: combined.length, notifications: combined });
  } catch (error) {
    return next(error);
  }
};

const readNotification = async (req, res, next) => {
  try {
    await markAsRead(req.params.id, req.user.id);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
};

const removeNotification = async (req, res, next) => {
  try {
    await deleteNotification(req.params.id, req.user.id);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listNotifications, readNotification, removeNotification };

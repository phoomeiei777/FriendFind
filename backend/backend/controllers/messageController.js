const { sendMessage, getMessages, privateRoomId } = require("../models/messageModel");

/**
 * POST /api/messages
 * body: { room_id, content }  OR  { target_user_id, content }  (private chat)
 */
const postMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { room_id, target_user_id, content, image_url } = req.body;

    if ((!content || !content.trim()) && !image_url) {
      return res.status(400).json({ message: "content or image_url is required." });
    }

    let roomId = room_id;
    if (!roomId && target_user_id) {
      roomId = privateRoomId(senderId, target_user_id);
    }
    if (!roomId) {
      return res.status(400).json({ message: "room_id or target_user_id is required." });
    }

    const msg = await sendMessage(roomId, senderId, content ? content.trim() : null, image_url);
    return res.status(201).json({ message: "Message sent.", data: msg });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/messages?room_id=xxx
 * GET /api/messages?target_user_id=xxx  (private chat)
 */
const fetchMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { room_id, target_user_id, limit } = req.query;

    let roomId = room_id;
    if (!roomId && target_user_id) {
      roomId = privateRoomId(userId, target_user_id);
    }
    if (!roomId) {
      return res.status(400).json({ message: "room_id or target_user_id is required." });
    }

    const msgs = await getMessages(roomId, parseInt(limit) || 100);
    return res.json({ room_id: roomId, count: msgs.length, messages: msgs });
  } catch (error) {
    return next(error);
  }
};

module.exports = { postMessage, fetchMessages };

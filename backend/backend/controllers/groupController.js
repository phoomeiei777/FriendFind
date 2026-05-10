const {
  createGroup,
  getGroups,
  requestJoinGroup,
  updateMemberStatus,
  getGroupMembers,
  getMyGroups,
  deleteGroup,
  leaveGroup,
} = require("../models/groupModel");
const { createNotification } = require("../models/notificationModel");
const db = require("../config/db");

const createStudyGroup = async (req, res, next) => {
  try {
    const { subject_id, title, description, member_limit } = req.body;
    if (!subject_id || !title) {
      return res.status(400).json({ message: "subject_id and title are required." });
    }
    const groupId = await createGroup({
      creatorId: req.user.id,
      subjectId: subject_id,
      title,
      description,
      memberLimit: member_limit,
    });
    return res.status(201).json({ message: "Study group created.", group_id: groupId });
  } catch (error) {
    return next(error);
  }
};

const listStudyGroups = async (req, res, next) => {
  try {
    const groups = await getGroups(req.query.subject_id);
    return res.json({ count: groups.length, groups });
  } catch (error) {
    return next(error);
  }
};

const joinStudyGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const created = await requestJoinGroup(groupId, userId);

    if (!created) {
      return res.status(409).json({ message: "Join request already exists." });
    }

    // 🔔 ส่ง Notification หาเจ้าของกลุ่ม
    const [groupRows] = await db.execute('SELECT creator_id, title FROM study_groups WHERE id = ?', [groupId]);
    if (groupRows.length > 0) {
      const ownerId = groupRows[0].creator_id;
      const groupTitle = groupRows[0].title;
      await createNotification({
        userId: ownerId,
        type: 'join_request',
        content: `มีคนขอเข้าร่วมกลุ่ม ${groupTitle}`,
        metadata: { groupId, requesterId: userId }
      });
    }

    return res.status(201).json({ message: "Join request submitted." });
  } catch (error) {
    return next(error);
  }
};

const updateGroupMemberStatus = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const { join_status } = req.body;
    const requesterId = req.user.id;

    // เช็คสิทธิ์ (ต้องเป็นเจ้าของ)
    const members = await getGroupMembers(groupId);
    const requester = members.find(m => String(m.id) === String(requesterId));
    if (!requester || requester.role !== 'owner') {
      return res.status(403).json({ message: "Only group owners can manage members." });
    }

    const updated = await updateMemberStatus(groupId, userId, join_status);
    if (!updated) {
      return res.status(404).json({ message: "Group member record not found." });
    }

    // 🔔 ส่ง Notification กลับหาคนขอ (หุ้มด้วย try-catch เพื่อไม่ให้กระทบการ approve)
    try {
      const [groupRows] = await db.execute('SELECT title FROM study_groups WHERE id = ?', [groupId]);
      const groupTitle = groupRows.length > 0 ? groupRows[0].title : 'กลุ่ม';
      await createNotification({
        userId: userId,
        type: 'request_update',
        content: join_status === 'approved' ? `คุณได้รับอนุมัติให้เข้ากลุ่ม ${groupTitle} แล้ว!` : `คำขอเข้ากลุ่ม ${groupTitle} ของคุณถูกปฏิเสธ`,
        metadata: { groupId, status: join_status }
      });
    } catch (notiError) {
      console.error('[NotificationError] Failed to send update notification:', notiError);
    }

    console.log(`[StatusUpdate] Success!`);
    return res.json({ message: "Member status updated successfully." });
  } catch (error) {
    console.error(`[StatusUpdate] Error:`, error);
    return next(error);
  }
};

const listGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { status } = req.query;
    const members = await getGroupMembers(groupId, status);
    return res.json({ count: members.length, members });
  } catch (error) {
    return next(error);
  }
};

const listMyGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const myGroups = await getMyGroups(userId, req.query.subject_id);
    return res.json({ count: myGroups.length, groups: myGroups });
  } catch (error) {
    return next(error);
  }
};

const handleDeleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const members = await getGroupMembers(groupId);
    const requester = members.find(m => String(m.id) === String(userId));
    if (!requester || requester.role !== 'owner') {
      return res.status(403).json({ message: "Only group owners can delete the group." });
    }
    await deleteGroup(groupId);
    return res.json({ message: "Group deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

const handleLeaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    await leaveGroup(groupId, userId);
    return res.json({ message: "Left group successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createStudyGroup,
  listStudyGroups,
  joinStudyGroup,
  updateGroupMemberStatus,
  listGroupMembers,
  listMyGroups,
  handleDeleteGroup,
  handleLeaveGroup,
};

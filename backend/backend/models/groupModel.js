const db = require("../config/db");

const createGroup = async ({ creatorId, subjectId, title, description, memberLimit }) => {
  const [result] = await db.execute(
    `INSERT INTO study_groups (creator_id, subject_id, title, description, member_limit)
     VALUES (?, ?, ?, ?, ?)`,
    [creatorId, subjectId, title, description || null, memberLimit || null]
  );

  await db.execute(
    `INSERT INTO group_members (group_id, user_id, role, join_status)
     VALUES (?, ?, 'owner', 'approved')`,
    [result.insertId, creatorId]
  );

  return result.insertId;
};

const getGroups = async (subjectId) => {
  let query = `
    SELECT
      g.id,
      g.creator_id,
      g.subject_id,
      s.subject_code,
      s.subject_name,
      g.title,
      g.description,
      g.member_limit
    FROM study_groups g
    JOIN subjects s ON s.id = g.subject_id`;
  const params = [];

  if (subjectId) {
    query += " WHERE g.subject_id = ?";
    params.push(subjectId);
  }

  query += " ORDER BY g.id DESC";
  const [groups] = await db.execute(query, params);

  // Enrich each group with approved member list (including profile images)
  for (const group of groups) {
    const [members] = await db.execute(
      `SELECT
         u.id,
         u.username,
         u.profile_image_url,
         gm.role
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = ? AND gm.join_status = 'approved'
       ORDER BY gm.role DESC, u.username ASC`,
      [group.id]
    );
    group.members = members;
    group.member_count = members.length;
  }

  return groups;
};

const requestJoinGroup = async (groupId, userId) => {
  const [rows] = await db.execute(
    `SELECT group_id, user_id
     FROM group_members
     WHERE group_id = ? AND user_id = ? LIMIT 1`,
    [groupId, userId]
  );

  if (rows[0]) return false;

  await db.execute(
    `INSERT INTO group_members (group_id, user_id, role, join_status)
     VALUES (?, ?, 'member', 'pending')`,
    [groupId, userId]
  );
  return true;
};

const updateMemberStatus = async (groupId, userId, joinStatus) => {
  const [result] = await db.execute(
    `UPDATE group_members
     SET join_status = ?
     WHERE group_id = ? AND user_id = ?`,
    [joinStatus, groupId, userId]
  );
  return result.affectedRows > 0;
};

const getGroupMembers = async (groupId, status = null) => {
  let query = `
    SELECT
      u.id,
      gm.group_id,
      gm.user_id,
      u.username,
      u.email,
      u.faculty,
      u.profile_image_url,
      gm.role,
      gm.join_status
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = ?`;
  const params = [groupId];

  if (status) {
    query += " AND gm.join_status = ?";
    params.push(status);
  }

  query += " ORDER BY gm.role DESC, u.username ASC";
  const [rows] = await db.execute(query, params);
  return rows;
};

/**
 * ดึงกลุ่มที่ user เป็นสมาชิก (approved) — สำหรับ private group view
 */
const getMyGroups = async (userId, subjectId) => {
  let query = `
    SELECT
      g.id,
      g.creator_id,
      g.subject_id,
      s.subject_code,
      s.subject_name,
      g.title,
      g.description,
      g.member_limit
    FROM study_groups g
    JOIN subjects s ON s.id = g.subject_id
    JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = ? AND gm.join_status = 'approved'`;
  
  const params = [userId];

  if (subjectId) {
    query += " AND g.subject_id = ?";
    params.push(subjectId);
  }

  query += " ORDER BY g.id DESC";
  const [groups] = await db.execute(query, params);

  // ดึงสมาชิกของแต่ละกลุ่มมาใส่ด้วย
  for (const group of groups) {
    const [members] = await db.execute(
      `SELECT u.id, u.username, u.profile_image_url, gm.role
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = ? AND gm.join_status = 'approved'`,
      [group.id]
    );
    group.members = members;
    group.member_count = members.length;
  }

  return groups;
};

const deleteGroup = async (groupId) => {
  // ลบสมาชิกก่อน (Foreign Key constraint)
  await db.execute(`DELETE FROM group_members WHERE group_id = ?`, [groupId]);
  const [result] = await db.execute(`DELETE FROM study_groups WHERE id = ?`, [groupId]);
  return result.affectedRows > 0;
};

const leaveGroup = async (groupId, userId) => {
  const [result] = await db.execute(
    `DELETE FROM group_members WHERE group_id = ? AND user_id = ?`,
    [groupId, userId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  createGroup,
  getGroups,
  requestJoinGroup,
  updateMemberStatus,
  getGroupMembers,
  getMyGroups,
  deleteGroup,
  leaveGroup,
};

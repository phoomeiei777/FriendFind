const db = require("../config/db");

const enrollInSubject = async (userId, subjectId) => {
  const [result] = await db.execute(
    "INSERT INTO enrollments (user_id, subject_id, status) VALUES (?, ?, 'pending')",
    [userId, subjectId]
  );
  return result.insertId;
};

const getEnrollmentsByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT e.*, s.subject_code, s.subject_name 
     FROM enrollments e 
     JOIN subjects s ON e.subject_id = s.id 
     WHERE e.user_id = ?`,
    [userId]
  );
  return rows;
};

const getApprovedSubjectsByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT s.* 
     FROM enrollments e 
     JOIN subjects s ON e.subject_id = s.id 
     WHERE e.user_id = ? AND e.status = 'approved'`,
    [userId]
  );
  return rows;
};

const getAllPendingEnrollments = async () => {
  const [rows] = await db.execute(
    `SELECT e.id, e.status, e.created_at, u.username, u.email, s.subject_code, s.subject_name 
     FROM enrollments e 
     JOIN users u ON e.user_id = u.id 
     JOIN subjects s ON e.subject_id = s.id 
     WHERE e.status = 'pending' 
     ORDER BY e.created_at DESC`
  );
  return rows;
};

const updateEnrollmentStatus = async (enrollmentId, status) => {
  const [result] = await db.execute(
    "UPDATE enrollments SET status = ? WHERE id = ?",
    [status, enrollmentId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  enrollInSubject,
  getEnrollmentsByUser,
  getApprovedSubjectsByUser,
  getAllPendingEnrollments,
  updateEnrollmentStatus,
};

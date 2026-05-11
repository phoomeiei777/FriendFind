const db = require("../config/db");

const createReport = async (reporterId, reportedId, reason) => {
  const [result] = await db.execute(
    "INSERT INTO reports (reporter_id, reported_id, reason) VALUES (?, ?, ?)",
    [reporterId, reportedId, reason]
  );
  return result.insertId;
};

module.exports = { createReport };

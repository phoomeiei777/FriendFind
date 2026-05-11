const { createReport } = require("../models/reportModel");

const submitReport = async (req, res, next) => {
  try {
    const { reported_id, reason } = req.body;
    const reporter_id = req.user.id;

    if (!reported_id || !reason) {
      return res.status(400).json({ message: "reported_id and reason are required." });
    }

    if (String(reporter_id) === String(reported_id)) {
      return res.status(400).json({ message: "Cannot report yourself." });
    }

    await createReport(reporter_id, reported_id, reason);
    return res.status(201).json({ message: "Report submitted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = { submitReport };

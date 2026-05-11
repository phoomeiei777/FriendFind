const enrollmentModel = require("../models/enrollmentModel");

const requestEnrollment = async (req, res, next) => {
  try {
    const subjectId = req.params.subjectId;
    const userId = req.user.id;

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required" });
    }

    try {
      await enrollmentModel.enrollInSubject(userId, subjectId);
      return res.status(201).json({ message: "Enrollment request submitted." });
    } catch (err) {
      // Catch unique constraint violation
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "You have already requested to enroll in this subject." });
      }
      throw err;
    }
  } catch (error) {
    return next(error);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const enrollments = await enrollmentModel.getEnrollmentsByUser(userId);
    return res.json({ enrollments });
  } catch (error) {
    return next(error);
  }
};

const getMyApprovedSubjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subjects = await enrollmentModel.getApprovedSubjectsByUser(userId);
    return res.json({ subjects });
  } catch (error) {
    return next(error);
  }
};

const getPendingEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentModel.getAllPendingEnrollments();
    return res.json({ enrollments });
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const enrollmentId = req.params.id;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const success = await enrollmentModel.updateEnrollmentStatus(enrollmentId, status);
    if (!success) {
      return res.status(404).json({ message: "Enrollment request not found." });
    }

    return res.json({ message: `Enrollment request ${status} successfully.` });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestEnrollment,
  getMyEnrollments,
  getMyApprovedSubjects,
  getPendingEnrollments,
  updateStatus,
};

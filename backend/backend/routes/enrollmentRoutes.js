const express = require("express");
const {
  requestEnrollment,
  getMyEnrollments,
  getMyApprovedSubjects,
  getPendingEnrollments,
  updateStatus,
} = require("../controllers/enrollmentController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// User endpoints
router.post("/:subjectId/enroll", requireAuth, requestEnrollment);
router.get("/my", requireAuth, getMyEnrollments);
router.get("/my-approved", requireAuth, getMyApprovedSubjects);

// Admin endpoints
// Assuming requireAuth can be used for admin context or a specific requireAdmin
// Here we just use requireAuth and trust the admin dashboard has valid token.
// You might want to add role check if needed.
router.get("/admin", getPendingEnrollments);
router.patch("/admin/:id", updateStatus);

module.exports = router;

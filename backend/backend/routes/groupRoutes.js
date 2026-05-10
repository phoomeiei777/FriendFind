const express = require("express");
const {
  createStudyGroup,
  listStudyGroups,
  joinStudyGroup,
  updateGroupMemberStatus,
  listGroupMembers,
  listMyGroups,
  handleDeleteGroup,
  handleLeaveGroup,
} = require("../controllers/groupController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", requireAuth, listMyGroups);           // Private: กลุ่มของฉัน
router.get("/", listStudyGroups);                        // Public: กลุ่มทั้งหมด
router.get("/:groupId/members", listGroupMembers);
router.post("/", requireAuth, createStudyGroup);
router.post("/:groupId/join", requireAuth, joinStudyGroup);
router.patch("/:groupId/members/:userId", requireAuth, updateGroupMemberStatus);
router.delete("/:groupId", requireAuth, handleDeleteGroup);
router.post("/:groupId/leave", requireAuth, handleLeaveGroup);

module.exports = router;

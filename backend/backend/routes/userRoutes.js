const express = require("express");
const { getUsersByActiveSubject, getAllUsers, updateProfile, deleteAccount } = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Optional auth middleware (ไม่บังคับ แต่ถ้ามี token จะ exclude ตัวเอง)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
  const jwt = require("jsonwebtoken");
  try {
    req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET || "dev_secret");
  } catch (_) {}
  next();
};

router.get("/active-subject/:subjectCode", optionalAuth, getUsersByActiveSubject);
router.get("/", optionalAuth, getAllUsers);
router.patch("/profile", requireAuth, updateProfile);
router.delete("/profile", requireAuth, deleteAccount);

module.exports = router;

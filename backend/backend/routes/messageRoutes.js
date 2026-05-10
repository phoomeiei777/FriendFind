const express = require("express");
const { postMessage, fetchMessages } = require("../controllers/messageController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, fetchMessages);
router.post("/", requireAuth, postMessage);

module.exports = router;

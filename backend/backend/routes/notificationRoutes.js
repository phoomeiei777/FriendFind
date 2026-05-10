const express = require("express");
const { listNotifications, readNotification, removeNotification } = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listNotifications);
router.patch("/:id/read", requireAuth, readNotification);
router.delete("/:id", requireAuth, removeNotification);

module.exports = router;

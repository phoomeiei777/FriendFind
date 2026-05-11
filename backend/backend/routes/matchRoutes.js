const express = require("express");
const { swipe, listMatches, swipedIds, unmatch } = require("../controllers/matchController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/swipe", requireAuth, swipe);
router.get("/", requireAuth, listMatches);
router.get("/swiped", requireAuth, swipedIds);
router.post("/unmatch/:id", requireAuth, unmatch);

module.exports = router;

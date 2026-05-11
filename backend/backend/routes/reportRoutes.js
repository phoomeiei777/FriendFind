const express = require("express");
const { submitReport } = require("../controllers/reportController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, submitReport);

module.exports = router;

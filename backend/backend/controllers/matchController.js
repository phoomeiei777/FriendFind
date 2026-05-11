const { recordSwipe, getMatches, getSwipedIds } = require("../models/matchModel");

/**
 * POST /api/matches/swipe
 * body: { target_id, direction: 'right'|'left' }
 * requireAuth middleware must run first
 */
const swipe = async (req, res, next) => {
  try {
    const { target_id, direction } = req.body;
    const swiperId = req.user.id;

    if (!target_id || !direction) {
      return res.status(400).json({ message: "target_id and direction are required." });
    }
    if (!["right", "left"].includes(direction)) {
      return res.status(400).json({ message: "direction must be 'right' or 'left'." });
    }
    if (String(swiperId) === String(target_id)) {
      return res.status(400).json({ message: "Cannot swipe on yourself." });
    }

    const result = await recordSwipe(swiperId, target_id, direction);
    return res.json({
      message: result.matched ? "It's a match! 🎉" : direction === "right" ? "Like recorded." : "Pass recorded.",
      matched: result.matched,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/matches
 * Returns all matched users for the authenticated user
 */
const listMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const matches = await getMatches(userId);
    return res.json({ count: matches.length, matches });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/matches/swiped
 * Returns IDs of users already swiped by the authenticated user
 */
const swipedIds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ids = await getSwipedIds(userId);
    return res.json({ ids });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/matches/unmatch/:id
 * Unmatch with a user
 */
const unmatch = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const userId = req.user.id;

    if (!targetId) {
      return res.status(400).json({ message: "target_id is required." });
    }

    const success = await require("../models/matchModel").unmatchUser(userId, targetId);
    if (!success) {
      return res.status(404).json({ message: "Match not found or already unmatched." });
    }

    return res.json({ message: "Unmatched successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = { swipe, listMatches, swipedIds, unmatch };

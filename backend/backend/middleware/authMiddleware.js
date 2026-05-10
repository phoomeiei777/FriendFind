const jwt = require("jsonwebtoken");
const db = require("../config/db");

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid auth token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    
    // Check if user is banned
    const [rows] = await db.execute("SELECT is_banned FROM users WHERE id = ? LIMIT 1", [payload.id]);
    if (rows.length > 0 && rows[0].is_banned) {
      return res.status(403).json({ message: "Your account has been banned." });
    }

    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = { requireAuth };

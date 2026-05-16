const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserByUsernameOrEmail,
  updatePasswordByIdentity,
} = require("../models/userModel");
const db = require("../config/db");
const axios = require("axios");

const register = async (req, res, next) => {
  try {
    let { username, email, password, phone, faculty, year, interests, profile_image_url } = req.body;

    // Provide defaults for OTP-based registration if fields are missing
    if (!username) {
      username = phone ? `user_${phone.replace(/\D/g, '')}` : `user_${Date.now()}`;
    }
    if (!email) {
      email = phone ? `${phone.replace(/\D/g, '')}@friendfind.com` : `temp_${Date.now()}@friendfind.com`;
    }
    if (!password) {
      password = "dummy_password_for_otp";
    }

    const existing = await findUserByUsernameOrEmail(username, email);
    if (existing) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({
      username,
      email,
      phone,
      passwordHash,
      faculty,
      year,
      interests,
      profileImageUrl: profile_image_url,
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: userId, username, email },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identity, password } = req.body; // เปลี่ยนจาก email เป็น identity (email or phone)

    if (!identity || !password) {
      return res.status(400).json({ message: "identity (email/phone) and password are required." });
    }

    // ค้นหาจาก Email หรือ Phone
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1",
      [identity, identity]
    );
    
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.is_banned) {
      return res.status(403).json({ message: "Your account has been banned. Please contact support." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        faculty: user.faculty,
        year: user.year,
        interests: user.interests,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { identity, newPassword } = req.body;

    if (!identity || !newPassword) {
      return res.status(400).json({ message: "identity (email/phone) and newPassword are required." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const success = await updatePasswordByIdentity(identity, passwordHash);

    if (!success) {
      return res.status(404).json({ message: "User not found with the provided identity." });
    }

    return res.json({ message: "Password reset successfully." });
  } catch (error) {
    return next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required." });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to DB (upsert)
    await db.execute(`
      INSERT INTO otp_codes (phone, code, expires_at) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at)
    `, [phone, otpCode, expiresAt]);

    console.log(`[DEV] Generated OTP for ${phone}: ${otpCode}`);

    // Call ThaiBulkSMS API
    const apiKey = process.env.THAIBULKSMS_API_KEY;
    const apiSecret = process.env.THAIBULKSMS_API_SECRET;
    
    if (apiKey && apiSecret) {
      const authHeader = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      
      const params = new URLSearchParams();
      params.append('msisdn', phone);
      params.append('message', `รหัสยืนยัน FriendFind ของคุณคือ ${otpCode}`);
      // params.append('sender', 'SMS'); // Commented out to use default sender

      await axios.post('https://api-v2.thaibulksms.com/sms', params, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } else {
      console.warn("ThaiBulkSMS credentials missing, OTP only logged to console.");
    }

    res.json({ message: "OTP sent successfully", status: "pending" });
  } catch (error) {
    console.error("ThaiBulkSMS sendOtp Error for phone:", req.body.phone, error.response?.data || error.message);
    res.status(500).json({ message: error.message || "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: "Phone and code are required." });

    // Check OTP in DB
    const [otpRows] = await db.execute(
      "SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND expires_at > NOW()", 
      [phone, code]
    );

    if (otpRows.length === 0) {
      return res.status(401).json({ message: "Invalid or expired OTP code." });
    }

    // Delete OTP after successful verification
    await db.execute("DELETE FROM otp_codes WHERE phone = ?", [phone]);

    // Search for user in MySQL by phone
    const [rows] = await db.execute("SELECT * FROM users WHERE phone = ? LIMIT 1", [phone]);
    const user = rows[0];

    if (!user) {
      // User doesn't exist, tell frontend to complete registration
      return res.status(200).json({
        message: "New user. Please complete registration.",
        isNewUser: true,
        phone: phone
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        faculty: user.faculty,
        year: user.year,
        interests: user.interests,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (error) {
    console.error("verifyOtp Error:", error);
    res.status(500).json({ message: error.message || "Failed to verify OTP" });
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) return res.status(400).json({ message: "email or phone is required" });

    let query = "SELECT id FROM users WHERE ";
    let params = [];
    if (email && phone) {
      query += "email = ? OR phone = ?";
      params = [email, phone];
    } else if (email) {
      query += "email = ?";
      params = [email];
    } else {
      query += "phone = ?";
      params = [phone];
    }

    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return res.status(409).json({ message: "Email or phone already registered" });
    }
    return res.json({ available: true });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, resetPassword, sendOtp, verifyOtp, checkAvailability };

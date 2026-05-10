const { fetchUsersByActiveSubject, fetchAllUsers, updateUser } = require("../models/userModel");

const getUsersByActiveSubject = async (req, res, next) => {
  try {
    const { subjectCode } = req.params;
    if (!subjectCode) {
      return res.status(400).json({ message: "subjectCode is required." });
    }
    const users = await fetchUsersByActiveSubject(subjectCode);
    return res.json({ count: users.length, users });
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    // ถ้ามี token ก็ exclude ตัวเองออก
    const excludeId = req.user?.id || null;
    const users = await fetchAllUsers(excludeId);
    return res.json({ count: users.length, users });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/profile
 * อัปเดต profile ของ user ที่ login อยู่
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, faculty, year, interests, profile_image_url } = req.body;

    const updated = await updateUser(userId, { username, faculty, year, interests, profile_image_url });
    if (!updated) {
      return res.status(400).json({ message: "Nothing to update." });
    }
    return res.json({ message: "Profile updated.", user: updated });
  } catch (error) {
    // duplicate username
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already taken." });
    }
    return next(error);
  }
};

module.exports = { getUsersByActiveSubject, getAllUsers, updateProfile };

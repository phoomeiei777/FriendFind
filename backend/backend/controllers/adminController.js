const adminModel = require("../models/adminModel");

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await adminModel.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await adminModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.banUser = async (req, res) => {
  const { id } = req.params;
  const { is_banned } = req.body;
  try {
    const success = await adminModel.banUser(id, is_banned);
    if (!success) return res.status(404).json({ message: "User not found" });
    res.json({ message: is_banned ? "User banned" : "User unbanned" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const success = await adminModel.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await adminModel.getAllSubjects();
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createSubject = async (req, res) => {
  const { subject_code, subject_name } = req.body;
  if (!subject_code || !subject_name) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const id = await adminModel.createSubject(subject_code, subject_name);
    res.status(201).json({ id, subject_code, subject_name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error (Duplicate code?)" });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const success = await adminModel.deleteSubject(req.params.id);
    if (!success) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error (Cannot delete subject if groups use it)" });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await adminModel.getAllGroups();
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const success = await adminModel.deleteGroup(req.params.id);
    if (!success) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

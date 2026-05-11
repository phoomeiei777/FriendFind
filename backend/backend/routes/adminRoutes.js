const express = require("express");
const adminController = require("../controllers/adminController");
const router = express.Router();

router.get("/dashboard", adminController.getDashboardStats);
router.get("/users", adminController.getUsers);
router.put("/users/:id/ban", adminController.banUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/subjects", adminController.getSubjects);
router.post("/subjects", adminController.createSubject);
router.put("/subjects/:id", adminController.updateSubject);
router.delete("/subjects/:id", adminController.deleteSubject);
router.get("/groups", adminController.getGroups);
router.delete("/groups/:id", adminController.deleteGroup);

module.exports = router;

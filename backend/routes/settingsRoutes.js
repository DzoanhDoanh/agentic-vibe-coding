const express = require("express");
const router = express.Router();
const {
  getCourses, createCourse, updateCourse, deleteCourse,
  getRooms, createRoom, updateRoom, deleteRoom
} = require("../controllers/settingsController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { isolateBranch } = require("../middlewares/branchIsolationMiddleware");

router.use(protect);

// ---- COURSES ----
router.get("/courses", getCourses);
router.post("/courses", authorize("SuperAdmin", "BranchAdmin"), createCourse);
router.put("/courses/:id", authorize("SuperAdmin", "BranchAdmin"), updateCourse);
router.delete("/courses/:id", authorize("SuperAdmin", "BranchAdmin"), deleteCourse);

// ---- ROOMS ----
router.get("/rooms", isolateBranch, getRooms);
router.post("/rooms", isolateBranch, authorize("SuperAdmin", "BranchAdmin"), createRoom);
router.put("/rooms/:id", isolateBranch, authorize("SuperAdmin", "BranchAdmin"), updateRoom);
router.delete("/rooms/:id", isolateBranch, authorize("SuperAdmin", "BranchAdmin"), deleteRoom);

module.exports = router;

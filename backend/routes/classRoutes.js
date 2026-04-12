const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const { isolateBranch } = require("../middlewares/branchIsolationMiddleware");
const {
  getClasses,
  createClass,
  getMyClasses,
  updateClass,
  deleteClass,
  enrollStudent,
  unenrollStudent,
  getMyStudentClasses,
} = require("../controllers/classController");

router
  .route("/")
  .get(protect, isolateBranch, getClasses)
  .post(protect, authorize("BranchAdmin", "SuperAdmin"), isolateBranch, createClass);

router.get("/my", protect, authorize("Teacher"), getMyClasses);
router.get("/student/my", protect, authorize("Student"), getMyStudentClasses);

router
  .route("/:id")
  .put(protect, authorize("BranchAdmin", "SuperAdmin"), isolateBranch, updateClass)
  .delete(protect, authorize("BranchAdmin", "SuperAdmin"), isolateBranch, deleteClass);

router.post(
  "/:id/enroll",
  protect,
  authorize("BranchAdmin", "SuperAdmin"),
  isolateBranch,
  enrollStudent,
);
router.post(
  "/:id/unenroll",
  protect,
  authorize("BranchAdmin", "SuperAdmin"),
  isolateBranch,
  unenrollStudent,
);

module.exports = router;


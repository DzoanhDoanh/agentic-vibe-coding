const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { isolateBranch } = require("../middlewares/branchIsolationMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

router
  .route("/")
  .get(protect, isolateBranch, getStudents)
  .post(protect, authorize("BranchAdmin"), isolateBranch, createStudent);

router
  .route("/:id")
  .put(protect, authorize("BranchAdmin"), isolateBranch, updateStudent)
  .delete(protect, authorize("BranchAdmin"), isolateBranch, deleteStudent);

module.exports = router;

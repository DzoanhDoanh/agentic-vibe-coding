const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { isolateBranch } = require("../middlewares/branchIsolationMiddleware");
const {
  getAttendanceByClassAndDate,
  upsertAttendance,
  getMyAttendance,
  getPayroll,
} = require("../controllers/attendanceController");

router.get("/class/:classId", protect, getAttendanceByClassAndDate);
router.post("/class/:classId", protect, upsertAttendance);
router.get("/student/my", protect, getMyAttendance);

router.use("/report", protect, isolateBranch);
router.get("/report/payroll", protect, isolateBranch, getPayroll);

module.exports = router;

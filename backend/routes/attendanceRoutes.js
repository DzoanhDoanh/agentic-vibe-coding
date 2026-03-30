const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  getAttendanceByClassAndDate,
  upsertAttendance,
  getMyAttendance,
} = require("../controllers/attendanceController");

router.get("/class/:classId", protect, getAttendanceByClassAndDate);
router.post("/class/:classId", protect, upsertAttendance);
router.get("/student/my", protect, getMyAttendance);

module.exports = router;

// backend/models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      required: true,
    },
    remarks: { type: String },
    // Optional: quick score entry for session/test
    score: { type: Number, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);

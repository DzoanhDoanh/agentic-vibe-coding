// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "BranchAdmin", "Teacher", "Student"],
      required: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null, // Nullable if SuperAdmin
    },
    // Only used when role === 'Student' to bind the login user to a Student profile record
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);

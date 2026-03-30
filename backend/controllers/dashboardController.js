const Class = require("../models/Class");
const Student = require("../models/Student");
const User = require("../models/User");

// GET /api/dashboard/summary?branch_id=...
// SuperAdmin: system-wide counts (or filtered by branch_id)
// BranchAdmin: counts in their branch
const getSummary = async (req, res) => {
  try {
    let branchId = null;

    if (req.user.role === "SuperAdmin") {
      branchId = req.query.branch_id || null;
    } else if (
      req.user.role === "BranchAdmin" ||
      req.user.role === "Teacher" ||
      req.user.role === "Student"
    ) {
      branchId = req.user.branch_id || null;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const branchFilter = branchId ? { branch_id: branchId } : {};

    const [studentsCount, teachersCount, classesCount] = await Promise.all([
      Student.countDocuments(branchFilter),
      User.countDocuments({ ...branchFilter, role: "Teacher" }),
      Class.countDocuments(branchFilter),
    ]);

    res.json({
      branch_id: branchId,
      students: studentsCount,
      teachers: teachersCount,
      classes: classesCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getSummary };

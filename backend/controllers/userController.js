const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Class = require("../models/Class");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const canBranchAdminManageRole = (role) => {
  return role === "Teacher" || role === "Student";
};

// GET /api/users?role=Teacher
// SuperAdmin: all users (optionally filter by role/branch_id)
// BranchAdmin: only users in their branch and roles Teacher/Student
const listUsers = async (req, res) => {
  try {
    const { role, branch_id } = req.query;

    const filter = {};

    if (req.user.role === "SuperAdmin") {
      if (role) filter.role = role;
      if (branch_id) filter.branch_id = branch_id;
    } else if (req.user.role === "BranchAdmin") {
      filter.branch_id = req.user.branch_id;
      if (role) {
        if (!canBranchAdminManageRole(role)) {
          return res
            .status(403)
            .json({ message: "BranchAdmin cannot list this role" });
        }
        filter.role = role;
      } else {
        filter.role = { $in: ["Teacher", "Student"] };
      }
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const users = await User.find(filter).select("-password_hash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/users
// SuperAdmin: create BranchAdmin (or others) with explicit branch_id when needed
// BranchAdmin: create Teacher/Student in their branch
const createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, branch_id, student_id } =
      req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailNormalized = String(email).toLowerCase().trim();

    // Authorization + branch rules
    let targetBranchId = branch_id || null;

    if (req.user.role === "SuperAdmin") {
      if (
        role !== "SuperAdmin" &&
        role !== "BranchAdmin" &&
        role !== "Teacher" &&
        role !== "Student"
      ) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (role !== "SuperAdmin" && !targetBranchId) {
        return res
          .status(400)
          .json({ message: "branch_id is required for this role" });
      }
    } else if (req.user.role === "BranchAdmin") {
      if (!canBranchAdminManageRole(role)) {
        return res
          .status(403)
          .json({ message: "BranchAdmin can only create Teacher/Student" });
      }
      targetBranchId = req.user.branch_id;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Student account binding validation
    let boundStudentId = null;
    if (role === "Student") {
      if (!student_id) {
        return res
          .status(400)
          .json({ message: "student_id is required when role is Student" });
      }
      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      if (String(student.branch_id) !== String(targetBranchId)) {
        return res
          .status(403)
          .json({ message: "Student profile belongs to a different branch" });
      }
      boundStudentId = student._id;
    }

    const existing = await User.findOne({ email: emailNormalized });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const password_hash = await hashPassword(password);

    const created = await User.create({
      email: emailNormalized,
      password_hash,
      full_name,
      role,
      branch_id: role === "SuperAdmin" ? null : targetBranchId,
      student_id: boundStudentId,
      status: "Active",
    });

    res.status(201).json({
      _id: created._id,
      email: created.email,
      full_name: created.full_name,
      role: created.role,
      branch_id: created.branch_id,
      student_id: created.student_id,
      status: created.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, status, password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.role === "SuperAdmin") {
      // SuperAdmin can update anyone
    } else if (req.user.role === "BranchAdmin") {
      if (String(user.branch_id) !== String(req.user.branch_id)) {
        return res
          .status(403)
          .json({ message: "Forbidden: cross-branch access" });
      }
      if (!canBranchAdminManageRole(user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: cannot manage this role" });
      }
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (full_name) user.full_name = full_name;
    if (status) user.status = status;
    if (password) user.password_hash = await hashPassword(password);

    const updated = await user.save();
    res.json({
      _id: updated._id,
      email: updated.email,
      full_name: updated.full_name,
      role: updated.role,
      branch_id: updated.branch_id,
      student_id: updated.student_id,
      status: updated.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.role === "SuperAdmin") {
      // ok
    } else if (req.user.role === "BranchAdmin") {
      if (String(user.branch_id) !== String(req.user.branch_id)) {
        return res
          .status(403)
          .json({ message: "Forbidden: cross-branch access" });
      }
      if (!canBranchAdminManageRole(user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: cannot manage this role" });
      }
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (user.role === "Teacher") {
      const assigned = await Class.countDocuments({
        teacher_id: user._id,
        status: "Open",
      });
      if (assigned > 0) {
        return res
          .status(409)
          .json({
            message: "Không thể xóa giáo viên vì đang được phân công lớp học",
          });
      }
    }

    await User.deleteOne({ _id: id });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { listUsers, createUser, updateUser, deleteUser };

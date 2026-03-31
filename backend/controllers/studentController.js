const Student = require("../models/Student");
const Class = require("../models/Class");
const User = require("../models/User");

const getStudents = async (req, res) => {
  try {
    const students = await Student.find(req.branchFilter).lean();
    const studentIds = students.map((s) => s._id);

    const accounts = await User.find({
      role: "Student",
      student_id: { $in: studentIds },
    })
      .select("_id email full_name status student_id")
      .sort({ createdAt: 1 })
      .lean();

    const accountByStudentId = new Map();
    for (const acc of accounts) {
      const key = String(acc.student_id);
      if (!accountByStudentId.has(key)) accountByStudentId.set(key, acc);
    }

    res.json(
      students.map((s) => ({
        ...s,
        account: accountByStudentId.get(String(s._id)) || null,
      })),
    );
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createStudent = async (req, res) => {
  try {
    const { full_name, parent_name, phone } = req.body;
    const student = new Student({
      full_name,
      parent_name,
      phone,
      branch_id: req.body.branch_id,
    });
    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(400).json({ message: "Invalid student data" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (
      req.user.role !== "SuperAdmin" &&
      String(student.branch_id) !== String(req.user.branch_id)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: cross-branch access" });
    }

    const { full_name, parent_name, phone, status, dob } = req.body;
    if (full_name !== undefined) student.full_name = full_name;
    if (parent_name !== undefined) student.parent_name = parent_name;
    if (phone !== undefined) student.phone = phone;
    if (status !== undefined) student.status = status;
    if (dob !== undefined) student.dob = dob;

    const updated = await student.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (
      req.user.role !== "SuperAdmin" &&
      String(student.branch_id) !== String(req.user.branch_id)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: cross-branch access" });
    }

    const enrolledCount = await Class.countDocuments({
      enrolled_students: student._id,
    });
    if (enrolledCount > 0) {
      return res
        .status(409)
        .json({ message: "Không thể xóa học sinh vì đang ghi danh vào lớp" });
    }

    await Student.deleteOne({ _id: id });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = { getStudents, createStudent, updateStudent, deleteStudent };

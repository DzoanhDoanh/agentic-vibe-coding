const Branch = require("../models/Branch");
const Class = require("../models/Class");
const Student = require("../models/Student");
const User = require("../models/User");

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private/SuperAdmin
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({});
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a branch
// @route   POST /api/branches
// @access  Private/SuperAdmin
const createBranch = async (req, res) => {
  try {
    const { name, address, contact_phone } = req.body;
    const branch = new Branch({
      name,
      address,
      contact_phone,
    });
    const createdBranch = await branch.save();
    res.status(201).json(createdBranch);
  } catch (error) {
    res.status(400).json({ message: "Invalid branch data" });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const branchId = req.params.id;

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Không tìm thấy" });

    const [classesCount, studentsCount, usersCount] = await Promise.all([
      Class.countDocuments({ branch_id: branchId }),
      Student.countDocuments({ branch_id: branchId }),
      User.countDocuments({ branch_id: branchId }),
    ]);

    if (classesCount > 0 || studentsCount > 0 || usersCount > 0) {
      return res.status(409).json({
        message:
          "Không thể xóa chi nhánh vì đang có dữ liệu liên kết (lớp/học sinh/tài khoản)",
      });
    }

    await Branch.deleteOne({ _id: branchId });
    res.json({ message: "Đã xóa chi nhánh thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi xóa" });
  }
};

const updateBranch = async (req, res) => {
  try {
    const { name, address, contact_phone } = req.body;
    const branch = await Branch.findById(req.params.id);
    if (!branch)
      return res.status(404).json({ message: "Không tìm thấy chi nhánh" });

    branch.name = name || branch.name;
    branch.address = address || branch.address;
    branch.contact_phone = contact_phone || branch.contact_phone;

    const updatedBranch = await branch.save();
    res.json(updatedBranch);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật" });
  }
};

module.exports = { getBranches, createBranch, deleteBranch, updateBranch };

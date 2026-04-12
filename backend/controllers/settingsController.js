const Course = require("../models/Course");
const Room = require("../models/Room");

// --- COURSES ---
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) { res.status(400).json({ message: error.message || "Invalid data" }); }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) { res.status(400).json({ message: error.message || "Invalid data" }); }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// --- ROOMS ---
const getRooms = async (req, res) => {
  try {
    const filter = req.branchFilter || {};
    const rooms = await Room.find(filter).populate("branch_id", "name");
    res.json(rooms);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const createRoom = async (req, res) => {
  try {
    // Resolve branch_id: from body (SuperAdmin picks) or from user (BranchAdmin auto-injected by middleware)
    const branch_id = req.body.branch_id || (req.user.branch_id ? String(req.user.branch_id) : null);

    if (!branch_id) {
      return res.status(400).json({ message: "Vui lòng chọn chi nhánh cho phòng học" });
    }

    const room = await Room.create({ ...req.body, branch_id });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message || "Invalid data" });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Branch isolation: BranchAdmin can only update their branch's rooms
    if (req.user.role !== "SuperAdmin" && String(room.branch_id) !== String(req.user.branch_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(room, req.body);
    await room.save();
    res.json(room);
  } catch (error) { res.status(400).json({ message: error.message || "Invalid data" }); }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (req.user.role !== "SuperAdmin" && String(room.branch_id) !== String(req.user.branch_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, getRooms, createRoom, updateRoom, deleteRoom };

const Attendance = require("../models/Attendance");
const Class = require("../models/Class");

const normalizeDateOnly = (dateInput) => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  // normalize to 00:00:00 local
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// GET /api/attendance/class/:classId?date=YYYY-MM-DD
// Teacher: only their class
// BranchAdmin: their branch
const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { classId } = req.params;
    const date = normalizeDateOnly(req.query.date);
    if (!date) return res.status(400).json({ message: "Invalid date" });

    const clazz = await Class.findById(classId);
    if (!clazz) return res.status(404).json({ message: "Class not found" });

    // Authorization
    if (req.user.role === "Teacher") {
      if (String(clazz.teacher_id) !== String(req.user._id)) {
        return res.status(403).json({ message: "Forbidden: not your class" });
      }
    } else if (req.user.role === "BranchAdmin") {
      if (String(clazz.branch_id) !== String(req.user.branch_id)) {
        return res
          .status(403)
          .json({ message: "Forbidden: cross-branch access" });
      }
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const records = await Attendance.find({ class_id: classId, date }).populate(
      "student_id",
      "full_name",
    );

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/attendance/class/:classId
// body: { date: 'YYYY-MM-DD', records: [{ student_id, status, remarks }] }
const upsertAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date: dateInput, records } = req.body;

    const date = normalizeDateOnly(dateInput);
    if (!date) return res.status(400).json({ message: "Invalid date" });
    if (!Array.isArray(records))
      return res.status(400).json({ message: "records must be an array" });

    const clazz = await Class.findById(classId);
    if (!clazz) return res.status(404).json({ message: "Class not found" });

    if (req.user.role !== "Teacher") {
      return res
        .status(403)
        .json({ message: "Only Teacher can mark attendance" });
    }
    if (String(clazz.teacher_id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden: not your class" });
    }

    // ensure students are enrolled
    const enrolledSet = new Set(
      (clazz.enrolled_students || []).map((s) => String(s)),
    );

    const ops = records
      .filter((r) => r && r.student_id)
      .map((r) => {
        if (!enrolledSet.has(String(r.student_id))) {
          return null;
        }
        return Attendance.findOneAndUpdate(
          { class_id: classId, student_id: r.student_id, date },
          {
            class_id: classId,
            student_id: r.student_id,
            date,
            status: r.status,
            remarks: r.remarks || "",
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      })
      .filter(Boolean);

    const saved = await Promise.all(ops);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/attendance/student/my
const getMyAttendance = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only Student can access this" });
    }
    if (!req.user.student_id) {
      return res
        .status(400)
        .json({
          message: "Student account is not linked to a Student profile",
        });
    }

    const records = await Attendance.find({ student_id: req.user.student_id })
      .populate("class_id", "name schedule_rule")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getPayroll = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin" && req.user.role !== "BranchAdmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Get all attendances in branch (we need to join with Class to ensure branch match)
    // For simplicity, we just fetch all classes in branch and then their attendances
    const classes = await Class.find(req.branchFilter);
    const classIds = classes.map(c => c._id);
    
    const attendances = await Attendance.find({ class_id: { $in: classIds } });
    
    // Group by teacher and count unique (class_id + date) sessions
    const sessions = new Set();
    const teacherSessions = {}; // teacher_id -> count
    
    attendances.forEach(att => {
      const classObj = classes.find(c => String(c._id) === String(att.class_id));
      if (!classObj || !classObj.teacher_id) return;
      
      const teacherId = String(classObj.teacher_id);
      const sessionKey = `${classObj._id}_${normalizeDateOnly(att.date).getTime()}`;
      
      if (!sessions.has(sessionKey)) {
        sessions.add(sessionKey);
        teacherSessions[teacherId] = (teacherSessions[teacherId] || 0) + 1;
      }
    });

    res.json(teacherSessions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAttendanceByClassAndDate,
  upsertAttendance,
  getMyAttendance,
  getPayroll,
};

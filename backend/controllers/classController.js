const Class = require("../models/Class");
const Student = require("../models/Student");
const User = require("../models/User");

const parseScheduleRule = (scheduleRule) => {
  if (!scheduleRule) return null;
  const raw = String(scheduleRule).trim();
  if (!raw) return null;

  // Supported examples:
  // - "T2-T4-T6, 18:00-19:30"
  // - "T2,T4,T6 18:00-19:30"
  // - "T2 T4 T6 18:00-19:30"
  // Days tokens: T2..T7 or CN
  const dayMatch = raw.match(/(CN|T[2-7])([\s,\-]+(CN|T[2-7]))*/i);
  const timeMatch = raw.match(
    /(\d{1,2}:\d{2})\s*(?:-|–|to)\s*(\d{1,2}:\d{2})/i,
  );

  const days = [];
  if (dayMatch) {
    const dayTokens = dayMatch[0]
      .toUpperCase()
      .replace(/\s+/g, "")
      .split(/[,\-]/)
      .filter(Boolean);
    for (const t of dayTokens) {
      if (t === "CN" || /^T[2-7]$/.test(t)) days.push(t);
    }
  }

  if (!timeMatch) return { days, start: null, end: null };
  const start = timeMatch[1].padStart(5, "0");
  const end = timeMatch[2].padStart(5, "0");
  return { days, start, end };
};

const toMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const scheduleOverlaps = (a, b) => {
  if (!a || !b) return false;
  if (!a.start || !a.end || !b.start || !b.end) return false;
  const aStart = toMinutes(a.start);
  const aEnd = toMinutes(a.end);
  const bStart = toMinutes(b.start);
  const bEnd = toMinutes(b.end);
  if (aStart == null || aEnd == null || bStart == null || bEnd == null)
    return false;

  const daySet = new Set(a.days || []);
  const shareDay = (b.days || []).some((d) => daySet.has(d));
  if (!shareDay) return false;

  // overlap if intervals intersect
  return aStart < bEnd && bStart < aEnd;
};

// @desc    Get all classes for a branch
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
  try {
    // req.branchFilter is injected by isolateBranch middleware
    const classes = await Class.find(req.branchFilter).populate(
      "teacher_id",
      "full_name email",
    );
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a class
// @route   POST /api/classes
// @access  Private/BranchAdmin
const createClass = async (req, res) => {
  try {
    const { name, course_id, room_id, teacher_id, schedule_rule } = req.body;

    // branch_id is automatically assigned to req.body by isolateBranch if BranchAdmin is creating it
    let teacher = null;
    if (teacher_id) {
      teacher = await User.findById(teacher_id);
      if (!teacher || teacher.role !== "Teacher") {
        return res.status(400).json({ message: "teacher_id is invalid" });
      }
      if (String(teacher.branch_id) !== String(req.body.branch_id)) {
        return res
          .status(403)
          .json({ message: "Teacher belongs to a different branch" });
      }
    }

    const parsed = parseScheduleRule(schedule_rule);

    // Conflict warning: prevent creating if overlaps with existing teacher classes in same branch
    if (
      teacher &&
      parsed &&
      parsed.days?.length &&
      parsed.start &&
      parsed.end
    ) {
      const existing = await Class.find({
        branch_id: req.body.branch_id,
        teacher_id: teacher._id,
        status: "Open",
      });
      for (const c of existing) {
        const p = {
          days:
            c.schedule_days || parseScheduleRule(c.schedule_rule)?.days || [],
          start: c.start_time || parseScheduleRule(c.schedule_rule)?.start,
          end: c.end_time || parseScheduleRule(c.schedule_rule)?.end,
        };
        if (scheduleOverlaps(parsed, p)) {
          return res
            .status(409)
            .json({ message: "Lịch dạy bị trùng với lớp khác của giáo viên" });
        }
      }
    }

    const newClass = new Class({
      name,
      course_id,
      room_id,
      teacher_id,
      schedule_rule,
      schedule_days: parsed?.days || [],
      start_time: parsed?.start || undefined,
      end_time: parsed?.end || undefined,
      branch_id: req.body.branch_id,
    });
    const createdClass = await newClass.save();
    res.status(201).json(createdClass);
  } catch (error) {
    res.status(400).json({ message: "Invalid class data" });
  }
};

// GET /api/classes/my (Teacher)
const getMyClasses = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only Teacher can access this" });
    }
    const classes = await Class.find({
      teacher_id: req.user._id,
      branch_id: req.user.branch_id,
    })
      .populate("teacher_id", "full_name email")
      .populate("enrolled_students", "full_name");
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/classes/student/my (Student)
const getMyStudentClasses = async (req, res) => {
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

    const classes = await Class.find({
      branch_id: req.user.branch_id,
      enrolled_students: req.user.student_id,
    }).populate("teacher_id", "full_name email");

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/classes/:id
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const clazz = await Class.findById(id);
    if (!clazz) return res.status(404).json({ message: "Class not found" });

    // Branch isolation
    if (
      req.user.role !== "SuperAdmin" &&
      String(clazz.branch_id) !== String(req.user.branch_id)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: cross-branch access" });
    }

    const { name, course_id, room_id, teacher_id, schedule_rule, status } =
      req.body;

    if (name !== undefined) clazz.name = name;
    if (course_id !== undefined) clazz.course_id = course_id;
    if (room_id !== undefined) clazz.room_id = room_id;
    if (status !== undefined) clazz.status = status;

    if (teacher_id !== undefined) {
      if (!teacher_id) {
        clazz.teacher_id = null;
      } else {
        const teacher = await User.findById(teacher_id);
        if (!teacher || teacher.role !== "Teacher") {
          return res.status(400).json({ message: "teacher_id is invalid" });
        }
        if (String(teacher.branch_id) !== String(clazz.branch_id)) {
          return res
            .status(403)
            .json({ message: "Teacher belongs to a different branch" });
        }
        clazz.teacher_id = teacher._id;
      }
    }

    if (schedule_rule !== undefined) {
      clazz.schedule_rule = schedule_rule;
      const parsed = parseScheduleRule(schedule_rule);
      clazz.schedule_days = parsed?.days || [];
      clazz.start_time = parsed?.start || undefined;
      clazz.end_time = parsed?.end || undefined;

      // conflict check if teacher assigned
      if (
        clazz.teacher_id &&
        parsed &&
        parsed.days?.length &&
        parsed.start &&
        parsed.end
      ) {
        const others = await Class.find({
          _id: { $ne: clazz._id },
          branch_id: clazz.branch_id,
          teacher_id: clazz.teacher_id,
          status: "Open",
        });
        for (const c of others) {
          const p = {
            days:
              c.schedule_days || parseScheduleRule(c.schedule_rule)?.days || [],
            start: c.start_time || parseScheduleRule(c.schedule_rule)?.start,
            end: c.end_time || parseScheduleRule(c.schedule_rule)?.end,
          };
          if (scheduleOverlaps(parsed, p)) {
            return res
              .status(409)
              .json({
                message: "Lịch dạy bị trùng với lớp khác của giáo viên",
              });
          }
        }
      }
    }

    const updated = await clazz.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/classes/:id (Block if has enrollments)
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const clazz = await Class.findById(id);
    if (!clazz) return res.status(404).json({ message: "Class not found" });

    if (
      req.user.role !== "SuperAdmin" &&
      String(clazz.branch_id) !== String(req.user.branch_id)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: cross-branch access" });
    }

    if ((clazz.enrolled_students || []).length > 0) {
      return res
        .status(409)
        .json({ message: "Không thể xóa lớp vì đang có học sinh ghi danh" });
    }

    await Class.deleteOne({ _id: id });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/classes/:id/enroll { student_id }
const enrollStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;
    if (!student_id)
      return res.status(400).json({ message: "student_id is required" });

    const clazz = await Class.findById(id);
    if (!clazz) return res.status(404).json({ message: "Class not found" });

    if (
      req.user.role !== "SuperAdmin" &&
      String(clazz.branch_id) !== String(req.user.branch_id)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: cross-branch access" });
    }

    const student = await Student.findById(student_id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (String(student.branch_id) !== String(clazz.branch_id)) {
      return res
        .status(403)
        .json({ message: "Student belongs to a different branch" });
    }

    const exists = (clazz.enrolled_students || []).some(
      (s) => String(s) === String(student._id),
    );
    if (!exists) {
      clazz.enrolled_students = [
        ...(clazz.enrolled_students || []),
        student._id,
      ];
      await clazz.save();
    }

    res.json(clazz);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/classes/:id/unenroll { student_id }
const unenrollStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;
    if (!student_id)
      return res.status(400).json({ message: "student_id is required" });

    const clazz = await Class.findById(id);
    if (!clazz) return res.status(404).json({ message: "Class not found" });

    if (
      req.user.role !== "SuperAdmin" &&
      String(clazz.branch_id) !== String(req.user.branch_id)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: cross-branch access" });
    }

    clazz.enrolled_students = (clazz.enrolled_students || []).filter(
      (s) => String(s) !== String(student_id),
    );
    await clazz.save();
    res.json(clazz);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getClasses,
  createClass,
  getMyClasses,
  getMyStudentClasses,
  updateClass,
  deleteClass,
  enrollStudent,
  unenrollStudent,
};

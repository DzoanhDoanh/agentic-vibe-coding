const Class = require('../models/Class');

// @desc    Get all classes for a branch
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
  try {
    // req.branchFilter is injected by isolateBranch middleware
    const classes = await Class.find(req.branchFilter).populate('teacher_id', 'full_name email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a class
// @route   POST /api/classes
// @access  Private/BranchAdmin
const createClass = async (req, res) => {
  try {
    const { name, course_id, room_id, teacher_id, schedule_rule } = req.body;
    
    // branch_id is automatically assigned to req.body by isolateBranch if BranchAdmin is creating it
    const newClass = new Class({
      name,
      course_id,
      room_id,
      teacher_id,
      schedule_rule,
      branch_id: req.body.branch_id
    });
    const createdClass = await newClass.save();
    res.status(201).json(createdClass);
  } catch (error) {
    res.status(400).json({ message: 'Invalid class data' });
  }
};

module.exports = { getClasses, createClass };

const Student = require('../models/Student');

const getStudents = async (req, res) => {
  try {
    const students = await Student.find(req.branchFilter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createStudent = async (req, res) => {
  try {
    const { full_name, parent_name, phone } = req.body;
    const student = new Student({
      full_name,
      parent_name,
      phone,
      branch_id: req.body.branch_id
    });
    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(400).json({ message: 'Invalid student data' });
  }
};
module.exports = { getStudents, createStudent };

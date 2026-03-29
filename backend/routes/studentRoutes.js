const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isolateBranch } = require('../middlewares/branchIsolationMiddleware');
const { getStudents, createStudent } = require('../controllers/studentController');

router.route('/')
  .get(protect, isolateBranch, getStudents)
  .post(protect, isolateBranch, createStudent);

module.exports = router;

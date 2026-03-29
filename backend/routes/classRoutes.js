const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { isolateBranch } = require('../middlewares/branchIsolationMiddleware');
const { getClasses, createClass } = require('../controllers/classController');

router.route('/')
  .get(protect, isolateBranch, getClasses)
  .post(protect, authorize('BranchAdmin'), isolateBranch, createClass);

module.exports = router;

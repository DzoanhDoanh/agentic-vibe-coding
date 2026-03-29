const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getBranches, createBranch, deleteBranch, updateBranch } = require('../controllers/branchController');

router.route('/')
  .get(protect, authorize('SuperAdmin'), getBranches)
  .post(protect, authorize('SuperAdmin'), createBranch);

router.route('/:id')
  .put(protect, authorize('SuperAdmin'), updateBranch)
  .delete(protect, authorize('SuperAdmin'), deleteBranch);

module.exports = router;

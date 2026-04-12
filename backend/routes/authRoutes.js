const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/change-password', protect, changePassword);

module.exports = router;

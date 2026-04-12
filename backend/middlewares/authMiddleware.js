const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_vibe_coding_mvp');
      req.user = await User.findById(decoded.id).select('-password_hash');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (req.user.status !== 'Active') {
        return res.status(403).json({ message: 'User is inactive' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user?.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

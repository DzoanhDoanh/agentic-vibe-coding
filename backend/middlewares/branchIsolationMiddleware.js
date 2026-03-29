const isolateBranch = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // If SuperAdmin, they can see everything or query by branch_id if provided
  if (req.user.role === 'SuperAdmin') {
     if (req.query.branch_id) {
         req.branchFilter = { branch_id: req.query.branch_id };
     } else {
         req.branchFilter = {}; // No filter
     }
  } else {
     // Force query to their own branch
     if (!req.user.branch_id) {
         return res.status(403).json({ message: 'User has no branch assigned' });
     }
     
     // Protect against malicious branch_id overriding in body (e.g. during Create/Update operations)
     if (req.body && req.body.branch_id && req.body.branch_id !== req.user.branch_id.toString()) {
         return res.status(403).json({ message: 'Forbidden: Cannot cross-assign branch data' });
     }

     // Inject their branch_id into the filter for standard GET queries
     req.branchFilter = { branch_id: req.user.branch_id };
     
     // Auto set branch_id in body for POST requests if missing
     if (req.method === 'POST' && !req.body.branch_id) {
         req.body.branch_id = req.user.branch_id.toString();
     }
  }

  next();
};

module.exports = { isolateBranch };

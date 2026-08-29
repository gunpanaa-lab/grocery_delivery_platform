const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Only ${role} accounts can perform this action` });
    }
    return next();
  };
}

module.exports = { protect, requireRole };

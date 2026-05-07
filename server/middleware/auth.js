// middleware/auth.js — JWT verification + role-based guards
const jwt = require('jsonwebtoken');
const db  = require('../config/db');

/**
 * Verifies the Bearer token in Authorization header.
 * Attaches req.user = { id, name, email, role, is_approved }.
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pull fresh user data (catches deactivated accounts mid-session)
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_approved, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ success: false, message: msg });
  }
};

/**
 * Role guard factory.
 * Usage: authorize('admin') or authorize('seller', 'admin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  // Sellers must be approved by admin
  if (req.user.role === 'seller' && !req.user.is_approved) {
    return res.status(403).json({ success: false, message: 'Your seller account is pending approval' });
  }
  next();
};

module.exports = { authenticate, authorize };

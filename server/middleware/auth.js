import jwt from 'jsonwebtoken';
import db from '../db.js';

export function verifyAdmin(req, res, next) {
  try {
    // Check HttpOnly cookie first, then fallback to Authorization header
    const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Access denied.'
      });
    }

    const secret = process.env.JWT_SECRET || 'ayyappa_default_secret_key_change_me';
    const decoded = jwt.verify(token, secret);

    // Verify admin exists in the database
    const admin = db.prepare('SELECT id, username FROM admins WHERE id = ?').get(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session. Admin user not found.'
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.'
    });
  }
}

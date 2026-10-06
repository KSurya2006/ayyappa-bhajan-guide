import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { sanitizeString } from '../middleware/validator.js';

const router = express.Router();

// Helper for audit logging
function logAudit(adminId, action, resourceType, resourceId, details) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      String(adminId || 'admin'),
      action,
      resourceType,
      resourceId ? String(resourceId) : null,
      typeof details === 'object' ? JSON.stringify(details) : String(details || '')
    );
  } catch (err) {
    console.error('[Audit Log Error]:', err.message);
  }
}

/**
 * 1. POST /api/admin/login
 * Super Admin authentication.
 * Rate-limited to prevent brute-force attacks.
 */
router.post('/login', loginLimiter, (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required.'
      });
    }

    const admin = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username.trim());

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      // Intentionally generic response for security
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your Super Admin username and password.'
      });
    }

    const secret = process.env.JWT_SECRET || 'ayyappa_default_secret_key_change_me';
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      secret,
      { expiresIn: '24h' }
    );

    // Set secure HttpOnly cookie (supports cross-site Vercel <-> Render in production)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isProduction, // HTTPS required for SameSite=None
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    logAudit(admin.username, 'admin_login_success', 'auth', null, 'Super Admin logged in successfully.');

    return res.json({
      success: true,
      message: 'Login successful.',
      token, // Supports dual auth: cookie + Authorization Bearer header
      user: { id: admin.id, username: admin.username }
    });
  } catch (err) {
    console.error('[Admin Login Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected authentication error occurred.'
    });
  }
});

/**
 * 2. POST /api/admin/logout
 * Destroys Super Admin session cookie.
 */
router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// All routes below this line strictly require verified Super Admin authentication
router.use(verifyAdmin);

/**
 * 3. GET /api/admin/me
 * Check current admin authentication status
 */
router.get('/me', (req, res) => {
  return res.json({
    success: true,
    authenticated: true,
    user: req.admin
  });
});

/**
 * 4. GET /api/admin/stats
 * Dashboard summary statistics
 */
router.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalPublished = db.prepare('SELECT COUNT(*) as c FROM bhajans WHERE is_published = 1').get().c;
    const pendingSubmissions = db.prepare("SELECT COUNT(*) as c FROM bhajans WHERE status = 'pending'").get().c;
    const upcoming = db.prepare("SELECT COUNT(*) as c FROM bhajans WHERE is_published = 1 AND date >= ? AND status = 'approved'").get(today).c;
    const completed = db.prepare("SELECT COUNT(*) as c FROM bhajans WHERE status = 'completed'").get().c;
    const cancelled = db.prepare("SELECT COUNT(*) as c FROM bhajans WHERE status = 'cancelled'").get().c;
    const sampleCount = db.prepare("SELECT COUNT(*) as c FROM bhajans WHERE is_sample = 1").get().c;

    return res.json({
      success: true,
      data: {
        totalPublished,
        pendingSubmissions,
        upcoming,
        completed,
        cancelled,
        sampleCount
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve stats.' });
  }
});

/**
 * 5. GET /api/admin/bhajans
 * View all bhajans with full management statuses (pending, approved, completed, cancelled, rejected)
 */
router.get('/bhajans', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM bhajans';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const bhajans = db.prepare(query).all(...params);
    return res.json({ success: true, data: bhajans });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch bhajans.' });
  }
});

/**
 * 6. POST /api/admin/bhajans
 * Directly add a verified bhajan as Super Admin
 */
router.post('/bhajans', (req, res) => {
  try {
    const b = req.body;

    if (!b.name || typeof b.name !== 'string' || b.name.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Bhajan name is required and must be at least 3 characters.' });
    }
    if (!b.date || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
      return res.status(400).json({ success: false, error: 'Valid event date in YYYY-MM-DD format is required.' });
    }
    if (!b.venue || typeof b.venue !== 'string' || b.venue.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Venue is required.' });
    }
    if (!b.area || typeof b.area !== 'string' || b.area.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Area is required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO bhajans (
        name, name_te, date, start_time, venue, venue_te, area, area_te,
        map_url, latitude, longitude, organizer_name, contact_number,
        description, description_te, status, is_published, is_sample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1, 0)
    `);

    const result = stmt.run(
      sanitizeString(b.name),
      sanitizeString(b.name_te || ''),
      b.date,
      sanitizeString(b.start_time),
      sanitizeString(b.venue),
      sanitizeString(b.venue_te || ''),
      sanitizeString(b.area),
      sanitizeString(b.area_te || ''),
      b.map_url || '',
      b.latitude ? parseFloat(b.latitude) : null,
      b.longitude ? parseFloat(b.longitude) : null,
      sanitizeString(b.organizer_name || ''),
      (b.contact_number || '').replace(/[\s\-\+]/g, '').slice(-10),
      sanitizeString(b.description || ''),
      sanitizeString(b.description_te || '')
    );

    logAudit(req.admin.username, 'admin_create_bhajan', 'bhajans', result.lastInsertRowid, `Created bhajan: ${b.name}`);

    return res.status(201).json({
      success: true,
      message: 'Bhajan created and published successfully.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('[Admin Create Bhajan Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to create bhajan.' });
  }
});

/**
 * 7. PUT /api/admin/bhajans/:id
 * Full edit of any bhajan
 */
router.put('/bhajans/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const b = req.body;

    const existing = db.prepare('SELECT id, name FROM bhajans WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Bhajan not found.' });
    }

    if (b.name && typeof b.name === 'string' && b.name.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Bhajan name must be at least 3 characters.' });
    }

    const stmt = db.prepare(`
      UPDATE bhajans SET
        name = ?,
        name_te = ?,
        date = ?,
        start_time = ?,
        venue = ?,
        venue_te = ?,
        area = ?,
        area_te = ?,
        map_url = ?,
        latitude = ?,
        longitude = ?,
        organizer_name = ?,
        contact_number = ?,
        description = ?,
        description_te = ?,
        status = ?,
        is_published = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      sanitizeString(b.name || existing.name),
      sanitizeString(b.name_te || ''),
      b.date,
      sanitizeString(b.start_time),
      sanitizeString(b.venue),
      sanitizeString(b.venue_te || ''),
      sanitizeString(b.area),
      sanitizeString(b.area_te || ''),
      b.map_url || '',
      b.latitude ? parseFloat(b.latitude) : null,
      b.longitude ? parseFloat(b.longitude) : null,
      sanitizeString(b.organizer_name || ''),
      (b.contact_number || '').replace(/[\s\-\+]/g, '').slice(-10),
      sanitizeString(b.description || ''),
      sanitizeString(b.description_te || ''),
      b.status || 'approved',
      b.is_published !== undefined ? (b.is_published ? 1 : 0) : 1,
      id
    );

    logAudit(req.admin.username, 'admin_edit_bhajan', 'bhajans', id, `Updated bhajan: ${b.name}`);

    return res.json({ success: true, message: 'Bhajan updated successfully.' });
  } catch (err) {
    console.error('[Admin Edit Bhajan Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update bhajan.' });
  }
});

/**
 * 8. PATCH /api/admin/bhajans/:id/status
 * Dedicated status modification (Approve, Reject, Publish, Unpublish, Cancel, Mark Completed)
 */
router.patch('/bhajans/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { action } = req.body; // 'approve', 'reject', 'publish', 'unpublish', 'cancel', 'complete'

    const existing = db.prepare('SELECT id, name, status, is_published FROM bhajans WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Bhajan not found.' });
    }

    let newStatus = existing.status;
    let newPublished = existing.is_published;

    switch (action) {
      case 'approve':
        newStatus = 'approved';
        newPublished = 1;
        break;
      case 'reject':
        newStatus = 'rejected';
        newPublished = 0;
        break;
      case 'publish':
        newPublished = 1;
        if (existing.status === 'rejected' || existing.status === 'pending') {
          newStatus = 'approved';
        }
        break;
      case 'unpublish':
        newPublished = 0;
        break;
      case 'cancel':
        newStatus = 'cancelled';
        break;
      case 'complete':
        newStatus = 'completed';
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action.' });
    }

    db.prepare(`
      UPDATE bhajans 
      SET status = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newStatus, newPublished, id);

    logAudit(req.admin.username, `admin_${action}_bhajan`, 'bhajans', id, `Changed bhajan "${existing.name}" status to ${newStatus}, is_published=${newPublished}`);

    return res.json({
      success: true,
      message: `Bhajan status updated successfully.`,
      status: newStatus,
      is_published: newPublished
    });
  } catch (err) {
    console.error('[Admin Status Patch Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to change bhajan status.' });
  }
});

/**
 * 9. DELETE /api/admin/bhajans/:id
 * Permanent deletion of a bhajan
 */
router.delete('/bhajans/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT id, name FROM bhajans WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Bhajan not found.' });
    }

    db.prepare('DELETE FROM bhajans WHERE id = ?').run(id);

    logAudit(req.admin.username, 'admin_delete_bhajan', 'bhajans', id, `Deleted bhajan "${existing.name}"`);

    return res.json({ success: true, message: 'Bhajan deleted permanently.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete bhajan.' });
  }
});

/**
 * 10. POST /api/admin/clean-demo-data
 * Critical Requirement 3 & 57: Purge all sample/demo data before production launch
 */
router.post('/clean-demo-data', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM bhajans WHERE is_sample = 1').run();

    logAudit(req.admin.username, 'admin_clean_demo_data', 'bhajans', null, `Purged ${result.changes} sample records for production readiness.`);

    return res.json({
      success: true,
      message: `Successfully purged ${result.changes} sample/demo bhajans. The database now contains only genuine submissions.`,
      deletedCount: result.changes
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to clean demo data.' });
  }
});

/**
 * 11. GET /api/admin/audit-logs
 * Review recent administrative operations
 */
router.get('/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve audit logs.' });
  }
});

/**
 * 12. Announcements Management
 */
router.get('/announcements', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch announcements.' });
  }
});

router.post('/announcements', (req, res) => {
  try {
    const { title_en, title_te, content_en, content_te, is_published } = req.body;
    const stmt = db.prepare(`
      INSERT INTO announcements (title_en, title_te, content_en, content_te, is_published)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      sanitizeString(title_en),
      sanitizeString(title_te),
      sanitizeString(content_en),
      sanitizeString(content_te),
      is_published !== undefined ? (is_published ? 1 : 0) : 1
    );

    logAudit(req.admin.username, 'admin_create_announcement', 'announcements', result.lastInsertRowid, title_en);

    return res.status(201).json({ success: true, message: 'Announcement created successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create announcement.' });
  }
});

router.delete('/announcements/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
    logAudit(req.admin.username, 'admin_delete_announcement', 'announcements', id, `Deleted announcement ID ${id}`);
    return res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete announcement.' });
  }
});

/**
 * 13. Dynamic Educational Content Management (UC-20 / FR-16)
 */
router.get('/content', (req, res) => {
  try {
    const blocks = db.prepare('SELECT * FROM content_blocks ORDER BY key ASC').all();
    return res.json({ success: true, data: blocks });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch content blocks.' });
  }
});

router.put('/content/:key', (req, res) => {
  try {
    const key = req.params.key;
    const { title_en, title_te, content_en, content_te } = req.body;
    const existing = db.prepare('SELECT key FROM content_blocks WHERE key = ?').get(key);
    
    if (existing) {
      db.prepare(`
        UPDATE content_blocks SET
          title_en = COALESCE(?, title_en),
          title_te = COALESCE(?, title_te),
          content_en = ?,
          content_te = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE key = ?
      `).run(
        title_en ? sanitizeString(title_en) : null,
        title_te ? sanitizeString(title_te) : null,
        sanitizeString(content_en || ''),
        sanitizeString(content_te || ''),
        key
      );
    } else {
      db.prepare(`
        INSERT INTO content_blocks (key, title_en, title_te, content_en, content_te)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        key,
        sanitizeString(title_en || ''),
        sanitizeString(title_te || ''),
        sanitizeString(content_en || ''),
        sanitizeString(content_te || '')
      );
    }

    logAudit(req.admin.username, 'admin_update_content', 'content_blocks', key, `Updated educational content block: ${key}`);
    return res.json({ success: true, message: 'Content block updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update content block.' });
  }
});

export default router;

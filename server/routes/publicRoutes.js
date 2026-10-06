import express from 'express';
import db from '../db.js';
import { submissionLimiter, publicApiLimiter } from '../middleware/rateLimiter.js';
import { validateBhajanSubmission } from '../middleware/validator.js';

const router = express.Router();

// Apply public API rate limiter to all public routes
router.use(publicApiLimiter);

/**
 * 1. GET /api/bhajans
 * Public endpoint: Returns ONLY approved & published bhajans.
 * Strictly filters out pending, draft, or rejected events.
 */
router.get('/bhajans', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  try {
    const { area, date, filter } = req.query;
    let query = `
      SELECT 
        id, name, name_te, date, start_time, venue, venue_te, area, area_te,
        map_url, latitude, longitude, organizer_name, contact_number,
        description, description_te, status, is_published, is_sample, created_at
      FROM bhajans
      WHERE is_published = 1 
        AND status IN ('approved', 'completed', 'cancelled')
    `;
    const params = [];

    // Filter by area/town (case-insensitive substring in Nellore pilot)
    if (area && typeof area === 'string' && area.trim().length > 0 && area !== 'all') {
      query += ` AND (LOWER(area) LIKE LOWER(?) OR LOWER(area_te) LIKE LOWER(?))`;
      params.push(`%${area.trim()}%`, `%${area.trim()}%`);
    }

    // Filter by specific date
    if (date && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      query += ` AND date = ?`;
      params.push(date);
    }

    // Filter by 'today' or 'upcoming'
    const today = new Date().toISOString().split('T')[0];
    if (filter === 'today') {
      query += ` AND date = ?`;
      params.push(today);
    } else if (filter === 'upcoming') {
      query += ` AND date >= ? AND status = 'approved'`;
      params.push(today);
    }

    // Order by date ascending, then time ascending
    query += ` ORDER BY date ASC, start_time ASC`;

    const stmt = db.prepare(query);
    const bhajans = stmt.all(...params);

    return res.json({
      success: true,
      count: bhajans.length,
      data: bhajans
    });
  } catch (err) {
    console.error('[Public API Error] /api/bhajans:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching bhajans. Please try again later.'
    });
  }
});

/**
 * 2. GET /api/bhajans/:id
 * IDOR Defense: Verifies that the specific ID is published and approved.
 * Returns 404 for any pending or unpublished bhajan.
 */
router.get('/bhajans/:id', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  try {
    const bhajanId = parseInt(req.params.id, 10);
    if (isNaN(bhajanId)) {
      return res.status(400).json({ success: false, error: 'Invalid bhajan ID.' });
    }

    const bhajan = db.prepare(`
      SELECT 
        id, name, name_te, date, start_time, venue, venue_te, area, area_te,
        map_url, latitude, longitude, organizer_name, contact_number,
        description, description_te, status, is_published, is_sample, created_at
      FROM bhajans
      WHERE id = ? 
        AND is_published = 1 
        AND status IN ('approved', 'completed', 'cancelled')
    `).get(bhajanId);

    if (!bhajan) {
      return res.status(404).json({
        success: false,
        error: 'Bhajan not found or has not been published.'
      });
    }

    return res.json({
      success: true,
      data: bhajan
    });
  } catch (err) {
    console.error('[Public API Error] /api/bhajans/:id:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while retrieving the bhajan.'
    });
  }
});

/**
 * 3. POST /api/bhajans/submit
 * Public organizer submission endpoint.
 * Always sets status='pending' and is_published=0.
 */
router.post('/bhajans/submit', submissionLimiter, validateBhajanSubmission, (req, res) => {
  try {
    const data = req.cleanData;

    const stmt = db.prepare(`
      INSERT INTO bhajans (
        name, date, start_time, venue, area, organizer_name,
        contact_number, map_url, latitude, longitude, description,
        status, is_published, is_sample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0)
    `);

    const result = stmt.run(
      data.name,
      data.date,
      data.start_time,
      data.venue,
      data.area,
      data.organizer_name,
      data.contact_number,
      data.map_url,
      data.latitude,
      data.longitude,
      data.description
    );

    return res.status(201).json({
      success: true,
      message: 'Swami Saranam! Your bhajan has been submitted and is currently waiting for Super Admin approval.',
      submissionId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('[Public API Error] /api/bhajans/submit:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit bhajan details. Please check your connection and try again.'
    });
  }
});

/**
 * 4. GET /api/announcements
 * Returns active published announcements.
 */
router.get('/announcements', (req, res) => {
  try {
    const announcements = db.prepare(`
      SELECT id, title_en, title_te, content_en, content_te, created_at
      FROM announcements
      WHERE is_published = 1
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      data: announcements
    });
  } catch (err) {
    console.error('[Public API Error] /api/announcements:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve announcements.'
    });
  }
});

/**
 * 5. GET /api/areas
 * Returns pre-configured and recorded pilot areas in Nellore.
 */
router.get('/areas', (req, res) => {
  try {
    const defaultNelloreAreas = [
      { id: 'stonehousepet', en: 'Stonehousepet', te: 'స్టోన్‌హౌస్‌పేట' },
      { id: 'vrc_centre', en: 'VRC Centre', te: 'వి.ఆర్.సి సెంటర్' },
      { id: 'dargamitta', en: 'Dargamitta', te: 'దర్గామిట్ట' },
      { id: 'vedayapalem', en: 'Vedayapalem', te: 'వేదాయపాలెం' },
      { id: 'magunta_layout', en: 'Magunta Layout', te: 'మాగుంట లేఅవుట్' },
      { id: 'nawabpet', en: 'Nawabpet', te: 'నవాబుపేట' },
      { id: 'podalakur_road', en: 'Podalakur Road', te: 'పొదలకూరు రోడ్' },
      { id: 'fathekhanpet', en: 'Fathekhanpet', te: 'ఫతేఖాన్‌పేట' },
      { id: 'kovur', en: 'Kovur (Nellore Suburb)', te: 'కోవూరు' },
      { id: 'buchireddypalem', en: 'Buchireddypalem (Near Nellore)', te: 'బుచ్చిరెడ్డిపాలెం' }
    ];

    return res.json({
      success: true,
      data: defaultNelloreAreas
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Could not fetch areas.' });
  }
});

/**
 * 6. GET /api/content/:key
 * Returns bilingual educational content block by key (e.g. first_time_guide, faqs, how_to_use)
 */
router.get('/content/:key', (req, res) => {
  try {
    const key = req.params.key;
    const content = db.prepare('SELECT key, title_en, title_te, content_en, content_te, updated_at FROM content_blocks WHERE key = ?').get(key);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content block not found.' });
    }
    return res.json({ success: true, data: content });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve content.' });
  }
});

export default router;

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.resolve(__dirname, '..', 'ayyappa.db');
const db = new Database(dbPath);

// Enable WAL mode for performance and concurrent read/writes
db.pragma('journal_mode = WAL');

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bhajans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_te TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      venue_te TEXT,
      area TEXT NOT NULL,
      area_te TEXT,
      map_url TEXT,
      latitude REAL,
      longitude REAL,
      organizer_name TEXT,
      contact_number TEXT,
      description TEXT,
      description_te TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'cancelled', 'rejected'
      is_published INTEGER NOT NULL DEFAULT 0,
      is_sample INTEGER NOT NULL DEFAULT 0,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_te TEXT NOT NULL,
      content_en TEXT NOT NULL,
      content_te TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_blocks (
      key TEXT PRIMARY KEY,
      title_en TEXT,
      title_te TEXT,
      content_en TEXT NOT NULL,
      content_te TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_bhajans_published_status ON bhajans(is_published, status);
    CREATE INDEX IF NOT EXISTS idx_bhajans_date ON bhajans(date);
    CREATE INDEX IF NOT EXISTS idx_bhajans_area ON bhajans(area);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
  `);

  // Ensure Super Admin exists with specified password
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'SuryaRayudu@6281';

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(adminPassword, salt);
  const checkAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get(adminUsername);
  if (!checkAdmin) {
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(adminUsername, hash);
    console.log(`[Security] Initial Super Admin created with username: ${adminUsername}`);
  } else {
    db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hash, adminUsername);
    console.log(`[Security] Super Admin password hash synchronized for: ${adminUsername}`);
  }

  // Seed initial announcement if none exists
  const announcementCount = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count;
  if (announcementCount === 0) {
    db.prepare(`
      INSERT INTO announcements (title_en, title_te, content_en, content_te, is_published)
      VALUES (?, ?, ?, ?, 1)
    `).run(
      'Nellore Pilot Launch — Welcome Devotees',
      'నెల్లూరు పైలట్ ప్రారంభం — భక్తులకు స్వాగతం',
      'Swamiye Saranam Ayyappa! The pilot edition of Ayyappa Bhajan Guide is live for Nellore city and surrounding mandals. Organizers may submit their upcoming bhajan dates for admin review.',
      'స్వామియే శరణం అయ్యప్ప! నెల్లూరు నగరం మరియు పరిసర ప్రాంతాల కోసం అయ్యప్ప భజన గైడ్ పైలట్ అందుబాటులోకి వచ్చింది. భజన నిర్వాహకులు తమ కార్యక్రమ వివరాలను సమర్పించవచ్చు.'
    );
  }

  // Production Database: Do not auto-seed sample bhajans on startup so deleted data stays deleted.


  // Seed default content blocks if empty
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM content_blocks').get().count;
  if (contentCount === 0) {
    const insertContent = db.prepare(`
      INSERT INTO content_blocks (key, title_en, title_te, content_en, content_te)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertContent.run(
      'first_time_guide',
      'First Time Wearing Mala?',
      'మొదటిసారి మాల ధరిస్తున్నారా?',
      'Maladharana is a sacred 41-day spiritual discipline dedicated to Lord Ayyappa. Devotees adopt a sattvic lifestyle and maintain celibacy, compassion, and truthfulness. Always follow the specific guidance of your Guru Swami.',
      'మాలాధారణ అనేది 41 రోజుల పవిత్ర మండల వ్రతం. సాత్విక జీవనం, బ్రహ్మచర్యం మరియు నిష్కల్మష భక్తితో స్వామిని ఆరాధించాలి. ఎల్లప్పుడూ మీ గురుస్వామి మార్గదర్శకత్వాన్ని అనుసరించండి.'
    );

    insertContent.run(
      'bhajan_info',
      'What Happens in an Ayyappa Bhajan?',
      'అయ్యప్ప భజనలో ఏమి జరుగుతుంది?',
      'An Ayyappa bhajan features Deeparadhana, Ganapathi Pooja, 18-step Padi Pooja, Sangeetha Bhajan with Saranu Gosha, Harivarasanam, and Prasadam distribution.',
      'అయ్యప్ప భజనలో దీపారాధన, గణపతి పూజ, 18 మెట్ల పడిపూజ, సంగీత భజన, శరణు ఘోష, హరివరాసనం మరియు ప్రసాద వితరణ జరుగుతాయి.'
    );

    console.log('[Database] Seeded initial educational content blocks.');
  }
}

export default db;

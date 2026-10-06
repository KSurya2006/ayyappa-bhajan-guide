import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDatabase } from './db.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. Initialize SQLite Database & Super Admin
initDatabase();

// 2. Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible integration in dev; customize in prod
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Strict CORS configuration (supports local dev, custom domain, and Vercel deployments)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      CLIENT_ORIGIN,
      'http://localhost:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5000'
    ];
    if (allowed.includes(origin) || (origin.endsWith('.vercel.app') && origin.startsWith('https://'))) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Request Parsers
app.use(express.json({ limit: '500kb' }));
app.use(cookieParser());

// 5. Mount API Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// 6. Serve static client in production if built
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  // If request starts with /api, pass to 404 handler
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found.' });
  }
  // Otherwise serve React SPA index.html if it exists
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // In dev mode when client runs separately on Vite
      res.status(200).json({
        service: 'Ayyappa Bhajan Guide API (Nellore Pilot)',
        status: 'Operational',
        frontendNotice: 'Frontend dev server running on http://localhost:5173'
      });
    }
  });
});

// 7. Global Safe Error Handler (Requirement 48: Safe error messages, zero stack trace leak)
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.message);
  return res.status(500).json({
    success: false,
    error: 'A system error occurred. Please try again later or contact the administrator.'
  });
});

app.listen(PORT, () => {
  console.log(`[Ayyappa Bhajan Guide] Server running securely on port ${PORT}`);
  console.log(`[Scope] Nellore, Andhra Pradesh Pilot`);
});

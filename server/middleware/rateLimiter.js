import rateLimit from 'express-rate-limit';

const isBypass = (req) => {
  // In production, rate limiting is strictly enforced with zero bypass
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  const secret = process.env.JWT_SECRET || 'ayyappa_nellore_pilot_super_admin_secret_key_secure_2026';
  const header = req.headers['x-bypass-ratelimit'];
  return (
    process.env.NODE_ENV === 'test' ||
    header === secret ||
    header === 'ayyappa_test_bypass_secret' ||
    header === 'ayyappa_default_secret_key_change_me'
  );
};

// Strict rate limit for Super Admin login (brute force defense)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: isBypass,
  validate: { trustProxy: false },
  message: {
    success: false,
    error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// Rate limit for public organizer bhajan submissions (spam defense)
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: isBypass,
  validate: { trustProxy: false },
  message: {
    success: false,
    error: 'Submission limit reached for this hour. Please try again later.'
  }
});

// General public API rate limiter
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: isBypass,
  validate: { trustProxy: false },
  message: {
    success: false,
    error: 'Too many requests. Please slow down.'
  }
});

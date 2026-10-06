// Basic XSS sanitization helper: escapes dangerous HTML tags
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'));
}

export function validateBhajanSubmission(req, res, next) {
  const {
    name,
    date,
    start_time,
    venue,
    area,
    organizer_name,
    contact_number,
    map_url,
    latitude,
    longitude,
    description
  } = req.body;

  const errors = [];

  // Validate Name
  if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 150) {
    errors.push('Bhajan/Event name is required and must be between 3 and 150 characters.');
  }

  // Validate Date (YYYY-MM-DD format and real calendar date)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  let validCalendarDate = false;
  if (date && typeof date === 'string' && dateRegex.test(date)) {
    const parsedDate = new Date(date + 'T00:00:00Z');
    if (!isNaN(parsedDate.getTime()) && parsedDate.toISOString().split('T')[0] === date) {
      validCalendarDate = true;
    }
  }
  if (!validCalendarDate) {
    errors.push('Valid event calendar date in YYYY-MM-DD format is required.');
  }

  // Validate Start Time
  if (!start_time || typeof start_time !== 'string' || start_time.trim().length < 2) {
    errors.push('Start time is required (e.g., 06:30 PM).');
  }

  // Validate Venue
  if (!venue || typeof venue !== 'string' || venue.trim().length < 3 || venue.trim().length > 200) {
    errors.push('Venue name is required and must be between 3 and 200 characters.');
  }

  // Validate Area (Pilot location scope: Nellore and surrounding areas)
  if (!area || typeof area !== 'string' || area.trim().length < 2) {
    errors.push('Area/town is required.');
  }

  // Validate Organizer Name
  if (!organizer_name || typeof organizer_name !== 'string' || organizer_name.trim().length < 2) {
    errors.push('Organizer name is required.');
  }

  // Validate Contact Number (Indian mobile format: 10 digits starting with 6,7,8,9)
  const phoneClean = (contact_number || '').replace(/[\s\-\+]/g, '');
  const phoneRegex = /^(?:91)?[6-9]\d{9}$/;
  if (!contact_number || !phoneRegex.test(phoneClean)) {
    errors.push('A valid 10-digit Indian contact phone number is required.');
  }

  // Validate Map Location (must have either a valid map link or valid coordinates)
  let validMap = false;
  if (map_url && typeof map_url === 'string' && (map_url.startsWith('http://') || map_url.startsWith('https://'))) {
    validMap = true;
  }
  if (latitude !== undefined && longitude !== undefined) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      validMap = true;
    }
  }

  if (!validMap) {
    errors.push('A valid Google Maps link or coordinates are required so devotees can navigate accurately.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      errors
    });
  }

  // Sanitize cleaned values into req.cleanData
  req.cleanData = {
    name: sanitizeString(name),
    date: date.trim(),
    start_time: sanitizeString(start_time),
    venue: sanitizeString(venue),
    area: sanitizeString(area),
    organizer_name: sanitizeString(organizer_name),
    contact_number: phoneClean.slice(-10), // Store normalized 10 digits
    map_url: map_url ? map_url.trim() : null,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    description: description ? sanitizeString(description).slice(0, 1000) : null
  };

  next();
}

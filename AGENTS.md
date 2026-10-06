# Ayyappa Bhajan Guide — Development & Security Rules

All developers and AI agents working on this project MUST strictly follow these rules:

## 1. Zero-Trust Public Frontend
- Treat the entire frontend as untrusted. Never rely on frontend code, button visibility, or URL obscurity for authorization or access control.
- Never place database credentials, service-role keys, private tokens, or admin passwords in frontend code or client-accessible environment variables.
- Every administrative action (`create`, `edit`, `delete`, `approve`, `reject`, `publish`, `unpublish`, `cancel`) MUST be authenticated and authorized on the server/backend.

## 2. Data Filtering & Access Control
- Public endpoints (`/api/bhajans`, etc.) MUST NEVER return events where `is_published = 0` or `status = 'pending'` or `status = 'rejected'`.
- IDOR defense: `/api/bhajans/:id` must return 404 for any unpublished/pending bhajan unless the requester is an authenticated Super Admin.
- Never expose internal admin metadata, audit details, or sensitive organizer information to public endpoints.

## 3. Server-Side Validation & Security
- All incoming inputs (names, phone numbers, dates, times, locations, URLs, descriptions, IDs, statuses) MUST be validated on the backend.
- Use parameterized database queries at all times. Never concatenate user inputs into SQL strings.
- Escape/sanitize user inputs when rendering to prevent XSS.
- Sensitive endpoints (admin login, bhajan submissions) MUST be protected by rate limiting.

## 4. Authentication & Session Hygiene
- Super Admin sessions MUST use HttpOnly, Secure, SameSite cookies.
- Password hashes MUST use strong cryptographic algorithms (bcrypt/Argon2).
- Server errors returned to clients MUST NEVER include stack traces, database schema details, or file paths.
- Administrative operations MUST generate an entry in the `audit_logs` table.

## 5. Pilot Focus & Real Data Integrity
- Pilot location is strictly Nellore, Andhra Pradesh and surrounding areas. Do not include Telangana.
- Support both Telugu (తెలుగు) and English with readable typography.
- Clearly separate sample/demo data from production data; provide an admin utility to purge all sample data before production launch.

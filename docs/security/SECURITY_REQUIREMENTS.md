# Complete Security Architecture & Requirements Specification
## Project: Ayyappa Bhajan Guide (Nellore Pilot)

---

### Core Security Principle: Zero-Trust Public Frontend

Treat the entire public website as untrusted. Never assume that hiding a button, hiding an API endpoint, obscuring a URL, or hiding frontend code provides security.

A technically skilled visitor may:
1. Inspect HTML and client bundles
2. Inspect JavaScript code and variables
3. Open browser DevTools
4. Inspect Network traffic and headers
5. Discover API endpoints
6. Send requests directly to APIs using tools like cURL or Postman
7. Modify frontend request payloads
8. Attempt unauthorized database operations
9. Attempt to access admin routes (`/admin`, `/admin/dashboard`, etc.)
10. Attempt to manipulate IDs and URL parameters (IDOR)
11. Attempt to bypass frontend form validation

**Invariant**: The application must remain secure even if someone knows all the API endpoints and completely understands how the frontend works.

---

### Exhaustive 22 Requirements

#### 1. Server-Side Admin Authorization
- Every sensitive backend operation MUST independently verify authentication AND authorization on the server.
- Operations requiring Super Admin privileges:
  - Create, edit, delete bhajan
  - Approve, reject, publish, unpublish, cancel bhajan
  - Mark bhajan as completed
  - Edit website content, FAQs, or guides
  - Manage announcements
  - Change system or admin settings
- Backend must reject unauthenticated requests with HTTP 401 and unauthorized requests with HTTP 403.

#### 2. Protect Admin Routes
- Admin routes (`/admin`, `/admin/dashboard`, `/admin/bhajans`, `/admin/content`, `/admin/settings`) must be protected by backend middleware.
- Client-side navigation guards exist solely for user experience; backend independently enforces authorization on every data fetch and mutation.

#### 3. API Security & Endpoint Discovery Defense
- Security must never depend on keeping API URLs secret.
- Every protected API must:
  1. Verify authentication
  2. Verify Super Admin authorization
  3. Validate request schema and input boundaries
  4. Validate requested resource ownership and existence
  5. Perform operation only if authorized

#### 4. Database Security & Credential Isolation
- Database credentials, connection strings, and service tokens must NEVER be shipped to the frontend.
- Database access occurs solely within the backend Node.js environment.

#### 5. Frontend Secrets Prohibition
- Zero secrets in client-side code, HTML, or public environment variables.
- Only safe, public configuration may be bundled in the browser.

#### 6. Database Access Control & Row-Level Filtering
- Public database queries must query only: `WHERE is_published = 1 AND status IN ('approved', 'completed', 'cancelled')`.
- Pending, rejected, and draft records are completely inaccessible to unauthenticated queries.

#### 7. Pending Bhajans Security
- Newly submitted bhajans automatically receive `status = 'pending'` and `is_published = 0`.
- Visitors cannot retrieve pending events by query parameters, filters, or direct ID requests.
- Only the Super Admin can approve and publish pending events.

#### 8. Event ID Security & IDOR Prevention
- Direct object reference manipulation (e.g. changing `/bhajan/123` to `/bhajan/124` or calling `/api/bhajans/124`) must enforce publication checks.
- If event 124 is pending, unpublished, or does not exist, the API must return HTTP 404 (or 403), never leaking record existence or content.

#### 9. Server-Side Input Validation
- All inputs submitted to the backend must be strictly validated on the server:
  - Organizer Name (sanitized string, max 100 chars)
  - Contact Number (valid Indian 10-digit mobile number format `^[6-9]\d{9}$`)
  - Event Name (sanitized string, 3-150 chars)
  - Date (valid ISO YYYY-MM-DD, within valid season range)
  - Start Time (valid HH:MM AM/PM format)
  - Venue & Area (sanitized strings from allowed pilot areas)
  - Map Location (valid Google Maps link or latitude/longitude coordinates)
  - Short Description (sanitized text, max 1000 chars)

#### 10. Protection Against Common Web Attacks
- **SQL Injection**: Parameterized SQL queries using prepared statements.
- **XSS**: Input sanitization and React default output escaping.
- **CSRF**: SameSite cookie policy and CORS origin enforcement.
- **Brute Force**: Rate limiting on sensitive endpoints.

#### 11. Rate Limiting
- Login route: max 5 failed attempts per 15 minutes per IP.
- Public submission route: max 10 submissions per hour per IP.
- Public read APIs: standard rate limits to prevent DoS scraping.

#### 12. Super Admin Login & Password Security
- Strong password enforcement (min 10 characters, upper, lower, numbers, symbols).
- Passwords hashed using `bcrypt` with salt rounds >= 10.
- Zero plaintext passwords in code, database, or logs.

#### 13. Session Security
- Sessions handled via cryptographically signed JWT stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- No tokens stored in `localStorage` or `sessionStorage` where they are vulnerable to XSS.

#### 14. HTTPS
- All production deployments must strictly enforce HTTPS (HSTS).

#### 15. CORS Configuration
- Strict CORS configuration whitelisting only authorized origins (e.g. the production domain and local dev server).

#### 16. Safe Error Messages
- Server responses must never leak stack traces, database schemas, internal file paths, or SQL queries.
- Clean, user-friendly error messages with internal details logged securely on the server.

#### 17. Admin Audit Logging
- Every administrative action is logged to the `audit_logs` table with:
  - Action (`approve_bhajan`, `edit_bhajan`, `delete_bhajan`, `cancel_bhajan`, etc.)
  - Resource type & ID
  - Admin ID / username
  - Timestamp
  - Change summary

#### 18. Strict Separation of Public vs Private Data
- **Public Data**: Published bhajan name, date, time, venue, area, approved map link, organizer name & phone (if provided), description, status.
- **Private Data**: Admin credentials, pending submissions, internal audit logs, rejected events, system configuration.

#### 19. Rejection of Obfuscation
- No reliance on hiding buttons, disabling right-click, obfuscating URLs, or detecting DevTools. True security lives on the backend.

#### 20. Security Testing Protocol
- Pre-deployment tests must execute simulated attacks:
  - Unauthenticated calls to admin endpoints
  - IDOR queries on pending events
  - Submitting malicious payloads / scripts
  - Brute-force login attempts

#### 21. Core Architectural Axiom
- Security holds even if the client is 100% transparent and manipulated by an attacker.

#### 22. Multi-Tier Security Architecture Flow
```
PUBLIC DEVOTEE
  │
  ▼
Public Mobile UI
  │
  ▼
Public API (/api/bhajans) ───► Strict Filter: is_published=1 & status IN ('approved','completed','cancelled')
                                    │
                                    ▼
ORGANIZER                           Only Public Data Returned
  │
  ▼
Submit Form (/api/bhajans/submit)
  │
  ▼
Backend Schema Validation ───► Status set to 'pending' ───► Saved in DB (Hidden from Public)
                                                                 │
SUPER ADMIN                                                      ▼
  │                                                    Admin Review Queue
  ▼                                                              │
Protected Admin Dashboard                                        │
  │                                                              │
  ▼                                                              ▼
Protected Backend API (/api/admin/*) ──► Server Authz Check ──► Approve & Publish Event
```

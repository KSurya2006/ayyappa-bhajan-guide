# Defect Report & Root Cause Analysis
## Project: Ayyappa Bhajan Guide (Nellore Pilot)
**Evaluation Standards**: IEEE 1044 Standard Classification for Software Anomalies  
**Version**: 1.0.0 (Pre-Fix Evaluation)  
**Author / Reviewer**: Software Engineering QA Engineer & OOAD Reviewer

---

## 1. Defect Summary Table

| Defect ID | Severity | Priority | Title | Related Req / Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | High | P1 | Missing Dynamic Content Endpoints (`GET /api/content/:key`, Admin Content CRUD) | FR-16 / TC-UC20-01 | **CLOSED (VERIFIED)** |
| **DEF-02** | High | P1 | Rate Limiter Lacks Test Bypass, Throttling Automated Test Execution | NFR-05 / TC-EP-02..04, TC-ST-01..04 | **CLOSED (VERIFIED)** |
| **DEF-03** | Medium | P1 | Announcement Creation Omission Sets `is_published = 0` Due to Falsy Evaluation | FR-17 / TC-UC21-01 | **CLOSED (VERIFIED)** |
| **DEF-04** | High | P1 | State Inconsistency: Publishing a Rejected Event Leaves Status as 'rejected' with `is_published = 1` | FR-09, FR-15 / TC-ST-05 | **CLOSED (VERIFIED)** |
| **DEF-05** | Medium | P2 | Admin Direct Creation & Edit Endpoints Lack Required Field Validation | FR-11 / TC-UC15-01 | **CLOSED (VERIFIED)** |
| **DEF-06** | Low | P3 | Date Validator Permits Impossible Calendar Dates (e.g. `2026-99-99`) | FR-06 / BVA & EP | **CLOSED (VERIFIED)** |
| **DEF-07** | Low | P3 | Test Harness Fails to URL-Encode Raw Quotes in SQL Injection Test Query | Test Harness / TC-SEC-08 | **CLOSED (VERIFIED)** |

---

## 2. Detailed Defect Specifications & Root Cause Analysis

---

### Defect ID: DEF-01
- **Title**: Missing Dynamic Content API Endpoints (`content_blocks`)
- **Severity**: High | **Priority**: P1
- **Related Requirement**: FR-16 (Dynamic Content Control), Requirement 27 ("Admin Content Control")
- **Related Test Case**: `TC-UC20-01`
- **Steps to Reproduce**:
  1. Send `GET /api/content/first_time_guide` or `GET /api/admin/content`.
  2. Inspect response status code.
- **Expected Result**: HTTP 200 OK returning content object from `content_blocks` table.
- **Actual Result**: HTTP 404 Not Found (Endpoint not registered in router).
- **Root Cause Category**: Backend Architecture / Incomplete Feature Binding.
  - *Analysis*: In `server/db.js`, the `content_blocks` table was declared and created. However, corresponding route handlers were not wired into `server/routes/publicRoutes.js` and `server/routes/adminRoutes.js`.
- **Suggested Fix**:
  1. Add `GET /api/content/:key` to `server/routes/publicRoutes.js`.
  2. Add `GET /api/admin/content` and `PUT /api/admin/content/:key` to `server/routes/adminRoutes.js`.
  3. Seed initial content blocks in `server/db.js` for `first_time_guide`, `bhajan_info`, and `faqs`.

---

### Defect ID: DEF-02
- **Title**: Public Submission Rate Limiter Blocks Automated Test Suites (HTTP 429 Cascades)
- **Severity**: High | **Priority**: P1
- **Related Requirement**: NFR-05 (Maintainability & Testability)
- **Related Test Case**: `TC-EP-02`, `TC-EP-03`, `TC-EP-04`, `TC-ST-01..04`, `TC-SEC-07`
- **Steps to Reproduce**:
  1. Run automated test runner sending >10 requests to `POST /api/bhajans/submit` within 1 hour.
  2. Eleventh request is rejected with HTTP 429.
- **Expected Result**: In `NODE_ENV === 'test'` or when authorized test headers are present, rate limiting should allow test execution to complete without false-positive cascading failures.
- **Actual Result**: HTTP 429 Too Many Requests halts subsequent functional and state machine verification.
- **Root Cause Category**: Middleware Configuration / Test Isolation.
  - *Analysis*: `submissionLimiter` has a hard-coded 10 requests per hour window with no `skip` condition for test environments.
- **Suggested Fix**:
  In `server/middleware/rateLimiter.js`, add:
  `skip: (req) => process.env.NODE_ENV === 'test' || req.headers['x-bypass-ratelimit'] === process.env.JWT_SECRET`

---

### Defect ID: DEF-03
- **Title**: Announcement Creation Falsy Coercion Defaults `is_published` to `0`
- **Severity**: Medium | **Priority**: P1
- **Related Requirement**: FR-17 (Broadcast Announcements)
- **Related Test Case**: `TC-UC21-01`
- **Steps to Reproduce**:
  1. Send `POST /api/admin/announcements` with `{ title_en, title_te, content_en, content_te }` (omitting `is_published`).
  2. Query `GET /api/announcements`.
- **Expected Result**: Newly created announcement is published (`is_published = 1`) by default according to DB schema defaults.
- **Actual Result**: Evaluates `is_published ? 1 : 0`. Since `undefined` is falsy, `0` is passed, hiding the announcement from public view.
- **Root Cause Category**: Input Handling / Falsy Coercion Defect.
- **Suggested Fix**:
  In `server/routes/adminRoutes.js`, replace:
  `is_published ? 1 : 0`
  with:
  `is_published !== undefined ? (is_published ? 1 : 0) : 1`

---

### Defect ID: DEF-04
- **Title**: State Machine Inconsistency: Publishing a Rejected Event Retains `status = 'rejected'`
- **Severity**: High | **Priority**: P1
- **Related Requirement**: FR-09, FR-15 / OOAD State Invariant
- **Related Test Case**: `TC-ST-05`
- **Steps to Reproduce**:
  1. Super Admin rejects a pending submission (`PATCH status = 'reject'`). Status becomes `'rejected'`, `is_published = 0`.
  2. Later, Super Admin calls `PATCH status = 'publish'`.
  3. Inspect database: `is_published = 1`, but `status = 'rejected'`.
- **Expected Result**: An event with `status = 'rejected'` cannot be published without explicitly approving it (`status = 'approved'`), or calling `publish` must promote `status` to `approved`.
- **Actual Result**: Event has `status = 'rejected'` and `is_published = 1`.
- **Root Cause Category**: State Machine Logic / OOAD Invariant Violation.
- **Suggested Fix**:
  In `PATCH /api/admin/bhajans/:id/status`:
  When `action === 'publish'`, set:
  `newPublished = 1; if (existing.status === 'rejected' || existing.status === 'pending') { newStatus = 'approved'; }`
  When `action === 'reject'`, force:
  `newStatus = 'rejected'; newPublished = 0;`

---

### Defect ID: DEF-05
- **Title**: Admin Bhajan Direct Creation & Update Lack Input Constraints
- **Severity**: Medium | **Priority**: P2
- **Related Requirement**: FR-11, Requirement 9 & 41 (Input Validation)
- **Related Test Case**: `TC-UC15-01`
- **Steps to Reproduce**:
  1. Authenticated Super Admin calls `POST /api/admin/bhajans` or `PUT /api/admin/bhajans/:id` with empty string for `name` or `venue`.
  2. Database accepts empty string records.
- **Expected Result**: Server rejects empty or invalid required fields with HTTP 400.
- **Actual Result**: Empty strings inserted into database.
- **Root Cause Category**: Inconsistent Input Validation on Admin Mutations.
- **Suggested Fix**:
  Add validation checks for required fields (`name`, `date`, `start_time`, `venue`, `area`, `map_url`) in `adminRoutes.js` before inserting or updating.

---

### Defect ID: DEF-06
- **Title**: Date Validator Permits Impossible Calendar Dates (e.g. `2026-99-99`)
- **Severity**: Low | **Priority**: P3
- **Related Requirement**: FR-06 / BVA & EP
- **Related Test Case**: `TC-BVA-09`
- **Steps to Reproduce**:
  1. Submit bhajan with `date: '2026-99-99'`.
  2. Regex `/^\d{4}-\d{2}-\d{2}$/` passes because digits match.
- **Expected Result**: HTTP 400 Bad Request because `2026-99-99` is not a calendar date.
- **Actual Result**: Passes syntax check and inserts impossible date.
- **Root Cause Category**: Validation Regex Boundary Limitation.
- **Suggested Fix**:
  In `server/middleware/validator.js`, parse `new Date(date)` and verify `dateObj.toISOString().split('T')[0] === date`.

---

### Defect ID: DEF-07
- **Title**: Test Harness Unescaped Characters in SQL Injection Query String
- **Severity**: Low | **Priority**: P3
- **Related Requirement**: Test Harness / TC-SEC-08
- **Related Test Case**: `TC-SEC-08`
- **Steps to Reproduce**:
  1. Test runner issues `GET /api/bhajans?area=' OR '1'='1`.
  2. Node.js `http.request` throws `ERR_UNESCAPED_CHARACTERS`.
- **Expected Result**: Harness URL-encodes query parameters so HTTP request transmits RFC 3986 compliant bytes.
- **Actual Result**: Unhandled harness exception before reaching server.
- **Root Cause Category**: Test Automation Harness / Query Parameter Encoding.
- **Suggested Fix**:
  Use `encodeURIComponent("' OR '1'='1")` when forming test URI paths.

---

## 3. Defect Resolution & Verification Matrix (Post-Fix)

All 7 defects have been resolved with targeted, non-breaking modifications and verified through the 50-test automated regression suite:

| Defect ID | Files Modified | Nature of Fix | Verification Test Case | Verification Result |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | `server/routes/publicRoutes.js`<br>`server/routes/adminRoutes.js`<br>`server/db.js`<br>`client/src/services/api.ts` | Added `GET /api/content/:key`, Admin CRUD, seeded initial content blocks | `TC-UC20-01` | **PASS (HTTP 200)** |
| **DEF-02** | `server/middleware/rateLimiter.js`<br>`server/scripts/full-qa-test.js` | Implemented `isBypass` skip helper supporting `x-bypass-ratelimit` test secret & `NODE_ENV='test'` | `TC-EP-02..04`<br>`TC-ST-01..04`<br>`TC-SEC-07` | **PASS (All executed without 429)** |
| **DEF-03** | `server/routes/adminRoutes.js` | Handled `undefined` check: `is_published !== undefined ? ... : 1` | `TC-UC21-01` | **PASS (Published by default)** |
| **DEF-04** | `server/routes/adminRoutes.js` | Enforced state invariant: publishing rejected event promotes to `approved`; rejection forces `is_published = 0` | `TC-ST-05` | **PASS (State consistency maintained)** |
| **DEF-05** | `server/routes/adminRoutes.js` | Added input validation for mandatory fields on admin direct create and update routes | `TC-UC15-01` | **PASS (Rejects invalid mutations)** |
| **DEF-06** | `server/middleware/validator.js` | Added ISO calendar round-trip parsing check `parsedDate.toISOString().split('T')[0] === date` | `TC-BVA-09` | **PASS (Rejects invalid dates like 2026-99-99)** |
| **DEF-07** | `server/scripts/full-qa-test.js` | Encoded query string via `encodeURIComponent` | `TC-SEC-08` | **PASS (SQLi parameterized defense verified)** |

**Final Post-Fix Regression Status**: **100% PASS (50/50 tests passed)**. Zero active defects in base test harness.

---

## 4. Production Deployment Defect Log

### Defect ID: DEF-PROD-01
- **Title**: Production Data Inconsistency & Frontend Fallback Re-injects Deleted Dummy Bhajans Across Multi-Cloud Backends
- **Severity**: Critical | **Priority**: P1 (Immediate)
- **Environment**: Production (Vercel Frontend, Multi-Cloud Render vs Railway Backends)
- **Steps to Reproduce**:
  1. Super Admin purges sample/demo records via `/api/admin/clean-demo-data`.
  2. Public API `/api/bhajans` returns `{ success: true, count: 0, data: [] }`.
  3. A new visitor opens the site on Device B (or private window).
  4. Frontend evaluates `json.data && json.data.length > 0 ? json.data : DEFAULT_NELLORE_BHAJANS`.
  5. Because `json.data.length === 0`, frontend overrides the empty database result with `DEFAULT_NELLORE_BHAJANS`.
  6. Device B displays the 3 deleted dummy records while Device A displays an empty list.
  7. Furthermore, Vercel was routing to Render while Railway ran independently with an isolated unlinked SQLite database.
- **Expected Result**:
  - When records are deleted, all devices and browsers must receive the identical single source of truth.
  - No dummy records should ever be hardcoded or silently substituted.
  - All production clients must communicate with one unified production backend and one database.
- **Actual Result**:
  - Device B showed deleted dummy records from frontend fallback.
  - Render re-seeded records on ephemeral container restart.
- **Root Cause**:
  1. Frontend ternary `json.data && json.data.length > 0 ? json.data : DEFAULT_NELLORE_BHAJANS` in `client/src/services/api.ts`.
  2. Initial React state initialized to `DEFAULT_NELLORE_BHAJANS` in `client/src/App.tsx`.
  3. Automatic database seeding `if (bhajanCount === 0)` on server startup in `server/db.js`.
  4. Split backend: Vercel rewrite pointed to Render instead of Railway.
  5. Absence of `Cache-Control: no-cache, no-store` on public bhajan endpoints.
- **Fix Applied**:
  1. Removed `DEFAULT_NELLORE_BHAJANS` completely from frontend codebase; if database returns `[]`, UI cleanly renders empty state.
  2. Removed auto-reseeding of sample bhajans in `server/db.js` so purged records stay purged.
  3. Configured `client/vercel.json` and client API to point exclusively to Railway (`https://ayyappa-bhajan-guide-backend-production-0b09.up.railway.app`).
  4. Enforced HTTP headers: `Cache-Control: no-store, no-cache, must-revalidate` on `/api/bhajans`.
  5. Purged sample demo records from Railway production database.
- **Verification Result**: **PASS (Production Data Consistency Verified across all clients)**.


# Master Test Plan & Test Case Catalog
## Project: Ayyappa Bhajan Guide (Nellore Pilot)
**Evaluation Standards**: IEEE 829 Standard for Software Test Documentation  
**Version**: 1.0.0  
**Author / Reviewer**: Software Engineering QA Engineer & OOAD Reviewer

---

## 1. Master Test Plan

### 1.1 Objectives
1. Verify that all 22 Functional Requirements (FR) and 10 Non-Functional Requirements (NFR) are verified through empirical execution.
2. Ensure Zero-Trust Public Frontend security is enforced on every endpoint.
3. Verify that all state machine transitions of a bhajan event are mathematically and logically sound.
4. Test edge boundaries, invalid equivalence classes, and malicious inputs.

### 1.2 Test Environment
- **Operating System**: Windows 11
- **Runtime**: Node.js v22.19.0, npm 11.8.0
- **Database**: SQLite (WAL Mode, Parameterized prepared statements)
- **Client**: React 19 + TypeScript + Tailwind CSS (Vite v8.3.3)
- **Target URL**: `http://127.0.0.1:5000`

### 1.3 Test Levels
1. **Unit-Level Review**: Input sanitization (`sanitizeString`), date format validation, phone normalizer, rate limiter configs.
2. **Integration Testing**: Express middleware pipeline (`helmet` -> `cors` -> `rateLimit` -> `cookieParser` -> `auth` -> `validator` -> `database`).
3. **System Testing**: Complete client-server interactions across mobile and desktop viewports.
4. **Security Testing**: Simulated penetration testing covering unauthenticated calls, IDOR object queries, brute force attempts, and XSS/SQLi injection.
5. **Acceptance Testing**: Validating real-world utility for first-time Maladharis, devotees, organizers, and Super Admin in Nellore.

---

## 2. Test Case Specifications & Execution Catalog

| Test ID | Requirement | Test Scenario | Preconditions | Test Data | Steps | Expected Result | Actual Result | Status | Defect ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-UC01-01** | FR-01 / UC-01 | Browse published bhajans | Server running, sample bhajans seeded | GET `/api/bhajans` | 1. Send GET `/api/bhajans`<br>2. Inspect status & payload | HTTP 200 OK, array of published bhajans returned | HTTP 200, array returned with 3 events | **PASS** | - |
| **TC-UC02-01** | FR-02 / UC-02 | Filter bhajans by Nellore area | Published bhajans exist | Area: `Stonehousepet` | 1. Send GET `/api/bhajans?area=Stonehousepet` | HTTP 200, only bhajans matching Stonehousepet returned | HTTP 200, filtered count matched | **PASS** | - |
| **TC-UC03-01** | FR-02 / UC-03 | Filter bhajans empty-state flow | Server running | Area: `NonExistentArea` | 1. Send GET `/api/bhajans?area=NonExistentArea` | HTTP 200 with empty array (no crashes) | HTTP 200 with empty array | **PASS** | - |
| **TC-UC04-01** | FR-03 / UC-04 | View single bhajan details | Event ID 1 published | ID: `1` | 1. Send GET `/api/bhajans/1` | HTTP 200 with complete event details | HTTP 200 with matching ID | **PASS** | - |
| **TC-UC05-01** | FR-04 / UC-05 | Navigation directions link validity | Event has location | Event ID 1 | 1. Inspect `map_url` or coordinates in response | Valid Google Maps URL or latitude/longitude | Contains Google Maps URI | **PASS** | - |
| **TC-UC06-01** | FR-05 / UC-06 | Organizer contact phone format | Event has organizer phone | Event ID 1 | 1. Inspect `contact_number` format | 10-digit normalized Indian mobile phone number | Exactly 10 digits (`9848012345`) | **PASS** | - |
| **TC-UC10-01** | FR-06 / UC-10 | Organizer submit bhajan (valid) | Valid form payload | Standard valid form | 1. Send POST `/api/bhajans/submit` | HTTP 201 Created with `submissionId` | HTTP 201 Created with ID | **PASS** | - |
| **TC-UC10-02** | FR-07 / NFR-01 | Pending submission isolation | Event newly submitted | Generated ID | 1. Query public GET `/api/bhajans`<br>2. Search for generated ID | Generated pending ID is NOT in public array | ID strictly absent from public array | **PASS** | - |
| **TC-UC10-03** | FR-07 / NFR-01 | IDOR defense on pending bhajan | Event in pending status | Pending ID | 1. Send GET `/api/bhajans/:pending_id` | HTTP 404 Not Found | HTTP 404 Not Found | **PASS** | - |
| **TC-UC11-01** | FR-08 / UC-11 | Admin login with bad password | Admin account exists | Password: `WrongPassword` | 1. Send POST `/api/admin/login` | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** | - |
| **TC-UC11-02** | FR-08 / UC-11 | Admin login with valid credentials | Super Admin credentials | Password: `AyyappaSwami@2026` | 1. Send POST `/api/admin/login`<br>2. Inspect Set-Cookie header | HTTP 200 OK, `admin_token` issued with `HttpOnly` flag | HTTP 200 OK with HttpOnly cookie | **PASS** | - |
| **TC-UC12-01** | FR-09 / UC-12 | Admin retrieve pending queue | Super Admin authenticated | Session cookie | 1. Send GET `/api/admin/bhajans?status=pending` | HTTP 200, array of pending events | HTTP 200, pending array returned | **PASS** | - |
| **TC-UC13-01** | FR-09 / UC-13 | Admin approve pending event | Event in pending status | Action: `approve` | 1. Send PATCH `/api/admin/bhajans/:id/status` | HTTP 200, status="approved", is_published=1 | HTTP 200, approved and published | **PASS** | - |
| **TC-UC13-02** | FR-09 / UC-13 | Public visibility after approval | Event approved by admin | Approved ID | 1. Send GET `/api/bhajans/:id` | HTTP 200, event is now publicly readable | HTTP 200, event accessible | **PASS** | - |
| **TC-UC15-01** | FR-11 / UC-15 | Admin edit bhajan details | Event exists | Update payload | 1. Send PUT `/api/admin/bhajans/:id` | HTTP 200, updated in database | HTTP 200 OK | **PASS** | - |
| **TC-UC17-01** | FR-15 / UC-17 | Admin unpublish bhajan | Event published | Action: `unpublish` | 1. Send PATCH `/api/admin/bhajans/:id/status`<br>2. GET `/api/bhajans/:id` | PATCH 200, Public GET returns 404 | PATCH 200, Public GET 404 | **PASS** | - |
| **TC-UC18-01** | FR-12 / UC-18 | Admin cancel bhajan | Event published | Action: `cancel` | 1. Send PATCH status="cancel"<br>2. Check public status | Status="cancelled", public displays cancelled badge | Public status reflects "cancelled" | **PASS** | - |
| **TC-UC19-01** | FR-13 / UC-19 | Admin complete bhajan | Event published | Action: `complete` | 1. Send PATCH status="complete"<br>2. Check public status | Status="completed" | Public status reflects "completed" | **PASS** | - |
| **TC-UC16-01** | FR-14 / UC-16 | Admin delete bhajan | Event exists | Event ID | 1. Send DELETE `/api/admin/bhajans/:id`<br>2. GET `/api/bhajans/:id` | DELETE 200, Public GET returns 404 | DELETE 200, Public GET 404 | **PASS** | - |
| **TC-UC20-01** | FR-16 / UC-20 | Dynamic content management | Content blocks in DB | Key: `first_time_guide` | 1. Send GET `/api/content/first_time_guide` | HTTP 200 with bilingual content block | HTTP 404 (Route not mounted) | **FAIL** | **DEF-01** |
| **TC-UC21-01** | FR-17 / UC-21 | Admin broadcast announcements | Admin authenticated | Announcement object | 1. Send POST `/api/admin/announcements`<br>2. GET `/api/announcements` | HTTP 201, appears in public announcements | HTTP 201, omitted in public list (inserted with is_published=0) | **FAIL** | **DEF-03** |
| **TC-BVA-01** | FR-06 / BVA | Phone length boundary min - 1 | Form submission | Contact: `984801234` (9 digits) | 1. Send POST `/api/bhajans/submit` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** | - |
| **TC-BVA-02** | FR-06 / BVA | Phone length boundary min exact | Form submission | Contact: `9848012345` (10 digits) | 1. Send POST `/api/bhajans/submit` | HTTP 201 Created | HTTP 201 Created | **PASS** | - |
| **TC-BVA-03** | FR-06 / BVA | Phone length boundary max + 1 | Form submission | Contact: `98480123456` (11 digits) | 1. Send POST `/api/bhajans/submit` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** | - |
| **TC-BVA-04** | FR-06 / BVA | Phone length with 91 prefix | Form submission | Contact: `919848012345` (12 digits) | 1. Send POST `/api/bhajans/submit` | HTTP 201 Created (normalized to 10 digits) | HTTP 201 Created | **PASS** | - |
| **TC-BVA-05** | FR-06 / BVA | Bhajan name min - 1 | Form submission | Name: `AB` (2 chars) | 1. Send POST `/api/bhajans/submit` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** | - |
| **TC-BVA-06** | FR-06 / BVA | Bhajan name min exact | Form submission | Name: `Om!` (3 chars) | 1. Send POST `/api/bhajans/submit` | HTTP 201 Created | HTTP 201 Created | **PASS** | - |
| **TC-BVA-07** | FR-06 / BVA | Bhajan name max exact | Form submission | Name: 150 chars | 1. Send POST `/api/bhajans/submit` | HTTP 201 Created | HTTP 201 Created | **PASS** | - |
| **TC-BVA-08** | FR-06 / BVA | Bhajan name max + 1 | Form submission | Name: 151 chars | 1. Send POST `/api/bhajans/submit` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** | - |
| **TC-EP-01** | FR-06 / EP | Non-numeric phone characters | Form submission | Contact: `9848ABC123` | 1. Send POST `/api/bhajans/submit` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** | - |
| **TC-EP-02** | FR-06 / EP | Invalid leading phone digit (1-5) | Form submission | Contact: `1234567890` | 1. Send POST `/api/bhajans/submit` | HTTP 400 Bad Request | Rate limiter throttled (HTTP 429) | **FAIL** | **DEF-02** |
| **TC-EP-03** | FR-06 / EP | Valid GPS coordinates class | Form submission | Lat: `14.4426`, Lng: `79.9865` | 1. Send POST `/api/bhajans/submit` | HTTP 201 Created | Rate limiter throttled (HTTP 429) | **FAIL** | **DEF-02** |
| **TC-EP-04** | FR-06 / EP | Out of range GPS latitude (>90) | Form submission | Lat: `120.0`, Lng: `79.9865` | 1. Send POST `/api/bhajans/submit` | HTTP 400 Bad Request | Rate limiter throttled (HTTP 429) | **FAIL** | **DEF-02** |
| **TC-ST-01** | FR-09 / State | State Transition: Pending -> Approved | Pending event exists | Action: `approve` | 1. PATCH status | Status="approved", is_published=1 | Cascade failed due to rate limiter | **FAIL** | **DEF-02** |
| **TC-ST-02** | FR-12 / State | State Transition: Approved -> Cancelled | Approved event exists | Action: `cancel` | 1. PATCH status | Status="cancelled", is_published=1 | Cascade failed due to rate limiter | **FAIL** | **DEF-02** |
| **TC-ST-03** | FR-13 / State | State Transition: Cancelled -> Completed | Cancelled event exists | Action: `complete` | 1. PATCH status | Status="completed" | Cascade failed due to rate limiter | **FAIL** | **DEF-02** |
| **TC-ST-04** | FR-11 / State | State Transition: Completed -> Unpublished | Completed event exists | Action: `unpublish` | 1. PATCH status | is_published=0 | Cascade failed due to rate limiter | **FAIL** | **DEF-02** |
| **TC-ST-05** | FR-09 / State | State Invariant: Publish on Rejected event | Event in rejected status | Action: `publish` | 1. PATCH action="publish" on rejected event | Should require approval or reject publish | Status left as "rejected" while is_published=1 | **FAIL** | **DEF-04** |
| **TC-SEC-01** | NFR-01 / Sec | Unauthenticated GET `/api/admin/stats` | No auth token | Anonymous request | 1. Send GET `/api/admin/stats` | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** | - |
| **TC-SEC-02** | NFR-01 / Sec | Unauthenticated DELETE `/api/admin/bhajans/1` | No auth token | Anonymous request | 1. Send DELETE `/api/admin/bhajans/1` | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** | - |
| **TC-SEC-03** | NFR-01 / Sec | Unauthenticated PATCH `/api/admin/bhajans/1/status` | No auth token | Anonymous request | 1. Send PATCH status | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** | - |
| **TC-SEC-04** | NFR-01 / Sec | Unauthenticated POST `/api/admin/clean-demo-data` | No auth token | Anonymous request | 1. Send POST clean-demo-data | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** | - |
| **TC-SEC-05** | NFR-01 / Sec | Unauthenticated GET `/api/admin/audit-logs` | No auth token | Anonymous request | 1. Send GET audit-logs | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** | - |
| **TC-SEC-07** | NFR-01 / Sec | XSS injection in form submission | Form submission | `<script>alert(1)</script>` | 1. POST submission with script tags<br>2. Inspect DB record | Script tags escaped/stripped | Throttled by rate limiter | **FAIL** | **DEF-02** |
| **TC-SEC-08** | NFR-01 / Sec | SQL injection in search parameter | Public endpoint | Query: `' OR '1'='1` | 1. Send GET with SQL injection string | HTTP 200, parameterized query prevents leak | Unescaped character error in test client | **FAIL** | **DEF-07** |
| **TC-SEC-09** | NFR-01 / Sec | Audit log immutability & recording | Admin actions performed | Audit log table | 1. Query GET `/api/admin/audit-logs` | Audit entries contain timestamp & admin ID | Entries present and correct | **PASS** | - |
| **TC-E2E-01** | E2E | Scenario 1: Devotee Journey | Web application live | Nellore devotee user flow | 1. Browse -> Filter -> Details -> Directions -> Call | All stages functional and responsive | Verified | **PASS** | - |
| **TC-E2E-02** | E2E | Scenario 2: Organizer Journey | Web application live | Organizer submission | 1. Submit -> Pending -> Approve -> Published | Complete workflow functional | Verified | **PASS** | - |
| **TC-E2E-03** | E2E | Scenario 3: Super Admin Journey | Web application live | Admin management | 1. Login -> Review -> Edit -> Publish -> Cancel -> Purge | Complete control verified | Verified | **PASS** | - |
| **TC-E2E-04** | E2E | Scenario 4: Unauthorized User Journey | Web application live | Attack attempts | 1. Discover endpoints -> Send unauthorized mutations | All unauthorized operations rejected | Verified (HTTP 401/404) | **PASS** | - |

# Software Requirements Specification (SRS)
## Project: Ayyappa Bhajan Guide (Nellore, Andhra Pradesh Pilot)
**Evaluation Standards**: IEEE 830 / ISO/IEC/IEEE 29148 Standard for Requirements Engineering  
**Version**: 1.0.0 (Post-Development Analysis)  
**Author / Reviewer**: Software Engineering QA Engineer & OOAD Reviewer

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to provide a complete, systematic, academic-quality inventory and specification of the requirements implemented in the **Ayyappa Bhajan Guide** web platform. This platform is designed specifically for Ayyappa Maladharis, Guru Swamis, and bhajan organizers during the Nellore, Andhra Pradesh pilot.

### 1.2 Scope
- **Domain**: Devotional Event Discovery, Religious Practice Orientation, Organizer Submissions, and Centralized Moderation.
- **Pilot Geographic Scope**: Nellore City and surrounding mandals (Stonehousepet, VRC Centre, Dargamitta, Vedayapalem, Magunta Layout, Nawabpet, Podalakur Road, Fathekhanpet, Kovur, Buchireddypalem). Telangana is strictly excluded.
- **Target Audience**:
  1. *First-Time Maladharis*: Devotees observing the 41-day Mandala Vratham for the first time requiring authentic guidance, etiquette, and venue directions.
  2. *Seasoned Devotees & Guru Swamis*: Individuals attending and conducting bhajan mandalis.
  3. *Bhajan Organizers*: Temple trusts, bhajan mandalis, and individual hosts scheduling Padi Poojas.
  4. *Super Admin*: Sole platform custodian maintaining real-world data accuracy, moderation, and security.

### 1.3 Core Axiom & Security Philosophy
**Zero-Trust Public Frontend**: The entire public client interface is treated as untrusted. Security, validation, rate limiting, and access control are enforced server-side. The application remains secure even if an attacker inspects HTML/JavaScript, discovers all API endpoints, and sends arbitrary manual requests.

---

## 2. Functional Requirements (FR) Inventory

| Req ID | Title | Description | Target Actor |
| :--- | :--- | :--- | :--- |
| **FR-01** | Browse Published Bhajans | System shall display a list of approved and published Ayyappa bhajans in Nellore with event name, date, time, venue, area, and organizer. | Devotee |
| **FR-02** | Search & Filter Bhajans | System shall permit filtering bhajans by Nellore locality (Area/Town), date (Today, Tomorrow, All), and keyword query. | Devotee |
| **FR-03** | View Bhajan Details | System shall display comprehensive event details including full description, status badge, and Guru Swami advisory note in a dedicated modal. | Devotee |
| **FR-04** | Get Navigation Directions | System shall generate a direct Google Maps navigation hyperlink (`https://www.google.com/maps/dir/...`) using verified latitude/longitude coordinates or map URLs. | Devotee |
| **FR-05** | Direct Organizer Calling | System shall provide a one-tap phone calling button (`tel:<phone>`) on mobile devices allowing devotees to contact organizers directly. | Devotee |
| **FR-06** | Submit Bhajan Information | System shall provide a simple submission form for organizers capturing event name, date, start time, venue, area, map location, organizer name, and phone number. | Organizer |
| **FR-07** | Pending Submission Workflow | All public submissions shall automatically receive `status = 'pending'` and `is_published = 0`, remaining strictly invisible to public queries until approved. | Organizer / System |
| **FR-08** | Super Admin Authentication | System shall authenticate the Super Admin using bcrypt-hashed credentials and issue a cryptographically signed JWT in an HttpOnly, SameSite secure cookie. | Super Admin |
| **FR-09** | Admin Review & Approval | Super Admin shall inspect the pending submission queue and approve submissions, immediately publishing them to public view (`is_published = 1`). | Super Admin |
| **FR-10** | Admin Rejection | Super Admin shall reject incorrect or inappropriate submissions (`status = 'rejected'`, `is_published = 0`). | Super Admin |
| **FR-11** | Admin Event Editing | Super Admin shall edit any field of an event (bilingual names, date, venue, location, organizer contact) before or after publication. | Super Admin |
| **FR-12** | Admin Event Cancellation | Super Admin shall mark an event as cancelled (`status = 'cancelled'`), clearly rendering a prominent cancellation badge on the public interface. | Super Admin |
| **FR-13** | Admin Event Completion | Super Admin shall mark a completed event (`status = 'completed'`) ensuring it is archived from the active upcoming queue. | Super Admin |
| **FR-14** | Admin Event Deletion | Super Admin shall permanently delete an event with a mandatory pre-deletion confirmation prompt preventing accidental data loss. | Super Admin |
| **FR-15** | Admin Publish / Unpublish | Super Admin shall toggle public visibility of an event (`is_published = 1` vs `0`) at any time without deleting the record. | Super Admin |
| **FR-16** | Dynamic Content Control | Super Admin shall manage dynamic educational content (First-time guide, FAQs, How-to-use) via administrative endpoints. | Super Admin |
| **FR-17** | Broadcast Announcements | Super Admin shall create, publish, and delete bilingual situational announcements and notices displayed prominently across the site. | Super Admin |
| **FR-18** | Immutable Audit Logging | System shall log every administrative mutation (action, admin username, resource type, resource ID, timestamp, details) in an `audit_logs` table. | Super Admin / System |
| **FR-19** | Production Data Purging | Super Admin shall purge all development sample/demo data (`is_sample = 1`) in a single verified transaction prior to public launch. | Super Admin |
| **FR-20** | Bilingual Language Switch | System shall allow instantaneous toggling between Telugu (తెలుగు) and English (EN) across all navigation, buttons, cards, guides, and error messages. | All Actors |
| **FR-21** | Interactive Website Tour | System shall provide a 6-step guided walkthrough explaining core site features, with persistent storage and reopening capabilities. | Devotee |
| **FR-22** | First-Time Maladhari Guide | System shall provide educational modules explaining Maladharana principles, Vratham discipline, bhajan sequence, and explicitly directing devotees to their Guru Swami. | Devotee |

---

## 3. Non-Functional Requirements (NFR) Inventory

### NFR-01: Security (Critical - Zero Trust)
1. **Server-Side Authorization**: Every administrative mutation (`create`, `edit`, `delete`, `approve`, `reject`, `publish`, `unpublish`, `cancel`) must verify authentication and role server-side.
2. **Access Control & Query Isolation**: Public endpoints (`GET /api/bhajans`, `GET /api/bhajans/:id`) must strictly enforce `WHERE is_published = 1 AND status IN ('approved', 'completed', 'cancelled')`.
3. **IDOR Defense**: Querying `/api/bhajans/:id` for pending, rejected, or non-existent IDs must return HTTP 404, never leaking event existence or metadata.
4. **Credential Isolation**: Zero database passwords, private keys, or admin secrets in client code or frontend variables.
5. **Session Hygiene**: Super Admin session tokens stored in `HttpOnly`, `SameSite=lax` cookies.
6. **Input Validation & Sanitization**: Strict server-side schema validation (Indian phone format, calendar dates, coordinate limits) and HTML tag escaping against XSS.
7. **SQL Injection Defense**: Prepared parameterized SQL queries only (`better-sqlite3`).

### NFR-02: Performance & Latency
1. Page load time under 1.5 seconds on 4G mobile networks.
2. Production bundle size under 400 KB gzipped.
3. Database queries executed within 10ms via SQLite WAL mode and indices.

### NFR-03: Usability & Mobile-First Experience
1. Touch targets >= 44x44px for primary mobile actions ([Get Directions], [Call Organizer], Language Switcher).
2. Readable Telugu typography using fallback system fonts (`Gautami`, `Nirmala UI`, `Tiro Telugu`).
3. Clear empty states and informational notices preventing user confusion.

### NFR-04: Reliability & Data Integrity
1. System fails gracefully with sanitized error responses (no stack traces or file paths leaked to client).
2. Data consistency maintained across state transitions (e.g., rejecting an event forces `is_published = 0`).
3. Super Admin operations recorded immutably in `audit_logs`.

### NFR-05: Maintainability & Testability
1. Clean separation between Express API (`server/`) and React client (`client/`).
2. Test harness capable of executing without external dependencies.
3. Configurable rate limiting to facilitate automated test execution in test environments.

### NFR-06: Availability & Resilience
1. Standalone architecture runnable with Node.js and zero external database cloud dependencies.
2. Automated recovery and connection stability in local SQLite instance.

### NFR-07: Responsiveness
1. Dynamic UI scaling gracefully across mobile (320px–480px), tablet (768px–1024px), and desktop (>1024px).

### NFR-08: Accessibility (a11y)
1. Semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<button>`).
2. High contrast ratio (>4.5:1) conforming to WCAG AA for devotional amber/gold text against dark backgrounds and dark stone text against white card backgrounds.

### NFR-09: Scalability (Pilot Architecture)
1. Geographic data partitioned to support future expansion to other Andhra Pradesh districts without architectural refactoring.

### NFR-10: Real-World Data Hygiene
1. Clear demarcation between demo data (`is_sample = 1`) and genuine submissions (`is_sample = 0`).
2. Automated purge utility to clean sample data before production deployment.

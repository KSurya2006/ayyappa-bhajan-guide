# Use-Case Specifications (Formal Catalog)
## Project: Ayyappa Bhajan Guide (Nellore Pilot)
**Evaluation Standards**: Alistair Cockburn Formal Use Case Template / RUP Standard  
**Version**: 1.0.0  
**Author / Reviewer**: Software Engineering QA Engineer & OOAD Reviewer

---

### UC-01: Browse Bhajans
- **Primary Actor**: Devotee / Public Visitor
- **Preconditions**: Application is accessible via web browser.
- **Main Flow**:
  1. Devotee opens the application homepage.
  2. System queries `GET /api/bhajans`.
  3. System renders a list of approved and published bhajans sorted chronologically.
  4. Devotee views event title, date, start time, venue, locality, and organizer.
- **Alternative Flow (Alt-1)**: No bhajans are scheduled. System displays devotional empty state: "No upcoming bhajans found in this area yet." with a prompt to submit events.
- **Exception Flow (Ex-1)**: Network or server error. System displays: "Something went wrong. Please check your connection and try again."
- **Postconditions**: Devotee has browsed verified bhajans without account registration.

---

### UC-02: Search Bhajans
- **Primary Actor**: Devotee
- **Preconditions**: Devotee is on the Find Bhajans section.
- **Main Flow**:
  1. Devotee enters a keyword (e.g. mandali name or street) into the search input.
  2. System filters displayed bhajans matching event name, venue, or organizer name.
- **Alternative Flow**: Query yields zero matches. System displays localized empty state.
- **Postconditions**: Filtered list displayed instantaneously.

---

### UC-03: Filter Bhajans by Area & Date
- **Primary Actor**: Devotee
- **Preconditions**: Bhajan listings available.
- **Main Flow**:
  1. Devotee selects a Nellore locality from the Area dropdown (e.g., Stonehousepet, VRC Centre).
  2. Devotee selects a date chip (All, Today, Tomorrow).
  3. System sends request with query parameters: `GET /api/bhajans?area=...&date=...`.
  4. System updates displayed cards with matched events.
- **Alternative Flow**: Non-intrusive "Find Near Me" button clicked; browser requests location permission. If granted, filters to nearest area; if denied, displays polite notice allowing manual dropdown selection.
- **Postconditions**: Events filtered strictly to selected criteria.

---

### UC-04: View Bhajan Details
- **Primary Actor**: Devotee
- **Preconditions**: Bhajan listing visible on screen.
- **Main Flow**:
  1. Devotee clicks on a Bhajan Card.
  2. System displays the Bhajan Details Modal.
  3. Devotee reviews bilingual details, complete venue address, timings, status, full description, and Guru Swami advisory.
- **Postconditions**: Detailed event information displayed.

---

### UC-05: Get Directions
- **Primary Actor**: Devotee
- **Preconditions**: Event details modal or card visible.
- **Main Flow**:
  1. Devotee clicks the [Get Directions] button.
  2. System launches Google Maps intent URI (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`) in a new browser tab or device navigation app.
  3. Devotee views turn-by-turn navigation to the venue.
- **Exception Flow**: Location URL unavailable. System displays safe notice.
- **Postconditions**: Navigation initiated in external navigation application.

---

### UC-06: Contact Organizer
- **Primary Actor**: Devotee
- **Preconditions**: Event has a registered organizer contact number.
- **Main Flow**:
  1. Devotee taps the [Call Organizer] button on mobile device.
  2. System triggers device telephony handler (`tel:<number>`).
  3. Devotee initiates phone call to the organizer for venue/prasadam questions.
- **Postconditions**: Mobile phone dialer launched with organizer's number prefilled.

---

### UC-07: Switch Language
- **Primary Actor**: All Actors
- **Preconditions**: Webpage loaded.
- **Main Flow**:
  1. User clicks the Language Switcher toggle (తెలుగు / EN) in the header.
  2. System changes language state (`lang = 'te'` or `'en'`).
  3. Entire interface (navigation, headings, guide text, button labels, status badges, tour) updates to selected language instantaneously.
- **Postconditions**: Application rendered in chosen language without page reload.

---

### UC-08: Take Website Tour
- **Primary Actor**: Devotee
- **Preconditions**: User visits for the first time or clicks [Take Tour].
- **Main Flow**:
  1. System opens the 6-step interactive tour modal.
  2. Step 1 (Find), Step 2 (Details), Step 3 (Directions), Step 4 (Call), Step 5 (Learn), Step 6 (Add).
  3. User navigates using [Next] and [Back] buttons.
  4. User completes the tour with [Got It, Thank You!].
- **Alternative Flow**: User clicks [Skip Tour] to dismiss at any step.
- **Postconditions**: Tour state persisted in browser `localStorage`.

---

### UC-09: Read Maladhari Information
- **Primary Actor**: Devotee (specifically First-Time Maladhari)
- **Preconditions**: User navigates to First Time Mala section.
- **Main Flow**:
  1. User reads guidance on 41-day Mandala Vratham, daily routine, and bhajan participation.
  2. User expands interactive FAQ accordion items to read beginner answers.
  3. User reads highlighted advisory explicitly reminding to follow their Guru Swami's guidance.
- **Postconditions**: Authentic, respectful religious orientation communicated.

---

### UC-10: Submit Bhajan
- **Primary Actor**: Bhajan Organizer
- **Preconditions**: Organizer clicks [Submit a Bhajan].
- **Main Flow**:
  1. System renders submission form.
  2. Organizer fills name, contact number, event name, date, time, venue, area, map link, and description.
  3. Organizer clicks [Submit for Admin Review].
  4. System validates inputs server-side, sanitizes strings, and stores record with `status = 'pending'` and `is_published = 0`.
  5. System returns HTTP 201 with confirmation message.
  6. Frontend displays success confirmation modal.
- **Invalid Flow**: Organizer enters invalid 8-digit phone number or omits map link. System returns HTTP 400 with specific localized validation error. Form remains populated for correction.
- **Postconditions**: Event stored in pending state, completely invisible to public queries.

---

### UC-11: Admin Login
- **Primary Actor**: Super Admin
- **Preconditions**: Super Admin clicks lock icon or accesses `/admin`.
- **Main Flow**:
  1. System presents secure login modal.
  2. Super Admin enters username and password.
  3. System sends credentials to `POST /api/admin/login`.
  4. Backend verifies bcrypt password hash and generates signed JWT token.
  5. Backend issues `HttpOnly`, `SameSite=lax` cookie `admin_token`.
  6. Backend creates audit log entry: `admin_login_success`.
  7. System grants access to Super Admin Console.
- **Exception Flow**: Invalid credentials entered. Backend returns HTTP 401 with generic error: "Invalid credentials." After 5 consecutive failures, rate limiter locks IP for 15 minutes.
- **Postconditions**: Authenticated Super Admin session active.

---

### UC-12: Admin Review Submission
- **Primary Actor**: Super Admin
- **Preconditions**: Super Admin authenticated.
- **Main Flow**:
  1. Super Admin clicks "Pending Submissions" tab.
  2. System retrieves records with `status = 'pending'`.
  3. Super Admin reviews organizer name, phone number, venue, and map location accuracy.
- **Postconditions**: Submissions reviewed prior to moderation action.

---

### UC-13: Admin Approve Bhajan
- **Primary Actor**: Super Admin
- **Preconditions**: Submission in pending queue.
- **Main Flow**:
  1. Super Admin clicks [Approve & Publish].
  2. Backend updates event: `status = 'approved'`, `is_published = 1`.
  3. Backend logs `admin_approve_bhajan` in `audit_logs`.
  4. System updates UI queue and public listing immediately reflects newly published event.
- **Postconditions**: Event transitioned from pending to published.

---

### UC-14: Admin Reject Bhajan
- **Primary Actor**: Super Admin
- **Preconditions**: Inappropriate or duplicate submission in queue.
- **Main Flow**:
  1. Super Admin clicks [Reject].
  2. Backend updates event: `status = 'rejected'`, `is_published = 0`.
  3. Backend logs `admin_reject_bhajan` in `audit_logs`.
- **Postconditions**: Submission rejected and permanently barred from public visibility.

---

### UC-15: Admin Edit Bhajan
- **Primary Actor**: Super Admin
- **Preconditions**: Bhajan exists in database.
- **Main Flow**:
  1. Super Admin clicks [Edit] on any event.
  2. System opens Edit Modal with pre-populated fields.
  3. Super Admin corrects venue name, time, date, or Telugu translation.
  4. Super Admin clicks [Save Changes].
  5. Backend executes parameterized `UPDATE` statement and records audit log.
- **Postconditions**: Event details updated in database and reflected on frontend.

---

### UC-16: Admin Delete Bhajan
- **Primary Actor**: Super Admin
- **Preconditions**: Bhajan exists in database.
- **Main Flow**:
  1. Super Admin clicks [Delete].
  2. System displays confirmation modal: "Are you sure you want to permanently delete this bhajan? This cannot be undone."
  3. Super Admin confirms deletion.
  4. Backend deletes record from database and records audit log.
- **Alternative Flow**: Super Admin clicks [Cancel]. Deletion is aborted.
- **Postconditions**: Record permanently removed from system.

---

### UC-17: Admin Publish / Unpublish Bhajan
- **Primary Actor**: Super Admin
- **Preconditions**: Bhajan exists in database.
- **Main Flow**:
  1. Super Admin clicks [Unpublish] on an active event.
  2. Backend sets `is_published = 0`. Event vanishes from public view.
  3. Super Admin clicks [Publish] on a hidden event.
  4. Backend sets `is_published = 1`. Event reappears on public view.
- **Postconditions**: Visibility toggled safely without record deletion.

---

### UC-18: Admin Cancel Bhajan
- **Primary Actor**: Super Admin
- **Preconditions**: Event scheduled in the future is called off by organizer.
- **Main Flow**:
  1. Super Admin clicks [Cancel Event].
  2. Backend sets `status = 'cancelled'`. Event remains published with red "Cancelled" badge.
  3. Devotees viewing the card or modal see clear cancellation warnings.
- **Postconditions**: Event marked cancelled, preventing devotees from traveling unnecessarily.

---

### UC-19: Admin Mark Event Completed
- **Primary Actor**: Super Admin
- **Preconditions**: Event date and time have passed.
- **Main Flow**:
  1. Super Admin clicks [Complete].
  2. Backend sets `status = 'completed'`.
  3. Event is removed from upcoming filters.
- **Postconditions**: Event archived as completed.

---

### UC-20: Admin Manage Content
- **Primary Actor**: Super Admin
- **Preconditions**: Authenticated Super Admin session.
- **Main Flow**:
  1. Super Admin selects dynamic content block (First-Time Guide, FAQs, How-to-Use).
  2. Super Admin edits English and Telugu copy.
  3. Backend updates `content_blocks` table and logs audit record.
- **Postconditions**: Public informational content updated without redeploying code.

---

### UC-21: Admin Manage Announcements
- **Primary Actor**: Super Admin
- **Preconditions**: Authenticated Super Admin session.
- **Main Flow**:
  1. Super Admin enters bilingual announcement title and content.
  2. Super Admin submits announcement.
  3. Backend inserts record into `announcements` and logs audit entry.
  4. Announcement banner appears across the top of public website.
- **Postconditions**: Timely notice broadcast to all visitors.

---

### UC-22: Admin Purge Sample Data (Production Mode)
- **Primary Actor**: Super Admin
- **Preconditions**: System contains test/sample records (`is_sample = 1`).
- **Main Flow**:
  1. Super Admin navigates to "Production Mode" tab.
  2. Super Admin reviews count of sample/demo records.
  3. Super Admin clicks [Purge All Demo Data].
  4. System prompts for explicit confirmation.
  5. Backend executes `DELETE FROM bhajans WHERE is_sample = 1` and logs audit entry.
  6. System confirms purge. Only genuine submissions remain in database.
- **Postconditions**: Zero dummy data exists in production database.

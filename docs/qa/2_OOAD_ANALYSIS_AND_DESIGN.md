# Object-Oriented Analysis & Design (OOAD) Document
## Project: Ayyappa Bhajan Guide (Nellore Pilot)
**Evaluation Standards**: Unified Modeling Language (UML 2.5) / GRASP Patterns / SOLID Principles  
**Version**: 1.0.0  
**Author / Reviewer**: Software Engineering QA Engineer & OOAD Reviewer

---

## 1. Actor Identification

```mermaid
flowchart LR
    Devotee(["👤 Devotee / Normal Visitor"])
    Organizer(["👤 Bhajan Organizer"])
    SuperAdmin(["🔐 Super Admin"])
    System(["⚙️ System / SQLite Engine"])

    Devotee -->|Browses, Filters, Navigates| System
    Organizer -->|Submits Event Form| System
    SuperAdmin -->|Reviews, Edits, Moderates, Purges| System
```

1. **Devotee / Normal Visitor**: Unauthenticated user searching for bhajans, viewing accurate locations, checking times, reading Maladhari guidance, and navigating via Google Maps.
2. **Bhajan Organizer**: Mandali leader, temple trustee, or devotee submitting upcoming bhajan events for moderation.
3. **Super Admin**: Platform custodian possessing full operational control over submissions, content, announcements, and database hygiene.
4. **System Engine**: Backend process executing validation, SQLite persistence, rate limiting, and session verification.

---

## 2. Domain Entities & Conceptual Class Model

```mermaid
classDiagram
    class Devotee {
        +viewBhajans(area, date)
        +getDirections(bhajanId)
        +callOrganizer(bhajanId)
        +toggleLanguage(lang)
        +takeTour()
    }

    class Organizer {
        +name: String
        +phoneNumber: String
        +submitBhajan(formData)
    }

    class SuperAdmin {
        +id: Integer
        +username: String
        -passwordHash: String
        +login(username, password)
        +reviewSubmission(id)
        +approveBhajan(id)
        +rejectBhajan(id)
        +editBhajan(id, updateData)
        +deleteBhajan(id)
        +cancelBhajan(id)
        +completeBhajan(id)
        +publishBhajan(id)
        +unpublishBhajan(id)
        +manageContent(key, data)
        +cleanDemoData()
    }

    class Bhajan {
        +id: Integer
        +name: String
        +name_te: String
        +date: Date
        +startTime: String
        +venue: String
        +venue_te: String
        +area: String
        +area_te: String
        +location: Location
        +organizerName: String
        +contactNumber: String
        +description: String
        +description_te: String
        +status: BhajanStatus
        +isPublished: Boolean
        +isSample: Boolean
        +createdAt: DateTime
        +updatedAt: DateTime
        +approve()
        +reject()
        +cancel()
        +markCompleted()
        +publish()
        +unpublish()
    }

    class Location {
        +area: String
        +venue: String
        +mapUrl: String
        +latitude: Float
        +longitude: Float
        +getDirectionsUrl() String
    }

    class Announcement {
        +id: Integer
        +title_en: String
        +title_te: String
        +content_en: String
        +content_te: String
        +isPublished: Boolean
        +createdAt: DateTime
    }

    class ContentBlock {
        +key: String
        +title_en: String
        +title_te: String
        +content_en: String
        +content_te: String
        +updatedAt: DateTime
    }

    class AuditLogEntry {
        +id: Integer
        +adminId: String
        +action: String
        +resourceType: String
        +resourceId: String
        +details: String
        +timestamp: DateTime
    }

    class AuthenticationSession {
        +token: String
        +adminId: Integer
        +expiresAt: DateTime
        +isValid() Boolean
    }

    Bhajan *-- Location : contains
    Organizer ..> Bhajan : submits
    SuperAdmin --> Bhajan : moderates
    SuperAdmin --> Announcement : manages
    SuperAdmin --> ContentBlock : manages
    SuperAdmin --> AuditLogEntry : generates
    SuperAdmin --> AuthenticationSession : authenticated by
    Devotee ..> Bhajan : reads
```

---

## 3. Class Responsibility & Collaborations (CRC Cards)

### 3.1 Class: `Bhajan` (Aggregate Root)
- **Primary Responsibilities**:
  - Encapsulate all event attributes (name, bilingual translations, date, start time, venue, area).
  - Enforce lifecycle state transitions (`pending` -> `approved` -> `completed` / `cancelled`).
  - Maintain the publication invariant (`is_published = 1` only when approved).
  - Preserve source origin flag (`is_sample = 0` vs `1`).
- **Collaborators**: `Location`, `SuperAdmin`, `Organizer`, `AuditLogEntry`.

### 3.2 Class: `Location` (Value Object)
- **Primary Responsibilities**:
  - Encapsulate geographic coordinates and Google Maps URIs.
  - Formulate mobile navigation intent URLs (`https://www.google.com/maps/dir/...`).
  - Validate latitude (-90 to +90) and longitude (-180 to +180) boundary conditions.
- **Collaborators**: `Bhajan`.

### 3.3 Class: `SuperAdmin` (Controller / Custodian)
- **Primary Responsibilities**:
  - Enforce server-side authority over all public data mutations.
  - Approve, reject, edit, or cancel events.
  - Trigger audit log entry creation upon mutation.
- **Collaborators**: `AuthenticationSession`, `Bhajan`, `AuditLogEntry`, `Announcement`, `ContentBlock`.

---

## 4. Sequence Diagrams

### 4.1 Sequence 1: Organizer Submission & Super Admin Moderation
```mermaid
sequenceDiagram
    autonumber
    actor Organizer
    participant Frontend as Mobile Frontend
    participant API as Public API (/api/bhajans)
    participant Validator as Input Validator
    participant DB as SQLite DB
    actor Admin as Super Admin
    participant AdminAPI as Admin API (/api/admin)

    Organizer->>Frontend: Enter Event Details & Submit
    Frontend->>API: POST /api/bhajans/submit
    API->>Validator: Validate Schema (Phone, Date, Location)
    alt Validation Failure
        Validator-->>API: Reject with Error Details
        API-->>Frontend: HTTP 400 Bad Request
        Frontend-->>Organizer: Display Specific Validation Feedback
    else Validation Success
        Validator-->>API: Validated Clean Payload
        API->>DB: INSERT INTO bhajans (status='pending', is_published=0)
        DB-->>API: Record Created (ID: 105)
        API-->>Frontend: HTTP 201 Created (Pending Confirmation)
        Frontend-->>Organizer: Show "Waiting for Admin Approval" Toast
    end

    Note over Admin, AdminAPI: Later: Super Admin logs in
    Admin->>AdminAPI: GET /api/admin/bhajans?status=pending
    AdminAPI->>DB: SELECT * FROM bhajans WHERE status='pending'
    DB-->>AdminAPI: Return Pending Records
    AdminAPI-->>Admin: Display Submission in Review Queue
    Admin->>AdminAPI: PATCH /api/admin/bhajans/105/status (action='approve')
    AdminAPI->>DB: UPDATE bhajans SET status='approved', is_published=1
    AdminAPI->>DB: INSERT INTO audit_logs (action='admin_approve_bhajan')
    AdminAPI-->>Admin: HTTP 200 OK (Approved & Published)
```

### 4.2 Sequence 2: Devotee Discovery & Navigation
```mermaid
sequenceDiagram
    autonumber
    actor Devotee
    participant Frontend as Mobile Frontend
    participant API as Public API (/api/bhajans)
    participant DB as SQLite DB
    participant GoogleMaps as Device Map App (External)

    Devotee->>Frontend: Open App & Select Locality ("Stonehousepet")
    Frontend->>API: GET /api/bhajans?area=Stonehousepet
    API->>DB: SELECT * FROM bhajans WHERE is_published=1 AND status IN ('approved','completed','cancelled')
    DB-->>API: Return Filtered Published Records
    API-->>Frontend: JSON Array of Bhajans
    Frontend-->>Devotee: Render Event Cards with Badges & Venues
    Devotee->>Frontend: Tap "Get Directions"
    Frontend->>GoogleMaps: Open maps.google.com/dir/?api=1&destination=lat,lng
    GoogleMaps-->>Devotee: Display Live GPS Route Navigation
```

---

## 5. State Machine: Bhajan Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending : Organizer Submits Form (is_published=0)
    
    Pending --> Approved : Super Admin Approves (is_published=1)
    Pending --> Rejected : Super Admin Rejects (is_published=0)
    
    Approved --> Cancelled : Event Cancelled (is_published=1, Cancel Badge)
    Approved --> Completed : Event Finished (status='completed')
    Approved --> Unpublished : Admin Hides Event (is_published=0)
    
    Unpublished --> Approved : Admin Republishes (is_published=1)
    Cancelled --> Unpublished : Admin Hides
    
    Approved --> Deleted : Super Admin Deletes (Permanently Purged)
    Pending --> Deleted : Super Admin Deletes
    Rejected --> Deleted : Super Admin Deletes
    
    Deleted --> [*]
```

### State Invariants:
1. **Public Visibility Invariant**: An event is visible to public queries IF AND ONLY IF `is_published = 1` AND `status IN ('approved', 'completed', 'cancelled')`.
2. **Pending Invariant**: An event in `status = 'pending'` MUST NEVER have `is_published = 1`.
3. **Rejected Invariant**: An event in `status = 'rejected'` MUST NEVER have `is_published = 1`.

---

## 6. Architectural Evaluation (OOAD & Clean Code Findings)

1. **High Cohesion**: 
   - `validator.js` handles pure validation.
   - `auth.js` encapsulates JWT and session decoding.
   - `rateLimiter.js` handles throttling.
2. **Low Coupling**:
   - The React frontend does not possess direct knowledge of the SQLite database. It communicates strictly via standard REST contracts (`/api/*`).
3. **Identified OOAD Code Flaws & Defect Traces**:
   - *State Transition Integrity*: In `PATCH /api/admin/bhajans/:id/status`, calling `publish` on an event currently in `status = 'rejected'` can result in an inconsistent state (`status = 'rejected'` and `is_published = 1`). The state transition method must enforce that only approved events may be published.
   - *Missing Domain Boundary for Dynamic Content*: The `ContentBlock` entity was declared in the database schema but lacks controller endpoints for CRUD operations.

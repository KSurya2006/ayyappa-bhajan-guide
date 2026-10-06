# Requirements Traceability Matrix (RTM)
## Project: Ayyappa Bhajan Guide (Nellore Pilot)
**Evaluation Standards**: IEEE 829 Standard for Software Test Documentation  
**Version**: 1.0.0 (Baseline Traceability)  
**Author / Reviewer**: Software Engineering QA Engineer & OOAD Reviewer

---

| Req ID | Requirement Title | Source / Feature | Use Case | Test Case IDs | Baseline Status | Defect ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Browse Published Bhajans | Find Bhajans | UC-01 | TC-UC01-01, TC-E2E-01 | **PASS** | - |
| **FR-02** | Search & Filter Bhajans | Find Bhajans Filters | UC-02, UC-03 | TC-UC02-01, TC-UC03-01, TC-E2E-01 | **PASS** | - |
| **FR-03** | View Bhajan Details | Details Modal | UC-04 | TC-UC04-01, TC-E2E-01 | **PASS** | - |
| **FR-04** | Get Navigation Directions | Navigation Link | UC-05 | TC-UC05-01, TC-E2E-01 | **PASS** | - |
| **FR-05** | Direct Organizer Calling | Mobile Phone Call | UC-06 | TC-UC06-01, TC-E2E-01 | **PASS** | - |
| **FR-06** | Submit Bhajan Information | Add Bhajan Form | UC-10 | TC-UC10-01, TC-BVA-01..08, TC-EP-01..04, TC-E2E-02 | **PASS** (with fixes) | DEF-02, DEF-06 |
| **FR-07** | Pending Submission Workflow | Moderation Engine | UC-10 | TC-UC10-02, TC-UC10-03, TC-E2E-02 | **PASS** | - |
| **FR-08** | Super Admin Authentication | Admin Login | UC-11 | TC-UC11-01, TC-UC11-02, TC-SEC-01..06, TC-E2E-03 | **PASS** | - |
| **FR-09** | Admin Review & Approval | Pending Queue | UC-12, UC-13 | TC-UC12-01, TC-UC13-01, TC-UC13-02, TC-ST-01, TC-E2E-02 | **PASS** (with fixes) | DEF-04 |
| **FR-10** | Admin Event Rejection | Moderation Action | UC-14 | TC-ST-05, TC-E2E-03 | **PASS** (with fixes) | DEF-04 |
| **FR-11** | Admin Event Editing | Bhajan Management | UC-15 | TC-UC15-01, TC-E2E-03 | **PASS** (with fixes) | DEF-05 |
| **FR-12** | Admin Event Cancellation | Status Engine | UC-18 | TC-UC18-01, TC-ST-02, TC-E2E-03 | **PASS** | - |
| **FR-13** | Admin Event Completion | Status Engine | UC-19 | TC-UC19-01, TC-ST-03, TC-E2E-03 | **PASS** | - |
| **FR-14** | Admin Event Deletion | Delete Confirmation | UC-16 | TC-UC16-01, TC-SEC-02, TC-E2E-03 | **PASS** | - |
| **FR-15** | Admin Publish / Unpublish | Visibility Toggle | UC-17 | TC-UC17-01, TC-ST-04, TC-E2E-03 | **PASS** | - |
| **FR-16** | Dynamic Content Control | Content Block API | UC-20 | TC-UC20-01 | **FAIL** (Defect logged) | **DEF-01** |
| **FR-17** | Broadcast Announcements | Announcement Engine | UC-21 | TC-UC21-01 | **FAIL** (Defect logged) | **DEF-03** |
| **FR-18** | Immutable Audit Logging | Security Engine | Admin Ops | TC-SEC-09, TC-E2E-03 | **PASS** | - |
| **FR-19** | Production Data Purging | Clean Demo Utility | UC-22 | TC-SEC-04, TC-E2E-03 | **PASS** | - |
| **FR-20** | Bilingual Language Switch | i18n Engine | Global | TC-E2E-01, Component Review | **PASS** | - |
| **FR-21** | Interactive Website Tour | Guided Tour Modal | UC-08 | TC-E2E-01, Component Review | **PASS** | - |
| **FR-22** | First-Time Maladhari Guide | Guidance & FAQ | UC-09 | TC-E2E-01, Component Review | **PASS** | - |
| **NFR-01** | Security & Zero-Trust | Backend Authorization | All Endpoints | TC-SEC-01..09, TC-UC10-03, TC-E2E-04 | **PASS** | - |
| **NFR-02** | Performance & Latency | Bundling & Latency | Global | Vite Build Time (1.64s), API Latency (<15ms) | **PASS** | - |
| **NFR-03** | Usability & Mobile-First | Responsive Layout | Global | Mobile Viewport Review, Touch Targets >=44px | **PASS** | - |
| **NFR-04** | Reliability & Graceful Errors | Error Middleware | Global | Safe Error Handler Review, Parameter Sanitization | **PASS** | - |
| **NFR-05** | Maintainability & Testability | Architecture & Tests | Global | Automated Test Runner Execution | **FAIL** (Defect logged) | **DEF-02** |
| **NFR-06** | Real-World Data Hygiene | Sample Data Separation | Database | Purge Demo Data Endpoint Verification | **PASS** | - |

---

### Traceability Summary Metrics
- **Total Functional Requirements Identified**: 22
- **Total Non-Functional Requirements Identified**: 6 Focus Areas (10 Sub-metrics)
- **Requirements Covered by Test Cases**: 100% (28 / 28)
- **Baseline Requirements Passing (First Run)**: 24 / 28 (85.7%)
- **Requirements Failing Initial Verification**: 4 / 28 (14.3%) — *Mapped directly to DEF-01, DEF-02, DEF-03, DEF-04, DEF-05, DEF-06*.

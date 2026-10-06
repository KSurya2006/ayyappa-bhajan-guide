# Ayyappa Bhajan Guide (అయ్యప్ప భజన గైడ్)
### Pilot Edition — Nellore, Andhra Pradesh

> **Swamiye Saranam Ayyappa!**  
> A simple, reliable, secure, mobile-first web platform designed specifically for Ayyappa Maladharis in Nellore and surrounding areas.

---

## 🌟 Project Purpose & Core Vision

For a person wearing the sacred Ayyappa Mala for the first time, finding genuine nearby bhajans, reaching the correct venue on time, and contacting the organizers can be daunting. **Ayyappa Bhajan Guide** brings all this essential information into one respectful, simple, and devotional interface.

- **Geographical Focus**: **Nellore, Andhra Pradesh and surrounding mandals** (Stonehousepet, VRC Centre, Dargamitta, Vedayapalem, Magunta Layout, Nawabpet, Podalakur Road, Fathekhanpet, Kovur, Buchireddypalem).
- **Expansion Readiness**: Structured to support other Andhra Pradesh districts in subsequent phases (Telangana is intentionally excluded).
- **Target Audience**: Ayyappa Maladharis, Guru Swamis, and bhajan mandali organizers.

---

## 🔒 Security Architecture (Zero-Trust Public Frontend)

This application is built under the non-negotiable security principle:  
**"Treat the entire public frontend as untrusted."**

Even if an attacker inspects JavaScript bundles, opens DevTools, discovers API endpoints, or sends manual requests, they cannot perform unauthorized operations.

Key security highlights:
1. **Server-Side Authorization**: Every administrative mutation (`create`, `edit`, `delete`, `approve`, `reject`, `publish`, `cancel`) is verified server-side.
2. **Strict Public Data Filtering**: The public API (`GET /api/bhajans`) strictly returns only approved and published events (`is_published = 1 AND status IN ('approved', 'completed', 'cancelled')`).
3. **Pending Status Isolation & IDOR Defense**: Newly submitted bhajans default to `pending` and `is_published = 0`. Querying `/api/bhajans/:id` for pending or unpublished events returns `404 Not Found`.
4. **Server-Side Input Validation**: Validates Indian phone numbers, dates, times, venues, and map links on the backend.
5. **Session Security & Credentials**: Passwords hashed with `bcrypt`. Super Admin sessions issued via `HttpOnly`, `SameSite=lax` cookies.
6. **Rate Limiting**: Protects admin login and public submissions against brute force and automated abuse.
7. **Audit Logging**: Every administrative action is logged to the immutable `audit_logs` table.
8. **Production Data Cleanliness**: Single-click Super Admin utility to purge demo data before production launch.

For full specifications, refer to [SECURITY.md](file:///c:/Ayapa/SECURITY.md) and [docs/security/SECURITY_REQUIREMENTS.md](file:///c:/Ayapa/docs/security/SECURITY_REQUIREMENTS.md).

---

## 📱 Features

- **Bilingual Interface**: Full toggle between **Telugu (తెలుగు)** and **English (EN)** with clear typography.
- **Find Bhajans**: Filter upcoming events by Nellore area and date (Today, Tomorrow, Upcoming).
- **Accurate Directions**: Direct **[Get Directions]** button opening the venue in Google Maps.
- **Organizer Contact**: Direct **[Call Organizer]** button (`tel:...`) on mobile.
- **Submit Your Bhajan**: Short submission form for organizers that routes directly to Super Admin approval.
- **First-Time Maladhari Guide**: Essential guidance on Vratham discipline, daily routine, and bhajan etiquette, with explicit instruction to consult their Guru Swami.
- **What Happens in a Bhajan**: Friendly explanation of Padi Pooja, Saranu Gosha, Harivarasanam, and Prasadam.
- **Interactive Website Tour**: 6-step guided walkthrough for first-time visitors with reopen controls.
- **Super Admin Dashboard**: Full control over submissions, bhajans, announcements, and audit logs.

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+

### 2. Installation
```bash
# Install root backend dependencies
npm install

# Install frontend client dependencies
cd client && npm install && cd ..
```

### 3. Environment Variables
Create `.env` at root (see `.env.example`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_secret_key
ADMIN_USERNAME=admin
ADMIN_INITIAL_PASSWORD=SuryaRayudu@6281
CLIENT_ORIGIN=http://localhost:5173
```

### 4. Running Locally
Run backend and frontend:
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
npm run server

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run client
```

### 5. Running the Automated Security Test Suite
```bash
npm run test:security
```

---

## 🏛️ Super Admin Access
- Default Username: `admin`
- Default Password: `AyyappaSwami@2026`
- Access via lock icon in the top navbar or footer link.

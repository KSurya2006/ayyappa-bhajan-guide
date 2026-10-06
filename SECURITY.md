# Security Policy — Ayyappa Bhajan Guide (Nellore Pilot)

## Security Philosophy: Untrusted Public Frontend

Treat the entire public website as untrusted. Never assume that hiding a button, hiding an API endpoint, obscuring a URL, or hiding frontend code provides security.

A technically skilled visitor may:
- Inspect HTML and JavaScript bundles
- Open browser DevTools and inspect Network requests
- Discover API endpoints and send requests directly to APIs
- Modify frontend requests and parameters
- Attempt unauthorized database operations
- Attempt to access admin routes or manipulate IDs
- Attempt to bypass frontend validation

**Core Security Mandate**: The application remains secure even if an attacker knows all API endpoints and understands how the frontend works. Security comes strictly from server-side authentication, authorization, database-level access controls, input validation, and secure deployment.

---

## 22 Security Principles & Requirements Summary

1. **Server-Side Admin Authorization**: Every mutation and sensitive query verifies authentication AND authorization on the backend.
2. **Protected Admin Routes**: Multi-layer protection (middleware guards + route authorization).
3. **API Security**: Discovered endpoints (e.g. `DELETE /api/bhajans/123`) strictly require authorized Super Admin session.
4. **Database Security**: Zero database credentials exposed to client. Server-side environment variables only.
5. **Zero Frontend Secrets**: No private tokens, service role keys, or admin passwords in JS/HTML bundles.
6. **Database Access Control**: Public queries retrieve only approved, published records (`status IN ('approved', 'completed', 'cancelled') AND is_published = 1`).
7. **Pending Bhajans Security**: Initial state is strictly `pending`. Zero public visibility or API leak.
8. **Event ID Security & IDOR Prevention**: Querying `/bhajan/:id` enforces publication checks; changing IDs never leaks private/pending data.
9. **Strict Server-Side Input Validation**: All fields (names, phone numbers, dates, times, map URLs, descriptions) validated on the server.
10. **Protection Against Common Web Attacks**: Parameterized queries (SQLi defense), output sanitization (XSS defense), CSRF protection, and rate limiting.
11. **Rate Limiting**: Defenses against brute-force attacks on login, submissions, and sensitive endpoints.
12. **Login Security**: Super Admin credentials hashed with bcrypt; lockout policies on failed attempts; no plaintext storage.
13. **Session Security**: HttpOnly, Secure, SameSite cookies with strict expiration.
14. **HTTPS Enforced**: All production traffic encrypted over TLS.
15. **CORS Restrictions**: Explicit origin whitelisting; no indiscriminate `*` allowances.
16. **Sanitized Error Handling**: Generic safe user errors; zero internal stack traces or SQL errors leaked to clients.
17. **Admin Audit Logging**: Immutable server-side log of administrative actions (approvals, edits, deletions, cancellations).
18. **Public vs Private Data Separation**: Public endpoints only serialize designated public fields.
19. **Rejection of Obfuscation**: No reliance on DevTools blockers, button hiding, or fake obfuscation.
20. **Security Testing Protocol**: Automated test suite verifying unauthorized API calls, IDOR, and tampering.
21. **Architectural Axiom**: The backend is the single source of truth and security.
22. **Multi-Tier Security Architecture**: Strict separation of Public User, Organizer Submission, and Super Admin tiers.

---

## Reporting a Vulnerability

If you discover any security issue or vulnerability in the Ayyappa Bhajan Guide platform, please report it directly to the Super Admin via the secure contact channel. All reports will be reviewed and addressed with top priority.

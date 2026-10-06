# Antigravity Rules — Ayyappa Bhajan Guide

Refer to [AGENTS.md](file:///c:/Ayapa/AGENTS.md) and [SECURITY.md](file:///c:/Ayapa/SECURITY.md) for full security requirements.

Key directives:
1. Strict server-side authentication & authorization for all admin mutations.
2. Public API endpoints must filter out pending (`status = 'pending'`) and unpublished (`is_published = 0`) bhajans.
3. Parameterized queries only. No SQL injection risks.
4. Mobile-first design for Nellore, Andhra Pradesh pilot.
5. Bilingual (Telugu & English) support across all public and admin UI.
6. Rate limiting on login and submission routes.
7. Admin audit logging for any content or event mutation.

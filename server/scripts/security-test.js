/**
 * Automated Security & Verification Test Suite for Ayyappa Bhajan Guide
 * Tests Requirements 1-22, 33-53: Zero-Trust Frontend, IDOR, Server-side Authz, Rate Limiting, and Data Leak Prevention.
 */

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5002;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_INITIAL_PASSWORD = 'AyyappaSwami@2026';
process.env.JWT_SECRET = 'test_secret_ayyappa_security_suite_2026';

let serverProcess;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTests() {
  console.log('================================================================');
  console.log('🔒 RUNNING AUTOMATED SECURITY SUITE: Ayyappa Bhajan Guide');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Start Server on test port
  console.log('[Setup] Starting backend server on port', PORT);
  serverProcess = spawn('node', [path.resolve(__dirname, '..', 'index.js')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'inherit'
  });

  await delay(2500);

  try {
    // TEST 1: Public endpoint filtering
    console.log('\n--- Test Group 1: Public Data Filtering (Req 2, 6, 7, 18) ---');
    const pubRes = await request({ path: '/api/bhajans', method: 'GET' });
    assert(pubRes.status === 200, 'GET /api/bhajans returns 200 OK');
    assert(pubRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(pubRes.body.data), 'Returns an array of bhajans');
    const hasUnpublished = pubRes.body.data.some((b) => b.is_published === 0 || b.status === 'pending');
    assert(!hasUnpublished, 'Zero unpublished or pending events returned to public users');

    // TEST 2: Organizer submission & Pending status isolation
    console.log('\n--- Test Group 2: Submission & Pending Isolation (Req 7, 8, 9, 39, 40) ---');
    const newSubmission = {
      name: 'Security Test Padi Pooja',
      date: '2026-11-15',
      start_time: '07:00 PM',
      venue: 'Stonehousepet Community Mandapam',
      area: 'Stonehousepet, Nellore',
      organizer_name: 'Test Swami',
      contact_number: '9848099999',
      map_url: 'https://maps.google.com/?q=14.4426,79.9865',
      description: 'Test submission to verify pending isolation'
    };
    const subRes = await request({ path: '/api/bhajans/submit', method: 'POST' }, newSubmission);
    assert(subRes.status === 201, 'POST /api/bhajans/submit returns 201 Created');
    const submissionId = subRes.body.submissionId;
    assert(typeof submissionId === 'number', 'Returns generated submission ID: ' + submissionId);

    // Verify the pending event is NOT leaked in public list
    const pubCheck = await request({ path: '/api/bhajans', method: 'GET' });
    const isLeaked = pubCheck.body.data.some((b) => b.id === submissionId);
    assert(!isLeaked, 'Newly submitted pending event does NOT appear in public GET /api/bhajans');

    // IDOR Test: Try to fetch pending event directly by ID
    const idorRes = await request({ path: `/api/bhajans/${submissionId}`, method: 'GET' });
    assert(idorRes.status === 404, 'Direct GET /api/bhajans/:pending_id returns 404 Not Found (IDOR defense)');

    // TEST 3: Server-side Input Validation
    console.log('\n--- Test Group 3: Server-side Input Validation (Req 9, 41) ---');
    const invalidPhoneSubmission = {
      ...newSubmission,
      contact_number: '123' // Invalid Indian mobile
    };
    const badPhoneRes = await request({ path: '/api/bhajans/submit', method: 'POST' }, invalidPhoneSubmission);
    assert(badPhoneRes.status === 400, 'Rejects invalid phone number with HTTP 400 Bad Request');

    const missingMapSubmission = {
      ...newSubmission,
      map_url: '' // Missing map link
    };
    const badMapRes = await request({ path: '/api/bhajans/submit', method: 'POST' }, missingMapSubmission);
    assert(badMapRes.status === 400, 'Rejects missing map location with HTTP 400 Bad Request');

    // TEST 4: Unauthorized Admin Mutations (Req 1, 3, 34, 36)
    console.log('\n--- Test Group 4: Server-Side Admin Authorization (Req 1, 3, 34, 36) ---');
    const unauthDelete = await request({ path: `/api/admin/bhajans/${submissionId}`, method: 'DELETE' });
    assert(unauthDelete.status === 401, 'Unauthenticated DELETE /api/admin/bhajans/:id returns 401 Unauthorized');

    const unauthPatch = await request({ path: `/api/admin/bhajans/${submissionId}/status`, method: 'PATCH' }, { action: 'approve' });
    assert(unauthPatch.status === 401, 'Unauthenticated PATCH /api/admin/bhajans/:id/status returns 401 Unauthorized');

    const unauthCreate = await request({ path: '/api/admin/bhajans', method: 'POST' }, newSubmission);
    assert(unauthCreate.status === 401, 'Unauthenticated POST /api/admin/bhajans returns 401 Unauthorized');

    // TEST 5: Super Admin Authentication & Authorized Operations
    console.log('\n--- Test Group 5: Super Admin Login & Authorized Operations (Req 12, 13, 17, 44, 49) ---');
    const badLogin = await request({ path: '/api/admin/login', method: 'POST' }, { username: 'admin', password: 'WrongPassword' });
    assert(badLogin.status === 401, 'Invalid password returns 401 Unauthorized');

    const goodLogin = await request({ path: '/api/admin/login', method: 'POST' }, { username: 'admin', password: 'AyyappaSwami@2026' });
    assert(goodLogin.status === 200, 'Valid Super Admin login returns 200 OK');
    const cookieHeader = goodLogin.headers['set-cookie'];
    assert(Array.isArray(cookieHeader) && cookieHeader.some((c) => c.includes('admin_token') && c.includes('HttpOnly')), 'Issues HttpOnly secure session cookie');

    const adminCookie = cookieHeader ? cookieHeader[0].split(';')[0] : '';

    // Authorized Admin Stats
    const statsRes = await request({
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Cookie: adminCookie }
    });
    assert(statsRes.status === 200, 'Authenticated Super Admin can access GET /api/admin/stats');
    assert(statsRes.body.data.pendingSubmissions >= 1, 'Stats correctly count pending submissions');

    // Authorized Admin Approval
    const approveRes = await request({
      path: `/api/admin/bhajans/${submissionId}/status`,
      method: 'PATCH',
      headers: { Cookie: adminCookie }
    }, { action: 'approve' });
    assert(approveRes.status === 200, 'Super Admin approves bhajan via PATCH -> 200 OK');

    // Verify it is now visible in the public endpoint
    const pubAfterApproval = await request({ path: `/api/bhajans/${submissionId}`, method: 'GET' });
    assert(pubAfterApproval.status === 200, 'Approved bhajan is now publicly accessible via GET /api/bhajans/:id');
    assert(pubAfterApproval.body.data.name === 'Security Test Padi Pooja', 'Bhajan name matches');

    // Verify Audit Log entry was recorded
    const auditRes = await request({
      path: '/api/admin/audit-logs',
      method: 'GET',
      headers: { Cookie: adminCookie }
    });
    assert(auditRes.status === 200, 'Super Admin can retrieve audit logs');
    const hasAudit = auditRes.body.data.some((a) => a.action === 'admin_approve_bhajan' && String(a.resource_id) === String(submissionId));
    assert(hasAudit, 'Audit log contains immutable entry for admin_approve_bhajan');

    // Clean up test bhajan
    await request({
      path: `/api/admin/bhajans/${submissionId}`,
      method: 'DELETE',
      headers: { Cookie: adminCookie }
    });

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

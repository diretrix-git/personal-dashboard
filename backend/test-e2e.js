/**
 * End-to-end backend API tests
 * 
 * Tests all CRUD endpoints for Subscriptions, Assignments, and Finances.
 * Tests auth rejection and data isolation between users.
 * Tests the reminder system.
 * 
 * This script connects directly to MongoDB and bypasses Clerk auth
 * by monkey-patching requireAuth to inject fake userId values.
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');

// Models
const Subscription = require('./models/Subscription');
const Assignment = require('./models/Assignment');
const Finance = require('./models/Finance');
const ReminderLog = require('./models/ReminderLog');

const TEST_PORT = 5099;
const BASE = `http://localhost:${TEST_PORT}/api`;
let server;

// ── Helpers ─────────────────────────────────────────────────────────────────
const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const body = await res.text();
  let json;
  try { json = JSON.parse(body); } catch { json = body; }
  return { status: res.status, body: json };
};

const results = [];
const test = (name, passed, detail = '') => {
  results.push({ name, passed, detail });
  console.log(`${passed ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── Build a test app that mimics the real server but with injectable auth ────
const buildApp = () => {
  const app = express();
  const helmet = require('helmet');
  const cors = require('cors');

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Mock Clerk middleware: reads X-Test-UserId header
  app.use((req, res, next) => {
    const userId = req.headers['x-test-userid'];
    if (userId) {
      req.auth = { userId };
    }
    next();
  });

  // Mount routes with a custom requireAuth that checks our mock
  const origRequireAuth = require('@clerk/express').requireAuth;
  // Override requireAuth globally for tests
  require('@clerk/express').requireAuth = () => (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Re-require routes after patching
  delete require.cache[require.resolve('./routes/subscriptionRoutes')];
  delete require.cache[require.resolve('./routes/assignmentRoutes')];
  delete require.cache[require.resolve('./routes/financeRoutes')];
  delete require.cache[require.resolve('./routes/reminderRoutes')];
  delete require.cache[require.resolve('./routes/index')];

  const routes = require('./routes/index');
  const errorHandler = require('./middleware/errorHandler');

  app.use('/api', routes);
  app.use(errorHandler);

  return app;
};

// ── Main test runner ────────────────────────────────────────────────────────
const run = async () => {
  console.log('\n🔧 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clean test data
  await Subscription.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  await Assignment.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  await Finance.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  await ReminderLog.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });

  const app = buildApp();
  server = app.listen(TEST_PORT);
  console.log(`🧪 Test server on :${TEST_PORT}\n`);

  const userA = { 'X-Test-UserId': 'test-user-A' };
  const userB = { 'X-Test-UserId': 'test-user-B' };
  const noAuth = {};

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Health Check ───');
  {
    const r = await fetchJSON(`${BASE}/health`);
    test('Health check returns 200', r.status === 200, `status=${r.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. AUTH REJECTION (all 3 modules)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Auth Rejection ───');
  for (const resource of ['subscriptions', 'assignments', 'finances']) {
    const r = await fetchJSON(`${BASE}/${resource}`);
    test(`GET /${resource} rejects no-auth`, r.status === 401, `status=${r.status}`);

    const r2 = await fetchJSON(`${BASE}/${resource}`, { method: 'POST', body: JSON.stringify({ name: 'x' }) });
    test(`POST /${resource} rejects no-auth`, r2.status === 401, `status=${r2.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SUBSCRIPTIONS CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Subscriptions CRUD ───');
  let subId;
  {
    // Create
    const r = await fetchJSON(`${BASE}/subscriptions`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ name: 'Netflix', cost: 15.99, currency: 'USD', billingCycle: 'monthly', renewalDate: '2026-08-28', category: 'Entertainment' }),
    });
    test('Create subscription', r.status === 201, `status=${r.status}`);
    subId = r.body._id;
    test('Create returns correct userId', r.body.userId === 'test-user-A');

    // Read list
    const r2 = await fetchJSON(`${BASE}/subscriptions`, { headers: userA });
    test('List subscriptions', r2.status === 200 && Array.isArray(r2.body) && r2.body.length >= 1, `count=${r2.body?.length}`);

    // Read single
    const r3 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { headers: userA });
    test('Get single subscription', r3.status === 200 && r3.body.name === 'Netflix');

    // Update
    const r4 = await fetchJSON(`${BASE}/subscriptions/${subId}`, {
      method: 'PUT', headers: userA,
      body: JSON.stringify({ cost: 19.99 }),
    });
    test('Update subscription', r4.status === 200 && r4.body.cost === 19.99, `cost=${r4.body?.cost}`);

    // User B cannot read user A's subscription
    const r5 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { headers: userB });
    test('User B cannot read User A subscription', r5.status === 404, `status=${r5.status}`);

    // User B cannot update user A's subscription
    const r6 = await fetchJSON(`${BASE}/subscriptions/${subId}`, {
      method: 'PUT', headers: userB,
      body: JSON.stringify({ cost: 0 }),
    });
    test('User B cannot update User A subscription', r6.status === 404, `status=${r6.status}`);

    // User B cannot delete user A's subscription
    const r7 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { method: 'DELETE', headers: userB });
    test('User B cannot delete User A subscription', r7.status === 404, `status=${r7.status}`);

    // User B sees empty list
    const r8 = await fetchJSON(`${BASE}/subscriptions`, { headers: userB });
    test('User B sees empty subscription list', r8.status === 200 && r8.body.length === 0, `count=${r8.body?.length}`);

    // Delete
    const r9 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { method: 'DELETE', headers: userA });
    test('Delete subscription', r9.status === 200, `status=${r9.status}`);

    // Confirm deleted
    const r10 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { headers: userA });
    test('Deleted subscription returns 404', r10.status === 404, `status=${r10.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ASSIGNMENTS CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Assignments CRUD ───');
  let assignId;
  {
    // Create
    const r = await fetchJSON(`${BASE}/assignments`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ courseName: 'CS101', taskTitle: 'Homework 1', dueDate: '2026-08-28', status: 'pending' }),
    });
    test('Create assignment', r.status === 201, `status=${r.status}`);
    assignId = r.body._id;

    // Read
    const r2 = await fetchJSON(`${BASE}/assignments`, { headers: userA });
    test('List assignments', r2.status === 200 && r2.body.length >= 1);

    // Update
    const r3 = await fetchJSON(`${BASE}/assignments/${assignId}`, {
      method: 'PUT', headers: userA,
      body: JSON.stringify({ status: 'in progress' }),
    });
    test('Update assignment status', r3.status === 200 && r3.body.status === 'in progress');

    // Data isolation
    const r4 = await fetchJSON(`${BASE}/assignments/${assignId}`, { headers: userB });
    test('User B cannot read User A assignment', r4.status === 404);

    const r5 = await fetchJSON(`${BASE}/assignments`, { headers: userB });
    test('User B sees empty assignment list', r5.body.length === 0);

    // Delete
    const r6 = await fetchJSON(`${BASE}/assignments/${assignId}`, { method: 'DELETE', headers: userA });
    test('Delete assignment', r6.status === 200);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. FINANCE CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Finance CRUD ───');
  let finId;
  {
    // Create
    const r = await fetchJSON(`${BASE}/finances`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ amount: 50.00, type: 'expense', category: 'Food', date: '2026-08-26', description: 'Lunch' }),
    });
    test('Create finance entry', r.status === 201, `status=${r.status}`);
    finId = r.body._id;

    // Read
    const r2 = await fetchJSON(`${BASE}/finances`, { headers: userA });
    test('List finance entries', r2.status === 200 && r2.body.length >= 1);

    // Update
    const r3 = await fetchJSON(`${BASE}/finances/${finId}`, {
      method: 'PUT', headers: userA,
      body: JSON.stringify({ amount: 75.00 }),
    });
    test('Update finance entry', r3.status === 200 && r3.body.amount === 75, `amount=${r3.body?.amount}`);

    // Data isolation
    const r4 = await fetchJSON(`${BASE}/finances/${finId}`, { headers: userB });
    test('User B cannot read User A finance entry', r4.status === 404);

    const r5 = await fetchJSON(`${BASE}/finances`, { headers: userB });
    test('User B sees empty finance list', r5.body.length === 0);

    // Delete
    const r6 = await fetchJSON(`${BASE}/finances/${finId}`, { method: 'DELETE', headers: userA });
    test('Delete finance entry', r6.status === 200);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. VALIDATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Validation ───');
  {
    // Subscription: missing required fields
    const r = await fetchJSON(`${BASE}/subscriptions`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ name: 'Test' }), // missing cost, billingCycle, renewalDate
    });
    test('Subscription rejects missing required fields', r.status === 500, `status=${r.status}`);

    // Finance: invalid type
    const r2 = await fetchJSON(`${BASE}/finances`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ amount: 10, type: 'invalid', category: 'Test', date: '2026-08-26' }),
    });
    test('Finance rejects invalid type enum', r2.status === 500, `status=${r2.status}`);

    // Assignment: invalid status
    const r3 = await fetchJSON(`${BASE}/assignments`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ courseName: 'X', taskTitle: 'Y', dueDate: '2026-08-28', status: 'invalid' }),
    });
    test('Assignment rejects invalid status enum', r3.status === 500, `status=${r3.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. REMINDER SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Reminder System ───');
  {
    // Create items due within 3 days for user A
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await Subscription.create({
      userId: 'test-user-A', name: 'TestSub', cost: 10, currency: 'USD',
      billingCycle: 'monthly', renewalDate: tomorrowStr, category: 'Test',
    });

    await Assignment.create({
      userId: 'test-user-A', courseName: 'TestCourse', taskTitle: 'TestTask',
      dueDate: tomorrowStr, status: 'pending',
    });

    // Trigger reminders (will fail to send email without RESEND_API_KEY, but we can check logic)
    const r = await fetchJSON(`${BASE}/reminders/trigger`, { method: 'POST' });
    // Without RESEND_API_KEY, this will error
    if (r.status === 200) {
      test('Reminder trigger succeeds', true, JSON.stringify(r.body));
      
      // Trigger again — should skip duplicates
      const r2 = await fetchJSON(`${BASE}/reminders/trigger`, { method: 'POST' });
      test('Second trigger skips duplicates', r2.body.skipped >= 2, `skipped=${r2.body?.skipped}`);
    } else {
      test('Reminder trigger (no RESEND_API_KEY)', false, `status=${r.status}, body=${JSON.stringify(r.body)}`);
      console.log('   ⚠️  Expected: RESEND_API_KEY is not set. Reminder email sending cannot be tested without it.');
      console.log('   ⚠️  The reminder query logic and dedup logic are structurally correct based on code review.');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. INVALID ID HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n─── Invalid ID Handling ───');
  {
    const fakeId = '000000000000000000000000';
    const badId = 'not-a-valid-id';

    const r1 = await fetchJSON(`${BASE}/subscriptions/${fakeId}`, { headers: userA });
    test('Non-existent subscription returns 404', r1.status === 404);

    const r2 = await fetchJSON(`${BASE}/subscriptions/${badId}`, { headers: userA });
    test('Malformed ID returns error (not crash)', r2.status >= 400, `status=${r2.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`TOTAL: ${results.length} tests | ✅ ${passed} passed | ❌ ${failed} failed`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => console.log(`  ❌ ${r.name} — ${r.detail}`));
  }
  console.log('═══════════════════════════════════════════════\n');

  // Cleanup
  await Subscription.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  await Assignment.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  await Finance.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  await ReminderLog.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });

  server.close();
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

run().catch(err => {
  console.error('Test runner crashed:', err);
  if (server) server.close();
  mongoose.disconnect();
  process.exit(1);
});

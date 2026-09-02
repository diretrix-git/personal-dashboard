/**
 * End-to-end backend API tests (post bug-fix)
 *
 * Tests all CRUD endpoints, auth rejection, data isolation, validation,
 * error handling (BUG-2/3 400 codes), userId stripping (BUG-1), and
 * reminder auth (BUG-4).
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const Subscription = require('./models/Subscription');
const Assignment = require('./models/Assignment');
const Finance = require('./models/Finance');
const ReminderLog = require('./models/ReminderLog');

const TEST_PORT = 5099;
const BASE = `http://localhost:${TEST_PORT}/api`;
let server;

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

const buildApp = () => {
  const app = express();
  const helmet = require('helmet');
  const cors = require('cors');

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Mock auth: read X-Test-UserId header
  app.use((req, res, next) => {
    const userId = req.headers['x-test-userid'];
    if (userId) req.auth = { userId };
    next();
  });

  // Patch requireAuth for tests
  require('@clerk/express').requireAuth = () => (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Clear module cache for routes so patched requireAuth takes effect
  Object.keys(require.cache)
    .filter(k => k.includes('routes') || k.includes('controllers'))
    .forEach(k => delete require.cache[k]);

  const routes = require('./routes/index');
  const errorHandler = require('./middleware/errorHandler');
  app.use('/api', routes);
  app.use(errorHandler);
  return app;
};

const run = async () => {
  console.log('\n🔧 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected\n');

  // Clean test data
  for (const Model of [Subscription, Assignment, Finance, ReminderLog]) {
    await Model.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  }

  const app = buildApp();
  server = app.listen(TEST_PORT);
  console.log(`🧪 Test server on :${TEST_PORT}\n`);

  const userA = { 'X-Test-UserId': 'test-user-A' };
  const userB = { 'X-Test-UserId': 'test-user-B' };

  // ════════════════════════════════════════════════════════════════════════
  // 1. HEALTH CHECK
  // ════════════════════════════════════════════════════════════════════════
  console.log('─── Health Check ───');
  {
    const r = await fetchJSON(`${BASE}/health`);
    test('Health check returns 200', r.status === 200);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. AUTH REJECTION
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n─── Auth Rejection ───');
  for (const resource of ['subscriptions', 'assignments', 'finances']) {
    const r = await fetchJSON(`${BASE}/${resource}`);
    test(`GET /${resource} rejects no-auth`, r.status === 401);
    const r2 = await fetchJSON(`${BASE}/${resource}`, {
      method: 'POST', body: JSON.stringify({ name: 'x' }),
    });
    test(`POST /${resource} rejects no-auth`, r2.status === 401);
  }

  // BUG-4: Reminder trigger now requires auth
  {
    const r = await fetchJSON(`${BASE}/reminders/trigger`, { method: 'POST' });
    test('POST /reminders/trigger rejects no-auth (BUG-4)', r.status === 401, `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. SUBSCRIPTIONS CRUD
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n─── Subscriptions CRUD ───');
  let subId;
  {
    const r = await fetchJSON(`${BASE}/subscriptions`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ name: 'Netflix', cost: 15.99, currency: 'USD', billingCycle: 'monthly', renewalDate: '2026-09-05', category: 'Entertainment' }),
    });
    test('Create subscription', r.status === 201);
    subId = r.body._id;
    test('Create returns correct userId', r.body.userId === 'test-user-A');

    const r2 = await fetchJSON(`${BASE}/subscriptions`, { headers: userA });
    test('List subscriptions', r2.status === 200 && r2.body.length >= 1);

    const r3 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { headers: userA });
    test('Get single subscription', r3.status === 200 && r3.body.name === 'Netflix');

    const r4 = await fetchJSON(`${BASE}/subscriptions/${subId}`, {
      method: 'PUT', headers: userA,
      body: JSON.stringify({ cost: 19.99 }),
    });
    test('Update subscription', r4.status === 200 && r4.body.cost === 19.99);

    // BUG-1: userId in PUT body should be stripped
    const r4b = await fetchJSON(`${BASE}/subscriptions/${subId}`, {
      method: 'PUT', headers: userA,
      body: JSON.stringify({ userId: 'hacker-id', cost: 20 }),
    });
    test('BUG-1: userId in PUT body is stripped', r4b.status === 200 && r4b.body.userId === 'test-user-A', `userId=${r4b.body?.userId}`);

    // Data isolation
    const r5 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { headers: userB });
    test('User B cannot read User A subscription', r5.status === 404);
    const r6 = await fetchJSON(`${BASE}/subscriptions/${subId}`, {
      method: 'PUT', headers: userB, body: JSON.stringify({ cost: 0 }),
    });
    test('User B cannot update User A subscription', r6.status === 404);
    const r7 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { method: 'DELETE', headers: userB });
    test('User B cannot delete User A subscription', r7.status === 404);
    const r8 = await fetchJSON(`${BASE}/subscriptions`, { headers: userB });
    test('User B sees empty list', r8.body.length === 0);

    const r9 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { method: 'DELETE', headers: userA });
    test('Delete subscription', r9.status === 200);
    const r10 = await fetchJSON(`${BASE}/subscriptions/${subId}`, { headers: userA });
    test('Deleted returns 404', r10.status === 404);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 4. ASSIGNMENTS CRUD
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n─── Assignments CRUD ───');
  let assignId;
  {
    const r = await fetchJSON(`${BASE}/assignments`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ courseName: 'CS101', taskTitle: 'Homework 1', dueDate: '2026-09-05', status: 'pending' }),
    });
    test('Create assignment', r.status === 201);
    assignId = r.body._id;

    // BUG-6: Update with only status field
    const r3 = await fetchJSON(`${BASE}/assignments/${assignId}`, {
      method: 'PUT', headers: userA,
      body: JSON.stringify({ status: 'in progress' }),
    });
    test('Update assignment with only status (BUG-6)', r3.status === 200 && r3.body.status === 'in progress');

    // Data isolation
    const r4 = await fetchJSON(`${BASE}/assignments/${assignId}`, { headers: userB });
    test('User B cannot read User A assignment', r4.status === 404);

    const r6 = await fetchJSON(`${BASE}/assignments/${assignId}`, { method: 'DELETE', headers: userA });
    test('Delete assignment', r6.status === 200);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 5. FINANCE CRUD
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n─── Finance CRUD ───');
  let finId;
  {
    const r = await fetchJSON(`${BASE}/finances`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ amount: 50, type: 'expense', category: 'Food', date: '2026-09-02', description: 'Lunch' }),
    });
    test('Create finance entry', r.status === 201);
    finId = r.body._id;

    const r3 = await fetchJSON(`${BASE}/finances/${finId}`, {
      method: 'PUT', headers: userA,
      body: JSON.stringify({ amount: 75 }),
    });
    test('Update finance entry', r3.status === 200 && r3.body.amount === 75);

    const r4 = await fetchJSON(`${BASE}/finances/${finId}`, { headers: userB });
    test('User B cannot read User A finance', r4.status === 404);

    const r6 = await fetchJSON(`${BASE}/finances/${finId}`, { method: 'DELETE', headers: userA });
    test('Delete finance entry', r6.status === 200);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 6. VALIDATION — BUG-2 (should be 400, not 500)
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n─── Validation (BUG-2: 400 not 500) ───');
  {
    const r = await fetchJSON(`${BASE}/subscriptions`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ name: 'Test' }), // missing required fields
    });
    test('BUG-2: Missing fields returns 400', r.status === 400, `status=${r.status}`);

    const r2 = await fetchJSON(`${BASE}/finances`, {
      method: 'POST', headers: userA,
      body: JSON.stringify({ amount: 10, type: 'invalid', category: 'Test', date: '2026-09-02' }),
    });
    test('BUG-2: Invalid enum returns 400', r2.status === 400, `status=${r2.status}`);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 7. MALFORMED ID — BUG-3 (should be 400, not 500)
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n─── Malformed ID (BUG-3: 400 not 500) ───');
  {
    const fakeId = '000000000000000000000000';
    const badId = 'not-a-valid-id';

    const r1 = await fetchJSON(`${BASE}/subscriptions/${fakeId}`, { headers: userA });
    test('Non-existent ID returns 404', r1.status === 404);

    const r2 = await fetchJSON(`${BASE}/subscriptions/${badId}`, { headers: userA });
    test('BUG-3: Malformed ID returns 400', r2.status === 400, `status=${r2.status}`);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════════════════
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
  for (const Model of [Subscription, Assignment, Finance, ReminderLog]) {
    await Model.deleteMany({ userId: { $in: ['test-user-A', 'test-user-B'] } });
  }

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

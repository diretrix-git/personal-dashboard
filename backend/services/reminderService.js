const { Resend } = require('resend');
const Subscription = require('../models/Subscription');
const Assignment = require('../models/Assignment');
const ReminderLog = require('../models/ReminderLog');

// ── Resend client (lazy-initialised so startup doesn't crash if key is missing)
let resend;
const getResend = () => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

/**
 * Build a date range from now → +3 days (end of day, UTC).
 */
const getUpcomingWindow = () => {
  const now = new Date();
  const threeDaysOut = new Date(now);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);
  threeDaysOut.setHours(23, 59, 59, 999);
  return { now, threeDaysOut };
};

/**
 * Normalise a Date to midnight UTC for the reminderDate dedup key.
 */
const toDateKey = (d) => {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

/**
 * Try to insert a ReminderLog entry.
 * Returns true if the insert succeeded (first time), false if it was a duplicate.
 */
const markAsSent = async (itemId, itemType, userId, dateKey) => {
  try {
    await ReminderLog.create({
      itemId,
      itemType,
      userId,
      reminderDate: dateKey,
    });
    return true; // first time — ok to send
  } catch (err) {
    if (err.code === 11000) return false; // duplicate — already sent
    throw err; // unexpected error — let it bubble
  }
};

/**
 * Send a single reminder email via Resend.
 */
const sendEmail = async ({ to, subject, html }) => {
  const client = getResend();
  const { data, error } = await client.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Personal Dashboard <onboarding@resend.dev>',
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw error;
  }
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Core reminder logic (called by cron AND the manual trigger endpoint)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans for upcoming subscriptions & assignments, sends reminder emails,
 * and skips any item that already received a reminder today.
 *
 * Returns a summary object for logging / API response.
 */
const processReminders = async () => {
  const { now, threeDaysOut } = getUpcomingWindow();
  const todayKey = toDateKey(now);
  const results = { subscriptions: 0, assignments: 0, skipped: 0, errors: [] };

  // ── Subscriptions renewing within 3 days ─────────────────────────────────
  const upcomingSubs = await Subscription.find({
    renewalDate: { $gte: now, $lte: threeDaysOut },
  });

  for (const sub of upcomingSubs) {
    const isNew = await markAsSent(sub._id, 'subscription', sub.userId, todayKey);
    if (!isNew) {
      results.skipped++;
      continue;
    }

    try {
      const renewalStr = sub.renewalDate.toISOString().split('T')[0];
      await sendEmail({
        to: process.env.REMINDER_RECIPIENT_EMAIL || 'delivered@resend.dev',
        subject: `Subscription Reminder: ${sub.name} renews on ${renewalStr}`,
        html: `
          <h2>Subscription Renewal Reminder</h2>
          <p>Your subscription <strong>${sub.name}</strong> is renewing soon.</p>
          <ul>
            <li><strong>Cost:</strong> ${sub.currency} ${sub.cost}</li>
            <li><strong>Billing Cycle:</strong> ${sub.billingCycle}</li>
            <li><strong>Renewal Date:</strong> ${renewalStr}</li>
            <li><strong>Category:</strong> ${sub.category}</li>
          </ul>
          <p>Review or cancel it in your <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}">dashboard</a>.</p>
        `,
      });
      results.subscriptions++;
    } catch (err) {
      results.errors.push({ type: 'subscription', id: sub._id, error: err.message });
    }
  }

  // ── Assignments due within 3 days ────────────────────────────────────────
  const upcomingAssignments = await Assignment.find({
    dueDate: { $gte: now, $lte: threeDaysOut },
    status: { $ne: 'done' },          // no point reminding about finished work
  });

  for (const task of upcomingAssignments) {
    const isNew = await markAsSent(task._id, 'assignment', task.userId, todayKey);
    if (!isNew) {
      results.skipped++;
      continue;
    }

    try {
      const dueStr = task.dueDate.toISOString().split('T')[0];
      await sendEmail({
        to: process.env.REMINDER_RECIPIENT_EMAIL || 'delivered@resend.dev',
        subject: `Assignment Due Soon: ${task.taskTitle} (${dueStr})`,
        html: `
          <h2>Assignment Due Date Reminder</h2>
          <p>Your assignment <strong>${task.taskTitle}</strong> is due soon.</p>
          <ul>
            <li><strong>Course:</strong> ${task.courseName}</li>
            <li><strong>Due Date:</strong> ${dueStr}</li>
            <li><strong>Status:</strong> ${task.status}</li>
            ${task.description ? `<li><strong>Description:</strong> ${task.description}</li>` : ''}
          </ul>
          <p>Check your <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}">dashboard</a> for details.</p>
        `,
      });
      results.assignments++;
    } catch (err) {
      results.errors.push({ type: 'assignment', id: task._id, error: err.message });
    }
  }

  return results;
};

module.exports = { processReminders };

const cron = require('node-cron');
const { processReminders } = require('../services/reminderService');

/**
 * Starts the daily reminder cron job.
 *
 * Schedule: every day at 08:00 server-local time.
 * Override with the REMINDER_CRON env var for custom schedules.
 */
const startReminderCron = () => {
  const schedule = process.env.REMINDER_CRON || '0 8 * * *';

  const task = cron.schedule(schedule, async () => {
    console.log(`[cron] Reminder job started at ${new Date().toISOString()}`);
    try {
      const results = await processReminders();
      console.log('[cron] Reminder job completed:', JSON.stringify(results));
    } catch (err) {
      console.error('[cron] Reminder job failed:', err);
    }
  });

  console.log(`[cron] Daily reminder scheduled (${schedule})`);
  return task;
};

module.exports = { startReminderCron };

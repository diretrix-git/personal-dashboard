const express = require('express');
const router = express.Router();
const { processReminders } = require('../services/reminderService');

// @desc    Manually trigger the reminder check (for testing)
// @route   POST /api/reminders/trigger
// @access  Should be admin-only in production; unprotected here for dev convenience
router.post('/trigger', async (req, res, next) => {
  try {
    console.log('[reminders] Manual trigger fired');
    const results = await processReminders();
    res.json({
      message: 'Reminder check completed',
      ...results,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

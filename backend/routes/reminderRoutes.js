const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const { processReminders } = require('../services/reminderService');

// @desc    Manually trigger the reminder check (for testing)
// @route   POST /api/reminders/trigger
// @access  Private (requires authenticated user)
router.post('/trigger', requireAuth(), async (req, res, next) => {
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

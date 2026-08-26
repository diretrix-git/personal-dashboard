const express = require('express');
const router = express.Router();

// Health-check route — confirms the API is reachable
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount feature routers
const subscriptionRoutes = require('./subscriptionRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const reminderRoutes = require('./reminderRoutes');

router.use('/subscriptions', subscriptionRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/reminders', reminderRoutes);

module.exports = router;

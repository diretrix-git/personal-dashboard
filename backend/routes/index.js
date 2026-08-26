const express = require('express');
const router = express.Router();

// Health-check route — confirms the API is reachable
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: mount feature routers here as you build them, e.g.:
// const userRoutes = require('./userRoutes');
// router.use('/users', userRoutes);

module.exports = router;

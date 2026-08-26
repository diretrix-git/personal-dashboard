const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');

// All routes here are protected
router.use(requireAuth());

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router.route('/:id')
  .get(getSubscription)
  .put(updateSubscription)
  .delete(deleteSubscription);

module.exports = router;

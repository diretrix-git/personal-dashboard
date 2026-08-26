const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const {
  getFinances,
  getFinance,
  createFinance,
  updateFinance,
  deleteFinance,
} = require('../controllers/financeController');

// All routes here are protected
router.use(requireAuth());

router.route('/')
  .get(getFinances)
  .post(createFinance);

router.route('/:id')
  .get(getFinance)
  .put(updateFinance)
  .delete(deleteFinance);

module.exports = router;

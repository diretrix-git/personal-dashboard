const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');

// All routes here are protected
router.use(requireAuth());

router.route('/')
  .get(getAssignments)
  .post(createAssignment);

router.route('/:id')
  .get(getAssignment)
  .put(updateAssignment)
  .delete(deleteAssignment);

module.exports = router;

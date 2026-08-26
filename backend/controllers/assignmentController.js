const Assignment = require('../models/Assignment');

// @desc    Get all assignments for the authenticated user
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const assignments = await Assignment.find({ userId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const assignment = await Assignment.findOne({ _id: req.params.id, userId });

    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private
const createAssignment = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const assignmentData = { ...req.body, userId };

    const assignment = await Assignment.create(assignmentData);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an assignment
// @route   PUT /api/assignments/:id
// @access  Private
const updateAssignment = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    // Strip fields the client must never overwrite
    const { userId: _u, _id, createdAt, updatedAt, __v, ...updateData } = req.body;
    
    // Ensure we only update if it belongs to the user
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private
const deleteAssignment = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId });

    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    res.json({ message: 'Assignment removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};

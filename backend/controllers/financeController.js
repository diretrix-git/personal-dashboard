const Finance = require('../models/Finance');

// @desc    Get all finance entries for the authenticated user
// @route   GET /api/finances
// @access  Private
const getFinances = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const finances = await Finance.find({ userId }).sort({ date: -1 });
    res.json(finances);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single finance entry
// @route   GET /api/finances/:id
// @access  Private
const getFinance = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const finance = await Finance.findOne({ _id: req.params.id, userId });

    if (!finance) {
      res.status(404);
      throw new Error('Finance entry not found');
    }

    res.json(finance);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new finance entry
// @route   POST /api/finances
// @access  Private
const createFinance = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const financeData = { ...req.body, userId };

    const finance = await Finance.create(financeData);
    res.status(201).json(finance);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a finance entry
// @route   PUT /api/finances/:id
// @access  Private
const updateFinance = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    
    // Ensure we only update if it belongs to the user
    const finance = await Finance.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!finance) {
      res.status(404);
      throw new Error('Finance entry not found');
    }

    res.json(finance);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a finance entry
// @route   DELETE /api/finances/:id
// @access  Private
const deleteFinance = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    
    const finance = await Finance.findOneAndDelete({ _id: req.params.id, userId });

    if (!finance) {
      res.status(404);
      throw new Error('Finance entry not found');
    }

    res.json({ message: 'Finance entry removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinances,
  getFinance,
  createFinance,
  updateFinance,
  deleteFinance,
};

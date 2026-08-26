const Subscription = require('../models/Subscription');

// @desc    Get all subscriptions for the authenticated user
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const subscriptions = await Subscription.find({ userId }).sort({ renewalDate: 1 });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscription = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const subscription = await Subscription.findOne({ _id: req.params.id, userId });

    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const subscriptionData = { ...req.body, userId };

    const subscription = await Subscription.create(subscriptionData);
    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    // Strip fields the client must never overwrite
    const { userId: _u, _id, createdAt, updatedAt, __v, ...updateData } = req.body;
    
    // Ensure we only update if it belongs to the user
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    
    const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, userId });

    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }

    res.json({ message: 'Subscription removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};

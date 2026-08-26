const mongoose = require('mongoose');

/**
 * Subscription model
 *
 * Tracks a user's recurring service subscription (e.g. Netflix, Spotify).
 * userId stores the Clerk user ID string — no User collection needed yet.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    // ── Ownership ────────────────────────────────────────────────────────────
    userId: {
      type: String,
      required: [true, 'userId is required'],
      trim: true,
      index: true,           // fast look-ups by Clerk user ID
    },

    // ── Core fields ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },

    currency: {
      type: String,
      required: [true, 'Currency is required'],
      trim: true,
      uppercase: true,
      default: 'USD',
      maxlength: [3, 'Currency must be a 3-letter ISO 4217 code (e.g. USD)'],
    },

    billingCycle: {
      type: String,
      required: [true, 'Billing cycle is required'],
      enum: {
        values: ['weekly', 'monthly', 'yearly'],
        message: 'billingCycle must be weekly, monthly, or yearly',
      },
    },

    renewalDate: {
      type: Date,
      required: [true, 'Renewal date is required'],
    },

    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
      default: 'Other',
    },
  },
  {
    // Automatically manages createdAt and updatedAt
    timestamps: true,
    // Clean JSON output (removes __v)
    toJSON: { versionKey: false },
    toObject: { versionKey: false },
  }
);

// ── Compound index: list all subscriptions for a user sorted by renewal date
subscriptionSchema.index({ userId: 1, renewalDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

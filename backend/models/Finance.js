const mongoose = require('mongoose');

/**
 * Finance model
 *
 * Tracks a user's income and expense entries.
 * userId stores the Clerk user ID string — no User collection needed yet.
 */
const financeSchema = new mongoose.Schema(
  {
    // ── Ownership ────────────────────────────────────────────────────────────
    userId: {
      type: String,
      required: [true, 'userId is required'],
      trim: true,
      index: true,           // fast look-ups by Clerk user ID
    },

    // ── Core fields ──────────────────────────────────────────────────────────
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'type must be income or expense',
      },
    },

    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
      default: 'Other',
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
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

// ── Compound index: list all finance entries for a user sorted by date
financeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Finance', financeSchema);

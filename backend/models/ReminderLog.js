const mongoose = require('mongoose');

/**
 * ReminderLog model
 *
 * Tracks which reminder emails have already been sent so the daily cron
 * job never sends duplicates for the same item in the same date window.
 *
 * The compound unique index on (itemId, itemType, reminderDate) guarantees
 * at most one reminder per item per calendar day.
 */
const reminderLogSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Distinguishes subscription reminders from assignment reminders
    itemType: {
      type: String,
      required: true,
      enum: ['subscription', 'assignment'],
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Calendar date the reminder was sent for (YYYY-MM-DD normalised to midnight UTC)
    reminderDate: {
      type: Date,
      required: true,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// One reminder per item per day — duplicate insert attempts will throw E11000
reminderLogSchema.index(
  { itemId: 1, itemType: 1, reminderDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('ReminderLog', reminderLogSchema);

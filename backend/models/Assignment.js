const mongoose = require('mongoose');

/**
 * Assignment model
 *
 * Tracks a user's academic or personal task within a course.
 * userId stores the Clerk user ID string.
 */
const assignmentSchema = new mongoose.Schema(
  {
    // ── Ownership ────────────────────────────────────────────────────────────
    userId: {
      type: String,
      required: [true, 'userId is required'],
      trim: true,
      index: true,           // fast look-ups by Clerk user ID
    },

    // ── Core fields ──────────────────────────────────────────────────────────
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [150, 'Course name cannot exceed 150 characters'],
    },

    taskTitle: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },

    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },

    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'in progress', 'done'],
        message: 'status must be pending, in progress, or done',
      },
      default: 'pending',
    },
  },
  {
    // Automatically manages createdAt and updatedAt
    timestamps: true,
    toJSON: { versionKey: false },
    toObject: { versionKey: false },
  }
);

// ── Compound index: list a user's assignments sorted by due date
assignmentSchema.index({ userId: 1, dueDate: 1 });

// ── Compound index: filter a user's assignments by status efficiently
assignmentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);

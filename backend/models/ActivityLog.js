const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'approve_user',
      'ban_user',
      'unban_user',
      'promote_admin',
      'demote_admin',
      'login',
      'logout'
    ]
  },
  target_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ user_id: 1, timestamp: -1 });
activityLogSchema.index({ target_user_id: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discord_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: String,
  discriminator: String,
  avatar: String,
  email: String,
  access_token: String,
  refresh_token: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'owner'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'banned'],
    default: 'pending'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: Date,
  last_login: {
    type: Date,
    default: Date.now
  },
  last_activity: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);


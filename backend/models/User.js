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
  last_login: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);


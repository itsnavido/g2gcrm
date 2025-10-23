const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  api_key: {
    type: String,
    required: true
  },
  api_base_url: {
    type: String,
    default: 'https://prod.your-api-server.com'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);


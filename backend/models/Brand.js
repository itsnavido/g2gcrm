const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brand_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  service_id: {
    type: String,
    required: true,
    index: true
  },
  brand_name: String,
  fetched_at: {
    type: Number,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Brand', brandSchema);


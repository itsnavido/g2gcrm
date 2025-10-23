const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  service_name: String,
  delivery_method: String,
  fetched_at: {
    type: Number,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);


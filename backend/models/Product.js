const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  product_name: String,
  service_id: String,
  service_name: String,
  brand_id: String,
  brand_name: String,
  region_name: String,
  fetched_at: {
    type: Number,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);


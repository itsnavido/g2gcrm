const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offer_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  seller_id: String,
  offer_type: String,
  product_id: String,
  service_id: String,
  brand_id: String,
  region_id: String,
  title: String,
  description: String,
  status: String,
  currency: String,
  unit_price: Number,
  min_qty: Number,
  available_qty: Number,
  api_qty: Number,
  low_stock_alert_qty: Number,
  created_at: Number,
  updated_at: Number,
  fetched_at: {
    type: Number,
    default: Date.now
  },
  data_json: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);


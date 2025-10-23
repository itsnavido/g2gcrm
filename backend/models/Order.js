const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  seller_store_name: String,
  seller_id: String,
  buyer_id: String,
  order_status: String,
  amount: Number,
  unit_price: Number,
  currency: String,
  purchased_qty: Number,
  delivered_qty: Number,
  refunded_qty: Number,
  defected_qty: Number,
  replacement_qty: Number,
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

module.exports = mongoose.model('Order', orderSchema);


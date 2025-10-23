const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  item_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  offer_id: {
    type: String,
    required: true,
    index: true
  },
  content: String,
  content_type: String,
  reference_id: String
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);


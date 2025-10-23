const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  event_type: String,
  webhook_url: String,
  http_status: Number,
  response_time: Number,
  event_sent_at: Number,
  data_json: mongoose.Schema.Types.Mixed,
  fetched_at: {
    type: Number,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebhookLog', webhookLogSchema);


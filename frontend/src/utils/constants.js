export const ORDER_STATUSES = {
  VERIFYING_PAYMENT: 'verifying_payment',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const OFFER_STATUSES = {
  LIVE: 'live',
  DRAFT: 'draft',
  INACTIVE: 'inactive'
};

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'MYR', 'SGD', 'JPY', 'CNY', 'AUD', 'CAD'
];

export const CONTENT_TYPES = [
  'text/plain',
  'application/json',
  'text/csv'
];

export const WEBHOOK_EVENT_TYPES = [
  'order.confirmed',
  'order.api_delivery',
  'order.completed',
  'order.cancelled',
  'offer.low_stock'
];


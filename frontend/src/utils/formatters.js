import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (timestamp, formatString = 'MMM dd, yyyy HH:mm') => {
  if (!timestamp) return 'N/A';
  return format(new Date(timestamp), formatString);
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const getStatusColor = (status) => {
  const statusColors = {
    live: 'text-green-600 bg-green-100',
    active: 'text-green-600 bg-green-100',
    delivering: 'text-blue-600 bg-blue-100',
    delivered: 'text-green-600 bg-green-100',
    completed: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    verifying_payment: 'text-yellow-600 bg-yellow-100',
    cancelled: 'text-red-600 bg-red-100',
    refunded: 'text-red-600 bg-red-100',
    draft: 'text-gray-600 bg-gray-100',
    inactive: 'text-gray-600 bg-gray-100'
  };
  
  return statusColors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100';
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};


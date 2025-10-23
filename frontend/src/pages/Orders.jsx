import { useEffect, useState } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import useOrdersStore from '../stores/useOrdersStore';
import useToastStore from '../stores/useToastStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const Orders = () => {
  const { orders, loading, fetchOrders, fetchOrder, currentOrder, clearCurrentOrder } = useOrdersStore();
  const { success, error } = useToastStore();
  
  const [searchId, setSearchId] = useState('');
  const [searching, setSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchId.trim()) {
      error('Please enter an Order ID');
      return;
    }

    setSearching(true);
    try {
      await fetchOrder(searchId.trim(), true);
      success('Order fetched successfully!');
      setSearchId('');
    } catch (err) {
      error('Failed to fetch order: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleViewOrder = (order) => {
    useOrdersStore.setState({ currentOrder: order });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    clearCurrentOrder();
  };

  return (
    <div>
      <Header 
        title="Orders" 
        action={
          <button 
            onClick={() => fetchOrders()}
            disabled={loading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />
      
      <div className="p-8">
        {/* Search Form */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order ID to fetch..."
              className="input flex-1"
            />
            <button 
              type="submit" 
              disabled={searching}
              className="btn btn-primary flex items-center gap-2"
            >
              {searching ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Fetch Order
                </>
              )}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            Search for an order by ID. If not cached, it will be fetched from the API and saved.
          </p>
        </div>

        {/* Orders Table */}
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No orders found. Search for an order ID above to get started.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.order_id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.amount, order.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.purchased_qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.delivered_qty} / {order.purchased_qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Order Details"
        size="lg"
      >
        {currentOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Order ID</label>
                <p className="text-gray-900 font-medium">{currentOrder.order_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={currentOrder.order_status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Seller Store</label>
                <p className="text-gray-900">{currentOrder.seller_store_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Buyer ID</label>
                <p className="text-gray-900">{currentOrder.buyer_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className="text-gray-900 font-semibold">
                  {formatCurrency(currentOrder.amount, currentOrder.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unit Price</label>
                <p className="text-gray-900">
                  {formatCurrency(currentOrder.unit_price, currentOrder.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Purchased Quantity</label>
                <p className="text-gray-900">{currentOrder.purchased_qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Delivered Quantity</label>
                <p className="text-gray-900">{currentOrder.delivered_qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Refunded Quantity</label>
                <p className="text-gray-900">{currentOrder.refunded_qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Defected Quantity</label>
                <p className="text-gray-900">{currentOrder.defected_qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-gray-900">{formatDate(currentOrder.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p className="text-gray-900">{formatDate(currentOrder.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;


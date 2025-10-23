import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import useOffersStore from '../stores/useOffersStore';
import useToastStore from '../stores/useToastStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CURRENCIES } from '../utils/constants';
import api from '../utils/api';

const Offers = () => {
  const { offers, loading, fetchOffers, createOffer, updateOffer, deleteOffer } = useOffersStore();
  const { success, error } = useToastStore();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [submitting, setSubmitting] = useState(false);

  // Product selection state
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchOffers();
    loadServices();
  }, []);

  function getEmptyForm() {
    return {
      product_id: '',
      offer_attributes: [],
      unit_price: '',
      min_qty: 1,
      api_qty: '',
      low_stock_alert_qty: '',
      currency: 'MYR'
    };
  }

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      if (response.success) {
        setServices(response.data);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const loadBrands = async (serviceId) => {
    try {
      const response = await api.get(`/brands/${serviceId}`);
      if (response.success) {
        setBrands(response.data);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  const loadProducts = async (serviceId, brandId) => {
    setLoadingProducts(true);
    try {
      const response = await api.get(`/products?service_id=${serviceId}&brand_id=${brandId}`);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadAttributes = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/attributes`);
      if (response.success) {
        setAttributes(response.data);
      }
    } catch (err) {
      console.error('Failed to load attributes:', err);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedOffer(null);
    setFormData(getEmptyForm());
    setShowModal(true);
  };

  const handleEdit = (offer) => {
    setModalMode('edit');
    setSelectedOffer(offer);
    
    // Parse data_json if it exists
    const offerData = offer.data_json ? JSON.parse(offer.data_json) : offer;
    
    setFormData({
      product_id: offer.product_id || '',
      offer_attributes: offerData.offer_attributes || [],
      unit_price: offer.unit_price || '',
      min_qty: offer.min_qty || 1,
      api_qty: offer.api_qty || '',
      low_stock_alert_qty: offer.low_stock_alert_qty || '',
      currency: offer.currency || 'MYR'
    });
    setShowModal(true);
  };

  const handleView = (offer) => {
    setModalMode('view');
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.product_id) {
      error('Please select a product');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        min_qty: parseInt(formData.min_qty),
        api_qty: parseInt(formData.api_qty),
        low_stock_alert_qty: parseInt(formData.low_stock_alert_qty)
      };

      if (modalMode === 'create') {
        await createOffer(submitData);
        success('Offer created successfully!');
      } else {
        await updateOffer(selectedOffer.offer_id, submitData);
        success('Offer updated successfully!');
      }
      
      setShowModal(false);
      setFormData(getEmptyForm());
    } catch (err) {
      error('Failed to save offer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      await deleteOffer(offerId);
      success('Offer deleted successfully!');
    } catch (err) {
      error('Failed to delete offer: ' + err.message);
    }
  };

  return (
    <div>
      <Header 
        title="Offers" 
        action={
          <div className="flex gap-3">
            <button 
              onClick={() => fetchOffers(true)}
              disabled={loading}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={handleCreate}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Offer
            </button>
          </div>
        }
      />
      
      <div className="p-8">
        {loading && offers.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading offers..." />
          </div>
        ) : offers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No offers found. Create your first offer to get started.</p>
            <button onClick={handleCreate} className="btn btn-primary">
              Create Offer
            </button>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offer ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer.offer_id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {offer.offer_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {offer.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(offer.unit_price, offer.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {offer.available_qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(offer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(offer)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(offer)}
                          className="text-green-600 hover:text-green-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(offer.offer_id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal && (modalMode === 'create' || modalMode === 'edit')}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Create Offer' : 'Edit Offer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product ID *</label>
            <input
              type="text"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="input"
              placeholder="e.g., d003e03b-c09b-45c7-a943-2a6441be5f5e"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Browse products in the Products page to find product IDs</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input"
                required
              >
                {CURRENCIES.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Quantity *</label>
              <input
                type="number"
                value={formData.min_qty}
                onChange={(e) => setFormData({ ...formData, min_qty: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Quantity *</label>
              <input
                type="number"
                value={formData.api_qty}
                onChange={(e) => setFormData({ ...formData, api_qty: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
              <input
                type="number"
                value={formData.low_stock_alert_qty}
                onChange={(e) => setFormData({ ...formData, low_stock_alert_qty: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? <LoadingSpinner size="sm" /> : modalMode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showModal && modalMode === 'view'}
        onClose={() => setShowModal(false)}
        title="Offer Details"
        size="lg"
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Offer ID</label>
                <p className="text-gray-900 font-medium">{selectedOffer.offer_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedOffer.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="text-gray-900">{selectedOffer.title || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Product ID</label>
                <p className="text-gray-900 text-xs">{selectedOffer.product_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unit Price</label>
                <p className="text-gray-900 font-semibold">
                  {formatCurrency(selectedOffer.unit_price, selectedOffer.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Min Quantity</label>
                <p className="text-gray-900">{selectedOffer.min_qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Available Quantity</label>
                <p className="text-gray-900">{selectedOffer.available_qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">API Quantity</label>
                <p className="text-gray-900">{selectedOffer.api_qty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-gray-900">{formatDate(selectedOffer.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p className="text-gray-900">{formatDate(selectedOffer.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Offers;


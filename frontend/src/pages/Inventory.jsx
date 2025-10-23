import { useState, useEffect } from 'react';
import { Upload, Trash2, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import useToastStore from '../stores/useToastStore';
import useOffersStore from '../stores/useOffersStore';
import { formatDate } from '../utils/formatters';
import { CONTENT_TYPES } from '../utils/constants';
import api from '../utils/api';

const Inventory = () => {
  const { offers, fetchOffers } = useOffersStore();
  const { success, error } = useToastStore();
  
  const [selectedOffer, setSelectedOffer] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    content: '',
    content_type: 'text/plain',
    reference_id: ''
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (selectedOffer) {
      loadInventory(selectedOffer);
    }
  }, [selectedOffer]);

  const loadInventory = async (offerId) => {
    setLoading(true);
    try {
      const response = await api.get(`/inventory/${offerId}`);
      if (response.success) {
        setItems(response.data);
      }
    } catch (err) {
      error('Failed to load inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedOffer) {
      error('Please select an offer first');
      return;
    }

    if (!formData.content.trim()) {
      error('Please enter code content');
      return;
    }

    setUploading(true);
    try {
      const response = await api.post(`/inventory/${selectedOffer}`, formData);
      if (response.success) {
        success('Code uploaded successfully!');
        setFormData({ content: '', content_type: 'text/plain', reference_id: '' });
        loadInventory(selectedOffer);
      }
    } catch (err) {
      error('Failed to upload code: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this code?')) {
      return;
    }

    try {
      const response = await api.delete(`/inventory/${selectedOffer}/${itemId}`);
      if (response.success) {
        success('Code deleted successfully!');
        loadInventory(selectedOffer);
      }
    } catch (err) {
      error('Failed to delete code: ' + err.message);
    }
  };

  const selectedOfferData = offers.find(o => o.offer_id === selectedOffer);

  return (
    <div>
      <Header title="Inventory Management" />
      
      <div className="p-8">
        {/* Offer Selection */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Offer</h2>
          <select
            value={selectedOffer}
            onChange={(e) => setSelectedOffer(e.target.value)}
            className="input"
          >
            <option value="">Choose an offer to manage inventory...</option>
            {offers.map((offer) => (
              <option key={offer.offer_id} value={offer.offer_id}>
                {offer.offer_id} - {offer.title || 'Untitled'}
              </option>
            ))}
          </select>

          {selectedOfferData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Available Qty:</span>
                  <span className="ml-2 font-medium">{selectedOfferData.available_qty}</span>
                </div>
                <div>
                  <span className="text-gray-500">API Qty:</span>
                  <span className="ml-2 font-medium">{selectedOfferData.api_qty}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium">{selectedOfferData.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedOffer && (
          <>
            {/* Upload Form */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Code</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="e.g., ABC123XYZ,31 Dec 2025"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the code content. Use comma to separate multiple values if needed.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.content_type}
                      onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                      className="input"
                    >
                      {CONTENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference ID
                    </label>
                    <input
                      type="text"
                      value={formData.reference_id}
                      onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                      className="input"
                      placeholder="Optional reference"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Code
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Inventory Items */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
                <button
                  onClick={() => loadInventory(selectedOffer)}
                  disabled={loading}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading inventory..." />
                </div>
              ) : items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No inventory items yet. Upload codes to get started.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.item_id} className="table-row">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            {item.item_id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate">
                              {item.content}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.content_type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.reference_id || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(item.item_id)}
                              className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;


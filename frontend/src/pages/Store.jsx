import { useEffect, useState } from 'react';
import { Store as StoreIcon, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import useToastStore from '../stores/useToastStore';
import api from '../utils/api';

const Store = () => {
  const { error } = useToastStore();
  
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/store');
      if (response.success) {
        setStoreData(response.data);
      }
    } catch (err) {
      error('Failed to load store settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header 
        title="Store Information" 
        action={
          <button 
            onClick={loadStoreSettings}
            disabled={loading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />
      
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading store information..." />
          </div>
        ) : storeData ? (
          <div className="max-w-2xl">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <StoreIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Store Details</h2>
                  <p className="text-sm text-gray-500">Your G2G marketplace store information</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      User ID
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {storeData.user_id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Account Status
                    </label>
                    <StatusBadge status={storeData.account_status} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Seller Status
                    </label>
                    <StatusBadge status={storeData.seller_status} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Selling Currencies
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {storeData.selling_currencies?.map((currency) => (
                        <span
                          key={currency}
                          className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full"
                        >
                          {currency}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(storeData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500">Failed to load store information</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;


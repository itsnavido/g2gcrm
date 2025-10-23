import { useEffect, useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import useToastStore from '../stores/useToastStore';
import api from '../utils/api';

const Products = () => {
  const { success, error } = useToastStore();
  
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  
  const [selectedService, setSelectedService] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  
  const [loading, setLoading] = useState({
    services: false,
    brands: false,
    products: false,
    attributes: false
  });

  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadBrands(selectedService);
      setBrands([]);
      setProducts([]);
      setAttributes([]);
      setSelectedBrand('');
      setSelectedProduct('');
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedService && selectedBrand) {
      loadProducts(selectedService, selectedBrand);
      setProducts([]);
      setAttributes([]);
      setSelectedProduct('');
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedProduct) {
      loadAttributes(selectedProduct);
    }
  }, [selectedProduct]);

  const loadServices = async (refresh = false) => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const response = await api.get(`/services${refresh ? '?refresh=true' : ''}`);
      if (response.success) {
        setServices(response.data);
      }
    } catch (err) {
      error('Failed to load services: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const loadBrands = async (serviceId, refresh = false) => {
    setLoading(prev => ({ ...prev, brands: true }));
    try {
      const response = await api.get(`/brands/${serviceId}${refresh ? '?refresh=true' : ''}`);
      if (response.success) {
        setBrands(response.data);
      }
    } catch (err) {
      error('Failed to load brands: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, brands: false }));
    }
  };

  const loadProducts = async (serviceId, brandId, refresh = false) => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await api.get(`/products?service_id=${serviceId}&brand_id=${brandId}${refresh ? '&refresh=true' : ''}`);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      error('Failed to load products: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const loadAttributes = async (productId) => {
    setLoading(prev => ({ ...prev, attributes: true }));
    try {
      const response = await api.get(`/products/${productId}/attributes`);
      if (response.success) {
        setAttributes(response.data);
      }
    } catch (err) {
      error('Failed to load attributes: ' + err.message);
      setAttributes([]);
    } finally {
      setLoading(prev => ({ ...prev, attributes: false }));
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div>
      <Header 
        title="Products" 
        action={
          <button 
            onClick={() => loadServices(true)}
            disabled={loading.services}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading.services ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />
      
      <div className="p-8">
        {/* Selection Cascade */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse Products</h2>
          <p className="text-sm text-gray-600 mb-6">
            Select a service, then a brand, and finally a product to view its details and attributes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service {loading.services && <LoadingSpinner size="sm" />}
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="input"
                disabled={loading.services}
              >
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.service_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brands */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand {loading.brands && <LoadingSpinner size="sm" />}
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="input"
                disabled={!selectedService || loading.brands}
              >
                <option value="">Select a brand...</option>
                {brands.map((brand) => (
                  <option key={brand.brand_id} value={brand.brand_id}>
                    {brand.brand_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product {loading.products && <LoadingSpinner size="sm" />}
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="input"
                disabled={!selectedBrand || loading.products}
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.product_id} className="table-row">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.product_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.region_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {product.product_id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => copyToClipboard(product.product_id, 'Product ID')}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          {copiedId === product.product_id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy ID
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Attributes */}
        {selectedProduct && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Attributes</h2>
              {loading.attributes && <LoadingSpinner size="sm" />}
            </div>

            {loading.attributes ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text="Loading attributes..." />
              </div>
            ) : attributes && attributes.length > 0 ? (
              <div className="space-y-4">
                {attributes.map((attrGroup, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      {attrGroup.attribute_group_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {attrGroup.attribute_group_id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(attrGroup.attribute_group_id, 'Attribute Group ID')}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {attrGroup.attributes && attrGroup.attributes.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {attrGroup.attributes.map((attr) => (
                          <div key={attr.attribute_id} className="bg-gray-50 rounded p-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {attr.attribute_name}
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                {attr.attribute_id}
                              </code>
                              <button
                                onClick={() => copyToClipboard(attr.attribute_id, 'Attribute ID')}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No attributes available for this product
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        {!selectedProduct && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Select a service from the dropdown</li>
              <li>Choose a brand for that service</li>
              <li>Pick a product to view its details and attributes</li>
              <li>Copy product IDs and attribute IDs to use when creating offers</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;


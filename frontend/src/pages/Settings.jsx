import { useState, useEffect } from 'react';
import { Save, TestTube, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import useSettingsStore from '../stores/useSettingsStore';
import useToastStore from '../stores/useToastStore';

const Settings = () => {
  const { apiKey, apiBaseUrl, loadSettings, saveSettings, testConnection, clearCache } = useSettingsStore();
  const { success, error: showError } = useToastStore();
  
  const [formData, setFormData] = useState({
    apiKey: '',
    apiBaseUrl: 'https://prod.your-api-server.com'
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setFormData({
      apiKey: apiKey || '',
      apiBaseUrl: apiBaseUrl || 'https://prod.your-api-server.com'
    });
  }, [apiKey, apiBaseUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.apiKey.trim()) {
      showError('API Key is required');
      return;
    }

    setLoading(true);
    try {
      const result = await saveSettings(formData.apiKey, formData.apiBaseUrl);
      if (result.success) {
        success('Settings saved successfully!');
      } else {
        showError(result.error || 'Failed to save settings');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!formData.apiKey.trim()) {
      showError('Please enter an API Key');
      return;
    }

    setTesting(true);
    try {
      await testConnection(formData.apiKey, formData.apiBaseUrl);
      success('Connection successful! ✅');
    } catch (err) {
      showError('Connection failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data?')) {
      return;
    }

    setClearing(true);
    try {
      await clearCache();
      success('Cache cleared successfully!');
    } catch (err) {
      showError('Failed to clear cache: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div>
      <Header title="Settings" />
      
      <div className="p-8 max-w-2xl">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">API Configuration</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="input"
                placeholder="Enter your G2G API key"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your API key for authenticating with the G2G API
              </p>
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Base URL
              </label>
              <input
                type="url"
                value={formData.apiBaseUrl}
                onChange={(e) => setFormData({ ...formData, apiBaseUrl: e.target.value })}
                className="input"
                placeholder="https://prod.your-api-server.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                The base URL for the G2G API
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !formData.apiKey}
                className="btn btn-secondary flex items-center gap-2"
              >
                {testing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Cache Management */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cache Management</h2>
          <p className="text-sm text-gray-600 mb-4">
            Clear all cached data including orders, offers, services, brands, and products. This will force fresh data to be fetched from the API on next request.
          </p>
          
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="btn btn-danger flex items-center gap-2"
          >
            {clearing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Clear All Cache
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;


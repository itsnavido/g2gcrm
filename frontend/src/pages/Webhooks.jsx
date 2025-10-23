import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import useToastStore from '../stores/useToastStore';
import { formatDate } from '../utils/formatters';
import api from '../utils/api';

const Webhooks = () => {
  const { success, error } = useToastStore();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  
  const [searchParams, setSearchParams] = useState({
    event_sent_from: '',
    event_sent_to: '',
    limit: 20,
    sort_order: 'desc'
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const params = {
        filter: {},
        limit: parseInt(searchParams.limit),
        sort_order: searchParams.sort_order
      };

      if (searchParams.event_sent_from) {
        params.filter.event_sent_from = new Date(searchParams.event_sent_from).getTime();
      }
      if (searchParams.event_sent_to) {
        params.filter.event_sent_to = new Date(searchParams.event_sent_to).getTime();
      }

      const response = await api.post('/webhook-logs/search', params);
      if (response.success) {
        setLogs(response.data.results || []);
        success(`Found ${response.data.results?.length || 0} webhook logs`);
      }
    } catch (err) {
      error('Failed to search webhook logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventId) => {
    setExpandedLog(expandedLog === eventId ? null : eventId);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-100';
    if (status >= 500) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div>
      <Header title="Webhook Logs" />
      
      <div className="p-8">
        {/* Search Form */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Webhook Logs</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="datetime-local"
                  value={searchParams.event_sent_from}
                  onChange={(e) => setSearchParams({ ...searchParams, event_sent_from: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="datetime-local"
                  value={searchParams.event_sent_to}
                  onChange={(e) => setSearchParams({ ...searchParams, event_sent_to: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limit
                </label>
                <input
                  type="number"
                  value={searchParams.limit}
                  onChange={(e) => setSearchParams({ ...searchParams, limit: e.target.value })}
                  className="input"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={searchParams.sort_order}
                  onChange={(e) => setSearchParams({ ...searchParams, sort_order: e.target.value })}
                  className="input"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Logs
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Searching logs..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No webhook logs found. Adjust your search criteria and try again.</p>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Results ({logs.length})
            </h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.event_id} className="border border-gray-200 rounded-lg">
                  {/* Log Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(log.event_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.http_status)}`}>
                          {log.http_status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {log.event_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(log.event_sent_at)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {log.response_time}ms
                        </span>
                      </div>
                      {expandedLog === log.event_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedLog === log.event_id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Event ID</label>
                          <p className="text-sm font-mono text-gray-900">{log.event_id}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Webhook URL</label>
                          <p className="text-sm text-gray-900">{log.webhook_url}</p>
                        </div>
                        {log.data_json && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Request Data</label>
                            <pre className="mt-1 p-3 bg-white border border-gray-200 rounded text-xs overflow-x-auto">
                              {JSON.stringify(typeof log.data_json === 'string' ? JSON.parse(log.data_json) : log.data_json, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Webhooks;


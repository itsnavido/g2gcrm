import { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../stores/useAuthStore';
import useToastStore from '../stores/useToastStore';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isOwner } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      showToast('Failed to fetch users: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/logs');
      setLogs(response.data);
    } catch (error) {
      showToast('Failed to fetch logs: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/approve`);
      showToast('User approved successfully', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to approve user: ' + error.message, 'error');
    }
  };

  const handleBan = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    
    try {
      await api.post(`/admin/users/${userId}/ban`);
      showToast('User banned successfully', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to ban user: ' + error.message, 'error');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/unban`);
      showToast('User unbanned successfully', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to unban user: ' + error.message, 'error');
    }
  };

  const handlePromote = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) return;
    
    try {
      await api.post(`/admin/users/${userId}/promote`);
      showToast('User promoted to admin', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to promote user: ' + error.message, 'error');
    }
  };

  const handleDemote = async (userId) => {
    if (!window.confirm('Are you sure you want to demote this admin?')) return;
    
    try {
      await api.post(`/admin/users/${userId}/demote`);
      showToast('User demoted successfully', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to demote user: ' + error.message, 'error');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      approve_user: 'Approved User',
      ban_user: 'Banned User',
      unban_user: 'Unbanned User',
      promote_admin: 'Promoted to Admin',
      demote_admin: 'Demoted from Admin',
      login: 'Logged In',
      logout: 'Logged Out'
    };
    return labels[action] || action;
  };

  const getAvatarUrl = (user) => {
    if (user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.discord_id || user.id}/${user.avatar}.png`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator || '0') % 5}.png`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-8">
      <Header title="Admin Panel" subtitle="Manage users and view system activity" />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Logs
          </button>
        </nav>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getAvatarUrl(user)}
                          alt="Avatar"
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                            {user.discriminator && user.discriminator !== '0' && (
                              <span className="text-gray-500">#{user.discriminator}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.role !== 'owner' && (
                        <>
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(user._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                          )}
                          {user.status === 'approved' && (
                            <button
                              onClick={() => handleBan(user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Ban
                            </button>
                          )}
                          {user.status === 'banned' && (
                            <button
                              onClick={() => handleUnban(user._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Unban
                            </button>
                          )}
                          {isOwner() && user.role === 'user' && user.status === 'approved' && (
                            <button
                              onClick={() => handlePromote(user._id)}
                              className="text-purple-600 hover:text-purple-900 ml-2"
                            >
                              Promote
                            </button>
                          )}
                          {isOwner() && user.role === 'admin' && (
                            <button
                              onClick={() => handleDemote(user._id)}
                              className="text-orange-600 hover:text-orange-900 ml-2"
                            >
                              Demote
                            </button>
                          )}
                        </>
                      )}
                      {user.role === 'owner' && (
                        <span className="text-gray-400 italic">Owner</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {log.user_id && (
                          <>
                            <img
                              src={getAvatarUrl(log.user_id)}
                              alt="Avatar"
                              className="h-8 w-8 rounded-full"
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {log.user_id.username}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(log.user_id.role)}`}>
                                {log.user_id.role}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.target_user_id && (
                        <div className="flex items-center">
                          <img
                            src={getAvatarUrl(log.target_user_id)}
                            alt="Avatar"
                            className="h-8 w-8 rounded-full"
                          />
                          <span className="ml-3 text-sm text-gray-900">
                            {log.target_user_id.username}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;


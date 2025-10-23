import { useEffect } from 'react';
import useAuthStore from '../stores/useAuthStore';

function AccessDenied() {
  const { user, logout } = useAuthStore();

  useEffect(() => {
    // Refresh auth to get latest status
    useAuthStore.getState().checkAuth();
  }, []);

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator || '0') % 5}.png`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Admin Approval Required
          </p>
        </div>

        {user && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="h-16 w-16 rounded-full border-2 border-gray-300"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Logged in as</p>
                <p className="text-lg font-bold text-gray-900">
                  {user.username}
                  {user.discriminator && user.discriminator !== '0' && (
                    <span className="text-gray-500">#{user.discriminator}</span>
                  )}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      user.status === 'banned' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {user.status === 'pending' ? '⏳ Pending Approval' : 
                     user.status === 'banned' ? '🚫 Banned' : 
                     user.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Your account is currently pending approval. An administrator will review your request shortly.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">
            Once approved, you'll be able to access the G2G CRM dashboard.
          </p>
          
          <button
            onClick={logout}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Contact an administrator if you believe this is an error
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;


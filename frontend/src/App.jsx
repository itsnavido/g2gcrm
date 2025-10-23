import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Offers from './pages/Offers';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Webhooks from './pages/Webhooks';
import Store from './pages/Store';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import Admin from './pages/Admin';
import useSettingsStore from './stores/useSettingsStore';
import useAuthStore from './stores/useAuthStore';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loadSettings } = useSettingsStore();
  const { user, loading, checkAuth, isAuthenticated, isApproved, isAdmin } = useAuthStore();

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated()) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toast />
      </Router>
    );
  }

  // If authenticated but not approved, show access denied page
  if (!isApproved()) {
    return (
      <Router>
        <Routes>
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<Navigate to="/access-denied" replace />} />
        </Routes>
        <Toast />
      </Router>
    );
  }

  // If authenticated and approved, show full dashboard
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/webhooks" element={<Webhooks />} />
            <Route path="/store" element={<Store />} />
            <Route path="/settings" element={<Settings />} />
            {isAdmin() && <Route path="/admin" element={<Admin />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Toast />
      </div>
    </Router>
  );
}

export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import useSettingsStore from './stores/useSettingsStore';

function App() {
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

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
          </Routes>
        </main>

        <Toast />
      </div>
    </Router>
  );
}

export default App;


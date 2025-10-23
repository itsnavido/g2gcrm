import { RefreshCw } from 'lucide-react';
import useSettingsStore from '../stores/useSettingsStore';

const Header = ({ title, action }) => {
  const { isConfigured } = useSettingsStore();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {!isConfigured && (
            <p className="text-sm text-yellow-600 mt-1">
              ⚠️ API not configured. Please configure in Settings.
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
};

export default Header;


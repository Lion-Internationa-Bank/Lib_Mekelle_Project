// src/components/Header.tsx
import { useAuth } from '../auth/AuthContext';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg">
              ML
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Mekele Land
              </h1>
              <p className="text-xs text-gray-500 font-medium">City Administration</p>
            </div>
          </div>
        </div>

        {/* Right: User Info (no logout here anymore) */}
        {user && (
          <div className="hidden sm:block text-right">
            <div className="font-semibold text-gray-900">{user.full_name}</div>
            <div className="text-sm text-gray-500">
              {user.role} • {user.username}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
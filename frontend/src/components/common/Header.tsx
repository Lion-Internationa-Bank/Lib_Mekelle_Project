// src/components/Header.tsx
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CalendarToggle from './CalendarToggle';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#f0cd6e]/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. Left Section: Logo & Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[#f0cd6e]/20"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#a68f4e] to-[#6d5f35] rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-[#f0cd6e]/30">
                ML
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-[#2a2718] leading-tight">Mekelle Land Administration</h1>
                <p className="text-[10px] text-[#6d5f35] font-medium uppercase tracking-wider">City Admin</p>
              </div>
            </div>
          </div>

          {/* 2. Center Section: Search (Simplified) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d5f35] w-4 h-4 group-focus-within:text-[#a68f4e] transition-colors" />
              <input
                type="search"
                placeholder="Search parcels..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#a68f4e]/20 focus:border-[#a68f4e] bg-gray-50/50 transition-all"
              />
            </div>
          </div>

          {/* 3. Right Section: Action Group */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Utility Group: Calendar & Notifications */}
            <div className="flex items-center gap-1.5 pr-2 sm:pr-4 border-r border-[#f0cd6e]">
              <CalendarToggle />
           
            </div>

            {/* User Account */}
            {user && (
              <div className="relative group pl-2">
                <button className="flex items-center gap-3 p-1 rounded-full hover:bg-[#f0cd6e]/20 transition-colors">
                  <div className="w-9 h-9 bg-[#f0cd6e]/30 rounded-lg flex items-center justify-center text-[#6d5f35] border border-[#a68f4e] shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#2a2718] leading-none">{user.full_name}</p>
                    <p className="text-[10px] text-[#6d5f35] mt-1 uppercase tracking-tighter">Authorized</p>
                  </div>
                </button>

                {/* Dropdown menu remains the same */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#f0cd6e] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-3 border-b border-[#f0cd6e]/50">
                    <p className="text-sm font-bold text-[#2a2718]">{user.full_name}</p>
                    <p className="text-xs text-[#6d5f35]">{user.username}</p>
                  </div>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-[#2a2718] hover:bg-[#f0cd6e]/20 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

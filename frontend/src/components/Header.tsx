// src/components/Header.tsx
import React from 'react';
import { Bell, Search, User, Calendar, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import CalendarToggle from './CalendarToggle';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  const { user } = useAuth();
  const { calendarType } = useCalendar();

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
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

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Search parcels, owners, or documents..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Right: User Controls */}
          <div className="flex items-center space-x-4">
            {/* Calendar Toggle */}
            <CalendarToggle />

            {/* Notifications */}
            <button className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                3
              </span>
            </button>

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="font-semibold text-gray-900">{user.full_name}</div>
                  <div className="text-sm text-gray-500">
                    {user.role} • {user.username}
                  </div>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold border-2 border-white shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.username}</p>
                    </div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Profile Settings
                    </a>
                    <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Type Indicator */}
        <div className="mt-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">
              Displaying dates in <span className="text-blue-600 font-semibold">
                {calendarType === 'ETHIOPIAN' ? 'Ethiopian Calendar (ዓ/ም)' : 'Gregorian Calendar'}
              </span>
            </span>
            <div className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded border">
              {calendarType === 'ETHIOPIAN' ? 'ዓ/ም' : 'GC'}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              placeholder="Search parcels, owners, or documents..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
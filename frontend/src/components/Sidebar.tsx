// src/components/Sidebar.tsx (Enhanced with Reports Dropdown)
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  allowedRoles?: string[];
};

type ReportItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  description: string;
};

const menuItems: MenuItem[] = [
  {
    id: 'parcels',
    label: 'Land Parcels',
    icon: '🏞️',
    href: '/home',
    allowedRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'SUBCITY_ADMIN', 'REVENUE_USER'],
  },
  {
    id: 'sessions',
    label: 'Sessions',
    icon: '🖥️',
    href: '/sessions',
    allowedRoles: ['SUBCITY_NORMAL'],
  },
  {
    id: 'pending-requests',
    label: 'Pending Requests',
    icon: '⏳',
    href: '/pending-requests',
    allowedRoles: ['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'SUBCITY_NORMAL'],
  },
  {
    id: 'ownership',
    label: 'Ownership',
    icon: '📋',
    href: '/ownership',
    allowedRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'REVENUE_USER'],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: '👥',
    href: '/users',
    allowedRoles: ['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'],
  },
  {
    id: 'subcities',
    label: 'Sub-cities',
    icon: '🏛️',
    href: '/sub-cities',
    allowedRoles: ['CITY_ADMIN'],
  },
  {
    id: 'rateconfigs',
    label: 'Rate Configs',
    icon: '💰',
    href: '/rateConfigs',
    allowedRoles: ['REVENUE_ADMIN'],
  },
  {
    id: 'configs',
    label: 'Configurations',
    icon: '⚙️',
    href: '/configs',
    allowedRoles: ['CITY_ADMIN', 'REVENUE_ADMIN'],
  },
  {
  id: 'upload-excel',
  label: 'Bulk Upload',
  icon: '📤',
  href: '/upload-excel',
  allowedRoles: ['SUBCITY_ADMIN'], // Adjust roles as needed
},
];

// Define available reports with role-based visibility
const reports: ReportItem[] = [
  {
    id: 'bills',
    label: 'Bills Report',
    icon: '💰',
    href: '/reports/bills',
    description: 'View and download bills with filters',
  },
  {
    id: 'payments',
    label: 'Payments Report',
    icon: '💳',
    href: '/reports/payments',
    description: 'Track all payments made',
  },
  {
    id: 'parcels',
    label: 'Parcels Report',
    icon: '🏞️',
    href: '/reports/parcels',
    description: 'Land parcels and their status',
  },
  {
    id: 'owners',
    label: 'Owners Report',
    icon: '👥',
    href: '/reports/owners',
    description: 'Property owners information',
  },
  {
    id: 'leases',
    label: 'Leases Report',
    icon: '📄',
    href: '/reports/leases',
    description: 'Active and expired leases',
  },
  {
    id: 'revenue',
    label: 'Revenue Analysis',
    icon: '📈',
    href: '/reports/revenue',
    description: 'Detailed revenue analysis',
  },
];

// Define which reports are visible for each role
const reportVisibilityByRole: Record<string, string[]> = {
  CITY_ADMIN: ['bills', 'payments', 'parcels', 'owners', 'leases', 'revenue'],
  REVENUE_ADMIN: ['bills', 'payments', 'revenue'],
  SUBCITY_ADMIN: ['bills', 'parcels', 'owners', 'leases'],
  SUBCITY_NORMAL: [], // No reports for normal users
  SUBCITY_AUDITOR: [], // No reports for auditors
  REVENUE_USER: [], // No reports for revenue users
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsReportsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsReportsOpen(false);
  }, [location.pathname]);

  const activeMenu = menuItems.find((item) => item.href === location.pathname)?.id || 
    (location.pathname.startsWith('/reports') ? 'reports' : 'dashboard');

  const filteredItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role ?? '')
  );

  // Get visible reports for current user
  const visibleReports = reports.filter(report => 
    user?.role && (reportVisibilityByRole[user.role]?.includes(report.id) || false)
  );

  // Check if user has access to reports
  const canAccessReports = user?.role && ['CITY_ADMIN', 'REVENUE_ADMIN', 'SUBCITY_ADMIN'].includes(user.role);

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-[#f0cd6e]/50 h-screen sticky top-0 z-40 flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="p-4 flex-1 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeMenu === item.id
                ? 'bg-gradient-to-r from-[#a68f4e] to-[#6d5f35] text-white shadow-lg'
                : 'text-[#2a2718] hover:bg-[#f0cd6e]/20'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Reports Dropdown - Only show if user has access */}
        {canAccessReports && visibleReports.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeMenu === 'reports'
                  ? 'bg-gradient-to-r from-[#a68f4e] to-[#6d5f35] text-white shadow-lg'
                  : 'text-[#2a2718] hover:bg-[#f0cd6e]/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">📊</span>
                <span className="font-medium">Reports</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isReportsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isReportsOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-[#f0cd6e] py-1 z-50">
                {visibleReports.map((report) => (
                  <Link
                    key={report.id}
                    to={report.href}
                    className={`flex items-center space-x-3 px-4 py-2 hover:bg-[#f0cd6e]/20 transition-colors ${
                      location.pathname === report.href ? 'bg-[#a68f4e]/20 text-[#6d5f35]' : 'text-[#2a2718]'
                    }`}
                  >
                    <span className="text-base">{report.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{report.label}</div>
                      <div className="text-xs text-[#2a2718]/60">{report.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Info and Logout */}
      {user && (
        <div className="p-4 border-t border-[#f0cd6e]/50 mt-auto">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-[#2a2718] truncate">{user.full_name}</p>
            <p className="text-xs text-[#6d5f35] truncate">{user.role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2a2718]/10 hover:bg-[#2a2718]/20 text-[#2a2718] font-medium transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

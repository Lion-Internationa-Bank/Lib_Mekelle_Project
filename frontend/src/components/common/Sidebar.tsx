// src/components/Sidebar.tsx (Enhanced with Reports Dropdown)
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslate } from '../../i18n/useTranslate';

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

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Add translation hook
  const { t } = useTranslate('navigation');

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

  const menuItems: MenuItem[] = [
    {
      id: 'parcels',
      label: t('parcels'),
      icon: '🏞️',
      href: '/home',
      allowedRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'SUBCITY_ADMIN', 'REVENUE_USER'],
    },
    {
      id: 'sessions',
      label: t('sessions'),
      icon: '🖥️',
      href: '/sessions',
      allowedRoles: ['SUBCITY_NORMAL'],
    },
    {
      id: 'pending-requests',
      label: t('pendingRequests'),
      icon: '⏳',
      href: '/pending-requests',
      allowedRoles: ['SUBCITY_APPROVER','CITY_APPROVER','REVENUE_APPROVER','CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN','SUBCITY_'],
    },
    {
      id: 'ownership',
      label: t('ownership'),
      icon: '📋',
      href: '/ownership',
      allowedRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'REVENUE_USER'],
    },
    {
      id: 'users',
      label: t('users'),
      icon: '👥',
      href: '/users',
      allowedRoles: ['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'],
    },
    {
      id: 'subcities',
      label: t('subcities'),
      icon: '🏛️',
      href: '/sub-cities',
      allowedRoles: ['CITY_ADMIN'],
    },
    {
      id: 'rateconfigs',
      label: t('rateConfigs'),
      icon: '💰',
      href: '/rateConfigs',
      allowedRoles: ['REVENUE_ADMIN'],
    },
    {
      id: 'configs',
      label: t('configurations'),
      icon: '⚙️',
      href: '/configs',
      allowedRoles: ['CITY_ADMIN', ],
    },
    {
      id: 'upload-excel',
      label: t('bulkUpload'),
      icon: '📤',
      href: '/upload-excel',
      allowedRoles: ['SUBCITY_ADMIN'],
    },
  ];

  // Update the reports array with translations
  const reports: ReportItem[] = [
    {
      id: 'bills',
      label: t('reportItems.bills'),
      icon: '💰',
      href: '/reports/bills',
      description: t('reportItems.descriptions.bills'),
    },
    {
      id: 'encumbrances',
      label: t('reportItems.encumbrances'),
      icon: '🔒',
      href: '/reports/encumbrances',
      description: t('reportItems.descriptions.encumbrances'),
    },
    {
      id: 'parcels',
      label: t('reportItems.parcels'),
      icon: '🏞️',
      href: '/reports/parcels',
      description: t('reportItems.descriptions.parcels'),
    },
    {
      id: 'owners-multiple',
      label: t('reportItems.ownersMultiple'),
      icon: '👥',
      href: '/reports/owners-multiple',
      description: t('reportItems.descriptions.ownersMultiple'),
    },
    {
      id: 'lease-installments',
      label: t('reportItems.leaseInstallments'),
      icon: '📊',
      href: '/reports/lease-installments',
      description: t('reportItems.descriptions.leaseInstallments'),
    },
    {
      id: 'payments',
      label: t('reportItems.payments'),
      icon: '💳',
      href: '/reports/payments',
      description: t('reportItems.descriptions.payments'),
    },
    {
      id: 'revenue',
      label: t('reportItems.revenue'),
      icon: '📈',
      href: '/reports/revenue',
      description: t('reportItems.descriptions.revenue'),
    },
  ];

  // Update visibility by role
  const reportVisibilityByRole: Record<string, string[]> = {
    CITY_ADMIN: [ 'encumbrances', 'parcels', 'owners-multiple', 'payments', ],
    REVENUE_ADMIN: ['bills', 'payments', 'revenue'],
    SUBCITY_ADMIN: ['encumbrances', 'parcels', 'owners-multiple','lease-installments',],
    SUBCITY_NORMAL: ['encumbrances', 'parcels', 'owners-multiple', ],
    SUBCITY_AUDITOR: ['encumbrances', 'parcels', 'owners-multiple', ],
    REVENUE_USER: ['bills', 'payments', 'revenue','lease-installments',],
  };

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
  const canAccessReports = user?.role && ['CITY_ADMIN', 'REVENUE_ADMIN', 'SUBCITY_ADMIN','REVENUE_USER','SUBCITY_NORMAL','SUBCITY_AUDITOR'].includes(user.role);

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
                ? 'bg-linear-to-r from-[#a68f4e] to-[#6d5f35] text-white shadow-lg'
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
                  ? 'bg-linear-to-r from-[#a68f4e] to-[#6d5f35] text-white shadow-lg'
                  : 'text-[#2a2718] hover:bg-[#f0cd6e]/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">📊</span>
                <span className="font-medium">{t('reports')}</span>
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
            {t('header.logout')}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
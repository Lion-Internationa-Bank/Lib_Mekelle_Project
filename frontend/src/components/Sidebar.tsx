// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  allowedRoles?: string[];
};

const menuItems: MenuItem[] = [

 {
    id: 'parcels',
    label: 'Land Parcels',
    icon: '🏞️', // National park - land parcels
    href: '/home',
    allowedRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'SUBCITY_ADMIN', 'REVENUE_USER'],
},
{
    id: 'sessions',
    label: 'Sessions',
    icon: '🖥️', // Desktop computer - active sessions
    href: '/sessions',
    allowedRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'SUBCITY_ADMIN', 'REVENUE_USER'],
},
{
    id: 'pending-requests',
    label: 'Pending Requests',
    icon: '⏳', // Hourglass - pending approval
    href: '/pending-requests',
    allowedRoles: ['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'SUBCITY_NORMAL'],
},
{
    id: 'ownership',
    label: 'Ownership',
    icon: '📋', // Clipboard - ownership records
    href: '/ownership',
    allowedRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'REVENUE_USER'],
},
{
    id: 'users',
    label: 'User Management',
    icon: '👥', // Multiple users - user management
    href: '/users',
    allowedRoles: ['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'],
},
{
    id: 'subcities',
    label: 'Sub-cities',
    icon: '🏛️', // Classical building - government administration
    href: '/sub-cities',
    allowedRoles: ['CITY_ADMIN'],
},
{
    id: 'rateconfigs',
    label: 'Rate Configs',
    icon: '💰', // Money bag - financial rates
    href: '/rateConfigs',
    allowedRoles: ['REVENUE_ADMIN'],
},
{
    id: 'configs',
    label: 'Configurations',
    icon: '⚙️', // Gear - system configuration
    href: '/configs',
    allowedRoles: ['CITY_ADMIN', 'REVENUE_ADMIN'],
},
{
    id: 'reports',
    label: 'Reports',
    icon: '📊', // Bar chart - reports and analytics
    href: '/reports',
    allowedRoles: ['CITY_ADMIN', 'REVENUE_ADMIN', 'SUBCITY_ADMIN'],
},
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const activeMenu =
    menuItems.find((item) => item.href === location.pathname)?.id || 'dashboard';

  const filteredItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role ?? '')
  );

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 h-screen sticky top-0 z-40 flex flex-col overflow-hidden">
  

      {/* Navigation */}
      <nav className="p-4 flex-1 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeMenu === item.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout at the bottom */}
      {user && (
        <div className="p-4 border-t border-gray-200/50 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-all duration-200"
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
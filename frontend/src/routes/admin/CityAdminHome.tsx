// src/routes/admin/CityAdminHome.tsx
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Settings, 
  Shield, 
  BarChart3, 
  Clock,
  ArrowRight,
  Globe,
} from 'lucide-react';

const CityAdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Manage Sub-cities',
      description: 'View and manage all sub-cities',
      icon: Building2,
      path: '/admin/sub-cities',
      color: 'bg-blue-500',
      stats: '12 active'
    },
    {
      title: 'User Management',
      description: 'Create and manage sub-city admins',
      icon: Users,
      path: '/admin/users',
      color: 'bg-purple-500',
      stats: '24 users'
    },
    {
      title: 'Approval Queue',
      description: 'Review pending approval requests',
      icon: Clock,
      path: '/admin/approvals',
      color: 'bg-amber-500',
      stats: '8 pending'
    },
    {
      title: 'System Configuration',
      description: 'Update system-wide settings',
      icon: Settings,
      path: '/admin/configurations',
      color: 'bg-green-500',
      stats: '15 configs'
    },
    {
      title: 'Reports & Analytics',
      description: 'View system reports and metrics',
      icon: BarChart3,
      path: '/admin/reports',
      color: 'bg-indigo-500',
      stats: 'Last 30 days'
    },
    {
      title: 'Approver Management',
      description: 'Manage city-level approvers',
      icon: Shield,
      path: '/admin/approvers',
      color: 'bg-rose-500',
      stats: '3 approvers'
    }
  ];

  const recentActivity = [
    { action: 'New sub-city created', entity: 'Bole Sub-city', time: '5 minutes ago', user: 'System' },
    { action: 'Configuration updated', entity: 'Land Tenure Options', time: '2 hours ago', user: 'Admin' },
    { action: 'User role changed', entity: 'John Doe', time: '1 day ago', user: 'You' },
    { action: 'Approval request processed', entity: 'New Sub-city Admin', time: '2 days ago', user: 'System' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718]">City Administration</h1>
          <p className="text-[#2a2718]/60 mt-1">
            Welcome back, {user?.full_name}. Manage the city-wide system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#f0cd6e] rounded-xl">
            <span className="text-sm font-medium text-[#2a2718]">
              Role: City Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Total Sub-cities</p>
              <p className="text-2xl font-bold text-[#2a2718]">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Total Users</p>
              <p className="text-2xl font-bold text-[#2a2718]">156</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Pending Approvals</p>
              <p className="text-2xl font-bold text-[#2a2718]">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">System Status</p>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${action.color} bg-opacity-10 rounded-lg`}>
                <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-xs text-[#2a2718]/40 group-hover:text-[#f0cd6e]">
                {action.stats}
              </span>
            </div>
            <h3 className="font-semibold text-[#2a2718] mb-1">{action.title}</h3>
            <p className="text-sm text-[#2a2718]/60 mb-4">{action.description}</p>
            <div className="flex items-center text-[#f0cd6e] text-sm font-medium">
              Go to section <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-[#2a2718]">{activity.action}</p>
                <p className="text-sm text-[#2a2718]/60">{activity.entity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#2a2718]">{activity.time}</p>
                <p className="text-xs text-[#2a2718]/40">by {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-linear-to-r from-[#f0cd6e] to-[#2a2718] rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.full_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{user?.full_name}</h3>
            <p className="text-white/80">@{user?.username}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">City Admin</span>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">ID: {user?.user_id.substring(0, 8)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/profile')}
            className="px-4 py-2 bg-white text-[#2a2718] rounded-lg hover:bg-white/90 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityAdminHome;
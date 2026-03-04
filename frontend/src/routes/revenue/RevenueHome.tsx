// src/routes/revenue/RevenueAdminHome.tsx
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Settings,
  Clock,
  ArrowRight,
  Receipt,
  BarChart3,
  Percent,
  CreditCard
} from 'lucide-react';

const RevenueAdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Rate Management',
      description: 'Configure revenue rates and fees',
      icon: Percent,
      path: '/revenue/rates',
      color: 'bg-emerald-500',
      stats: '8 rates'
    },
    {
      title: 'Revenue Users',
      description: 'Manage revenue collection users',
      icon: Users,
      path: '/revenue/users',
      color: 'bg-blue-500',
      stats: '12 users'
    },
    {
      title: 'Payment Methods',
      description: 'Configure payment options',
      icon: CreditCard,
      path: '/revenue/payment-methods',
      color: 'bg-purple-500',
      stats: '5 methods'
    },
    {
      title: 'Revenue Reports',
      description: 'View collection reports',
      icon: BarChart3,
      path: '/revenue/reports',
      color: 'bg-amber-500',
      stats: 'Monthly'
    },
    {
      title: 'Pending Approvals',
      description: 'Rate change requests',
      icon: Clock,
      path: '/revenue/approvals',
      color: 'bg-rose-500',
      stats: '3 pending'
    },
    {
      title: 'Transaction Logs',
      description: 'View all transactions',
      icon: Receipt,
      path: '/revenue/transactions',
      color: 'bg-indigo-500',
      stats: '1,245 total'
    }
  ];

  const recentRates = [
    { type: 'LEASE_INTEREST_RATE', value: '5.5%', updated: '2 hours ago', status: 'active' },
    { type: 'PENALTY_RATE', value: '2%', updated: '1 day ago', status: 'active' },
    { type: 'ANNUAL_ESCALATION', value: '3%', updated: '3 days ago', status: 'pending' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718]">Revenue Administration</h1>
          <p className="text-[#2a2718]/60 mt-1">
            Manage revenue rates, users, and collections
          </p>
        </div>
        <div className="px-4 py-2 bg-[#f0cd6e] rounded-xl">
          <span className="text-sm font-medium text-[#2a2718]">
            Role: Revenue Administrator
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Monthly Collection</p>
              <p className="text-2xl font-bold text-[#2a2718]">Br 2.4M</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Growth</p>
              <p className="text-2xl font-bold text-[#2a2718]">+12.5%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Active Users</p>
              <p className="text-2xl font-bold text-[#2a2718]">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Pending Changes</p>
              <p className="text-2xl font-bold text-[#2a2718]">3</p>
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
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 ${action.color} bg-opacity-10 rounded-lg`}>
                <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-xs text-[#2a2718]/40">{action.stats}</span>
            </div>
            <h3 className="font-semibold text-[#2a2718] group-hover:text-[#f0cd6e] transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-[#2a2718]/60 mt-1">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Recent Rate Changes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2a2718]">Recent Rate Changes</h2>
          <button 
            onClick={() => navigate('/revenue/rates')}
            className="text-sm text-[#f0cd6e] hover:text-[#2a2718] flex items-center gap-1"
          >
            Manage rates <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentRates.map((rate, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-[#2a2718]">{rate.type}</p>
                <p className="text-sm text-[#2a2718]/60">Updated {rate.updated}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#2a2718]">{rate.value}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rate.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {rate.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueAdminHome;
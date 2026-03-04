// src/routes/admin/SubCityAdminHome.tsx
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  FileText, 
  Clock,
  ArrowRight,
  Home,
  UserPlus,
  Eye,
  AlertCircle,
  Building2,
  Landmark
} from 'lucide-react';

const SubCityAdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Land Parcels',
      description: 'View and manage land parcels',
      icon: MapPin,
      path: '/subcity/parcels',
      color: 'bg-emerald-500',
      stats: '2,345 total'
    },
    {
      title: 'Owner Management',
      description: 'Manage property owners',
      icon: Users,
      path: '/subcity/owners',
      color: 'bg-blue-500',
      stats: '156 owners'
    },
    {
      title: 'User Management',
      description: 'Manage sub-city users',
      icon: UserPlus,
      path: '/subcity/users',
      color: 'bg-purple-500',
      stats: '24 users'
    },
    {
      title: 'Pending Approvals',
      description: 'Requests awaiting approval',
      icon: Clock,
      path: '/subcity/approvals',
      color: 'bg-amber-500',
      stats: '12 pending'
    },
    {
      title: 'Encumbrances',
      description: 'Manage encumbrances',
      icon: FileText,
      path: '/subcity/encumbrances',
      color: 'bg-rose-500',
      stats: '8 active'
    },
    {
      title: 'Reports',
      description: 'View sub-city reports',
      icon: Landmark,
      path: '/subcity/reports',
      color: 'bg-indigo-500',
      stats: 'Monthly summary'
    }
  ];

  const recentParcels = [
    { upin: 'UPIN-2024-001', owner: 'Abebe Kebede', type: 'Residential', status: 'active', date: '2 hours ago' },
    { upin: 'UPIN-2024-002', owner: 'Tigist Haile', type: 'Commercial', status: 'pending', date: '5 hours ago' },
    { upin: 'UPIN-2024-003', owner: 'Dawit Mekonnen', type: 'Mixed Use', status: 'active', date: '1 day ago' },
  ];

  const pendingRequests = [
    { type: 'New Owner Registration', requester: 'Worku Tadesse', priority: 'high', time: '30 min ago' },
    { type: 'Parcel Transfer', requester: 'Meron Ayele', priority: 'medium', time: '2 hours ago' },
    { type: 'Encumbrance Release', requester: 'Solomon Desta', priority: 'low', time: '5 hours ago' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Sub-city Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718]">Sub-city Administration</h1>
          <p className="text-[#2a2718]/60 mt-1">
            Manage land, owners, and users in your sub-city
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#f0cd6e] rounded-xl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2a2718]" />
            <span className="text-sm font-medium text-[#2a2718]">
              {user?.sub_city_name || 'Bole Sub-city'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Total Parcels</p>
              <p className="text-2xl font-bold text-[#2a2718]">2,345</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Total Owners</p>
              <p className="text-2xl font-bold text-[#2a2718]">1,892</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Pending</p>
              <p className="text-2xl font-bold text-[#2a2718]">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Encumbrances</p>
              <p className="text-2xl font-bold text-[#2a2718]">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 ${action.color} bg-opacity-10 rounded-lg`}>
                      <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-xs text-[#2a2718]/40">{action.stats}</span>
                  </div>
                  <h3 className="font-medium text-[#2a2718] group-hover:text-[#f0cd6e] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[#2a2718]/60 mt-1">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Parcels */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2a2718]">Recent Parcels</h2>
              <button 
                onClick={() => navigate('/subcity/parcels')}
                className="text-sm text-[#f0cd6e] hover:text-[#2a2718] flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentParcels.map((parcel) => (
                <div key={parcel.upin} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-[#2a2718]">{parcel.upin}</p>
                    <p className="text-sm text-[#2a2718]/60">{parcel.owner} • {parcel.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      parcel.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {parcel.status}
                    </span>
                    <span className="text-xs text-[#2a2718]/40">{parcel.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Sub-city Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Sub-city Info</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#f0cd6e] rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#2a2718]" />
                </div>
                <div>
                  <p className="font-medium text-[#2a2718]">{user?.sub_city_name || 'Bole Sub-city'}</p>
                  <p className="text-sm text-[#2a2718]/60">ID: {user?.sub_city_id || 'SUB-001'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-[#2a2718]/60">Woredas</p>
                  <p className="text-xl font-bold text-[#2a2718]">8</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-[#2a2718]/60">Active Users</p>
                  <p className="text-xl font-bold text-[#2a2718]">24</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Pending Requests</h2>
            <div className="space-y-3">
              {pendingRequests.map((request, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    request.priority === 'high' ? 'bg-red-500' : 
                    request.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2a2718]">{request.type}</p>
                    <p className="text-xs text-[#2a2718]/60">by {request.requester} • {request.time}</p>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/subcity/approvals')}
                className="w-full mt-2 text-center text-sm text-[#f0cd6e] hover:text-[#2a2718]"
              >
                View all pending
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80">API Service</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Database</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Last Backup</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCityAdminHome;
// src/routes/approver/SubCityApproverHome.tsx
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin,
  Eye,
  ArrowRight,
  AlertCircle,
  Building2
} from 'lucide-react';

const SubCityApproverHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const pendingRequests = [
    { 
      id: 'REQ001', 
      type: 'Land Parcel Transfer', 
      requester: 'Worku Tadesse (Normal User)', 
      property: 'Parcel #UPIN-2024-001',
      submitted: '1 hour ago', 
      priority: 'high'
    },
    { 
      id: 'REQ002', 
      type: 'New Owner Registration', 
      requester: 'Meron Ayele (Normal User)', 
      property: 'Owner: Abebe Kebede',
      submitted: '3 hours ago', 
      priority: 'medium'
    },
    { 
      id: 'REQ003', 
      type: 'Encumbrance Registration', 
      requester: 'Solomon Desta (Auditor)', 
      property: 'Parcel #UPIN-2024-045',
      submitted: '5 hours ago', 
      priority: 'medium'
    },
    { 
      id: 'REQ004', 
      type: 'Parcel Subdivision', 
      requester: 'Tigist Haile (Normal User)', 
      property: 'Parcel #UPIN-2024-078',
      submitted: '1 day ago', 
      priority: 'low'
    },
  ];

  const stats = {
    pending: 12,
    approved: 156,
    rejected: 8,
    thisWeek: 23
  };

  const recentActivity = [
    { action: 'Approved parcel transfer', property: 'UPIN-2024-023', time: '2 hours ago' },
    { action: 'Rejected encumbrance', property: 'UPIN-2024-156', time: '5 hours ago' },
    { action: 'Approved owner registration', property: 'Owner: Sara Hailu', time: '1 day ago' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718]">Sub-city Approver Dashboard</h1>
          <p className="text-[#2a2718]/60 mt-1">
            Review and approve land-related requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#f0cd6e] rounded-xl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2a2718]" />
            <span className="text-sm font-medium text-[#2a2718]">
              {user?.sub_city_id || ''}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Pending</p>
              <p className="text-2xl font-bold text-[#2a2718]">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Approved</p>
              <p className="text-2xl font-bold text-[#2a2718]">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Rejected</p>
              <p className="text-2xl font-bold text-[#2a2718]">{stats.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">This Week</p>
              <p className="text-2xl font-bold text-[#2a2718]">{stats.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718]">Pending Approval Requests</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      request.priority === 'high' ? 'bg-red-500' : 
                      request.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-[#2a2718]">{request.type}</h3>
                      <p className="text-sm text-[#2a2718]/60 mt-1">{request.property}</p>
                      <p className="text-xs text-[#2a2718]/40 mt-1">
                        From: {request.requester} • {request.submitted}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.priority === 'high' ? 'bg-red-100 text-red-600' : 
                    request.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {request.priority}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button 
                    onClick={() => navigate(`/approver/requests/${request.id}`)}
                    className="p-2 text-[#2a2718]/60 hover:text-[#f0cd6e] hover:bg-[#f0cd6e]/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Approve
                  </button>
                  <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button 
              onClick={() => navigate('/approver/requests')}
              className="text-[#f0cd6e] hover:text-[#2a2718] text-sm font-medium flex items-center gap-1"
            >
              View all {stats.pending} pending requests <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Approver Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Your Queue</h2>
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">
                      You have {stats.pending} requests to review
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {pendingRequests.filter(r => r.priority === 'high').length} high priority
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-[#2a2718]">4.5h</p>
                  <p className="text-xs text-[#2a2718]/60">Avg response</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-[#2a2718]">92%</p>
                  <p className="text-xs text-[#2a2718]/60">Approval rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Quick Filters</h2>
            <div className="space-y-2">
              <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                <span className="text-[#2a2718]">Parcel Transfers</span>
                <span className="text-sm bg-amber-100 text-amber-600 px-2 py-1 rounded-full">4</span>
              </button>
              <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                <span className="text-[#2a2718]">Owner Registrations</span>
                <span className="text-sm bg-amber-100 text-amber-600 px-2 py-1 rounded-full">3</span>
              </button>
              <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                <span className="text-[#2a2718]">Encumbrances</span>
                <span className="text-sm bg-amber-100 text-amber-600 px-2 py-1 rounded-full">2</span>
              </button>
              <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                <span className="text-[#2a2718]">Subdivisions</span>
                <span className="text-sm bg-amber-100 text-amber-600 px-2 py-1 rounded-full">3</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#2a2718]">{item.action}</p>
                    <p className="text-xs text-[#2a2718]/60">{item.property} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCityApproverHome;
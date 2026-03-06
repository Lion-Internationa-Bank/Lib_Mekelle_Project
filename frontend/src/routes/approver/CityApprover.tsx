// src/routes/approver/CityApproverHome.tsx
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  CheckCheck,
  Eye,
  ArrowRight,
  Filter
} from 'lucide-react';

const CityApproverHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const pendingRequests = [
    { 
      id: 'REQ001', 
      type: 'Sub-city Admin Creation', 
      requester: 'John Doe (City Admin)', 
      submitted: '2 hours ago', 
      priority: 'high',
      details: 'New admin for Bole sub-city'
    },
    { 
      id: 'REQ002', 
      type: 'Configuration Change', 
      requester: 'Jane Smith (City Admin)', 
      submitted: '5 hours ago', 
      priority: 'medium',
      details: 'Update land tenure options'
    },
    { 
      id: 'REQ003', 
      type: 'Sub-city Creation', 
      requester: 'Mike Johnson (City Admin)', 
      submitted: '1 day ago', 
      priority: 'low',
      details: 'Create new Yeka sub-city'
    },
  ];

  const recentApprovals = [
    { type: 'Sub-city Admin', requester: 'Sarah Wilson', approved: '3 hours ago' },
    { type: 'Rate Configuration', requester: 'Tom Brown', approved: '1 day ago' },
    { type: 'System Setting', requester: 'Lisa Anderson', approved: '2 days ago' },
  ];

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-600',
      medium: 'bg-amber-100 text-amber-600',
      low: 'bg-green-100 text-green-600'
    };
    return styles[priority as keyof typeof styles] || styles.medium;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718]">Approver Dashboard</h1>
          <p className="text-[#2a2718]/60 mt-1">
            Review and manage pending approval requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#f0cd6e] rounded-xl">
            <span className="text-sm font-medium text-[#2a2718]">
              Role: City Approver
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
              <p className="text-2xl font-bold text-[#2a2718]">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Approved (Today)</p>
              <p className="text-2xl font-bold text-[#2a2718]">12</p>
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
              <p className="text-2xl font-bold text-[#2a2718]">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">Approval Rate</p>
              <p className="text-2xl font-bold text-[#2a2718]">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2a2718]">Pending Approval Requests</h2>
              <button className="text-sm text-[#f0cd6e] hover:text-[#2a2718] flex items-center gap-1">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#2a2718]">{request.type}</h3>
                    <p className="text-sm text-[#2a2718]/60 mt-1">{request.details}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[#2a2718]/60">
                    <span>From: {request.requester}</span>
                    <span>{request.submitted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/approver/requests/${request.id}`)}
                      className="p-2 text-[#2a2718]/60 hover:text-[#f0cd6e] hover:bg-[#f0cd6e]/10 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button 
              onClick={() => navigate('/approver/requests')}
              className="text-[#f0cd6e] hover:text-[#2a2718] text-sm font-medium flex items-center gap-1"
            >
              View all requests <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column - Info & Stats */}
        <div className="space-y-6">
          {/* Approver Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Your Info</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#f0cd6e] rounded-full flex items-center justify-center text-lg font-bold text-[#2a2718]">
                  {user?.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-[#2a2718]">{user?.full_name}</p>
                  <p className="text-sm text-[#2a2718]/60">@{user?.username}</p>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">
                      {pendingRequests.length} requests pending your review
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Please review them at your earliest convenience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/approver/requests?status=pending')}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span className="text-[#2a2718]">View Pending</span>
                <span className="text-sm bg-amber-100 text-amber-600 px-2 py-1 rounded-full">8</span>
              </button>
              <button 
                onClick={() => navigate('/approver/requests?status=approved')}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span className="text-[#2a2718]">Approved History</span>
                <ArrowRight className="w-4 h-4 text-[#2a2718]/40" />
              </button>
              <button 
                onClick={() => navigate('/approver/statistics')}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span className="text-[#2a2718]">Approval Stats</span>
                <ArrowRight className="w-4 h-4 text-[#2a2718]/40" />
              </button>
            </div>
          </div>

          {/* Recent Approvals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Recent Approvals</h2>
            <div className="space-y-3">
              {recentApprovals.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-[#2a2718]">{item.type}</p>
                    <p className="text-xs text-[#2a2718]/60">by {item.requester}</p>
                  </div>
                  <span className="text-xs text-[#2a2718]/40">{item.approved}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityApproverHome;
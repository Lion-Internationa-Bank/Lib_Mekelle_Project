// src/routes/approver/RevenueApproverHome.tsx
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Percent,

  Eye,
  ArrowRight,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const RevenueApproverHome = () => {
  const navigate = useNavigate();

  const pendingRequests = [
    { 
      id: 'REQ001', 
      type: 'Rate Change Request', 
      requester: 'John Doe (Revenue Admin)', 
      details: 'LEASE_INTEREST_RATE: 5.5% → 6.0%',
      submitted: '2 hours ago', 
      priority: 'high'
    },
    { 
      id: 'REQ002', 
      type: 'New Payment Method', 
      requester: 'Jane Smith (Revenue Admin)', 
      details: 'Add Mobile Money as payment option',
      submitted: '5 hours ago', 
      priority: 'medium'
    },
    { 
      id: 'REQ003', 
      type: 'Rate Deactivation', 
      requester: 'Mike Johnson (Revenue Admin)', 
      details: 'Deactivate PENALTY_RATE (old rate)',
      submitted: '1 day ago', 
      priority: 'low'
    },
  ];

  const stats = {
    pending: 5,
    approved: 89,
    rejected: 4,
    thisMonth: 23
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718]">Revenue Approver Dashboard</h1>
          <p className="text-[#2a2718]/60 mt-1">
            Review and approve revenue rate changes
          </p>
        </div>
        <div className="px-4 py-2 bg-[#f0cd6e] rounded-xl">
          <span className="text-sm font-medium text-[#2a2718]">
            Role: Revenue Approver
          </span>
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
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#2a2718]/60">This Month</p>
              <p className="text-2xl font-bold text-[#2a2718]">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718]">Pending Rate Change Requests</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <Percent className="w-5 h-5 text-[#f0cd6e] mt-1" />
                    <div>
                      <h3 className="font-semibold text-[#2a2718]">{request.type}</h3>
                      <p className="text-sm text-[#2a2718]/60 mt-1">{request.details}</p>
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
              View all pending requests <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Approver Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Approval Queue</h2>
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">
                      {stats.pending} rate changes need review
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {pendingRequests.filter(r => r.priority === 'high').length} high priority
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Average response time</p>
                <p className="text-2xl font-bold">3.2 hours</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#2a2718] mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#2a2718]/70">Approval Rate</span>
                <span className="font-medium text-[#2a2718]">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#2a2718]/70">Changes This Month</span>
                <span className="font-medium text-[#2a2718]">27</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#2a2718]/70">Active Rates</span>
                <span className="font-medium text-[#2a2718]">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueApproverHome;
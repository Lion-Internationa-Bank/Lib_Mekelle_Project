// src/pages/SessionDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import wizardApi from "../../services/wizardApi";
import { toast } from "sonner";


interface SessionDetails {
  session_id: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "MERGED";
  current_step: string;
  parcel_data: any;
  parcel_docs: any[];
  owner_data: any;
  owner_docs: any[];
  lease_data: any;
  lease_docs: any[];
  user_id: string;
  sub_city_id: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  approval_request?: {
    request_id: string;
    status: string;
    approver_role?: string;
    created_at: string;
    approved_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
  };
  sub_city?: {
    name: string;
  };
  user?: {
    username: string;
    full_name: string;
  };
}

const SessionDetailsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "approval">("overview");

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
    }
  }, [sessionId]);

  const loadSessionDetails = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await wizardApi.getSession(sessionId);
      
      if (response.success && response.data) {
        setSession(response.data)
      } else {
        toast.error(response.error || "Failed to load session details");
        navigate("/sessions");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load session details");
      navigate("/sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PENDING_APPROVAL":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "APPROVED":
      case "MERGED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "PENDING_APPROVAL":
        return "Pending Approval";
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      case "MERGED":
        return "Completed";
      default:
        return status.replace("_", " ");
    }
  };

  const handleContinue = () => {
    if (session?.status === "DRAFT") {
      navigate(`/wizard?session_id=${sessionId}`);
    }
  };

  const handleGoBack = () => {
    navigate("/sessions");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading session details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h3>
            <p className="text-gray-600 mb-6">The requested session could not be found.</p>
            <button
              onClick={handleGoBack}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Back to Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Session Details</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                  {getStatusText(session.status)}
                </span>
                <span className="text-sm text-gray-500">
                  ID: {session.session_id.substring(0, 12)}...
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              
              {session.status === "DRAFT" && (
                <button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continue Editing
                </button>
              )}
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Created</div>
                <div className="font-medium">{(new Date(session.created_at), "PPP")}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="font-medium">{(new Date(session.updated_at), "PPP")}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Sub-City</div>
                <div className="font-medium">{session.sub_city?.name || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/60">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === "documents"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              Documents ({(session.parcel_docs?.length || 0) + (session.owner_docs?.length || 0) + (session.lease_docs?.length || 0)})
            </button>
            {session.approval_request && (
              <button
                onClick={() => setActiveTab("approval")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === "approval"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Approval
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Parcel Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📍</span> Parcel Information
                </h3>
                {session.parcel_data ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">UPIN</div>
                      <div className="font-mono text-lg">{session.parcel_data.upin}</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">File Number</div>
                      <div className="font-mono text-lg">{session.parcel_data.file_number}</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Area</div>
                      <div className="text-lg">{session.parcel_data.total_area_m2} m²</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Land Use</div>
                      <div className="text-lg">{session.parcel_data.land_use}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500">No parcel information provided yet</p>
                  </div>
                )}
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-emerald-600">👤</span> Owner Information
                </h3>
                {session.owner_data ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-sm text-emerald-600 font-medium mb-1">Full Name</div>
                      <div className="text-lg">
                        {Array.isArray(session.owner_data) 
                          ? session.owner_data[0]?.full_name 
                          : session.owner_data.full_name}
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-sm text-emerald-600 font-medium mb-1">National ID</div>
                      <div className="font-mono text-lg">
                        {Array.isArray(session.owner_data) 
                          ? session.owner_data[0]?.national_id 
                          : session.owner_data.national_id}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500">No owner information provided yet</p>
                  </div>
                )}
              </div>

              {/* Lease Information */}
              {session.lease_data && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-purple-600">📝</span> Lease Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-sm text-purple-600 font-medium mb-1">Total Amount</div>
                      <div className="text-lg">ETB {session.lease_data.total_lease_amount?.toLocaleString()}</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-sm text-purple-600 font-medium mb-1">Lease Period</div>
                      <div className="text-lg">{session.lease_data.lease_period_years} years</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              {/* Parcel Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Parcel Documents ({session.parcel_docs?.length || 0})</h4>
                {session.parcel_docs && session.parcel_docs.length > 0 ? (
                  <div className="space-y-3">
                    {session.parcel_docs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600">📄</span>
                          </div>
                          <div>
                            <div className="font-medium">{doc.document_type}</div>
                            <div className="text-sm text-gray-500">{doc.file_name}</div>
                          </div>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500">No parcel documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Owner Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Owner Documents ({session.owner_docs?.length || 0})</h4>
                {session.owner_docs && session.owner_docs.length > 0 ? (
                  <div className="space-y-3">
                    {session.owner_docs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="text-emerald-600">📄</span>
                          </div>
                          <div>
                            <div className="font-medium">{doc.document_type}</div>
                            <div className="text-sm text-gray-500">{doc.file_name}</div>
                          </div>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-800 font-medium"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500">No owner documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Lease Documents */}
              {session.lease_data && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Lease Documents ({session.lease_docs?.length || 0})</h4>
                  {session.lease_docs && session.lease_docs.length > 0 ? (
                    <div className="space-y-3">
                      {session.lease_docs.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-purple-600">📄</span>
                            </div>
                            <div>
                              <div className="font-medium">{doc.document_type}</div>
                              <div className="text-sm text-gray-500">{doc.file_name}</div>
                            </div>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <p className="text-gray-500">No lease documents uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "approval" && session.approval_request && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-bold text-blue-800 mb-4">Approval Status</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-blue-600 font-medium mb-1">Status</div>
                      <div className="text-lg font-semibold">{session.approval_request.status}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 font-medium mb-1">Request ID</div>
                      <div className="font-mono text-sm">{session.approval_request.request_id}</div>
                    </div>
                    {session.approval_request.approver_role && (
                      <div>
                        <div className="text-sm text-blue-600 font-medium mb-1">Awaiting Approval From</div>
                        <div className="text-lg">{session.approval_request.approver_role.replace("_", " ")}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-4">Timeline</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Request Submitted</div>
                      <div className="font-medium">
                        {(new Date(session.approval_request.created_at), "PPpp")}
                      </div>
                    </div>
                    {session.approval_request.approved_at && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Approved At</div>
                        <div className="font-medium">
                          {(new Date(session.approval_request.approved_at), "PPpp")}
                        </div>
                      </div>
                    )}
                    {session.approval_request.rejected_at && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Rejected At</div>
                        <div className="font-medium">
                          {(new Date(session.approval_request.rejected_at), "PPpp")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {session.approval_request.rejection_reason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                  <h4 className="font-bold text-red-800 mb-2">Rejection Reason</h4>
                  <p className="text-red-700">{session.approval_request.rejection_reason}</p>
                </div>
              )}

              {session.status === "REJECTED" && (
                <div className="text-center">
                  <button
                    onClick={() => navigate(`/wizard?session_id=${sessionId}`)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Edit and Resubmit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/sessions"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Back to All Sessions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsPage;
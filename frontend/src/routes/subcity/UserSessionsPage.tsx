// src/pages/UserSessionsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import wizardApi from "../../services/wizardApi";
import { toast } from "sonner";
// import { format } from "date-fns";

interface WizardSession {
  session_id: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "MERGED";
  current_step: string;
  parcel_data?: any;
  owner_data?: any;
  lease_data?: any;
  sub_city_id: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  approval_request?: {
    request_id: string;
    status: string;
    approver_role?: string;
  };
  sub_city?: {
    name: string;
  };
}

const UserSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WizardSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "pending" | "completed">("all");

  useEffect(() => {
    loadSessions();
  }, []);

// src/pages/UserSessionsPage.tsx - Fix the loadSessions function
const loadSessions = async () => {
  try {
    setIsLoading(true);
    const response = await wizardApi.getUserSessions();
    
    console.log('Sessions response:', response); // Debug log
    
    if (response.success && response.data) {
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setSessions(response.data);
      } else {
        console.error('Sessions data is not an array:', response.data);
        setSessions([]);
        toast.error('Invalid sessions data format');
      }
    } else {
      toast.error(response.error || "Failed to load sessions");
      setSessions([]);
    }
  } catch (error: any) {
    console.error('Load sessions error:', error);
    toast.error(error.message || "Failed to load sessions");
    setSessions([]);
  } finally {
    setIsLoading(false);
  }
};

  const filteredSessions = sessions.filter((session) => {
    switch (filter) {
      case "draft":
        return session.status === "DRAFT";
      case "pending":
        return session.status === "PENDING_APPROVAL";
      case "completed":
        return ["APPROVED", "REJECTED", "MERGED"].includes(session.status);
      default:
        return true;
    }
  });

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

  const getStepText = (step: string) => {
    const stepMap: Record<string, string> = {
      parcel: "Parcel Info",
      "parcel-docs": "Parcel Documents",
      owner: "Owner Info",
      "owner-docs": "Owner Documents",
      lease: "Lease Info",
      "lease-docs": "Lease Documents",
      validation: "Ready to Submit",
    };
    return stepMap[step] || step;
  };

  const handleContinueSession = (sessionId: string) => {
    navigate(`/wizard?session_id=${sessionId}`);
  };

  const handleViewDetails = (sessionId: string) => {
    navigate(`/wizard?session_id=${sessionId}&step=validation`);
  };

  const handleCreateNew = () => {
    navigate("/wizard");
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return;
    }

    try {
      // Note: You'll need to add a delete endpoint in your backend
      // For now, we'll just filter it out from the UI
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      toast.success("Session deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete session");
    }
  };

  const getParcelInfo = (session: WizardSession) => {
    if (session.parcel_data) {
      return {
        upin: session.parcel_data.upin,
        fileNumber: session.parcel_data.file_number,
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wizard Sessions</h1>
          <p className="text-gray-600 mt-2">
            Manage your parcel registration sessions
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "draft"
                  ? "bg-yellow-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Draft ({sessions.filter(s => s.status === "DRAFT").length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Pending ({sessions.filter(s => s.status === "PENDING_APPROVAL").length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Completed ({sessions.filter(s => ["APPROVED", "REJECTED", "MERGED"].includes(s.status)).length})
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <span>+</span> New Registration
          </button>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No sessions found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "You haven't started any parcel registration sessions yet."
                : `No ${filter} sessions found.`}
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start New Registration
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSessions.map((session) => {
              const parcelInfo = getParcelInfo(session);
              const isExpired = session.status === "DRAFT" && session.expires_at && new Date(session.expires_at) < new Date();

              return (
                <div
                  key={session.session_id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Session Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                        {isExpired && (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>ID: {session.session_id.substring(0, 8)}...</span>
                        {session.sub_city?.name && (
                          <>
                            <span>•</span>
                            <span>{session.sub_city.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {(new Date(session.updated_at), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-gray-400">
                        Last updated
                      </div>
                    </div>
                  </div>

                  {/* Session Content */}
                  <div className="mb-6">
                    {parcelInfo ? (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Parcel Information</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs text-blue-600 font-medium mb-1">UPIN</div>
                            <div className="font-mono text-sm">{parcelInfo.upin}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs text-blue-600 font-medium mb-1">File Number</div>
                            <div className="font-mono text-sm">{parcelInfo.fileNumber}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Session Progress</h4>
                        <div className="text-sm text-gray-600">
                          Current step: <span className="font-medium">{getStepText(session.current_step)}</span>
                        </div>
                      </div>
                    )}

                    {/* Progress indicators */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{session.current_step ? getStepText(session.current_step) : "Not started"}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${(() => {
                              const steps = ["parcel", "parcel-docs", "owner", "owner-docs", "lease", "lease-docs", "validation"];
                              const currentIndex = steps.indexOf(session.current_step);
                              return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
                            })()}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Additional info */}
                    {session.approval_request && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Approval:</span> {session.approval_request.status}
                          {session.approval_request.approver_role && (
                            <span className="ml-2 text-gray-500">
                              (Awaiting {session.approval_request.approver_role})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {session.status === "DRAFT" && !isExpired && (
                      <button
                        onClick={() => handleContinueSession(session.session_id)}
                        className="flex-1 min-w-[120px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-center"
                      >
                        Continue
                      </button>
                    )}

                    {session.status === "PENDING_APPROVAL" && (
                      <button
                        onClick={() => handleViewDetails(session.session_id)}
                        className="flex-1 min-w-[120px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-center"
                      >
                        View Details
                      </button>
                    )}

                    {["APPROVED", "REJECTED", "MERGED"].includes(session.status) && (
                      <button
                        onClick={() => handleViewDetails(session.session_id)}
                        className="flex-1 min-w-[120px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-center"
                      >
                        View Results
                      </button>
                    )}

                    {session.status === "DRAFT" && (
                      <button
                        onClick={(e) => handleDeleteSession(session.session_id, e)}
                        className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors"
                      >
                        Delete
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/sessions/${session.session_id}`)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                    >
                      Details
                    </button>
                  </div>

                  {/* Expired warning */}
                  {isExpired && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-red-700">
                        <span>⚠️</span>
                        <span>This draft session has expired and cannot be continued.</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {sessions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">
                {sessions.filter(s => s.status === "DRAFT").length}
              </div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {sessions.filter(s => s.status === "PENDING_APPROVAL").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {sessions.filter(s => ["APPROVED", "MERGED"].includes(s.status)).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSessionsPage;
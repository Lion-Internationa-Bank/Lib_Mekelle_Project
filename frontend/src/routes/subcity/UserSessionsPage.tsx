import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import wizardApi from "../../services/wizardApi";
import { toast } from "sonner";

interface WizardSession {
  session_id: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "MERGED";
  current_step: string;
  parcel_data?: {
    upin: string;
    block: string;
    tabia: string;
    ketena: string;
    land_use: string;
    land_grade: number;
    file_number: string;
    tenure_type: string;
    total_area_m2: number;
  } | null;
  owner_data?: Array<{
    full_name: string;
    tin_number: string;
    national_id: string;
    phone_number: string;
    acquired_at: string;
  }> | null;
  lease_data?: {
    start_date: string;
    price_per_m2: number;
    total_lease_amount: number;
    lease_period_years: number;
    payment_term_years: number;
    down_payment_amount: number;
    legal_framework: string;
    demarcation_fee?: number;
    contract_registration_fee?: string;
    engineering_service_fee?: number;
  } | null;
  parcel_docs?: Array<{
    document_type: string;
    file_name: string;
  }> | null;
  owner_docs?: Array<{
    document_type: string;
    file_name: string;
  }> | null;
  lease_docs?: Array<{
    document_type: string;
    file_name: string;
  }> | null;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  approval_request?: {
    request_id: string;
    status: string;
    approver_role?: string;
    rejection_reason?: string;
  } | null;
  user_role: string;
  sub_city_id: string;
  approval_request_id: string | null;
  submitted_at: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const UserSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WizardSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "pending" | "completed" | "rejected">("all");
  
  // Pagination state
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Load sessions when filter or page changes
  useEffect(() => {
    loadSessions(pagination.page);
  }, [filter, pagination.page]);

  const loadSessions = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      // Map filter to status parameter
      let statusParam: string | undefined;
      switch (filter) {
        case "draft":
          statusParam = "DRAFT";
          break;
        case "pending":
          statusParam = "PENDING_APPROVAL";
          break;
        case "rejected":
          statusParam = "REJECTED";
          break;
        case "completed":
          statusParam = "COMPLETED"; // Meta-status for APPROVED and MERGED
          break;
        default:
          statusParam = "ALL"; // Get all statuses
      }
      
      const response = await wizardApi.getUserSessions(
        page, 
        pagination.limit, 
        statusParam,
        'created_at',
        'desc'
      );
      
      console.log('Sessions response:', response);
      
      if (response.success && response.data) {
        setSessions(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
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

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      handlePageChange(pagination.page - 1);
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

  const getDocumentCount = (session: WizardSession) => {
    let count = 0;
    if (session.parcel_docs?.length) count += session.parcel_docs.length;
    if (session.owner_docs?.length) count += session.owner_docs.length;
    if (session.lease_docs?.length) count += session.lease_docs.length;
    return count;
  };

  const getLandUseBadge = (landUse: string) => {
    switch (landUse) {
      case "COMMERCIAL":
        return "bg-purple-100 text-purple-800";
      case "RESIDENTIAL":
        return "bg-green-100 text-green-800";
      case "INDUSTRIAL":
        return "bg-orange-100 text-orange-800";
      case "AGRICULTURAL":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLandUseText = (landUse: string) => {
    return landUse?.charAt(0) + landUse?.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleContinueSession = (sessionId: string) => {
    navigate(`/wizard/${sessionId}`);
  };

  const handleViewDetails = (sessionId: string) => {
    navigate(`/wizard/${sessionId}?step=validation`);
  };

  const handleResubmitSession = (sessionId: string) => {
    console.log("session id from user sessions ", sessionId);
    navigate(`/wizard/${sessionId}`);
    toast.info("You can now update your information and resubmit for approval");
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
      const response = await wizardApi.deleteSession(sessionId);
      if (response.success) {
        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
        toast.success("Session deleted");
        // Refresh the current page to update counts
        loadSessions(pagination.page);
      } else {
        toast.error(response.error || "Failed to delete session");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete session");
    }
  };



  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
      <div className="max-w-7xl mx-auto">
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
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All ({pagination.totalCount})
            </button>
            <button
              onClick={() => handleFilterChange("draft")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "draft"
                  ? "bg-yellow-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => handleFilterChange("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleFilterChange("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => handleFilterChange("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Completed
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Registration
          </button>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
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
                : filter === "rejected"
                ? "No rejected sessions found."
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
          <>
            <div className="grid grid-cols-1 gap-6">
              {sessions.map((session) => {
                const isExpired = session.status === "DRAFT" && session.expires_at && new Date(session.expires_at) < new Date();
                const documentCount = getDocumentCount(session);
                const progressSteps = ["parcel", "parcel-docs", "owner", "owner-docs", "lease", "lease-docs", "validation"];
                const currentStepIndex = progressSteps.indexOf(session.current_step);
                const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / progressSteps.length) * 100 : 0;

                return (
                  <div
                    key={session.session_id}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Session Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </span>
                          {isExpired && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                              Expired
                            </span>
                          )}
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                            {getStepText(session.current_step)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Session ID: {session.session_id.substring(0, 8)}...</span>
                          <span>•</span>
                          <span>Created: {formatDate(session.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatDate(session.updated_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated
                        </div>
                      </div>
                    </div>

                    {/* Session Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Parcel Information */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Parcel Information
                        </h3>
                        
                        {session.parcel_data ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-gray-500">UPIN</div>
                                <div className="font-mono text-sm font-medium">{session.parcel_data.upin || "Not set"}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">File Number</div>
                                <div className="text-sm font-medium">{session.parcel_data.file_number || "Not set"}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Land Use</div>
                                {session.parcel_data.land_use ? (
                                  <span className={`px-2 py-1 text-xs rounded-full ${getLandUseBadge(session.parcel_data.land_use)}`}>
                                    {getLandUseText(session.parcel_data.land_use)}
                                  </span>
                                ) : (
                                  <div className="text-sm">Not set</div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-gray-500">Total Area</div>
                                <div className="text-sm font-medium">{session.parcel_data.total_area_m2 || 0} m²</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Tenure Type</div>
                                <div className="text-sm font-medium">{session.parcel_data.tenure_type || "Not set"}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Location</div>
                                <div className="text-sm font-medium">
                                  {[session.parcel_data.block, session.parcel_data.tabia, session.parcel_data.ketena]
                                    .filter(Boolean)
                                    .join(", ") || "Not set"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic text-sm">No parcel information added yet</div>
                        )}
                      </div>

                      {/* Owner & Lease Information */}
                      <div className="space-y-6">
                        {/* Owner Information */}
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Owner Information
                          </h3>
                          {session.owner_data?.length ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">{session.owner_data[0].full_name}</div>
                              <div className="text-xs text-gray-600">
                                {session.owner_data[0].national_id && `ID: ${session.owner_data[0].national_id}`}
                                {session.owner_data[0].tin_number && ` • TIN: ${session.owner_data[0].tin_number}`}
                              </div>
                              {session.owner_data.length > 1 && (
                                <div className="text-xs text-blue-600">
                                  +{session.owner_data.length - 1} more owner(s)
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500 italic text-sm">No owner information added yet</div>
                          )}
                        </div>

                        {/* Lease Information */}
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Lease Information
                          </h3>
                          {session.lease_data ? (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-500">Total Amount</div>
                                <div className="text-sm font-medium">{formatCurrency(session.lease_data.total_lease_amount)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Lease Period</div>
                                <div className="text-sm font-medium">{session.lease_data.lease_period_years} years</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Price per m²</div>
                                <div className="text-sm font-medium">{formatCurrency(session.lease_data.price_per_m2)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Start Date</div>
                                <div className="text-sm font-medium">{formatDate(session.lease_data.start_date)}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500 italic text-sm">No lease information added yet</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress and Documents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                      {/* Documents */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Documents</span>
                          <span className="text-sm font-medium">{documentCount} file(s)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {session.parcel_docs?.map((doc, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                              {doc.document_type}
                            </span>
                          ))}
                          {session.owner_docs?.map((doc, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-full">
                              {doc.document_type}
                            </span>
                          ))}
                          {session.lease_docs?.map((doc, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full">
                              {doc.document_type}
                            </span>
                          ))}
                          {documentCount === 0 && (
                            <span className="text-gray-500 italic text-xs">No documents uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      {session.status === "DRAFT" && !isExpired && (
                        <button
                          onClick={() => handleContinueSession(session.session_id)}
                          className="flex-1 min-w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          Continue Session
                        </button>
                      )}

                      {session.status === "REJECTED" && (
                        <button
                          onClick={() => handleResubmitSession(session.session_id)}
                          className="flex-1 min-w-[140px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Resubmit for Approval
                        </button>
                      )}

                      {["PENDING_APPROVAL", "APPROVED", "MERGED"].includes(session.status) && (
                        <button
                          onClick={() => handleViewDetails(session.session_id)}
                          className={`flex-1 min-w-[140px] font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2 ${
                            session.status === "PENDING_APPROVAL"
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                              : session.status === "APPROVED" || session.status === "MERGED"
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      )}

                      {session.status === "DRAFT" && (
                        <>
                          <button
                            onClick={(e) => handleDeleteSession(session.session_id, e)}
                            className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </>
                      )}

                    </div>

                    {/* Rejection Message (if available) */}
                    {session.status === "REJECTED" && session.approval_request && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <div className="text-sm font-medium text-red-800 mb-1">
                              This request was rejected
                            </div>
                            {session.approval_request.rejection_reason && (
                              <p className="text-xs text-red-700 mb-2">
                                Reason: {session.approval_request.rejection_reason}
                              </p>
                            )}
                            <p className="text-xs text-red-700">
                              Click "Resubmit for Approval" to update your information and try again.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expired warning */}
                    {isExpired && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-red-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span>This draft session has expired and cannot be continued.</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount} sessions
                </div>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!pagination.hasPreviousPage}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.hasPreviousPage
                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.hasNextPage
                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        {pagination.totalCount > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{pagination.totalCount}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">
                {/* We don't have per-status counts from API, but could add another endpoint */}
                -
              </div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">-</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSessionsPage;
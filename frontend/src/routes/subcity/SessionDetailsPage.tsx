// src/pages/SessionDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import wizardApi from "../../services/wizardApi";
import { toast } from "sonner";
// import { format } from "date-fns";

interface SessionDetails {
  session_id: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "MERGED";
  current_step: string;
  parcel_data: {
    upin: string;
    block: string;
    tabia: string;
    ketena: string;
    land_use: string;
    land_grade: number;
    file_number: string;
    tenure_type: string;
    boundary_east: string;
    boundary_west: string;
    boundary_north: string;
    boundary_south: string;
    boundary_coords: string;
    total_area_m2: number;
  } | null;
  parcel_docs: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    document_type: string;
    metadata: {
      uploaded_at: string;
      uploaded_by: string;
    };
  }> | null;
  owner_data: Array<{
    full_name: string;
    tin_number: string;
    national_id: string;
    phone_number: string;
    acquired_at: string;
  }> | null;
  owner_docs: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    document_type: string;
    metadata: {
      uploaded_at: string;
      uploaded_by: string;
    };
  }> | null;
  lease_data: {
    start_date: string;
    price_per_m2: number;
    total_lease_amount: number;
    lease_period_years: number;
    payment_term_years: number;
    down_payment_amount: number;
    legal_framework: string;
    contract_date: string;
    other_payment: number;
  } | null;
  lease_docs: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    document_type: string;
    metadata: {
      uploaded_at: string;
      uploaded_by: string;
    };
  }> | null;
  user_id: string;
  sub_city_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  expires_at: string | null;
  approval_request_id: string | null;
  approval_request?: {
    request_id: string;
    status: string;
    approver_role?: string;
    created_at: string;
    approved_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
  } | null;
  user_role: string;
}

const SessionDetailsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "approval" | "timeline">("overview");

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
    }
  }, [sessionId]);

  const loadSessionDetails = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      // Assuming you have a getSession method in wizardApi
      const response = await wizardApi.getSession(sessionId);
      
      if (response.success && response.data) {
        setSession(response.data);
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
        return ;
    }
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
    if (!landUse) return "Not specified";
    return landUse.charAt(0) + landUse.slice(1).toLowerCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return (new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Invalid date";
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

  const downloadDocument = async (fileUrl: string, fileName: string) => {
    try {
      // You might need to adjust this based on your API
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const getDocumentCount = () => {
    let count = 0;
    if (session?.parcel_docs?.length) count += session.parcel_docs.length;
    if (session?.owner_docs?.length) count += session.owner_docs.length;
    if (session?.lease_docs?.length) count += session.lease_docs.length;
    return count;
  };

  const renderProgressBar = () => {
    const steps = ["parcel", "parcel-docs", "owner", "owner-docs", "lease", "lease-docs", "validation"];
    const currentIndex = steps.indexOf(session?.current_step || "parcel");
    const progress = ((currentIndex + 1) / steps.length) * 100;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {/* Current step: {session?.current_step.replace("-", " ").toUpperCase()} */}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Session Details</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                  {getStatusText(session.status)}
                </span>
                <span className="text-sm text-gray-500">
                  {/* ID: {session.session_id.substring(0, 12)}... */}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {formatDate(session.created_at)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              
              {session.status === "DRAFT" && (
                <button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Continue Editing
                </button>
              )}

              {session.status === "REJECTED" && (
                <button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resubmit
                </button>
              )}
            </div>
          </div>

          {renderProgressBar()}

          {/* Session Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-4">
              <div className="text-sm text-gray-500 mb-1">Total Documents</div>
              <div className="text-2xl font-bold text-blue-600">{getDocumentCount()}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-4">
              <div className="text-sm text-gray-500 mb-1">Last Updated</div>
              <div className="text-lg font-medium">{formatDate(session.updated_at)}</div>
            </div>
            {session.expires_at && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-4">
                <div className="text-sm text-gray-500 mb-1">Expires</div>
                <div className="text-lg font-medium">{formatDate(session.expires_at)}</div>
              </div>
            )}
            {session.submitted_at && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-4">
                <div className="text-sm text-gray-500 mb-1">Submitted</div>
                <div className="text-lg font-medium">{formatDate(session.submitted_at)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto space-x-1 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/60">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-shrink-0 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              📋 Overview
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex-shrink-0 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "documents"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              📄 Documents ({getDocumentCount()})
            </button>
            {session.approval_request && (
              <button
                onClick={() => setActiveTab("approval")}
                className={`flex-shrink-0 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === "approval"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                ✅ Approval
              </button>
            )}
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-shrink-0 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "timeline"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              📅 Timeline
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Parcel Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </span>
                  Parcel Information
                </h3>
                {session.parcel_data ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-5">
                      <div className="text-sm text-blue-600 font-medium mb-2">Basic Information</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">UPIN</div>
                          <div className="font-mono font-bold text-lg">{session.parcel_data.upin}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">File Number</div>
                          <div className="font-semibold">{session.parcel_data.file_number}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Area</div>
                          <div className="font-semibold">{session.parcel_data.total_area_m2} m²</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-5">
                      <div className="text-sm text-blue-600 font-medium mb-2">Location Details</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Block</div>
                          <div className="font-semibold">{session.parcel_data.block}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Tabia</div>
                          <div className="font-semibold">{session.parcel_data.tabia}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Ketena</div>
                          <div className="font-semibold">{session.parcel_data.ketena}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-5">
                      <div className="text-sm text-blue-600 font-medium mb-2">Parcel Details</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Land Use</div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getLandUseBadge(session.parcel_data.land_use)}`}>
                            {getLandUseText(session.parcel_data.land_use)}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Land Grade</div>
                          <div className="font-semibold">{session.parcel_data.land_grade}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Tenure Type</div>
                          <div className="font-semibold">{session.parcel_data.tenure_type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No parcel information provided yet</p>
                  </div>
                )}
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-emerald-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  Owner Information
                </h3>
                {session.owner_data && session.owner_data.length > 0 ? (
                  <div className="space-y-6">
                    {session.owner_data.map((owner, index) => (
                      <div key={index} className="bg-emerald-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-emerald-800">Owner {index + 1}</h4>
                          <span className="text-sm text-emerald-600">
                            Acquired: {formatDate(owner.acquired_at)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-emerald-600 font-medium mb-1">Full Name</div>
                            <div className="font-semibold">{owner.full_name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-emerald-600 font-medium mb-1">National ID</div>
                            <div className="font-mono">{owner.national_id}</div>
                          </div>
                          <div>
                            <div className="text-xs text-emerald-600 font-medium mb-1">TIN Number</div>
                            <div className="font-mono">{owner.tin_number}</div>
                          </div>
                          <div>
                            <div className="text-xs text-emerald-600 font-medium mb-1">Phone Number</div>
                            <div className="font-mono">{owner.phone_number}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No owner information provided yet</p>
                  </div>
                )}
              </div>

              {/* Lease Information */}
              {session.lease_data && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <span className="text-purple-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    Lease Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-purple-50 rounded-xl p-5">
                      <div className="text-sm text-purple-600 font-medium mb-2">Financial Details</div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">Total Lease Amount</div>
                          <div className="font-bold text-lg">{formatCurrency(session.lease_data.total_lease_amount)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Price per m²</div>
                          <div className="font-semibold">{formatCurrency(session.lease_data.price_per_m2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Down Payment</div>
                          <div className="font-semibold">{formatCurrency(session.lease_data.down_payment_amount)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-5">
                      <div className="text-sm text-purple-600 font-medium mb-2">Term Details</div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">Lease Period</div>
                          <div className="font-semibold">{session.lease_data.lease_period_years} years</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Payment Term</div>
                          <div className="font-semibold">{session.lease_data.payment_term_years} years</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Other Payment</div>
                          <div className="font-semibold">{formatCurrency(session.lease_data.other_payment)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-5">
                      <div className="text-sm text-purple-600 font-medium mb-2">Dates</div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">Start Date</div>
                          <div className="font-semibold">{formatDate(session.lease_data.start_date)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Contract Date</div>
                          <div className="font-semibold">{formatDate(session.lease_data.contract_date)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-5">
                      <div className="text-sm text-purple-600 font-medium mb-2">Legal Details</div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">Legal Framework</div>
                          <div className="font-semibold text-sm">{session.lease_data.legal_framework}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-8">
              {/* Parcel Documents */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-blue-600">📋</span>
                  Parcel Documents ({session.parcel_docs?.length || 0})
                </h4>
                {session.parcel_docs && session.parcel_docs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {session.parcel_docs.map((doc, idx) => (
                      <div key={doc.id} className="bg-blue-50 rounded-xl p-5 hover:bg-blue-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-blue-800 mb-1">{doc.document_type}</div>
                              <div className="text-sm text-gray-600 mb-2">{doc.file_name}</div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(doc.file_size)} • {formatDate(doc.metadata.uploaded_at)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(doc.file_url, '_blank')}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No parcel documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Owner Documents */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-emerald-600">👤</span>
                  Owner Documents ({session.owner_docs?.length || 0})
                </h4>
                {session.owner_docs && session.owner_docs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {session.owner_docs.map((doc, idx) => (
                      <div key={doc.id} className="bg-emerald-50 rounded-xl p-5 hover:bg-emerald-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <span className="text-emerald-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-emerald-800 mb-1">{doc.document_type}</div>
                              <div className="text-sm text-gray-600 mb-2">{doc.file_name}</div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(doc.file_size)} • {formatDate(doc.metadata.uploaded_at)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(doc.file_url, '_blank')}
                            className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No owner documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Lease Documents */}
              {session.lease_data && (
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <span className="text-purple-600">📝</span>
                    Lease Documents ({session.lease_docs?.length || 0})
                  </h4>
                  {session.lease_docs && session.lease_docs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {session.lease_docs.map((doc, idx) => (
                        <div key={doc.id} className="bg-purple-50 rounded-xl p-5 hover:bg-purple-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-purple-800 mb-1">{doc.document_type}</div>
                                <div className="text-sm text-gray-600 mb-2">{doc.file_name}</div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(doc.file_size)} • {formatDate(doc.metadata.uploaded_at)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No lease documents uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "approval" && session.approval_request && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h4 className="font-bold text-blue-800 mb-4 text-xl">Approval Details</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Status</div>
                      <div className="text-2xl font-bold text-blue-700">{session.approval_request.status}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Request ID</div>
                      <div className="font-mono font-semibold">{session.approval_request.request_id}</div>
                    </div>
                    {session.approval_request.approver_role && (
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-sm text-blue-600 font-medium mb-1">Awaiting Approval From</div>
                        <div className="text-lg font-semibold">
                          {session.approval_request.approver_role.replace("_", " ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-800 mb-4 text-xl">Timeline</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Request Submitted</div>
                      <div className="font-medium text-lg">
                        {formatDate(session.approval_request.created_at)}
                      </div>
                    </div>
                    {session.approval_request.approved_at && (
                      <div className="bg-white rounded-xl p-4 border border-green-200">
                        <div className="text-sm text-green-600 font-medium mb-1">Approved At</div>
                        <div className="font-medium text-lg">
                          {formatDate(session.approval_request.approved_at)}
                        </div>
                      </div>
                    )}
                    {session.approval_request.rejected_at && (
                      <div className="bg-white rounded-xl p-4 border border-red-200">
                        <div className="text-sm text-red-600 font-medium mb-1">Rejected At</div>
                        <div className="font-medium text-lg">
                          {formatDate(session.approval_request.rejected_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {session.approval_request.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h4 className="font-bold text-red-800 mb-2 text-xl">Rejection Reason</h4>
                  <p className="text-red-700 text-lg leading-relaxed">{session.approval_request.rejection_reason}</p>
                </div>
              )}

              {session.status === "REJECTED" && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => navigate(`/wizard?session_id=${sessionId}`)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                  >
                    Edit and Resubmit Application
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Session Timeline</h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                
                <div className="space-y-8">
                  {/* Created */}
                  <div className="relative flex items-start">
                    <div className="absolute left-4 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                    <div className="ml-12">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-blue-800">Session Created</span>
                          <span className="text-sm text-gray-500">{formatDate(session.created_at)}</span>
                        </div>
                        <p className="text-gray-600">New parcel registration session was initiated</p>
                      </div>
                    </div>
                  </div>

                  {/* Updated */}
                  <div className="relative flex items-start">
                    <div className="absolute left-4 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>
                    <div className="ml-12">
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-green-800">Last Updated</span>
                          <span className="text-sm text-gray-500">{formatDate(session.updated_at)}</span>
                        </div>
                        <p className="text-gray-600">Session information was last modified</p>
                      </div>
                    </div>
                  </div>

                  {/* Submitted */}
                  {session.submitted_at && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 w-4 h-4 bg-purple-500 rounded-full border-4 border-white"></div>
                      <div className="ml-12">
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-purple-800">Submitted for Approval</span>
                            <span className="text-sm text-gray-500">{formatDate(session.submitted_at)}</span>
                          </div>
                          <p className="text-gray-600">Session was submitted for administrative review</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status changes */}
                  <div className="relative flex items-start">
                    <div className="absolute left-4 w-4 h-4 rounded-full border-4 border-white"
                      style={{
                        backgroundColor: 
                          session.status === "APPROVED" ? "#10b981" :
                          session.status === "REJECTED" ? "#ef4444" :
                          session.status === "PENDING_APPROVAL" ? "#3b82f6" :
                          session.status === "DRAFT" ? "#f59e0b" : "#6b7280"
                      }}
                    ></div>
                    <div className="ml-12">
                      <div className={`rounded-xl p-4 ${
                        session.status === "APPROVED" ? "bg-green-50" :
                        session.status === "REJECTED" ? "bg-red-50" :
                        session.status === "PENDING_APPROVAL" ? "bg-blue-50" :
                        session.status === "DRAFT" ? "bg-yellow-50" : "bg-gray-50"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold ${
                            session.status === "APPROVED" ? "text-green-800" :
                            session.status === "REJECTED" ? "text-red-800" :
                            session.status === "PENDING_APPROVAL" ? "text-blue-800" :
                            session.status === "DRAFT" ? "text-yellow-800" : "text-gray-800"
                          }`}>
                            Status: {getStatusText(session.status)}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(session.updated_at)}</span>
                        </div>
                        <p className="text-gray-600">
                          {session.status === "APPROVED" ? "Session has been approved and processed" :
                           session.status === "REJECTED" ? "Session was rejected" :
                           session.status === "PENDING_APPROVAL" ? "Session is pending administrative approval" :
                           session.status === "DRAFT" ? "Session is in draft state" : "Session status updated"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expiration warning */}
                  {session.expires_at && session.status === "DRAFT" && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 w-4 h-4 bg-orange-500 rounded-full border-4 border-white"></div>
                      <div className="ml-12">
                        <div className="bg-orange-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-orange-800">Expiration Warning</span>
                            <span className="text-sm text-gray-500">{formatDate(session.expires_at)}</span>
                          </div>
                          <p className="text-gray-600">This draft session will expire if not completed by this date</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/sessions"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            ← Back to All Sessions
          </Link>
          
          {session.status === "DRAFT" && (
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continue Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsPage;
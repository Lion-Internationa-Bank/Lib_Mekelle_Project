// src/pages/RequestDetailPage.tsx - Updated with safe null checks
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getRequestDetails, 
  approveRequest, 
  rejectRequest 
} from '../../services/makerCheckerService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  type UserRole, 
  APPROVER_ROLES,
  type ApprovalRequestData,
  getStatusDisplayName,
  getEntityDisplayName,
  getActionDisplayName,
  getEntityIcon,
  getStatusColor,
  getActionColor
} from '../../types/makerChecker';
import WizardRequestDetail from '../../components/request-details/WizardRequestDetail';
import ParcelRequestDetail from '../../components/request-details/ParcelRequestDetail';
import OwnerRequestDetail from '../../components/request-details/OwnerRequestDetail';
import LeaseRequestDetail from '../../components/request-details/LeaseRequestDetail';
import EncumbranceRequestDetail from '../../components/request-details/EncumbranceRequestDetail';
import DateDisplay from '../../components/common/DateDisplay';


// Dialog Component with Tailwind CSS
const ActionDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'approve' | 'reject';
  onSubmit: (reason: string, comments: string) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, title, type, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    if (type === 'reject' && !reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    onSubmit(reason, comments);
    setReason('');
    setComments('');
  };

  const handleClose = () => {
    setReason('');
    setComments('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-[90%] shadow-xl animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2>
        
        {type === 'reject' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
              placeholder="Please provide a detailed reason for rejection..."
              required
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments {type === 'approve' ? '(Optional)' : '(Optional)'}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
            placeholder={type === 'approve' 
              ? "Add any comments for this approval..." 
              : "Add any additional comments..."}
          />
        </div>

        <div className="flex gap-4 justify-end mt-8">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (type === 'reject' && !reason.trim())}
            className={`
              px-6 py-3 text-white rounded-lg font-medium transition-colors
              ${type === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting 
              ? type === 'approve' ? 'Approving...' : 'Rejecting...' 
              : type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ApprovalRequestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { user } = useAuth();

  // Determine if user is approver
  const isApprover = user?.role ? APPROVER_ROLES.includes(user.role as UserRole) : false;

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        if (!requestId) {
          toast.error('Request ID is required');
          navigate('/pending-requests');
          return;
        }

        const response = await getRequestDetails(requestId);
        console.log("response",response)
        if (response.success && response.data.data) {
          setRequest(response.data.data);
        } else {
          toast.error(response.error || 'Failed to fetch request details');
          navigate('/pending-requests');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('An unexpected error occurred');
        navigate('/pending-requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, navigate]);

  const handleApproveSubmit = async (reason: string, comments: string) => {
    if (!requestId) return;
    
    setIsSubmitting(true);
    try {
      const response = await approveRequest(requestId, { comments });
      if (response.success && response.data) {
        toast.success(response.data.message || 'Request approved successfully');
        setApproveDialogOpen(false);
        navigate('/pending-requests');
      } else {
        toast.error(response.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (reason: string, comments: string) => {
    if (!requestId) return;

    setIsSubmitting(true);
    try {
      const response = await rejectRequest(requestId, { 
        rejection_reason: reason || comments 
      });
      if (response.success && response.data) {
        toast.success(response.data.message || 'Request rejected successfully');
        setRejectDialogOpen(false);
        navigate('/pending-requests');
      } else {
        toast.error(response.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEntityDetail = () => {
    if (!request) return null;

    const { entity_type, action_type, request_data, entity_id } = request;

    if (!entity_type) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">Entity type not specified</p>
        </div>
      );
    }

    switch (entity_type) {
      case 'WIZARD_SESSION':
        return (
          <WizardRequestDetail 
            data={request_data || {}}
            actionType={action_type}
          />
        );
      case 'LAND_PARCELS':
        return (
          <ParcelRequestDetail 
            data={request_data || {}}
            actionType={action_type}
            entityId={entity_id}
          />
        );
      case 'OWNERS':
        return (
          <OwnerRequestDetail 
            data={request_data || {}}
            actionType={action_type}
            entityId={entity_id}
          />
        );
      case 'LEASE_AGREEMENTS':
        return (
          <LeaseRequestDetail 
            data={request_data || {}}
            actionType={action_type}
            entityId={entity_id}
          />
        );
      case 'ENCUMBRANCES':
        return (
          <EncumbranceRequestDetail 
            data={request_data || {}}
            actionType={action_type}
            entityId={entity_id}
          />
        );
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Request Data</h3>
            <pre className="bg-gray-50 p-6 rounded-lg overflow-auto max-h-[500px] text-sm font-mono border border-gray-200">
              {JSON.stringify(request_data || {}, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl text-gray-700">Loading request details...</div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">❓</div>
          <div className="text-xl text-gray-700">Request not found</div>
          <button
            onClick={() => navigate('/pending-requests')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Pending Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Action Dialogs */}
      <ActionDialog
        isOpen={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        title="Approve Request"
        type="approve"
        onSubmit={handleApproveSubmit}
        isSubmitting={isSubmitting}
      />
      
      <ActionDialog
        isOpen={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        title="Reject Request"
        type="reject"
        onSubmit={handleRejectSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Back Button */}
      <button 
        onClick={() => navigate('/pending-requests')}
        className="mb-6 px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
      >
        <span>←</span> Back to Pending Requests
      </button>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl p-8 shadow-lg">
        {/* Request Header */}
        <div className="flex items-start gap-5 mb-8 pb-6 border-b border-gray-200">
          <div className="text-4xl bg-gray-100 w-20 h-20 flex items-center justify-center rounded-xl border border-gray-200">
            {getEntityIcon(request.entity_type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {getEntityDisplayName(request.entity_type)} - {getActionDisplayName(request.action_type)}
              </h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                {getStatusDisplayName(request.status)}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600">
              <span>📅 Created: {request.created_at ?(   <span className="font-medium">
                <DateDisplay 
                  date={request.created_at} 
                  format="medium"
                  showCalendarIndicator={true}
                  showTooltip={true}
                />
              </span>) : 'N/A'}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>👤 By: {request.maker?.full_name || 'Unknown'} ({request.maker?.role?.replace('_', ' ') || 'Unknown'})</span>
              {request.sub_city && (
                <>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>📍 Sub-city: {request.sub_city.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Request ID Accordion */}
        <details className="mb-6 group">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors list-none flex items-center gap-2">
            <span className="transform group-open:rotate-90 transition-transform">▶</span>
            Show Request ID
          </summary>
          <code className="block mt-3 p-4 bg-gray-50 rounded-lg text-xs font-mono border border-gray-200 break-all">
            {request.request_id || 'N/A'}
          </code>
        </details>

        {/* Entity Specific Details */}
        <div className="mb-8">
          {renderEntityDetail()}
        </div>

        {/* Action Buttons - Only for Approvers and PENDING status */}
        {isApprover && request.status === 'PENDING' && (
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Take Action</h3>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setApproveDialogOpen(true)}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-3 transition-colors shadow-md hover:shadow-lg"
              >
                <span className="text-xl">✓</span> Approve Request
              </button>
              
              <button
                onClick={() => setRejectDialogOpen(true)}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-3 transition-colors shadow-md hover:shadow-lg"
              >
                <span className="text-xl">✗</span> Reject Request
              </button>
            </div>
          </div>
        )}

        {/* Not Authorized Message - Show for non-approvers when request is PENDING */}
        {!isApprover && request.status === 'PENDING' && (
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <span className="text-3xl mb-3 block">👁️</span>
              <h4 className="text-lg font-semibold text-blue-800 mb-2">View Only Mode</h4>
              <p className="text-blue-600">
                You are viewing this request in read-only mode. Only approvers can take action on this request.
              </p>
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {request.status === 'REJECTED' && request.rejection_reason && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Rejection Reason</h4>
                <p className="text-red-700">{request.rejection_reason}</p>
                {request.rejected_at && (
                  <p className="text-sm text-red-600 mt-2">
                    Rejected on:    <span className="font-medium">
                <DateDisplay 
                  date={request.rejected_at} 
                  format="medium"
                  showCalendarIndicator={true}
                  showTooltip={true}
                />
              </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval Info */}
        {request.status === 'APPROVED' && request.approved_at && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Approved</h4>
                <p className="text-green-700">
                     <span className="font-medium">
                <DateDisplay 
                  date={request.approved_at} 
                  format="medium"
                  showCalendarIndicator={true}
                  showTooltip={true}
                />
              </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Returned Info */}
        {request.status === 'RETURNED' && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">↩️</span>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Returned for Revision</h4>
                <p className="text-blue-700">
                  This request has been returned for modifications.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailPage;
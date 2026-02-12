// src/pages/RequestDetailPage.tsx - Updated with Dialog Boxes
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getRequestDetails, 
  approveRequest, 
  rejectRequest 
} from '../../services/makerCheckerService';
import { type ApprovalRequest } from '../../types/makerChecker';
import { toast } from 'sonner';
import WizardRequestDetail from '../../components/request-details/WizardRequestDetail';
import ParcelRequestDetail from '../../components/request-details/ParcelRequestDetail';
import OwnerRequestDetail from '../../components/request-details/OwnerRequestDetail';
import LeaseRequestDetail from '../../components/request-details/LeaseRequestDetail';
import EncumbranceRequestDetail from '../../components/request-details/EncumbranceRequestDetail';

// Dialog Component
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{title}</h2>
        
        {type === 'reject' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Reason for Rejection *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '100px',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
              placeholder="Please provide a detailed reason for rejection..."
              required
            />
          </div>
        )}

       { type === 'approve' && (
         <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Comments {type === 'approve' ? '(Optional)' : '(Optional)'}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '80px',
              padding: '0.75rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
            placeholder={type === 'approve' 
              ? "Add any comments for this approval..." 
              : "Add any additional comments..."}
          />
        </div>
       )

       }

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem'
        }}>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (type === 'reject' && !reason.trim())}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: type === 'approve' ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: (isSubmitting || (type === 'reject' && !reason.trim())) ? 0.6 : 1,
            }}
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
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        if (!requestId) {
          toast.error('Request ID is required');
          navigate('/pending-requests');
          return;
        }

        const response = await getRequestDetails(requestId);
        if (response.success && response.data) {
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

    const { entity_type, action_type, request_data } = request;

    switch (entity_type) {
      case 'WIZARD_SESSION':
        return (
          <WizardRequestDetail 
            data={request_data}
            actionType={action_type}
          />
        );
      case 'LAND_PARCELS':
        return (
          <ParcelRequestDetail 
            data={request_data}
            actionType={action_type}
            entityId={request.entity_id}
          />
        );
      case 'OWNERS':
        return (
          <OwnerRequestDetail 
            data={request_data}
            actionType={action_type}
            entityId={request.entity_id}
          />
        );
      case 'LEASE_AGREEMENTS':
        return (
          <LeaseRequestDetail 
            data={request_data}
            actionType={action_type}
            entityId={request.entity_id}
          />
        );
      case 'ENCUMBRANCES':
        return (
          <EncumbranceRequestDetail 
            data={request_data}
            actionType={action_type}
            entityId={request.entity_id}
          />
        );
      default:
        return (
          <div>
            <h3>Request Data</h3>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(request_data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'WIZARD_SESSION':
        return '🪄';
      case 'LAND_PARCELS':
        return '🏞️';
      case 'OWNERS':
        return '👤';
      case 'LEASE_AGREEMENTS':
        return '📄';
      case 'ENCUMBRANCES':
        return '🔒';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading request details...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Request not found</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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

      <button 
        onClick={() => navigate('/pending-requests')}
        style={{ 
          marginBottom: '1.5rem', 
          padding: '0.5rem 1rem',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ← Back to Pending Requests
      </button>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '2rem', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        {/* Request Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #dee2e6'
        }}>
          <div style={{
            fontSize: '2rem',
            backgroundColor: '#e9ecef',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px'
          }}>
            {getEntityIcon(request.entity_type)}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>
              {request.entity_type} - {request.action_type}
            </h1>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              color: '#6c757d'
            }}>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '4px',
                backgroundColor: request.status === 'PENDING' ? '#fff3cd' : 
                               request.status === 'APPROVED' ? '#d1e7dd' : 
                               '#f8d7da',
                color: request.status === 'PENDING' ? '#856404' : 
                      request.status === 'APPROVED' ? '#0f5132' : 
                      '#721c24',
                fontWeight: '600'
              }}>
                {request.status}
              </span>
              <span>•</span>
              <span>Created: {new Date(request.created_at).toLocaleString()}</span>
              <span>•</span>
              <span>By: {request.maker?.full_name} ({request.maker?.role})</span>
              {request.sub_city && (
                <>
                  <span>•</span>
                  <span>Sub-city: {request.sub_city.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Request ID (hidden by default, can be revealed) */}
        <details style={{ marginBottom: '1.5rem' }}>
          <summary style={{ 
            cursor: 'pointer', 
            color: '#6c757d',
            fontSize: '0.9rem'
          }}>
            Show Request ID
          </summary>
          <code style={{ 
            display: 'block', 
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '0.85em',
            wordBreak: 'break-all'
          }}>
            {request.request_id}
          </code>
        </details>

        {/* Entity Specific Details */}
        <div style={{ marginBottom: '2rem' }}>
          {renderEntityDetail()}
        </div>

        {/* Action Buttons (only if pending) */}
        {request.status === 'PENDING' && (
          <div style={{ 
            borderTop: '1px solid #dee2e6', 
            paddingTop: '2rem',
            marginTop: '2rem'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Take Action</h3>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setApproveDialogOpen(true)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
              >
                <span>✓</span> Approve Request
              </button>
              
              <button
                onClick={() => setRejectDialogOpen(true)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
              >
                <span>✗</span> Reject Request
              </button>
            </div>
          </div>
        )}

        {/* Show rejection reason if already rejected */}
        {request.status === 'REJECTED' && request.rejection_reason && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Rejection Reason:</strong><br />
            {request.rejection_reason}
            <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
              Rejected on: {request.rejected_at ? new Date(request.rejected_at).toLocaleString() : 'N/A'}
            </div>
          </div>
        )}

        {/* Show approval info if already approved */}
        {request.status === 'APPROVED' && request.approved_at && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#d1e7dd',
            color: '#0f5132',
            borderRadius: '4px',
            border: '1px solid #badbcc'
          }}>
            <strong>Approved:</strong><br />
            {new Date(request.approved_at).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailPage;
// src/pages/PendingRequestsPage.tsx - Updated with Cards
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingRequests } from '../../services/makerCheckerService';
import { type ApprovalRequest } from '../../types/makerChecker';
import { toast } from 'sonner';

const PendingRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getPendingRequests();
        if (response.success && response.data) {
          setRequests(response.data.data)
        } else {
          toast.error(response.error || 'Failed to fetch pending requests');
        }
      } catch (err) {
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fff3cd', text: '#856404' };
      case 'APPROVED':
        return { bg: '#d1e7dd', text: '#0f5132' };
      case 'REJECTED':
        return { bg: '#f8d7da', text: '#721c24' };
      default:
        return { bg: '#e9ecef', text: '#495057' };
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return { bg: '#d1e7dd', text: '#0f5132' };
      case 'UPDATE':
        return { bg: '#cce5ff', text: '#004085' };
      case 'DELETE':
        return { bg: '#f8d7da', text: '#721c24' };
      case 'TRANSFER':
        return { bg: '#d4edda', text: '#155724' };
      default:
        return { bg: '#e2e3e5', text: '#383d41' };
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.entity_type === filter);

  const entityTypes = Array.from(new Set(requests.map(req => req.entity_type)));

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading pending requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Pending Approval Requests</h1>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>
            {requests.length} request{requests.length !== 1 ? 's' : ''} pending approval
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: filter === 'all' ? '#007bff' : '#e9ecef',
            color: filter === 'all' ? 'white' : '#495057',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          All ({requests.length})
        </button>
        {entityTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filter === type ? '#007bff' : '#e9ecef',
              color: filter === type ? 'white' : '#495057',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {getEntityIcon(type)} {type.replace('_', ' ')} ({requests.filter(r => r.entity_type === type).length})
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem', 
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No pending requests found</h3>
          <p style={{ color: '#6c757d' }}>
            {filter === 'all' 
              ? 'There are no pending approval requests at the moment.'
              : `No ${filter.replace('_', ' ')} requests pending.`}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem'
        }}>
          {filteredRequests.map((req) => {
            const statusColor = getStatusColor(req.status);
            const actionColor = getActionColor(req.action_type);
            
            return (
              <div
                key={req.request_id}
                onClick={() => navigate(`/pending-requests/${req.request_id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    backgroundColor: '#e9ecef',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}>
                    {getEntityIcon(req.entity_type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '1.1rem',
                      marginBottom: '0.25rem'
                    }}>
                      {req.entity_type.replace('_', ' ')}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        fontWeight: '500'
                      }}>
                        {req.status}
                      </span>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: actionColor.bg,
                        color: actionColor.text,
                        fontWeight: '500'
                      }}>
                        {req.action_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Maker Info */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {req.maker.full_name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                      {req.maker.full_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      {req.maker.role} • {req.maker.username}
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  color: '#6c757d'
                }}>
                  <span>Created {new Date(req.created_at).toLocaleDateString()}</span>
                  <span>{new Date(req.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>

                {/* Click Indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: '0.8rem',
                  color: '#007bff'
                }}>
                  <span>Click to review →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {requests.length > 0 && (
        <div style={{ 
          marginTop: '3rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Request Statistics</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem'
          }}>
            {entityTypes.map(type => {
              const count = requests.filter(r => r.entity_type === type).length;
              const percentage = (count / requests.length * 100).toFixed(1);
              
              return (
                <div key={type} style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  borderLeft: '4px solid #007bff'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span>{getEntityIcon(type)}</span>
                    <span style={{ fontWeight: '500' }}>
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    {percentage}% of total
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsPage;
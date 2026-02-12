// src/components/request-details/LeaseRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';

interface LeaseRequestDetailProps {
  data: any;
  actionType: ActionType;
  entityId: string;
}

const LeaseRequestDetail: React.FC<LeaseRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  const renderCreate = () => {
    return (
      <div>
        <h3>New Lease Agreement</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          {Object.entries(data).map(([key, value]) => {
            let displayValue = value;
            if (key.includes('date') && value) {
              displayValue = new Date(value as string).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } else if (typeof value === 'number' && key.includes('amount') || key.includes('payment')) {
              displayValue = `$${Number(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
            }
            
            return (
              <div key={key} style={{ 
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ 
                  fontSize: '0.85rem',
                  color: '#6c757d',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  wordBreak: 'break-word'
                }}>
                  {String(displayValue)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUpdate = () => {
    const { changes, current_data } = data;
    
    return (
      <div>
        <h3>Update Lease Agreement</h3>
        
        {/* Current Data Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Lease Details</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            {Object.entries(current_data).map(([key, value]) => {
              let displayValue = value;
              if (key.includes('date') && value) {
                displayValue = new Date(value as string).toLocaleDateString();
              }
              
              return (
                <div key={key}>
                  <div style={{ 
                    fontSize: '0.85rem',
                    color: '#6c757d',
                    marginBottom: '0.25rem'
                  }}>
                    {key.replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div style={{ wordBreak: 'break-word' }}>
                    {String(displayValue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Data Changes */}
        <DataDiffViewer
          originalData={current_data}
          updatedData={changes}
          title="Proposed Changes"
        />
      </div>
    );
  };

  const renderDelete = () => (
    <div>
      <h3>Delete Lease Agreement</h3>
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Lease ID:</strong> {entityId}
        </div>
        {data.reason && (
          <div>
            <strong>Reason for Deletion:</strong> {data.reason}
          </div>
        )}
        {data.current_data && (
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              Lease Information:
            </div>
            {Object.entries(data.current_data).slice(0, 3).map(([key, value]) => (
              <div key={key} style={{ fontSize: '0.9rem' }}>
                {key.replace(/_/g, ' ')}: {String(value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTerminateExtend = () => {
    return renderUpdate(); // Same as update for terminate/extend
  };

  switch (actionType) {
    case 'CREATE':
      return renderCreate();
    case 'UPDATE':
    case 'TERMINATE':
    case 'EXTEND':
      return actionType === 'UPDATE' ? renderUpdate() : renderTerminateExtend();
    case 'DELETE':
      return renderDelete();
    default:
      return (
        <div style={{ 
          padding: '1rem',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          color: '#856404'
        }}>
          Unsupported action type: {actionType}
        </div>
      );
  }
};

export default LeaseRequestDetail;
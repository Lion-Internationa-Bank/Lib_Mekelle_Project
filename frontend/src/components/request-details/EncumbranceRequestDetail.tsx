// src/components/request-details/EncumbranceRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';

interface EncumbranceRequestDetailProps {
  data: any;
  actionType: ActionType;
  entityId: string;
}

const EncumbranceRequestDetail: React.FC<EncumbranceRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  const renderCreate = () => {
    return (
      <div>
        <h3>New Encumbrance Registration</h3>
        <div style={{ 
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          {Object.entries(data).map(([key, value]) => (
            <div 
              key={key} 
              style={{ 
                marginBottom: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #dee2e6',
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '1rem',
                alignItems: 'start'
              }}
            >
              <div style={{ fontWeight: '600', color: '#495057' }}>
                {key.replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}:
              </div>
              <div style={{ wordBreak: 'break-word' }}>
                {key.includes('date') && value 
                  ? new Date(value as string).toLocaleDateString()
                  : String(value)
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUpdate = () => {
    const { changes, current_data } = data;
    
    return (
      <div>
        <h3>Update Encumbrance</h3>
        
        {/* Current Data Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Encumbrance Details</h4>
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            {Object.entries(current_data).map(([key, value]) => (
              <div 
                key={key} 
                style={{ 
                  marginBottom: '0.5rem',
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr',
                  gap: '1rem',
                  alignItems: 'start'
                }}
              >
                <div style={{ fontWeight: '600', color: '#495057' }}>
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}:
                </div>
                <div style={{ wordBreak: 'break-word' }}>
                  {key.includes('date') && value 
                    ? new Date(value as string).toLocaleDateString()
                    : String(value)
                  }
                </div>
              </div>
            ))}
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
      <h3>Release Encumbrance</h3>
      <div style={{ 
        padding: '1rem',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Encumbrance ID:</strong> {entityId}
        </div>
        {data.reason && (
          <div>
            <strong>Reason for Release:</strong> {data.reason}
          </div>
        )}
      </div>
    </div>
  );

  switch (actionType) {
    case 'CREATE':
      return renderCreate();
    case 'UPDATE':
      return renderUpdate();
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

export default EncumbranceRequestDetail;
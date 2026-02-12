// src/components/request-details/OwnerRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';
import DocumentList from '../common/DocumentList';


interface OwnerRequestDetailProps {
  data: any;
  actionType: ActionType;
  entityId: string;
}

const OwnerRequestDetail: React.FC<OwnerRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
 const renderCreate = () => {
    // Document field names to look for
    const documentFieldNames = ['documents', 'attachments', 'identification_docs', 'supporting_documents'];
    
    const regularEntries = Object.entries(data).filter(
      ([key]) => !documentFieldNames.includes(key) && !key.toLowerCase().includes('document')
    );
    
    const documentEntries = Object.entries(data).filter(
      ([key]) => documentFieldNames.includes(key) || key.toLowerCase().includes('document')
    );

    const renderValue = (value: any): string => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          if (value.length === 0) return 'No items';
          return `${value.length} item(s)`;
        }
        if (Object.keys(value).length === 0) return 'Empty object';
        return JSON.stringify(value);
      }
      return String(value);
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">New Owner Registration</h3>
        
        {/* Regular fields grid */}
        {regularEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularEntries.map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-base font-semibold text-gray-900 break-words">
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documents sections */}
        {documentEntries.map(([key, value]) => {
          const documents = Array.isArray(value) ? value : (value ? [value] : []);
          if (documents.length === 0) return null;

          return (
            <div key={key} className="mt-4">
              <DocumentList
                documents={documents}
                title={key.replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                variant="compact"
                showUploadInfo={true}
              />
            </div>
          );
        })}

        {/* Show message if no documents */}
        {documentEntries.length === 0 && (
          <DocumentList documents={[]} title="Documents" />
        )}
      </div>
    );
  };

  const renderUpdate = () => {
    const { changes, current_data } = data;
    
    return (
      <div>
        <h3>Update Owner Information</h3>
        
        {/* Current Owner Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Owner Details</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            {Object.entries(current_data).map(([key, value]) => (
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
                  {String(value || 'N/A')}
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
      <h3>Delete Owner</h3>
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Owner ID:</strong> {entityId}
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
              Owner Information:
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div><strong>Full Name:</strong> {data.current_data.full_name}</div>
              <div><strong>National ID:</strong> {data.current_data.national_id}</div>
              <div><strong>Phone:</strong> {data.current_data.phone_number}</div>
              {data.current_data.active_parcels_count !== undefined && (
                <div><strong>Active Parcels:</strong> {data.current_data.active_parcels_count}</div>
              )}
            </div>
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

export default OwnerRequestDetail;
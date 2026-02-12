// src/components/request-details/EncumbranceRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';
import DocumentList from '../common/DocumentList';

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
  // Document field names to look for
  const documentFieldNames = ['documents', 'attachments', 'encumbrance_docs', 'supporting_documents', 'registered_document'];
  
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

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">New Encumbrance Registration</h3>
      
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
                {key.toLowerCase().includes('date') && value 
                  ? formatDate(value as string)
                  : renderValue(value)
                }
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
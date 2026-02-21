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
      <h3 className="text-lg font-semibold text-[#2a2718]">New Encumbrance Registration</h3>
      
      {/* Regular fields grid */}
      {regularEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularEntries.map(([key, value]) => (
            <div key={key} className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
              <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                {key.replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-base font-semibold text-[#2a2718] break-words">
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
        <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Update Encumbrance</h3>
        
        {/* Current Data Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-[#2a2718] mb-3">Current Encumbrance Details</h4>
          <div className="p-4 bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e]">
            {Object.entries(current_data).map(([key, value]) => (
              <div 
                key={key} 
                className="mb-2 grid grid-cols-[200px_1fr] gap-4 items-start"
              >
                <div className="font-semibold text-[#2a2718]">
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}:
                </div>
                <div className="break-words text-[#2a2718]">
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
      <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Release Encumbrance</h3>
      <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <div className="mb-2">
          <strong className="text-[#2a2718]">Encumbrance ID:</strong> {entityId}
        </div>
        {data.reason && (
          <div>
            <strong className="text-[#2a2718]">Reason for Release:</strong> {data.reason}
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
        <div className="p-4 bg-[#f0cd6e]/20 rounded-lg border border-[#f0cd6e] text-[#2a2718]">
          Unsupported action type: {actionType}
        </div>
      );
  }
};

export default EncumbranceRequestDetail;
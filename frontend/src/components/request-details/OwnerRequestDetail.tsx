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
        <h3 className="text-lg font-semibold text-[#2a2718]">New Owner Registration</h3>
        
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
        <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Update Owner Information</h3>
        
        {/* Current Owner Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-[#2a2718] mb-3">Current Owner Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e]">
            {Object.entries(current_data).map(([key, value]) => (
              <div key={key}>
                <div className="text-xs text-[#2a2718]/70 mb-1">
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="break-words text-[#2a2718]">
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
      <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Delete Owner</h3>
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <div className="mb-4">
          <strong className="text-[#2a2718]">Owner ID:</strong> {entityId}
        </div>
        {data.reason && (
          <div>
            <strong className="text-[#2a2718]">Reason for Deletion:</strong> {data.reason}
          </div>
        )}
        {data.current_data && (
          <div className="mt-4 p-4 bg-white/50 rounded-lg">
            <div className="font-semibold text-[#2a2718] mb-3">
              Owner Information:
            </div>
            <div className="grid gap-2">
              <div><strong className="text-[#2a2718]">Full Name:</strong> {data.current_data.full_name}</div>
              <div><strong className="text-[#2a2718]">National ID:</strong> {data.current_data.national_id}</div>
              <div><strong className="text-[#2a2718]">Phone:</strong> {data.current_data.phone_number}</div>
              {data.current_data.active_parcels_count !== undefined && (
                <div><strong className="text-[#2a2718]">Active Parcels:</strong> {data.current_data.active_parcels_count}</div>
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
        <div className="p-4 bg-[#f0cd6e]/20 rounded-lg border border-[#f0cd6e] text-[#2a2718]">
          Unsupported action type: {actionType}
        </div>
      );
  }
};

export default OwnerRequestDetail;
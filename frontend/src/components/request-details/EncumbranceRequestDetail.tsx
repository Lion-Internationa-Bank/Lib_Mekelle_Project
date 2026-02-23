// src/components/request-details/EncumbranceRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';
import DocumentList from '../common/DocumentList';
import DateDisplay from '../common/DateDisplay'; // Import DateDisplay

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
  // Helper function to check if a field is a date field
  const isDateField = (key: string): boolean => {
    const dateKeywords = ['date', 'created_at', 'updated_at', 'registered_on', 'issued_date', 'expiry_date', 'effective_date'];
    return dateKeywords.some(keyword => key.toLowerCase().includes(keyword));
  };

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

    // Remove the old formatDate function - we'll use DateDisplay instead

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
                  {isDateField(key) && value ? (
                    <DateDisplay 
                      date={value as string} 
                      format="medium"
                      showCalendarIndicator={true}
                      showTooltip={true}
                    />
                  ) : (
                    renderValue(value)
                  )}
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
                  {isDateField(key) && value ? (
                    <DateDisplay 
                      date={value as string} 
                      format="medium"
                      showCalendarIndicator={true}
                      showTooltip={true}
                    />
                  ) : (
                    String(value)
                  )}
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
        {data.release_date && (
          <div className="mt-2">
            <strong className="text-[#2a2718]">Release Date:</strong>{' '}
            <DateDisplay 
              date={data.release_date} 
              format="medium"
              showCalendarIndicator={true}
              showTooltip={true}
            />
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
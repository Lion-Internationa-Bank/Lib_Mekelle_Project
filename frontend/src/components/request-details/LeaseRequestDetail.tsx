// src/components/request-details/LeaseRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';
import DocumentList from '../common/DocumentList';

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
  // Extract data from request_data
  const requestData = data.request_data || data;
  
  // Document field names to look for
  const documentFieldNames = [
    'documents', 
    'attachments', 
    'lease_documents', 
    'agreement_docs', 
    'signed_agreement',
    'supporting_documents'
  ];
  
  // Fields to exclude from display
  const excludedFields = [
    'parcel_sub_city_id',
    'sub_city_id',
    'maker_id',
    'approver_id',
    'request_id',
    'entity_id',
    'last_document_update',
    'created_at',
    'updated_at'
  ];

  // Extract lease details
  const leaseDetails = requestData.lease_details || {};
  
  // Regular fields (exclude documents, lease_details, and excluded fields)
  const regularEntries = Object.entries(requestData).filter(
    ([key]) => !documentFieldNames.includes(key) && 
               !key.toLowerCase().includes('document') &&
               !key.includes('lease_details') &&
               !excludedFields.includes(key) &&
               typeof requestData[key] !== 'object'
  );
  
  const documentEntries = Object.entries(requestData).filter(
    ([key]) => documentFieldNames.includes(key) || key.toLowerCase().includes('document')
  );

  const formatCurrency = (value: number): string => {
    return `$${Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    
    // Handle date fields
    if (key.toLowerCase().includes('date') && value) {
      return formatDate(value);
    }
    
    // Handle amount/payment fields
    if (typeof value === 'number' && 
        (key.toLowerCase().includes('amount') || 
         key.toLowerCase().includes('payment') || 
         key.toLowerCase().includes('rent') ||
         key.toLowerCase().includes('price') ||
         key.toLowerCase().includes('installment') ||
         key.toLowerCase().includes('deposit') ||
         key.toLowerCase().includes('principal'))) {
      return formatCurrency(value);
    }
    
    // Handle objects/arrays
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
      <h3 className="text-lg font-semibold text-gray-900">New Lease Agreement</h3>
      
      {/* Parcel Information */}
      {requestData.parcel_file_number && (
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-blue-600">🏢</span>
            Parcel Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md border border-blue-100">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                File Number
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {requestData.parcel_file_number}
              </div>
            </div>
            {leaseDetails.upin && (
              <div className="bg-white p-4 rounded-md border border-blue-100">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  UPIN
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {leaseDetails.upin}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lease Details Section */}
      {Object.keys(leaseDetails).length > 0 && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-gray-600">📋</span>
            Lease Agreement Details
          </h4>
          
          {/* Lease Period Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Lease Period
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {leaseDetails.lease_period_years || 0} Years
              </div>
              {leaseDetails.payment_term_years && (
                <div className="text-xs text-gray-600 mt-2">
                  Payment term: {leaseDetails.payment_term_years} years
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Total Lease Amount
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(leaseDetails.total_lease_amount || 0)}
              </div>
              {leaseDetails.price_per_m2 && (
                <div className="text-xs text-gray-600 mt-2">
                  Price per m²: {formatCurrency(leaseDetails.price_per_m2)}
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Down Payment
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(leaseDetails.down_payment_amount || 0)}
              </div>
              {leaseDetails.annual_installment && (
                <div className="text-xs text-gray-600 mt-2">
                  Annual installment: {formatCurrency(leaseDetails.annual_installment)}
                </div>
              )}
            </div>
          </div>

          {/* Lease Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {leaseDetails.contract_date && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  Contract Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(leaseDetails.contract_date)}
                </div>
              </div>
            )}
            {leaseDetails.start_date && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  Start Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(leaseDetails.start_date)}
                </div>
              </div>
            )}
            {leaseDetails.expiry_date && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  Expiry Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(leaseDetails.expiry_date)}
                </div>
              </div>
            )}
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h5 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Payment Breakdown
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {leaseDetails.principal !== undefined && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Principal</div>
                  <div className="text-base font-semibold text-gray-900">
                    {formatCurrency(leaseDetails.principal)}
                  </div>
                </div>
              )}
              {leaseDetails.other_payment !== undefined && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Other Payment</div>
                  <div className="text-base font-semibold text-gray-900">
                    {formatCurrency(leaseDetails.other_payment)}
                  </div>
                </div>
              )}
              {leaseDetails.down_payment_amount !== undefined && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Down Payment</div>
                  <div className="text-base font-semibold text-gray-900">
                    {formatCurrency(leaseDetails.down_payment_amount)}
                  </div>
                </div>
              )}
              {leaseDetails.annual_installment !== undefined && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Annual Installment</div>
                  <div className="text-base font-semibold text-gray-900">
                    {formatCurrency(leaseDetails.annual_installment)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legal Framework */}
          {leaseDetails.legal_framework && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Legal Framework
              </div>
              <div className="text-sm text-gray-900">
                {leaseDetails.legal_framework}
              </div>
            </div>
          )}

          {/* Other Lease Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {Object.entries(leaseDetails).filter(([key]) => 
              !['upin', 'principal', 'start_date', 'expiry_date', 'price_per_m2', 
                'contract_date', 'other_payment', 'legal_framework', 'annual_installment',
                'lease_period_years', 'payment_term_years', 'total_lease_amount', 
                'down_payment_amount'].includes(key)
            ).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm font-medium text-gray-900 break-words">
                  {renderValue(key, value)}
                </div>
              </div>
            ))}
          </div>
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
        <DocumentList documents={[]} title="Lease Documents" />
      )}
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
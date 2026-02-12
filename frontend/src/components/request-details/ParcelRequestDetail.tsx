// src/components/request-details/ParcelRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';
import DocumentList from '../common/DocumentList';


interface ParcelRequestDetailProps {
  data: any;
  actionType: ActionType;
  entityId: string;
}

const ParcelRequestDetail: React.FC<ParcelRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  const renderCreate = () => {
    return (
      <div>
        <h3>New Parcel Registration</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          {Object.entries(data).map(([key, value]) => (
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
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2) 
                  : String(value)}
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
        <h3>Update Parcel Information</h3>
        
        {/* Current Parcel Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Parcel Details</h4>
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
                  {typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)}
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

const renderTransfer = () => {
  // Extract data from request_data
  const requestData = data.request_data || data;
  
  // Document field names to look for
  const documentFieldNames = ['documents', 'attachments', 'transfer_docs', 'supporting_documents', 'deed_documents'];
  
  // Parcel info to display
  const parcelInfo = requestData.parcel_details || {};
  
  // Owner details
  const ownerDetails = requestData.owner_details || {};
  
  // Regular fields (exclude documents, complex objects, and owner IDs)
  const regularEntries = Object.entries(requestData).filter(
    ([key]) => !documentFieldNames.includes(key) && 
               !key.toLowerCase().includes('document') &&
               !key.includes('owner_details') &&
               !key.includes('parcel_details') &&
               !key.includes('from_owner_id') &&
               !key.includes('to_owner_id') &&
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
    
    if (key.toLowerCase().includes('date') && value) {
      return formatDate(value);
    }
    
    if (key.toLowerCase().includes('price') || 
        key.toLowerCase().includes('amount') || 
        key.toLowerCase().includes('value')) {
      return formatCurrency(value);
    }
    
    return String(value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Ownership Transfer</h3>
      
      {/* Owner Transfer Cards - Only showing names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Owner Card */}
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
              FROM
            </span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
              Owner Name
            </div>
            <div className="text-lg font-semibold text-gray-900 break-words">
              {ownerDetails.from_owner_name || 'N/A'}
            </div>
          </div>
        </div>
        
        {/* To Owner Card */}
        <div className="bg-green-50 p-5 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-green-800 bg-green-100 px-3 py-1 rounded-full">
              TO
            </span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
              Owner Name
            </div>
            <div className="text-lg font-semibold text-gray-900 break-words">
              {ownerDetails.to_owner_name || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Parcel Information */}
      {Object.keys(parcelInfo).length > 0 && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-gray-600">🏢</span>
            Parcel Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(parcelInfo).map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-md border border-gray-100">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm font-medium text-gray-900 break-words">
                  {String(value || 'N/A')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Details */}
      {regularEntries.length > 0 && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Transfer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularEntries.map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-md border border-gray-100">
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
        <DocumentList documents={[]} title="Transfer Documents" />
      )}
    </div>
  );
};

const renderAddOwner = () => {
  // Extract data from request_data
  const requestData = data.request_data || data;
  
  // Document field names to look for
  const documentFieldNames = ['documents', 'attachments', 'ownership_docs', 'supporting_documents', 'id_copies'];
  
  // Parcel info to display
  const parcelInfo = requestData.parcel_details || {};
  
  // New owner details
  const newOwnerDetails = requestData.owner_details || {};
  
  // Existing owners
  const existingOwners = requestData.existing_owners || [];
  
  // Regular fields (exclude documents, complex objects, and IDs)
  const regularEntries = Object.entries(requestData).filter(
    ([key]) => !documentFieldNames.includes(key) && 
               !key.toLowerCase().includes('document') &&
               !key.includes('owner_details') &&
               !key.includes('parcel_details') &&
               !key.includes('existing_owners') &&
               !key.includes('owner_id') &&
               !key.includes('last_document_update') &&
               typeof requestData[key] !== 'object'
  );
  
  const documentEntries = Object.entries(requestData).filter(
    ([key]) => documentFieldNames.includes(key) || key.toLowerCase().includes('document')
  );

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
    
    if (key.toLowerCase().includes('date') && value) {
      return formatDate(value);
    }
    
    if (key.toLowerCase().includes('area') || key.toLowerCase().includes('size')) {
      return `${value} m²`;
    }
    
    return String(value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Add Owner to Parcel</h3>
      
      {/* Parcel Information */}
      {Object.keys(parcelInfo).length > 0 && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-gray-600">🏢</span>
            Parcel Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(parcelInfo).map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-md border border-gray-100">
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

      {/* New Owner Information */}
      {Object.keys(newOwnerDetails).length > 0 && (
        <div className="bg-green-50 p-5 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-green-800 bg-green-100 px-3 py-1 rounded-full">
              NEW OWNER
            </span>
            {requestData.is_first_owner !== undefined && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                requestData.is_first_owner 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {requestData.is_first_owner ? 'First Owner' : 'Additional Owner'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(newOwnerDetails).map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-md border border-green-100">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  {key.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm font-medium text-gray-900 break-words">
                  {String(value || 'N/A')}
                </div>
              </div>
            ))}
          </div>
          {requestData.acquired_at && (
            <div className="mt-3 bg-white p-3 rounded-md border border-green-100">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                ACQUISITION DATE
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(requestData.acquired_at)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Owners */}
      {existingOwners.length > 0 && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-gray-600">👥</span>
            Existing Owners ({existingOwners.length})
          </h4>
          <div className="space-y-3">
            {existingOwners.map((owner, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(owner).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                        {key.replace(/_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {key.toLowerCase().includes('date') && value
                          ? formatDate(value as string)
                          : String(value || 'N/A')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Transfer Details */}
      {regularEntries.length > 0 && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularEntries.map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-md border border-gray-100">
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
        <DocumentList documents={[]} title="Ownership Documents" />
      )}
    </div>
  );
};

const renderSubdivide = () => {
  // Extract data from request_data
  const requestData = data.request_data || data;
  
  if (!requestData) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
        No subdivision data available
      </div>
    );
  }

  const { 
    parent_details,
    childParcels = [],
    parcel_documents = {},
    validation = {}
  } = requestData;

  // Format area helper
  const formatArea = (area: number) => `${area.toFixed(2)} m²`;

  // Calculate total child area
  const totalChildArea = childParcels.reduce((sum: number, child: any) => 
    sum + Number(child.total_area_m2 || 0), 0
  );

  // Calculate area difference
  const parentArea = parent_details?.total_area_m2 || 0;
  const areaDifference = Math.abs(parentArea - totalChildArea);
  const areaMatch = areaDifference <= 0.1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-blue-600">🗺️</span>
          Parcel Subdivision Request
        </h3>
        <p className="text-blue-700 mt-2">
          Subdividing parcel into {childParcels.length} child {childParcels.length === 1 ? 'parcel' : 'parcels'}
        </p>
      </div>

      {/* Parent Parcel Information */}
      {parent_details && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-gray-600">🏞️</span>
            Parent Parcel Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                UPIN
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {parent_details.upin || entityId}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                File Number
              </div>
              <div className="text-base font-medium text-gray-900">
                {parent_details.file_number || 'N/A'}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Tenure Type
              </div>
              <div className="text-base font-medium text-gray-900">
                {parent_details.tenure_type || 'N/A'}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Owners Count
              </div>
              <div className="text-base font-medium text-gray-900">
                {parent_details.owners_count || 0} {parent_details.owners_count === 1 ? 'Owner' : 'Owners'}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Total Area
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatArea(parent_details.total_area_m2 || 0)}
              </div>
            </div>
          </div>

          {/* Parent Documents */}
          {parcel_documents[parent_details.upin]?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <DocumentList
                documents={parcel_documents[parent_details.upin]}
                title="Parent Parcel Documents"
                variant="compact"
                showUploadInfo={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Area Distribution Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-5 rounded-lg border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-green-700 mb-1 font-medium uppercase tracking-wider">
                Parent Area
              </div>
              <div className="text-2xl font-bold text-green-800">
                {formatArea(parentArea)}
              </div>
            </div>
            <span className="text-2xl text-green-600">🏞️</span>
          </div>
        </div>
        
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-blue-700 mb-1 font-medium uppercase tracking-wider">
                Total Child Area
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {formatArea(totalChildArea)}
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Across {childParcels.length} {childParcels.length === 1 ? 'parcel' : 'parcels'}
              </div>
            </div>
            <span className="text-2xl text-blue-600">🧩</span>
          </div>
        </div>
        
        <div className={`p-5 rounded-lg border ${
          areaMatch 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className={`text-xs mb-1 font-medium uppercase tracking-wider ${
                areaMatch ? 'text-green-700' : 'text-yellow-700'
              }`}>
                Area Balance
              </div>
              <div className={`text-2xl font-bold ${
                areaMatch ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {formatArea(areaDifference)}
              </div>
              <div className={`text-xs mt-2 ${
                areaMatch ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {areaMatch ? '✓ Areas match' : '⚠ Area mismatch'}
              </div>
            </div>
            <span className={`text-2xl ${
              areaMatch ? 'text-green-600' : 'text-yellow-600'
            }`}>⚖️</span>
          </div>
        </div>
      </div>

      {/* Child Parcels */}
      {childParcels.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-orange-500">🧩</span>
              Child Parcels ({childParcels.length})
            </h4>
            <div className="text-sm text-gray-600">
              Average area: {formatArea(totalChildArea / childParcels.length)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {childParcels.map((child: any, index: number) => {
              const childDocuments = parcel_documents[child.upin] || [];
              
              return (
                <div 
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Child Header */}
                  <div className="bg-gradient-to-r from-orange-50 to-white p-5 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900">
                            Child Parcel #{index + 1}
                          </div>
                          <div className="text-sm text-gray-600 font-mono">
                            {child.upin}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatArea(child.total_area_m2 || 0)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {((child.total_area_m2 || 0) / parentArea * 100).toFixed(1)}% of parent
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Child Details */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                          File Number
                        </div>
                        <div className="font-medium text-gray-900">
                          {child.file_number || 'N/A'}
                        </div>
                      </div>
                      {child.land_use && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                            Land Use
                          </div>
                          <div className="font-medium text-gray-700">
                            {child.land_use.replace(/_/g, ' ')}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {child.land_grade && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                          Land Grade
                        </div>
                        <div className="text-gray-700">{child.land_grade}</div>
                      </div>
                    )}
                    
                    {child.tenure_type && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                          Tenure Type
                        </div>
                        <div className="text-gray-700">{child.tenure_type}</div>
                      </div>
                    )}
                    
                    {/* Boundaries Section */}
                    {(child.boundary_north || child.boundary_south || child.boundary_east || child.boundary_west) && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-gray-500">📍</span>
                          Boundaries
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {child.boundary_north && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div>
                                <div className="text-xs text-gray-500">North</div>
                                <div className="text-sm truncate max-w-[150px]" title={child.boundary_north}>
                                  {child.boundary_north}
                                </div>
                              </div>
                            </div>
                          )}
                          {child.boundary_south && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div>
                                <div className="text-xs text-gray-500">South</div>
                                <div className="text-sm truncate max-w-[150px]" title={child.boundary_south}>
                                  {child.boundary_south}
                                </div>
                              </div>
                            </div>
                          )}
                          {child.boundary_east && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <div className="text-xs text-gray-500">East</div>
                                <div className="text-sm truncate max-w-[150px]" title={child.boundary_east}>
                                  {child.boundary_east}
                                </div>
                              </div>
                            </div>
                          )}
                          {child.boundary_west && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <div>
                                <div className="text-xs text-gray-500">West</div>
                                <div className="text-sm truncate max-w-[150px]" title={child.boundary_west}>
                                  {child.boundary_west}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Child Parcel Documents */}
                    {childDocuments.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <DocumentList
                          documents={childDocuments}
                          title={`Documents for ${child.upin}`}
                          variant="compact"
                          showUploadInfo={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Documents Section */}
      {requestData.documents && requestData.documents.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <DocumentList
            documents={requestData.documents}
            title="All Subdivision Documents"
            variant="compact"
            showUploadInfo={true}
          />
        </div>
      )}
    </div>
  );
};

  const renderDelete = () => (
    <div>
      <h3>Delete Parcel</h3>
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>UPIN:</strong> {entityId}
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
              Parcel Information:
            </div>
            {Object.entries(data.current_data).slice(0, 4).map(([key, value]) => (
              <div key={key} style={{ fontSize: '0.9rem' }}>
                {key.replace(/_/g, ' ')}: {String(value)}
              </div>
            ))}
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
    case 'TRANSFER':
      return renderTransfer();
    case 'ADD_OWNER':
      return renderAddOwner();
    case 'SUBDIVIDE':
      return renderSubdivide();
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

export default ParcelRequestDetail;
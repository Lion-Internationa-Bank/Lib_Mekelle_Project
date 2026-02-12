// src/components/request-details/WizardRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DocumentList from '../common/DocumentList';

const VITE_API_PDF_URL = import.meta.env.VITE_API_PDF_URL || import.meta.env.VITE_API_URL || '';

interface WizardRequestDetailProps {
  data: any;
  actionType: ActionType;
}

const WizardRequestDetail: React.FC<WizardRequestDetailProps> = ({ data, actionType }) => {
  // Extract data from request_data
  const requestData = data.request_data || data;
  
  if (actionType !== 'CREATE') {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800">
        Invalid action type for wizard session: {actionType}
      </div>
    );
  }

  const { 
    parcel, 
    owners = [], 
    lease, 
    parcel_docs = [], 
    owner_docs = [], 
    lease_docs = [] 
  } = requestData;

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

  const formatCurrency = (value: number): string => {
    return `$${Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatArea = (area: number): string => {
    return `${area.toFixed(2)} m²`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-blue-600">✨</span>
          New Land Registration Wizard
        </h2>
        <p className="text-blue-700 mt-2">
          Complete land registration with parcel, owner, and lease information
        </p>
      </div>
      
      {/* Parcel Information */}
      {parcel && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <span className="text-green-600">🏞️</span>
            Parcel Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Key parcel identifiers - emphasized */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 col-span-1 md:col-span-2 lg:col-span-1">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                UPIN
              </div>
              <div className="text-xl font-bold text-gray-900">
                {parcel.upin || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                File Number
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {parcel.file_number || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Total Area
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatArea(parcel.total_area_m2 || 0)}
              </div>
            </div>
            
            {/* Other parcel details */}
            {[
              { label: 'Tabia', value: parcel.tabia },
              { label: 'Ketena', value: parcel.ketena },
              { label: 'Block', value: parcel.block },
              { label: 'Land Use', value: parcel.land_use?.replace(/_/g, ' ') },
              { label: 'Land Grade', value: parcel.land_grade },
              { label: 'Tenure Type', value: parcel.tenure_type?.replace(/_/g, ' ') }
            ].map((item, index) => (
              item.value && (
                <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-gray-900 break-words">
                    {item.value}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Boundaries Section */}
          {(parcel.boundary_north || parcel.boundary_south || parcel.boundary_east || parcel.boundary_west) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-gray-500">📍</span>
                Boundaries
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {parcel.boundary_north && (
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-xs text-gray-500 block">North</span>
                    <span className="text-sm font-medium">{parcel.boundary_north}</span>
                  </div>
                )}
                {parcel.boundary_south && (
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-xs text-gray-500 block">South</span>
                    <span className="text-sm font-medium">{parcel.boundary_south}</span>
                  </div>
                )}
                {parcel.boundary_east && (
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-xs text-gray-500 block">East</span>
                    <span className="text-sm font-medium">{parcel.boundary_east}</span>
                  </div>
                )}
                {parcel.boundary_west && (
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-xs text-gray-500 block">West</span>
                    <span className="text-sm font-medium">{parcel.boundary_west}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Owners Information */}
      {owners.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-purple-600">👥</span>
            Owners ({owners.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {owners.map((owner: any, index: number) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {owner.full_name?.charAt(0) || 'O'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      {owner.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Owner #{index + 1}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {owner.acquired_at ? formatDate(owner.acquired_at) : 'New Owner'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                      National ID
                    </div>
                    <div className="text-base font-semibold text-gray-900 font-mono">
                      {owner.national_id || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                      TIN Number
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {owner.tin_number || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                      Phone Number
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {owner.phone_number || 'N/A'}
                    </div>
                  </div>
                  {owner.acquired_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                        Acquisition Date
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(owner.acquired_at)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lease Information */}
      {lease && Object.keys(lease).length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <span className="text-amber-600">📄</span>
            Lease Agreement
          </h3>
          
          {/* Lease Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-lg border border-amber-200">
              <div className="text-xs text-amber-700 mb-1 font-medium uppercase tracking-wider">
                Lease Period
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {lease.lease_period_years || 0} Years
              </div>
              {lease.payment_term_years && (
                <div className="text-xs text-gray-600 mt-2">
                  Payment term: {lease.payment_term_years} years
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-200">
              <div className="text-xs text-green-700 mb-1 font-medium uppercase tracking-wider">
                Total Amount
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(lease.total_lease_amount || 0)}
              </div>
              {lease.price_per_m2 && (
                <div className="text-xs text-gray-600 mt-2">
                  Price per m²: {formatCurrency(lease.price_per_m2)}
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 mb-1 font-medium uppercase tracking-wider">
                Down Payment
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(lease.down_payment_amount || 0)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-700 mb-1 font-medium uppercase tracking-wider">
                Other Payment
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(lease.other_payment || 0)}
              </div>
            </div>
          </div>

          {/* Lease Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {lease.contract_date && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  Contract Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(lease.contract_date)}
                </div>
              </div>
            )}
            {lease.start_date && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                  Start Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(lease.start_date)}
                </div>
              </div>
            )}
          </div>

          {/* Legal Framework */}
          {lease.legal_framework && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                Legal Framework
              </div>
              <div className="text-sm text-gray-900">
                {lease.legal_framework}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-blue-600">📎</span>
          Documents
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Parcel Documents */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl text-green-600">🏞️</span>
              <h4 className="text-md font-semibold text-gray-800">
                Parcel Documents
              </h4>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                {parcel_docs?.length || 0}
              </span>
            </div>
            {parcel_docs?.length > 0 ? (
              <DocumentList
                documents={parcel_docs}
                variant="compact"
                showUploadInfo={true}
                emptyMessage="No parcel documents"
              />
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-3xl mb-2 block">📄</span>
                <p className="text-sm text-gray-500">No parcel documents</p>
              </div>
            )}
          </div>
          
          {/* Owner Documents */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl text-purple-600">👤</span>
              <h4 className="text-md font-semibold text-gray-800">
                Owner Documents
              </h4>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                {owner_docs?.length || 0}
              </span>
            </div>
            {owner_docs?.length > 0 ? (
              <DocumentList
                documents={owner_docs}
                variant="compact"
                showUploadInfo={true}
                emptyMessage="No owner documents"
              />
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-3xl mb-2 block">🆔</span>
                <p className="text-sm text-gray-500">No owner documents</p>
              </div>
            )}
          </div>
          
          {/* Lease Documents */}
          {lease_docs && lease_docs.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl text-amber-600">📋</span>
                <h4 className="text-md font-semibold text-gray-800">
                  Lease Documents
                </h4>
                <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                  {lease_docs.length}
                </span>
              </div>
              <DocumentList
                documents={lease_docs}
                variant="compact"
                showUploadInfo={true}
                emptyMessage="No lease documents"
              />
            </div>
          )}
        </div>

        {/* Overall Documents */}
        {requestData.documents && requestData.documents.length > 0 && (
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl text-gray-600">📎</span>
              <h4 className="text-md font-semibold text-gray-800">
                All Documents
              </h4>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                {requestData.documents.length}
              </span>
            </div>
            <DocumentList
              documents={requestData.documents}
              variant="compact"
              showUploadInfo={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WizardRequestDetail;
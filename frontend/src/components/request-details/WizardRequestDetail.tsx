// src/components/request-details/WizardRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DocumentList from '../common/DocumentList';
import DateDisplay from '../common/DateDisplay';

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
      <div className="p-4 bg-[#f0cd6e]/20 rounded-lg border border-[#f0cd6e] text-[#2a2718]">
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

  // Remove old formatDate function - we'll use DateDisplay instead

  const formatCurrency = (value: number): string => {
    return `ETB ${Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatArea = (area: number): string => {
    return `${area.toFixed(2)} m²`;
  };

  // Helper function to check if a field is a date field
  const isDateField = (key: string): boolean => {
    const dateKeywords = [
      'date', 'acquired_at', 'created_at', 'updated_at', 
      'contract_date', 'start_date', 'expiry_date', 'effective_date'
    ];
    return dateKeywords.some(keyword => key.toLowerCase().includes(keyword));
  };

  // Render value with appropriate formatting
  const renderValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) return 'N/A';
    
    // Handle date fields
    if (isDateField(key) && value) {
      return (
        <DateDisplay 
          date={value}
          format="medium"
          showCalendarIndicator={true}
          showTooltip={true}
        />
      );
    }
    
    // Handle other types
    return String(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#f0cd6e]/10 p-6 rounded-lg border border-[#f0cd6e]">
        <h2 className="text-xl font-semibold text-[#2a2718] flex items-center gap-2">
          <span className="text-[#2a2718]">✨</span>
          New Land Registration Wizard
        </h2>
        <p className="text-[#2a2718]/70 mt-2">
          Complete land registration with parcel, owner, and lease information
        </p>
      </div>
      
      {/* Parcel Information */}
      {parcel && (
        <div className="bg-white p-6 rounded-lg border border-[#f0cd6e] shadow-sm">
          <h3 className="text-lg font-semibold text-[#2a2718] flex items-center gap-2 mb-4">
            <span className="text-[#2a2718]">🏞️</span>
            Parcel Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Key parcel identifiers - emphasized */}
            <div className="bg-gradient-to-r from-[#f0cd6e]/5 to-white p-4 rounded-lg border border-[#f0cd6e] col-span-1 md:col-span-2 lg:col-span-1">
              <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                UPIN
              </div>
              <div className="text-xl font-bold text-[#2a2718]">
                {parcel.upin || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#f0cd6e]/5 to-white p-4 rounded-lg border border-[#f0cd6e]">
              <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                File Number
              </div>
              <div className="text-lg font-semibold text-[#2a2718]">
                {parcel.file_number || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#f0cd6e]/5 to-white p-4 rounded-lg border border-[#f0cd6e]">
              <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                Total Area
              </div>
              <div className="text-lg font-semibold text-[#2a2718]">
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
                <div key={index} className="bg-[#f0cd6e]/5 p-3 rounded-md border border-[#f0cd6e]">
                  <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-[#2a2718] break-words">
                    {item.value}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Boundaries Section */}
          {(parcel.boundary_north || parcel.boundary_south || parcel.boundary_east || parcel.boundary_west) && (
            <div className="mt-6 pt-4 border-t border-[#f0cd6e]">
              <h4 className="text-sm font-semibold text-[#2a2718] mb-3 flex items-center gap-2">
                <span className="text-[#2a2718]/70">📍</span>
                Boundaries
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {parcel.boundary_north && (
                  <div className="bg-[#f0cd6e]/5 p-2 rounded border border-[#f0cd6e]">
                    <span className="text-xs text-[#2a2718]/70 block">North</span>
                    <span className="text-sm font-medium text-[#2a2718]">{parcel.boundary_north}</span>
                  </div>
                )}
                {parcel.boundary_south && (
                  <div className="bg-[#f0cd6e]/5 p-2 rounded border border-[#f0cd6e]">
                    <span className="text-xs text-[#2a2718]/70 block">South</span>
                    <span className="text-sm font-medium text-[#2a2718]">{parcel.boundary_south}</span>
                  </div>
                )}
                {parcel.boundary_east && (
                  <div className="bg-[#f0cd6e]/5 p-2 rounded border border-[#f0cd6e]">
                    <span className="text-xs text-[#2a2718]/70 block">East</span>
                    <span className="text-sm font-medium text-[#2a2718]">{parcel.boundary_east}</span>
                  </div>
                )}
                {parcel.boundary_west && (
                  <div className="bg-[#f0cd6e]/5 p-2 rounded border border-[#f0cd6e]">
                    <span className="text-xs text-[#2a2718]/70 block">West</span>
                    <span className="text-sm font-medium text-[#2a2718]">{parcel.boundary_west}</span>
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
          <h3 className="text-lg font-semibold text-[#2a2718] flex items-center gap-2">
            <span className="text-[#2a2718]">👥</span>
            Owners ({owners.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {owners.map((owner: any, index: number) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg border border-[#f0cd6e] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#f0cd6e]">
                  <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-[#f0cd6e] to-[#2a2718] text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {owner.full_name?.charAt(0) || 'O'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-[#2a2718]">
                      {owner.full_name}
                    </div>
                    <div className="text-sm text-[#2a2718]/70">
                      Owner #{index + 1}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#f0cd6e]/20 text-[#2a2718] text-xs font-semibold rounded-full border border-[#f0cd6e]">
                    {owner.acquired_at ? (
                      <DateDisplay 
                        date={owner.acquired_at}
                        format="short"
                        showCalendarIndicator={false}
                        showTooltip={false}
                      />
                    ) : (
                      'New Owner'
                    )}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                      National ID
                    </div>
                    <div className="text-base font-semibold text-[#2a2718] font-mono">
                      {owner.national_id || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                      TIN Number
                    </div>
                    <div className="text-sm font-medium text-[#2a2718]">
                      {owner.tin_number || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                      Phone Number
                    </div>
                    <div className="text-sm font-medium text-[#2a2718]">
                      {owner.phone_number || 'N/A'}
                    </div>
                  </div>
                  {owner.acquired_at && (
                    <div>
                      <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                        Acquisition Date
                      </div>
                      <div className="text-sm font-medium text-[#2a2718]">
                        <DateDisplay 
                          date={owner.acquired_at}
                          format="medium"
                          showCalendarIndicator={true}
                          showTooltip={true}
                        />
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
  <div className="bg-white p-6 rounded-lg border border-[#f0cd6e] shadow-sm">
    <h3 className="text-lg font-semibold text-[#2a2718] flex items-center gap-2 mb-4">
      <span className="text-[#2a2718]">📄</span>
      Lease Agreement
    </h3>
    
    {/* Lease Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-[#f0cd6e]/10 to-white p-4 rounded-lg border border-[#f0cd6e]">
        <div className="text-xs text-[#2a2718] mb-1 font-medium uppercase tracking-wider">
          Lease Period
        </div>
        <div className="text-2xl font-bold text-[#2a2718]">
          {lease.lease_period_years || 0} Years
        </div>
        {lease.payment_term_years && (
          <div className="text-xs text-[#2a2718]/70 mt-2">
            Payment term: {lease.payment_term_years} years
          </div>
        )}
      </div>
      
      <div className="bg-gradient-to-br from-[#f0cd6e]/10 to-white p-4 rounded-lg border border-[#f0cd6e]">
        <div className="text-xs text-[#2a2718] mb-1 font-medium uppercase tracking-wider">
          Total Amount
        </div>
        <div className="text-2xl font-bold text-[#2a2718]">
          {formatCurrency(lease.total_lease_amount || 0)}
        </div>
        {lease.price_per_m2 && (
          <div className="text-xs text-[#2a2718]/70 mt-2">
            Price per m²: {formatCurrency(lease.price_per_m2)}
          </div>
        )}
      </div>
      
      <div className="bg-gradient-to-br from-[#f0cd6e]/10 to-white p-4 rounded-lg border border-[#f0cd6e]">
        <div className="text-xs text-[#2a2718] mb-1 font-medium uppercase tracking-wider">
          Down Payment
        </div>
        <div className="text-2xl font-bold text-[#2a2718]">
          {formatCurrency(lease.down_payment_amount || 0)}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-[#f0cd6e]/10 to-white p-4 rounded-lg border border-[#f0cd6e]">
        <div className="text-xs text-[#2a2718] mb-1 font-medium uppercase tracking-wider">
          Other Payment
        </div>
        <div className="text-2xl font-bold text-[#2a2718]">
          {formatCurrency(lease.other_payment || 0)}
        </div>
      </div>
    </div>

    {/* Additional Fees Section */}
    {(lease.demarcation_fee || lease.contract_registration_fee || lease.engineering_service_fee) && (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-[#2a2718] flex items-center gap-2 mb-3">
          <span className="text-[#2a2718]">💰</span>
          Additional Fees
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lease.demarcation_fee !== undefined && lease.demarcation_fee !== null && (
            <div className="bg-[#f0cd6e]/10 p-4 rounded-lg border border-[#f0cd6e]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#2a2718] text-lg">📏</span>
                <div className="text-xs text-[#2a2718] font-medium uppercase tracking-wider">
                  Demarcation Fee
                </div>
              </div>
              <div className="text-xl font-bold text-[#2a2718]">
                {formatCurrency(Number(lease.demarcation_fee))}
              </div>
            </div>
          )}
          
          {lease.engineering_service_fee !== undefined && lease.engineering_service_fee !== null && (
            <div className="bg-[#f0cd6e]/10 p-4 rounded-lg border border-[#f0cd6e]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#2a2718] text-lg">🔧</span>
                <div className="text-xs text-[#2a2718] font-medium uppercase tracking-wider">
                  Engineering Service Fee
                </div>
              </div>
              <div className="text-xl font-bold text-[#2a2718]">
                {formatCurrency(Number(lease.engineering_service_fee))}
              </div>
            </div>
          )}
          
          {lease.contract_registration_fee !== undefined && lease.contract_registration_fee !== null && (
            <div className="bg-[#f0cd6e]/10 p-4 rounded-lg border border-[#f0cd6e]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#2a2718] text-lg">📝</span>
                <div className="text-xs text-[#2a2718] font-medium uppercase tracking-wider">
                  Contract Registration
                </div>
              </div>
              <div className="text-xl font-bold text-[#2a2718]">
                {/* Handle both string and number cases */}
                {typeof lease.contract_registration_fee === 'string' 
                  ? lease.contract_registration_fee 
                  : formatCurrency(Number(lease.contract_registration_fee))}
              </div>
              <div className="text-xs text-[#2a2718]/70 mt-1">
                Reference/Receipt
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Lease Dates - Updated with DateDisplay */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {lease.contract_date && (
        <div className="bg-[#f0cd6e]/5 p-3 rounded-md border border-[#f0cd6e]">
          <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
            Contract Date
          </div>
          <div className="text-base font-semibold text-[#2a2718]">
            <DateDisplay 
              date={lease.contract_date}
              format="medium"
              showCalendarIndicator={true}
              showTooltip={true}
            />
          </div>
        </div>
      )}
      {lease.start_date && (
        <div className="bg-[#f0cd6e]/5 p-3 rounded-md border border-[#f0cd6e]">
          <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
            Start Date
          </div>
          <div className="text-base font-semibold text-[#2a2718]">
            <DateDisplay 
              date={lease.start_date}
              format="medium"
              showCalendarIndicator={true}
              showTooltip={true}
            />
          </div>
        </div>
      )}
      {lease.expiry_date && (
        <div className="bg-[#f0cd6e]/5 p-3 rounded-md border border-[#f0cd6e]">
          <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
            Expiry Date
          </div>
          <div className="text-base font-semibold text-[#2a2718]">
            <DateDisplay 
              date={lease.expiry_date}
              format="medium"
              showCalendarIndicator={true}
              showTooltip={true}
            />
          </div>
        </div>
      )}
    </div>

    {/* Legal Framework */}
    {lease.legal_framework && (
      <div className="mt-4 p-4 bg-[#f0cd6e]/5 rounded-md border border-[#f0cd6e]">
        <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
          Legal Framework
        </div>
        <div className="text-sm text-[#2a2718]">
          {lease.legal_framework}
        </div>
      </div>
    )}

    {/* Annual Installment Info (if available) */}
    {lease.annual_installment && (
      <div className="mt-4 p-4 bg-[#f0cd6e]/10 rounded-md border border-[#f0cd6e]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#2a2718] mb-1 font-medium uppercase tracking-wider">
              Annual Installment
            </div>
            <div className="text-xl font-bold text-[#2a2718]">
              {formatCurrency(lease.annual_installment)}
            </div>
          </div>
          {lease.annual_lease_fee && (
            <div className="text-right">
              <div className="text-xs text-[#2a2718]/70 mb-1">Annual Lease Fee</div>
              <div className="text-lg font-semibold text-[#2a2718]/80">
                {formatCurrency(lease.annual_lease_fee)}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)}

      {/* Documents Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#2a2718] flex items-center gap-2">
          <span className="text-[#2a2718]">📎</span>
          Documents
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Parcel Documents */}
          <div className="bg-white p-5 rounded-lg border border-[#f0cd6e] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl text-[#2a2718]">🏞️</span>
              <h4 className="text-md font-semibold text-[#2a2718]">
                Parcel Documents
              </h4>
              <span className="ml-auto bg-[#f0cd6e]/20 text-[#2a2718] px-2 py-1 rounded-full text-xs font-semibold border border-[#f0cd6e]">
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
              <div className="p-8 text-center bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e]">
                <span className="text-3xl mb-2 block">📄</span>
                <p className="text-sm text-[#2a2718]/70">No parcel documents</p>
              </div>
            )}
          </div>
          
          {/* Owner Documents */}
          <div className="bg-white p-5 rounded-lg border border-[#f0cd6e] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl text-[#2a2718]">👤</span>
              <h4 className="text-md font-semibold text-[#2a2718]">
                Owner Documents
              </h4>
              <span className="ml-auto bg-[#f0cd6e]/20 text-[#2a2718] px-2 py-1 rounded-full text-xs font-semibold border border-[#f0cd6e]">
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
              <div className="p-8 text-center bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e]">
                <span className="text-3xl mb-2 block">🆔</span>
                <p className="text-sm text-[#2a2718]/70">No owner documents</p>
              </div>
            )}
          </div>
          
          {/* Lease Documents */}
          {lease_docs && lease_docs.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-[#f0cd6e] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl text-[#2a2718]">📋</span>
                <h4 className="text-md font-semibold text-[#2a2718]">
                  Lease Documents
                </h4>
                <span className="ml-auto bg-[#f0cd6e]/20 text-[#2a2718] px-2 py-1 rounded-full text-xs font-semibold border border-[#f0cd6e]">
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
          <div className="bg-white p-5 rounded-lg border border-[#f0cd6e] shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl text-[#2a2718]">📎</span>
              <h4 className="text-md font-semibold text-[#2a2718]">
                All Documents
              </h4>
              <span className="ml-auto bg-[#f0cd6e]/20 text-[#2a2718] px-2 py-1 rounded-full text-xs font-semibold border border-[#f0cd6e]">
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
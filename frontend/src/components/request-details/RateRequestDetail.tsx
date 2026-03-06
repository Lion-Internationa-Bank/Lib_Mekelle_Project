// src/components/request-details/RateRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DateDisplay from '../common/DateDisplay';

interface RateRequestDetailProps {
  data: any;  // This is request_data from the approval request
  actionType: ActionType;
  entityId: string;
}

const RateRequestDetail: React.FC<RateRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  // Format rate type for display
  const formatRateType = (type: string): string => {
    return type.replace(/_/g, ' ')
               .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format percentage value
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const renderCreate = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#2a2718]">New Rate Configuration</h3>
        
        {/* Rate Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Rate Type */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Rate Type
            </div>
            <div className="text-base font-semibold">
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {formatRateType(data.rate_type)}
              </span>
            </div>
          </div>

          {/* Value/Percentage */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Rate Value
            </div>
            <div className="text-base font-semibold text-[#2a2718]">
              {formatPercentage(data.value)}
            </div>
          </div>

          {/* Source */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Source
            </div>
            <div className="text-base font-semibold text-[#2a2718] break-words">
              {data.source || '-'}
            </div>
          </div>

          {/* Effective From */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Effective From
            </div>
            <div className="text-base font-semibold text-[#2a2718]">
              <DateDisplay 
                date={data.effective_from}
                format="medium"
                showCalendarIndicator={true}
                showTooltip={true}
              />
            </div>
          </div>

          {/* Effective Until */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Effective Until
            </div>
            <div className="text-base font-semibold text-[#2a2718]">
              {data.effective_until ? (
                <DateDisplay 
                  date={data.effective_until}
                  format="medium"
                  showCalendarIndicator={true}
                  showTooltip={true}
                />
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Status
            </div>
            <div className="text-base font-semibold">
              <span className={`px-3 py-1 rounded-full text-sm ${
                data.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {data.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderUpdate = () => {
    const { previous_values } = data;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#2a2718]">Update Rate Configuration</h3>
        
        {/* Current Rate Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-[#2a2718] mb-3">Current Rate Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e]">
            {/* Rate Type */}
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Rate Type</div>
              <div className="font-semibold">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {formatRateType(data.rate_type)}
                </span>
              </div>
            </div>

            {/* Current Value */}
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Current Value</div>
              <div className="font-semibold text-[#2a2718]">
                {previous_values ? formatPercentage(previous_values.value) : '-'}
              </div>
            </div>

            {/* New Value */}
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">New Value</div>
              <div className="font-semibold text-green-600">
                {formatPercentage(data.value)}
              </div>
            </div>

            {/* Current Source */}
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Current Source</div>
              <div className="font-semibold text-[#2a2718]">
                {previous_values?.source || '-'}
              </div>
            </div>

            {/* New Source */}
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">New Source</div>
              <div className="font-semibold text-green-600">
                {data.source || '-'}
              </div>
            </div>

            {/* Current Effective Until */}
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Current Effective Until</div>
              <div className="font-semibold text-[#2a2718]">
                {previous_values?.effective_until ? (
                  <DateDisplay 
                    date={previous_values.effective_until}
                    format="medium"
                    showCalendarIndicator={true}
                    showTooltip={true}
                  />
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
            </div>

            {/* New Effective Until */}
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">New Effective Until</div>
              <div className="font-semibold text-green-600">
                {data.effective_until ? (
                  <DateDisplay 
                    date={data.effective_until}
                    format="medium"
                    showCalendarIndicator={true}
                    showTooltip={true}
                  />
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Changes Summary */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Proposed Changes</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            {previous_values?.value !== data.value && (
              <li>• Rate value: {formatPercentage(previous_values?.value)} → {formatPercentage(data.value)}</li>
            )}
            {previous_values?.source !== data.source && (
              <li>• Source: {previous_values?.source || 'N/A'} → {data.source || 'N/A'}</li>
            )}
            {previous_values?.effective_until !== data.effective_until && (
              <li>• Effective until: {
                previous_values?.effective_until ? 
                  new Date(previous_values.effective_until).toLocaleDateString() : 
                  'Indefinite'
              } → {
                data.effective_until ? 
                  new Date(data.effective_until).toLocaleDateString() : 
                  'Indefinite'
              }</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const renderDelete = () => (
    <div>
      <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Deactivate Rate</h3>
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <div className="mb-4">
          <strong className="text-[#2a2718]">Rate ID:</strong> {entityId}
        </div>
        
        {/* Rate Information */}
        <div className="mb-4 p-4 bg-white/50 rounded-lg">
          <div className="font-semibold text-[#2a2718] mb-3">
            Rate Information:
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Rate Type</div>
              <div>
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {formatRateType(data.rate_type)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Value</div>
              <div className="font-semibold text-[#2a2718]">{formatPercentage(data.value)}</div>
            </div>
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Effective From</div>
              <div className="font-semibold text-[#2a2718]">
                <DateDisplay 
                  date={data.effective_from}
                  format="medium"
                  showCalendarIndicator={true}
                  showTooltip={true}
                />
              </div>
            </div>
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Effective Until</div>
              <div className="font-semibold text-[#2a2718]">
                {data.effective_until ? (
                  <DateDisplay 
                    date={data.effective_until}
                    format="medium"
                    showCalendarIndicator={true}
                    showTooltip={true}
                  />
                ) : (
                  <span className="text-gray-500">Indefinite</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Reason for Deactivation */}
        {data.reason && (
          <div className="mt-4">
            <strong className="text-[#2a2718]">Reason for Deactivation:</strong> {data.reason}
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

export default RateRequestDetail;
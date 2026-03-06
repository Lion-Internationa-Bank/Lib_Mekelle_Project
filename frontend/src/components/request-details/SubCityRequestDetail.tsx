// src/components/request-details/SubCityRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';


interface SubCityRequestDetailProps {
  data: any;  // This is request_data from the approval request
  actionType: ActionType;
  entityId: string;
}

const SubCityRequestDetail: React.FC<SubCityRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  const renderCreate = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#2a2718]">New Sub-City Registration</h3>
        
        {/* Sub-City Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Sub-City Name
            </div>
            <div className="text-base font-semibold text-[#2a2718]">
              {data.name}
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Description
            </div>
            <div className="text-base font-semibold text-[#2a2718] break-words">
              {data.description || <span className="text-gray-500 italic">No description provided</span>}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">New sub-city will be created with default settings</span>
          </div>
        </div>
      </div>
    );
  };

  const renderUpdate = () => {
    const { previous_values } = data;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#2a2718]">Update Sub-City Information</h3>
        
        {/* Current vs New Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Values */}
          <div>
            <h4 className="text-sm font-medium text-[#2a2718] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Current Values
            </h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Name</div>
                <div className="font-semibold text-gray-700">
                  {previous_values?.name}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <div className="font-semibold text-gray-700">
                  {previous_values?.description || <span className="text-gray-400 italic">No description</span>}
                </div>
              </div>
            </div>
          </div>

          {/* New Values */}
          <div>
            <h4 className="text-sm font-medium text-[#2a2718] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Proposed Changes
            </h4>
            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 mb-1">Name</div>
                <div className="font-semibold text-green-700">
                  {data.name}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 mb-1">Description</div>
                <div className="font-semibold text-green-700">
                  {data.description || <span className="text-green-400 italic">No description</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Changes Summary */}
        {(previous_values?.name !== data.name || previous_values?.description !== data.description) && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Summary of Changes</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              {previous_values?.name !== data.name && (
                <li>• Name: {previous_values?.name} → {data.name}</li>
              )}
              {previous_values?.description !== data.description && (
                <li>• Description: {previous_values?.description || 'None'} → {data.description || 'None'}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderDelete = () => (
    <div>
      <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Delete Sub-City</h3>
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <div className="mb-4">
          <strong className="text-[#2a2718]">Sub-City ID:</strong> {entityId}
        </div>
        
        {/* Sub-City Information */}
        <div className="mb-4 p-4 bg-white/50 rounded-lg">
          <div className="font-semibold text-[#2a2718] mb-3">
            Sub-City Information:
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Name</div>
              <div className="font-semibold text-[#2a2718]">{data.name}</div>
            </div>
            <div>
              <div className="text-xs text-[#2a2718]/70 mb-1">Description</div>
              <div className="font-semibold text-[#2a2718]">
                {data.description || <span className="text-gray-500 italic">No description</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Dependencies Warning */}
        {data.dependencies && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold">Dependencies Warning</span>
            </div>
            <div className="space-y-2 text-sm text-yellow-700">
              {data.dependencies.active_users > 0 && (
                <div>• {data.dependencies.active_users} active user(s) in this sub-city</div>
              )}
              {data.dependencies.land_parcels > 0 && (
                <div>• {data.dependencies.land_parcels} land parcel(s) in this sub-city</div>
              )}
              {data.dependencies.pending_approvals > 0 && (
                <div>• {data.dependencies.pending_approvals} pending approval request(s) for this sub-city</div>
              )}
              {Object.values(data.dependencies).every((v: any) => v === 0) && (
                <div>No active dependencies found</div>
              )}
            </div>
          </div>
        )}
        
        {/* Reason for Deletion */}
        {data.reason && (
          <div className="mt-4">
            <strong className="text-[#2a2718]">Reason for Deletion:</strong> {data.reason}
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

export default SubCityRequestDetail;
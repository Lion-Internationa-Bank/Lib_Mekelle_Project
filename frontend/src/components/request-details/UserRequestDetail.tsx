// src/components/request-details/UserRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';
import DateDisplay from '../common/DateDisplay';

interface UserRequestDetailProps {
  data: any;  // This is request_data from the approval request
  actionType: ActionType;
  entityId: string;
}

const UserRequestDetail: React.FC<UserRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  // Helper function to check if a field is a date field
  const isDateField = (key: string): boolean => {
    const dateKeywords = ['date', 'created_at', 'updated_at', 'last_login'];
    return dateKeywords.some(keyword => key.toLowerCase().includes(keyword));
  };

  // Format role for display
  const formatRole = (role: string): string => {
    return role.replace(/_/g, ' ')
               .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper to determine if a field should be hidden
  const shouldHideField = (key: string): boolean => {
    const hiddenFields = ['password_hash', 'is_deleted', 'updated_at'];
    return hiddenFields.includes(key);
  };

  const renderCreate = () => {
    // Filter out sensitive or unnecessary fields
    const displayData = Object.entries(data).filter(
      ([key]) => !shouldHideField(key) && key !== 'created_at'
    );

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#2a2718]">New User Registration</h3>
        
        {/* User Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayData.map(([key, value]) => {
            // Skip null/undefined values
            if (value === null || value === undefined) return null;

            // Special handling for specific fields
            if (key === 'role') {
              return (
                <div key={key} className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                  <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                    Role
                  </div>
                  <div className="text-base font-semibold">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      value === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      value === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      value === 'REVENUE_APPROVER' || value === 'SUBCITY_APPROVER' ? 'bg-blue-100 text-blue-800' :
                      value === 'REVENUE_USER' ? 'bg-green-100 text-green-800' :
                      value === 'SUBCITY_ADMIN' ? 'bg-orange-100 text-orange-800' :
                      value === 'SUBCITY_AUDITOR' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formatRole(value as string)}
                    </span>
                  </div>
                </div>
              );
            }

            if (key === 'sub_city_id') {
              return (
                <div key={key} className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                  <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                    Sub-City
                  </div>
                  <div className="text-base font-semibold text-[#2a2718]">
                    {value ? `Sub-City ${value}` : 'N/A (Revenue Role)'}
                  </div>
                </div>
              );
            }

            if (key === 'is_active') {
              return (
                <div key={key} className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                  <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-base font-semibold">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {value ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              );
            }

            // Default field rendering
            return (
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
                    String(value)
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Account Created Date */}
        {data.created_at && (
          <div className="mt-4 p-4 bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e]">
            <div className="text-xs text-[#2a2718]/70 mb-1 font-medium uppercase tracking-wider">
              Account Created
            </div>
            <div className="text-base font-semibold text-[#2a2718]">
              <DateDisplay 
                date={data.created_at}
                format="full"
                showCalendarIndicator={true}
                showTooltip={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSuspend = () => {
    // For suspend action, data contains the requestData from the approval request
    // which includes user_id, username, full_name, role, current_status, new_status, reason
    return (
      <div>
        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800">
          
          
          {/* User Information */}
          <div className="mb-4 p-4 bg-white/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Username</div>
                <div className="font-semibold text-[#2a2718]">{data.username}</div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Full Name</div>
                <div className="font-semibold text-[#2a2718]">{data.full_name}</div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Role</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    data.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                    data.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    data.role === 'REVENUE_APPROVER' || data.role === 'SUBCITY_APPROVER' ? 'bg-blue-100 text-blue-800' :
                    data.role === 'REVENUE_USER' ? 'bg-green-100 text-green-800' :
                    data.role === 'SUBCITY_ADMIN' ? 'bg-orange-100 text-orange-800' :
                    data.role === 'SUBCITY_AUDITOR' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatRole(data.role)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Current Status</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    data.current_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data.current_status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">New Status</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    data.new_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data.new_status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reason for Suspension */}
          {data.reason && (
            <div className="mt-4">
              <strong className="text-[#2a2718]">Reason for Suspension:</strong> {data.reason}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActivate = () => {
    // For activate action, data contains the requestData from the approval request
    return (
      <div>
        <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Activate User</h3>
        <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-green-800">
          <div className="mb-4">
            <strong className="text-[#2a2718]">User ID:</strong> {entityId}
          </div>
          
          {/* User Information */}
          <div className="mb-4 p-4 bg-white/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Username</div>
                <div className="font-semibold text-[#2a2718]">{data.username}</div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Full Name</div>
                <div className="font-semibold text-[#2a2718]">{data.full_name}</div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Role</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    data.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                    data.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    data.role === 'REVENUE_APPROVER' || data.role === 'SUBCITY_APPROVER' ? 'bg-blue-100 text-blue-800' :
                    data.role === 'REVENUE_USER' ? 'bg-green-100 text-green-800' :
                    data.role === 'SUBCITY_ADMIN' ? 'bg-orange-100 text-orange-800' :
                    data.role === 'SUBCITY_AUDITOR' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatRole(data.role)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">Current Status</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    data.current_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data.current_status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#2a2718]/70 mb-1">New Status</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    data.new_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data.new_status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reason for Activation */}
          {data.reason && (
            <div className="mt-4">
              <strong className="text-[#2a2718]">Reason for Activation:</strong> {data.reason}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDelete = () => (
    <div>
      <h3 className="text-lg font-semibold text-[#2a2718] mb-4">Delete User</h3>
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <div className="mb-4">
          <strong className="text-[#2a2718]">User ID:</strong> {entityId}
        </div>
        
        {/* User Information */}
        <div className="mb-4 p-4 bg-white/50 rounded-lg">
          <div className="font-semibold text-[#2a2718] mb-3">
            User Information:
          </div>
          <div className="grid gap-2">
            <div>
              <strong className="text-[#2a2718]">Username:</strong> {data.username}
            </div>
            <div>
              <strong className="text-[#2a2718]">Full Name:</strong> {data.full_name}
            </div>
            <div>
              <strong className="text-[#2a2718]">Role:</strong>{' '}
              <span className={`px-2 py-1 rounded-full text-xs ${
                data.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                data.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                data.role === 'REVENUE_APPROVER' || data.role === 'SUBCITY_APPROVER' ? 'bg-blue-100 text-blue-800' :
                data.role === 'REVENUE_USER' ? 'bg-green-100 text-green-800' :
                data.role === 'SUBCITY_ADMIN' ? 'bg-orange-100 text-orange-800' :
                data.role === 'SUBCITY_AUDITOR' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {formatRole(data.role)}
              </span>
            </div>
            {data.sub_city_id && (
              <div>
                <strong className="text-[#2a2718]">Sub-City:</strong> Sub-City {data.sub_city_id}
              </div>
            )}
          </div>
        </div>
        
        {/* Reason for Deletion */}
        {data.reason && (
          <div className="mt-4">
            <strong className="text-[#2a2718]">Reason for Deletion:</strong> {data.reason}
          </div>
        )}
      </div>
    </div>
  );

  // Note: UPDATE action type might not be fully implemented in your backend yet
  // based on your controller code, but keeping it for future use
  const renderUpdate = () => {
    // If you implement UPDATE later, this will handle it
    return (
      <div className="p-4 bg-[#f0cd6e]/20 rounded-lg border border-[#f0cd6e] text-[#2a2718]">
        Update functionality coming soon
      </div>
    );
  };

  switch (actionType) {
    case 'CREATE':
      return renderCreate();
    case 'UPDATE':
      return renderUpdate();
    case 'DELETE':
      return renderDelete();
    case 'SUSPEND':
      return renderSuspend();
    case 'ACTIVATE':
      return renderActivate();
    default:
      return (
        <div className="p-4 bg-[#f0cd6e]/20 rounded-lg border border-[#f0cd6e] text-[#2a2718]">
          Unsupported action type: {actionType}
        </div>
      );
  }
};

export default UserRequestDetail;
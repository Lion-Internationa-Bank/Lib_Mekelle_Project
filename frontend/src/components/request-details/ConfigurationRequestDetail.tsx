// src/components/request-details/ConfigurationRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';

interface ConfigurationRequestDetailProps {
  data: any;  // This is request_data from the approval request
  actionType: ActionType;
  entityId: string;
}

const ConfigurationRequestDetail: React.FC<ConfigurationRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  // Format category for display
  const formatCategory = (category: string): string => {
    return category.replace(/_/g, ' ')
                   .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Render options as a table
  const renderOptionsTable = (options: any) => {
    if (!options) return <div className="text-gray-500 italic">No options configured</div>;
    
    // Handle array of options
    if (Array.isArray(options)) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {options.map((option: any, index: number) => {
                // Handle different option formats
                let value = '';
                let description = '';
                
                if (typeof option === 'string') {
                  value = option;
                  description = '';
                } else if (option.value) {
                  value = option.value;
                  description = option.description || '';
                } else {
                  value = JSON.stringify(option);
                }
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">
                      {value}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {description || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    
    // Handle object with numbered keys (like your screenshot)
    if (typeof options === 'object') {
      const entries = Object.entries(options);
      
      // Check if it's a numbered index object
      const isNumberedIndex = entries.every(([key]) => !isNaN(Number(key)));
      
      if (isNumberedIndex) {
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Index
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map(([key, value]) => (
                  <tr key={key} className={parseInt(key) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {key}:
                    </td>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      // Default object display
      return (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-500 min-w-[100px]">
                {key}:
              </span>
              <span className="text-sm text-gray-900 font-mono">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return <div className="text-gray-900">{String(options)}</div>;
  };

  const renderUpdate = () => {
    const { previous_values, category, key, description, is_active, options } = data;
    const currentOptions = previous_values?.value || previous_values?.options;

    return (
      <div className="space-y-6">
        {/* Header with Category and Key */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-[#2a2718]">Update Configuration</span>
            <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-medium">
              {formatCategory(category)}
            </span>
            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {key}
            </span>
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(entityId)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Show Request ID
          </button>
        </div>

        {/* Current Configuration */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-700">Current Configuration</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Options</span>
            </div>
            <div className="p-4">
              {renderOptionsTable(currentOptions)}
            </div>
          </div>
        </div>

        {/* Proposed Changes */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-700">Proposed Changes</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Options</span>
            </div>
            <div className="p-4">
              {renderOptionsTable(options)}
            </div>
          </div>
        </div>

        {/* Description and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Description</div>
            <div className="text-gray-900">
              {description || <span className="text-gray-400 italic">No description provided</span>}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary of Changes */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Summary of Changes</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            {JSON.stringify(currentOptions) !== JSON.stringify(options) && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Configuration options have been modified
              </li>
            )}
            {previous_values?.description !== description && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Description: {previous_values?.description || 'None'} → {description || 'None'}
              </li>
            )}
            {previous_values?.is_active !== is_active && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Status: {previous_values?.is_active ? 'Active' : 'Inactive'} → {is_active ? 'Active' : 'Inactive'}
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const renderCreate = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-[#2a2718]">New Configuration</span>
            <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-medium">
              {formatCategory(data.category)}
            </span>
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(entityId)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Show Request ID
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Options</span>
          </div>
          <div className="p-4">
            {renderOptionsTable(data.options)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Description</div>
            <div className="text-gray-900">
              {data.description || <span className="text-gray-400 italic">No description provided</span>}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div>
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

  switch (actionType) {
    case 'CREATE':
      return renderCreate();
    case 'UPDATE':
      return renderUpdate();
    case 'DELETE':
      return (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700">
          Delete action not implemented for configurations
        </div>
      );
    default:
      return (
        <div className="p-4 bg-[#f0cd6e]/20 rounded-lg border border-[#f0cd6e] text-[#2a2718]">
          Unsupported action type: {actionType}
        </div>
      );
  }
};

export default ConfigurationRequestDetail;
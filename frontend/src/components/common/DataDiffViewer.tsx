// src/components/common/DataDiffViewer.tsx
import React from 'react';

interface DataDiffViewerProps {
  originalData: any;
  updatedData: any;
  title?: string;
}

const DataDiffViewer: React.FC<DataDiffViewerProps> = ({ 
  originalData, 
  updatedData, 
  title = "Data Changes" 
}) => {
  const getChangedFields = () => {
    const changed: { [key: string]: { from: any; to: any } } = {};
    
    // Check updatedData against originalData
    Object.keys(updatedData).forEach(key => {
      const originalValue = originalData[key];
      const updatedValue = updatedData[key];
      
      // Deep comparison
      const originalStr = JSON.stringify(originalValue);
      const updatedStr = JSON.stringify(updatedValue);
      
      if (originalStr !== updatedStr) {
        changed[key] = { from: originalValue, to: updatedValue };
      }
    });
    
    return changed;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key.replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
  };

  const changedFields = getChangedFields();

  if (Object.keys(changedFields).length === 0) {
    return (
      <div className="p-4 bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded-lg text-[#2a2718]">
        <strong>No changes detected.</strong> The updated data is identical to the original.
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-semibold text-[#2a2718] mb-4">{title}</h4>
      <div className="bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e] overflow-hidden">
        {Object.entries(changedFields).map(([key, diff], index) => (
          <div 
            key={key}
            className={`p-4 ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f0cd6e]/5'
            } border-b border-[#f0cd6e] last:border-b-0`}
          >
            <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
              <div className="font-semibold text-[#2a2718]">
                {formatKey(key)}
              </div>
              <div className="text-xs px-2 py-1 bg-[#f0cd6e] text-[#2a2718] rounded">
                Changed
              </div>
            </div>
            
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              {/* Original Value */}
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="text-xs text-red-700 font-medium mb-1">
                  Original:
                </div>
                <div className="break-words text-[#2a2718]">
                  {formatValue(diff.from)}
                </div>
              </div>
              
              {/* Arrow */}
              <div className="text-2xl text-[#f0cd6e] text-center">
                →
              </div>
              
              {/* Updated Value */}
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="text-xs text-green-700 font-medium mb-1">
                  Updated:
                </div>
                <div className="break-words text-[#2a2718]">
                  {formatValue(diff.to)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataDiffViewer;
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
      <div style={{ 
        padding: '1rem',
        backgroundColor: '#fff3cd',
        borderRadius: '4px',
        color: '#856404',
        border: '1px solid #ffeaa7'
      }}>
        <strong>No changes detected.</strong> The updated data is identical to the original.
      </div>
    );
  }

  return (
    <div>
      <h4>{title}</h4>
      <div style={{ 
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #e9ecef',
        overflow: 'hidden'
      }}>
        {Object.entries(changedFields).map(([key, diff], index) => (
          <div 
            key={key}
            style={{
              padding: '1rem',
              backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
              borderBottom: index < Object.keys(changedFields).length - 1 ? '1px solid #e9ecef' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ fontWeight: '600', color: '#495057' }}>
                {formatKey(key)}
              </div>
              <div style={{ 
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '4px'
              }}>
                Changed
              </div>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '1rem',
              alignItems: 'center'
            }}>
              {/* Original Value */}
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: '#f8d7da',
                borderRadius: '4px',
                borderLeft: '3px solid #dc3545'
              }}>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: '#721c24',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  Original:
                </div>
                <div style={{ wordBreak: 'break-word' }}>
                  {formatValue(diff.from)}
                </div>
              </div>
              
              {/* Arrow */}
              <div style={{ 
                fontSize: '1.5rem',
                color: '#6c757d',
                textAlign: 'center'
              }}>
                →
              </div>
              
              {/* Updated Value */}
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: '#d1e7dd',
                borderRadius: '4px',
                borderLeft: '3px solid #28a745'
              }}>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: '#0f5132',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  Updated:
                </div>
                <div style={{ wordBreak: 'break-word' }}>
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
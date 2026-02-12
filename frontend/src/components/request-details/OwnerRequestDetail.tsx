// src/components/request-details/OwnerRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';

interface OwnerRequestDetailProps {
  data: any;
  actionType: ActionType;
  entityId: string;
}

const OwnerRequestDetail: React.FC<OwnerRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
const renderCreate = () => {
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Separate regular fields from document fields
  const documentKeys = ['documents', 'attachments', 'identification_docs', 'supporting_documents'];
  
  const regularEntries = Object.entries(data).filter(
    ([key]) => !documentKeys.includes(key) && !key.toLowerCase().includes('document')
  );
  
  const documentEntries = Object.entries(data).filter(
    ([key]) => documentKeys.includes(key) || key.toLowerCase().includes('document')
  );

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return 'No items';
        // For non-document arrays, show count
        return `${value.length} item(s)`;
      }
      if (Object.keys(value).length === 0) return 'Empty object';
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Document type display names
  const getDocumentTypeDisplay = (docType: string): string => {
    const types: Record<string, string> = {
      'ID_COPY': 'ID Copy',
      'SUPPORTING_DOCUMENT': 'Supporting Document',
      'PASSPORT': 'Passport',
      'DRIVERS_LICENSE': "Driver's License",
      'BIRTH_CERTIFICATE': 'Birth Certificate',
      'MARRIAGE_CERTIFICATE': 'Marriage Certificate',
      'TITLE_DEED': 'Title Deed',
      'SURVEY_PLAN': 'Survey Plan',
      'POWER_OF_ATTORNEY': 'Power of Attorney',
      'CONTRACT': 'Contract',
      'INVOICE': 'Invoice',
      'RECEIPT': 'Receipt',
      'OTHER': 'Other'
    };
    return types[docType] || docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      <h3>New Owner Registration</h3>
      
      {/* Regular fields grid */}
      {regularEntries.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef',
          marginBottom: '1.5rem'
        }}>
          {regularEntries.map(([key, value]) => (
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
                {renderValue(value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents section */}
      {documentEntries.map(([key, value]) => {
        const documents = Array.isArray(value) ? value : (value ? [value] : []);
        
        if (documents.length === 0) return null;

        return (
          <div key={key} style={{ marginTop: '1rem' }}>
            <h4 style={{ 
              marginBottom: '1rem',
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{key.replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}</span>
              <span style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 'normal'
              }}>
                {documents.length} file(s)
              </span>
            </h4>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1rem'
            }}>
              {documents.map((doc, index) => (
                <div key={doc.id || index} style={{
                  padding: '1.25rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {/* Document header with type badge */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid #dee2e6',
                    paddingBottom: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '1.25rem'
                      }}>📄</span>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#212529'
                        }}>
                          {doc.file_name || 'Unnamed Document'}
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#6c757d'
                        }}>
                          {doc.document_type && getDocumentTypeDisplay(doc.document_type)}
                        </div>
                      </div>
                    </div>
                    {doc.document_type && (
                      <span style={{
                        backgroundColor: doc.document_type === 'ID_COPY' ? '#e3f2fd' : '#f3e5f5',
                        color: doc.document_type === 'ID_COPY' ? '#0d47a1' : '#4a148c',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {doc.document_type === 'ID_COPY' ? 'ID' : 'DOC'}
                      </span>
                    )}
                  </div>

                  {/* Document details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    {doc.file_size && (
                      <>
                        <span style={{ color: '#6c757d' }}>Size:</span>
                        <span style={{ fontWeight: '500' }}>{formatFileSize(doc.file_size)}</span>
                      </>
                    )}
                    {doc.mime_type && (
                      <>
                        <span style={{ color: '#6c757d' }}>Type:</span>
                        <span style={{ fontWeight: '500' }}>{doc.mime_type.split('/').pop()?.toUpperCase()}</span>
                      </>
                    )}
                    {doc.metadata?.uploaded_at && (
                      <>
                        <span style={{ color: '#6c757d' }}>Uploaded:</span>
                        <span style={{ fontWeight: '500' }}>{formatDate(doc.metadata.uploaded_at)}</span>
                      </>
                    )}
                    {doc.metadata?.uploaded_by_role && (
                      <>
                        <span style={{ color: '#6c757d' }}>Uploaded by:</span>
                        <span style={{ fontWeight: '500' }}>{doc.metadata.uploaded_by_role.replace(/_/g, ' ')}</span>
                      </>
                    )}
                  </div>

                  {/* Document ID */}
                  {doc.id && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#adb5bd',
                      borderTop: '1px solid #dee2e6',
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      wordBreak: 'break-all'
                    }}>
                      ID: {doc.id}
                    </div>
                  )}

                  {/* File URL - only show truncated version */}
                  {doc.file_url && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>🔗</span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {doc.file_url.split('/').pop()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Show message if no documents */}
      {documentEntries.length === 0 && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          color: '#6c757d',
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          No documents attached
        </div>
      )}
    </div>
  );
};

  const renderUpdate = () => {
    const { changes, current_data } = data;
    
    return (
      <div>
        <h3>Update Owner Information</h3>
        
        {/* Current Owner Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Owner Details</h4>
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
                  {String(value || 'N/A')}
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

  const renderDelete = () => (
    <div>
      <h3>Delete Owner</h3>
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Owner ID:</strong> {entityId}
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
              Owner Information:
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div><strong>Full Name:</strong> {data.current_data.full_name}</div>
              <div><strong>National ID:</strong> {data.current_data.national_id}</div>
              <div><strong>Phone:</strong> {data.current_data.phone_number}</div>
              {data.current_data.active_parcels_count !== undefined && (
                <div><strong>Active Parcels:</strong> {data.current_data.active_parcels_count}</div>
              )}
            </div>
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

export default OwnerRequestDetail;
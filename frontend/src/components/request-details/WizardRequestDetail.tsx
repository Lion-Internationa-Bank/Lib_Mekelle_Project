// src/components/request-details/WizardRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';

interface WizardRequestDetailProps {
  data: any;
  actionType: ActionType;
}

const WizardRequestDetail: React.FC<WizardRequestDetailProps> = ({ data, actionType }) => {
  if (actionType !== 'CREATE') {
    return (
      <div style={{ 
        padding: '1rem',
        backgroundColor: '#fff3cd',
        borderRadius: '4px',
        color: '#856404'
      }}>
        Invalid action type for wizard session: {actionType}
      </div>
    );
  }

  const { parcel, owners, lease, parcel_docs, owner_docs, lease_docs } = data;

  return (
    <div>
      <div style={{ 
        backgroundColor: '#e7f1ff',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '2rem',
        border: '1px solid #cfe2ff'
      }}>
        <h2 style={{ margin: 0 }}>New Land Registration Wizard</h2>
        <p style={{ margin: '0.5rem 0 0 0', color: '#084298' }}>
          Complete land registration with parcel, owner, and lease information
        </p>
      </div>
      
      {/* Parcel Information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🏞️</span> Parcel Information
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {[
            { label: 'UPIN', value: parcel.upin, emphasis: true },
            { label: 'File Number', value: parcel.file_number, emphasis: true },
            { label: 'Tabia', value: parcel.tabia },
            { label: 'Ketena', value: parcel.ketena },
            { label: 'Block', value: parcel.block },
            { label: 'Area', value: `${parcel.total_area_m2} m²` },
            { label: 'Land Use', value: parcel.land_use },
            { label: 'Land Grade', value: parcel.land_grade },
            { label: 'Tenure Type', value: parcel.tenure_type }
          ].map((item, index) => (
            <div key={index} style={{ 
              padding: '0.75rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '0.8rem',
                color: '#6c757d',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {item.label}
              </div>
              <div style={{ 
                fontSize: item.emphasis ? '1.1rem' : '1rem',
                fontWeight: item.emphasis ? '600' : '400',
                wordBreak: 'break-word'
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owners Information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <span>👥</span> Owners ({owners.length})
        </h3>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {owners.map((owner: any, index: number) => (
            <div 
              key={index}
              style={{ 
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>
                  {owner.full_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    {owner.full_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    Owner #{index + 1}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}>
                {[
                  { label: 'National ID', value: owner.national_id },
                  { label: 'TIN Number', value: owner.tin_number || 'N/A' },
                  { label: 'Phone', value: owner.phone_number },
                  { label: 'Acquired', value: owner.acquired_at }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ 
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      marginBottom: '0.25rem'
                    }}>
                      {item.label}
                    </div>
                    <div style={{ 
                      fontSize: '0.95rem',
                      fontWeight: item.label === 'National ID' ? '600' : '400'
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lease Information (if exists) */}
      {lease && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>📄</span> Lease Agreement
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {[
              { label: 'Start Date', value: lease.start_date },
              { label: 'Contract Date', value: lease.contract_date },
              { label: 'Lease Period', value: `${lease.lease_period_years} years` },
              { label: 'Payment Term', value: `${lease.payment_term_years} years` },
              { label: 'Total Amount', value: `$${lease.total_lease_amount}` },
              { label: 'Down Payment', value: `$${lease.down_payment_amount}` },
              { label: 'Price per m²', value: `$${lease.price_per_m2}` },
              { label: 'Other Payment', value: `$${lease.other_payment || 0}` },
              { label: 'Legal Framework', value: lease.legal_framework }
            ].map((item, index) => (
              <div key={index} style={{ 
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  fontSize: '0.8rem',
                  color: '#6c757d',
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {item.label}
                </div>
                <div style={{ 
                  fontSize: '1rem',
                  fontWeight: ['Total Amount', 'Down Payment', 'Price per m²'].includes(item.label) ? '600' : '400'
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Summary */}
      <div>
        <h3 style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>📎</span> Documents
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem'
        }}>
          <div style={{ 
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <span style={{ color: '#0d6efd' }}>🏞️</span> 
              Parcel Documents ({parcel_docs?.length || 0})
            </h4>
            {parcel_docs?.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {parcel_docs.map((doc: any, index: number) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '0.75rem',
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      {doc.file_name}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#6c757d'
                    }}>
                      <span>{doc.document_type}</span>
                      <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '2rem',
                textAlign: 'center',
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                No parcel documents
              </div>
            )}
          </div>
          
          <div style={{ 
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <span style={{ color: '#198754' }}>👤</span> 
              Owner Documents ({owner_docs?.length || 0})
            </h4>
            {owner_docs?.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {owner_docs.map((doc: any, index: number) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '0.75rem',
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      {doc.file_name}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#6c757d'
                    }}>
                      <span>{doc.document_type}</span>
                      <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '2rem',
                textAlign: 'center',
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                No owner documents
              </div>
            )}
          </div>
          
          {lease_docs && (
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ color: '#6f42c1' }}>📄</span> 
                Lease Documents ({lease_docs?.length || 0})
              </h4>
              {lease_docs?.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {lease_docs.map((doc: any, index: number) => (
                    <div 
                      key={index}
                      style={{ 
                        padding: '0.75rem',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {doc.file_name}
                      </div>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        color: '#6c757d'
                      }}>
                        <span>{doc.document_type}</span>
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6c757d',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  No lease documents
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardRequestDetail;
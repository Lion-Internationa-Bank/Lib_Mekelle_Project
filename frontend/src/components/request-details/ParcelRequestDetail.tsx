// src/components/request-details/ParcelRequestDetail.tsx
import React from 'react';
import { type ActionType } from '../../types/makerChecker';
import DataDiffViewer from '../common/DataDiffViewer';

interface ParcelRequestDetailProps {
  data: any;
  actionType: ActionType;
  entityId: string;
}

const ParcelRequestDetail: React.FC<ParcelRequestDetailProps> = ({ 
  data, 
  actionType, 
  entityId 
}) => {
  const renderCreate = () => {
    return (
      <div>
        <h3>New Parcel Registration</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          {Object.entries(data).map(([key, value]) => (
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
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2) 
                  : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUpdate = () => {
    const { changes, current_data } = data;
    
    return (
      <div>
        <h3>Update Parcel Information</h3>
        
        {/* Current Parcel Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Parcel Details</h4>
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
                  {typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)}
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

  const renderTransfer = () => (
    <div>
      <h3>Ownership Transfer</h3>
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#e7f1ff',
        borderRadius: '4px',
        border: '1px solid #cfe2ff'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ 
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
              FROM OWNER
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {data.from_owner_id || 'First Owner'}
            </div>
          </div>
          
          <div style={{ 
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
              TO OWNER
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {data.to_owner_id}
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <strong>Transfer Type:</strong> {data.transfer_type}
          </div>
          {data.transfer_price && (
            <div>
              <strong>Transfer Price:</strong> ${data.transfer_price}
            </div>
          )}
          {data.reference_no && (
            <div>
              <strong>Reference No:</strong> {data.reference_no}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddOwner = () => (
    <div>
      <h3>Add Owner to Parcel</h3>
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#d1e7dd',
        borderRadius: '4px',
        border: '1px solid #badbcc'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Owner ID:</strong> {data.owner_id}
        </div>
        {data.acquired_at && (
          <div>
            <strong>Acquisition Date:</strong> {data.acquired_at}
          </div>
        )}
      </div>
    </div>
  );

const renderSubdivide = () => {
  if (!data) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
        No subdivision data available
      </div>
    );
  }

  const { 
    parent_details,
    childParcels 
  } = data;

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 m-0">
          Parcel Subdivision Request
        </h2>
        <p className="text-blue-700 mt-2 mb-0">
          Subdividing parcel into {childParcels?.length || 0} child parcels
        </p>
      </div>

      {/* Parent Parcel Information */}
      <div className="mb-10">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">
          <span className="text-red-600">🏞️</span> Parent Parcel Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs uppercase text-gray-500 tracking-wide mb-1">
              UPIN
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {parent_details?.upin || entityId}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs uppercase text-gray-500 tracking-wide mb-1">
              File Number
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {parent_details?.file_number || 'N/A'}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs uppercase text-gray-500 tracking-wide mb-1">
              Tenure Type
            </div>
            <div className="text-base font-medium text-gray-700">
              {parent_details?.tenure_type || 'N/A'}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs uppercase text-gray-500 tracking-wide mb-1">
              Owners Count
            </div>
            <div className="text-base font-medium text-gray-700">
              {parent_details?.owners_count || 0} owner{parent_details?.owners_count !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs uppercase text-gray-500 tracking-wide mb-1">
              Total Area
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {parent_details?.total_area_m2 || 0} m²
            </div>
          </div>
        </div>
      </div>

      {/* Area Distribution Summary */}
      <div className="mb-10">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">
          <span className="text-green-600">📊</span> Area Distribution Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 mb-1">Parent Area</div>
                <div className="text-2xl font-bold text-green-800">
                  {parent_details?.total_area_m2 || 0} m²
                </div>
              </div>
              <div className="text-3xl text-green-600">🏞️</div>
            </div>
          </div>
          
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 mb-1">Total Child Area</div>
                <div className="text-2xl font-bold text-blue-800">
                  {childParcels?.reduce((sum: number, child: any) => 
                    sum + Number(child.total_area_m2), 0
                  )} m²
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Across {childParcels?.length || 0} parcels
                </div>
              </div>
              <div className="text-3xl text-blue-600">🧩</div>
            </div>
          </div>
          
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-700 mb-1">Area Balance</div>
                <div className={`text-2xl font-bold ${
                  Math.abs(
                    (parent_details?.total_area_m2 || 0) - 
                    childParcels?.reduce((sum: number, child: any) => 
                      sum + Number(child.total_area_m2), 0
                    )
                  ) <= 0.1 ? 'text-green-600' : 'text-yellow-800'
                }`}>
                  {Math.abs(
                    (parent_details?.total_area_m2 || 0) - 
                    childParcels?.reduce((sum: number, child: any) => 
                      sum + Number(child.total_area_m2), 0
                    )
                  ).toFixed(2)} m²
                </div>
                <div className={`text-xs mt-2 ${
                  Math.abs(
                    (parent_details?.total_area_m2 || 0) - 
                    childParcels?.reduce((sum: number, child: any) => 
                      sum + Number(child.total_area_m2), 0
                    )
                  ) <= 0.1 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {Math.abs(
                    (parent_details?.total_area_m2 || 0) - 
                    childParcels?.reduce((sum: number, child: any) => 
                      sum + Number(child.total_area_m2), 0
                    )
                  ) <= 0.1 ? '✓ Areas match' : '⚠ Area difference'}
                </div>
              </div>
              <div className="text-3xl text-yellow-600">⚖️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Child Parcels */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <span className="text-orange-500">🧩</span> Child Parcels ({childParcels?.length || 0})
          </h3>
          {childParcels?.length > 0 && (
            <div className="text-sm text-gray-600">
              Average area: {(childParcels.reduce((sum: number, child: any) => 
                sum + Number(child.total_area_m2), 0
              ) / childParcels.length).toFixed(1)} m²
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {childParcels?.map((child: any, index: number) => (
            <div 
              key={index}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Child Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      Child Parcel #{index + 1}
                    </div>
                    <div className="text-sm text-gray-600">
                      {child.upin}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {child.total_area_m2} m²
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((child.total_area_m2 / (parent_details?.total_area_m2 || 1)) * 100).toFixed(1)}% of parent
                  </div>
                </div>
              </div>
              
              {/* Child Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">File Number</div>
                    <div className="font-medium text-gray-800">{child.file_number}</div>
                  </div>
                  {child.land_use && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Land Use</div>
                      <div className="font-medium text-gray-700">{child.land_use}</div>
                    </div>
                  )}
                </div>
                
                {child.land_grade && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Land Grade</div>
                    <div className="text-gray-700">{child.land_grade}</div>
                  </div>
                )}
                
                {child.tenure_type && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tenure Type</div>
                    <div className="text-gray-700">{child.tenure_type}</div>
                  </div>
                )}
                
                {/* Boundaries Section */}
                {(child.boundary_north || child.boundary_south || child.boundary_east || child.boundary_west) && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-3">Boundaries</div>
                    <div className="grid grid-cols-2 gap-3">
                      {child.boundary_north && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">North</div>
                            <div className="text-sm truncate">{child.boundary_north}</div>
                          </div>
                        </div>
                      )}
                      {child.boundary_south && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">South</div>
                            <div className="text-sm truncate">{child.boundary_south}</div>
                          </div>
                        </div>
                      )}
                      {child.boundary_east && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">East</div>
                            <div className="text-sm truncate">{child.boundary_east}</div>
                          </div>
                        </div>
                      )}
                      {child.boundary_west && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">West</div>
                            <div className="text-sm truncate">{child.boundary_west}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

  const renderDelete = () => (
    <div>
      <h3>Delete Parcel</h3>
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>UPIN:</strong> {entityId}
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
              Parcel Information:
            </div>
            {Object.entries(data.current_data).slice(0, 4).map(([key, value]) => (
              <div key={key} style={{ fontSize: '0.9rem' }}>
                {key.replace(/_/g, ' ')}: {String(value)}
              </div>
            ))}
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
    case 'TRANSFER':
      return renderTransfer();
    case 'ADD_OWNER':
      return renderAddOwner();
    case 'SUBDIVIDE':
      return renderSubdivide();
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

export default ParcelRequestDetail;
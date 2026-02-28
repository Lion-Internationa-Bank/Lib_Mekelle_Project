import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable, type Column, ExpandableRow } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  NumberRangeFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { reportService } from '../../services/reportService';
import type{ LeaseInstallmentItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';

export const LeaseInstallmentRangePage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<LeaseInstallmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const [filters, setFilters] = useState({
    subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    min: 0,
    max: 1000000
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '' && v !== 0 && v !== 1000000).length;

  // Auto-fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const validateFilters = (): boolean => {
    if (filters.min > filters.max) {
      setValidationError('Minimum value cannot be greater than maximum value');
      return false;
    }
    return true;
  };

  const fetchData = async () => {
    if (!validateFilters()) return;
    
    setIsLoading(true);
    try {
      const response = await reportService.getLeaseInstallmentRangeReport(filters);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching lease data:', error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const handleExport = async () => {
    if (!validateFilters()) return;
    
    try {
      await reportService.exportLeaseInstallmentRangeReport(filters);
    } catch (error) {
      console.error('Error exporting lease data:', error);
    }
  };

  const columns: Column<LeaseInstallmentItem>[] = [
    {
      key: 'parcel',
      header: 'Parcel',
      render: (item) => (
        <div>
          <div className="font-medium">{item.parcel.upin}</div>
          <div className="text-xs text-gray-500">{item.parcel.file_number}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <div>
          <div>{item.parcel.sub_city_name}</div>
          <div className="text-xs text-gray-500">
            {[item.parcel.tabia, item.parcel.ketena, item.parcel.block]
              .filter(Boolean)
              .join(' / ')}
          </div>
        </div>
      )
    },
    {
      key: 'annual_installment',
      header: 'Annual Installment',
      render: (item) => (
        <div className="font-medium text-green-600">
          {item.lease.annual_installment.toLocaleString()} ETB
        </div>
      )
    },
    {
      key: 'lease_status',
      header: 'Lease Status',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.lease.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : item.lease.status === 'EXPIRED'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {item.lease.status}
        </span>
      )
    },
    {
      key: 'owners_count',
      header: 'Owners',
      render: (item) => (
        <div className="text-center">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {item.owners.length}
          </span>
        </div>
      )
    }
  ];

  const renderExpandedRow = (item: LeaseInstallmentItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Parcel Details</h4>
          <ExpandableRow label="Area" value={`${item.parcel.total_area_m2 || 'N/A'} m²`} />
          <ExpandableRow label="Land Use" value={item.parcel.land_use || 'N/A'} />
          <ExpandableRow label="Tenure" value={item.parcel.tenure_type || 'N/A'} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Lease Details</h4>
          <ExpandableRow label="Lease ID" value={item.lease.lease_id.slice(0, 8) + '...'} />
          <ExpandableRow label="Annual Installment" value={`${item.lease.annual_installment.toLocaleString()} ETB`} />
          <ExpandableRow label="Status" value={item.lease.status} />
          <ExpandableRow label="Start Date" value={new Date(item.lease.start_date).toLocaleDateString()} />
          {item.lease.expiry_date && (
            <ExpandableRow label="Expiry Date" value={new Date(item.lease.expiry_date).toLocaleDateString()} />
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Owners ({item.owners.length})</h4>
        <div className="bg-white rounded border border-gray-200 divide-y max-h-60 overflow-y-auto">
          {item.owners.map((owner) => (
            <div key={owner.owner_id} className="p-2 text-sm hover:bg-gray-50">
              <div className="font-medium">{owner.full_name}</div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                <span>ID: {owner.national_id || 'N/A'}</span>
                <span>TIN: {owner.tin_number || 'N/A'}</span>
                <span>Tel: {owner.phone_number || 'N/A'}</span>
                <span>Acquired: {new Date(owner.acquired_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ReportsLayout
      title="Lease Annual Installment Range"
      description="View land parcels within a specific annual installment range"
      filterCount={activeFilterCount}
      onRefresh={fetchData}
      isLoading={isLoading}
      filters={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SubCityFilter
              value={filters.subCityId}
              onChange={(v) => handleFilterChange('subCityId', v)}
            />
          </div>

          <NumberRangeFilter
            label="Annual Installment Range (ETB)"
            minName="Amount"
            maxName="Amount"
            minValue={filters.min}
            maxValue={filters.max}
            onMinChange={(v) => handleFilterChange('min', v || 0)}
            onMaxChange={(v) => handleFilterChange('max', v || 1000000)}
          />

          {validationError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {validationError}
            </div>
          )}

          <FilterActions
            onApply={fetchData}
            onClear={() => setFilters({ 
              subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '', 
              min: 0, 
              max: 1000000 
            })}
            onExport={handleExport}
            isLoading={isLoading}
            activeFilterCount={activeFilterCount}
          />
        </div>
      }
    >
      <BaseTable
        data={data}
        columns={columns}
        isLoading={isLoading && !initialLoadDone}
        emptyMessage="No parcels found in this installment range"
        onRowClick={renderExpandedRow}
      />
    </ReportsLayout>
  );
};
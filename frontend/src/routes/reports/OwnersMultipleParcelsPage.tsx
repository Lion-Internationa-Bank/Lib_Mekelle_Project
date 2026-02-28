import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable, type Column, ExpandableRow } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { reportService } from '../../services/reportService';
import type { OwnerMultipleParcelsItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';

export const OwnersMultipleParcelsPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OwnerMultipleParcelsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const [filters, setFilters] = useState({
    subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    minParcels: 2
  });

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  // Auto-fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getOwnersMultipleParcelsReport(filters);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const handleExport = async () => {
    try {
      await reportService.exportOwnersMultipleParcelsReport(filters);
    } catch (error) {
      console.error('Error exporting owners:', error);
    }
  };

  const columns: Column<OwnerMultipleParcelsItem>[] = [
    {
      key: 'full_name',
      header: 'Owner',
      render: (item) => (
        <div>
          <div className="font-medium">{item.full_name}</div>
          <div className="text-xs text-gray-500">{item.national_id || 'No National ID'}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item) => (
        <div>
          <div>{item.phone_number || '-'}</div>
          <div className="text-xs text-gray-500">TIN: {item.tin_number || '-'}</div>
        </div>
      )
    },
    {
      key: 'sub_city_name',
      header: 'Sub City'
    },
    {
      key: 'parcel_count',
      header: 'Parcel Count',
      render: (item) => (
  <div className="flex flex-col gap-3 p-2">
    {/* Header Badge */}
    <div>
      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold tracking-wide">
        {item.parcel_count} parcels
      </span>
    </div>

    {/* Parcels List */}
    <div className="flex flex-col gap-2">
      {item.parcels.map((parcel, index) => (
        <div 
          key={index} 
          className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          {/* UPIN - Bold and Prominent */}
          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="text-gray-400 text-xs font-normal">UPIN:</span>
            {parcel.upin}
          </div>
          
          {/* Details - Muted and smaller */}
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span className="bg-gray-200 h-1 w-1 rounded-full"></span>
            {[parcel.file_number, `${parcel.total_area_m2} m²`].filter(Boolean).join(" • ")}
          </div>
        </div>
      ))}
    </div>
  </div>
)

    }
  ];

  const renderExpandedRow = (item: OwnerMultipleParcelsItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Owned Parcels</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {item.parcels.map((parcel) => (
          <div key={parcel.upin} className="bg-white p-3 rounded border border-gray-200">
            <div className="font-medium text-sm">{parcel.upin}</div>
            <div className="text-xs text-gray-500">{parcel.file_number}</div>
            <div className="text-xs mt-1">
              <span className="text-gray-600">{parcel.tabia || '-'} / {parcel.ketena || '-'}</span>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span>{parcel.total_area_m2 ? `${parcel.total_area_m2} m²` : 'N/A'}</span>
              <span className={`px-2 py-0.5 rounded-full ${
                parcel.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}>
                {parcel.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ReportsLayout
      title="Owners with Multiple Parcels"
      description="View property owners who own more than one land parcel"
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
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Minimum Parcels</label>
              <input
                type="number"
                min={2}
                value={filters.minParcels}
                onChange={(e) => handleFilterChange('minParcels', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <FilterActions
            onApply={fetchData}
            onClear={() => setFilters({ 
              subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '', 
              minParcels: 2 
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
        emptyMessage="No owners with multiple parcels found"
        onRowClick={renderExpandedRow}
      />
    </ReportsLayout>
  );
};
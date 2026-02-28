import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable,type Column, ExpandableRow } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  NumberRangeFilter,
  StatusFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { reportService } from '../../services/reportService';
import { getSubCities,getConfig } from '../../services/cityAdminService';
import type { LandParcelReportItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';

// Status options (hardcoded as they're enum values)
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'PENDING', label: 'Pending' }
];

interface ConfigOption {
  value: string;
  description?: string;
}

export const LandParcelsReportPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<LandParcelReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Filter options from API
  const [subCities, setSubCities] = useState<Array<{ sub_city_id: string; name: string }>>([]);
  const [landUseOptions, setLandUseOptions] = useState<ConfigOption[]>([]);
  const [tenureTypeOptions, setTenureTypeOptions] = useState<ConfigOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    landUse: '',
    tenureType: '',
    tabia: '',
    ketena: '',
    block: '',
    minArea: undefined as number | undefined,
    maxArea: undefined as number | undefined,
    landGrade: undefined as number | undefined,
    status: '',
    tender: ''
  });

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'subCityId' && value === user?.sub_city_id) return false;
    return value !== undefined && value !== '' && value !== null;
  }).length;

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, [user]);

  // Auto-fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchFilterOptions = async () => {
    setIsLoadingOptions(true);
    try {
      // Fetch sub-cities if user is admin
      if (user?.role === 'CITY_ADMIN') {
        const subCitiesResponse = await getSubCities();
        if (subCitiesResponse.success && subCitiesResponse.data?.sub_cities) {
          setSubCities(subCitiesResponse.data.sub_cities);
        }
      }

      // Fetch land use options from config
      try {
        const landUseConfig = await getConfig('LAND_USE');
        if (landUseConfig.success && landUseConfig.data) {
          setLandUseOptions(landUseConfig.data.options || []);
        }
      } catch (error) {
        console.error('Error fetching land use options:', error);
        // Fallback options if API fails
        setLandUseOptions([
          { value: 'Residential', description: 'Residential' },
          { value: 'Commercial', description: 'Commercial' },
          { value: 'Industrial', description: 'Industrial' },
          { value: 'Agricultural', description: 'Agricultural' },
          { value: 'Mixed Use', description: 'Mixed Use' }
        ]);
      }

      // Fetch tenure type options from config
      try {
        const tenureConfig = await getConfig('LAND_TENURE');
        if (tenureConfig.success && tenureConfig.data) {
          setTenureTypeOptions(tenureConfig.data.options || []);
        }
      } catch (error) {
        console.error('Error fetching tenure type options:', error);
        // Fallback options if API fails
        setTenureTypeOptions([
          { value: 'LEASEHOLD', description: 'Leasehold' },
          { value: 'FREEHOLD', description: 'Freehold' },
          { value: 'OLD_POSSESSION', description: 'Old Possession' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getLandParcelsReport(filters);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching land parcels:', error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const handleExport = async () => {
    try {
      await reportService.exportLandParcelsReport(filters);
    } catch (error) {
      console.error('Error exporting land parcels:', error);
    }
  };

  const columns: Column<LandParcelReportItem>[] = [
    {
      key: 'upin',
      header: 'UPIN',
      render: (item) => (
        <div>
          <div className="font-medium">{item.upin}</div>
          <div className="text-xs text-gray-500">{item.file_number}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <div>
          <div>{item.sub_city?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            {[item.tabia, item.ketena, item.block].filter(Boolean).join(' / ') || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'land_details',
      header: 'Land Details',
      render: (item) => (
        <div>
          <div className="text-sm">{item.land_use || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            Area: {item.total_area_m2 ? `${item.total_area_m2.toLocaleString()} m²` : 'N/A'}
          </div>
          {item.land_grade && (
            <div className="text-xs text-gray-500">Grade: {item.land_grade}</div>
          )}
        </div>
      )
    },
    {
      key: 'tenure',
      header: 'Tenure',
      render: (item) => item.tenure_type || 'N/A'
    },
    {
      key: 'tender',
      header: 'Tender',
      render: (item) => item.tender || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors = {
          ACTIVE: 'bg-green-100 text-green-800',
          RETIRED: 'bg-gray-100 text-gray-800',
          PENDING: 'bg-yellow-100 text-yellow-800'
        };
        const colorClass = statusColors[item.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
            {item.status}
          </span>
        );
      }
    },
    {
      key: 'owners_count',
      header: 'Owners',
      render: (item) => (
        <div className="text-center">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {item.owners?.length || 0}
          </span>
        </div>
      )
    }
  ];

  const renderExpandedRow = (item: LandParcelReportItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-6">
        {/* Parcel Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Parcel Details</h4>
          <div className="space-y-2">
            <ExpandableRow label="UPIN" value={item.upin} />
            <ExpandableRow label="File Number" value={item.file_number} />
            <ExpandableRow label="Sub City" value={item.sub_city?.name || 'N/A'} />
            <ExpandableRow label="Tabia" value={item.tabia || 'N/A'} />
            <ExpandableRow label="Ketena" value={item.ketena || 'N/A'} />
            <ExpandableRow label="Block" value={item.block || 'N/A'} />
            <ExpandableRow label="Total Area" value={item.total_area_m2 ? `${item.total_area_m2.toLocaleString()} m²` : 'N/A'} />
            <ExpandableRow label="Land Use" value={item.land_use || 'N/A'} />
            <ExpandableRow label="Land Grade" value={item.land_grade?.toString() || 'N/A'} />
            <ExpandableRow label="Tender" value={item.tender || 'N/A'} />
            <ExpandableRow label="Status" value={item.status} />
          </div>
        </div>

        {/* Boundaries */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Boundaries</h4>
          <div className="space-y-2">
            <ExpandableRow label="East" value={item.boundary_east || 'N/A'} />
            <ExpandableRow label="North" value={item.boundary_north || 'N/A'} />
            <ExpandableRow label="South" value={item.boundary_south || 'N/A'} />
            <ExpandableRow label="West" value={item.boundary_west || 'N/A'} />
          </div>
        </div>
      </div>

      {/* Owners Section */}
      {item.owners && item.owners.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Owners ({item.owners.length})</h4>
          <div className="bg-white rounded border border-gray-200 divide-y max-h-80 overflow-y-auto">
            {item.owners.map((ownerRelation, index) => (
              <div key={index} className="p-3 hover:bg-gray-50">
                <div className="font-medium">{ownerRelation.owner.full_name}</div>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-1">
                  <span>ID: {ownerRelation.owner.national_id || 'N/A'}</span>
                  <span>TIN: {ownerRelation.owner.tin_number || 'N/A'}</span>
                  <span>Phone: {ownerRelation.owner.phone_number || 'N/A'}</span>
                  <span>Acquired: {new Date(ownerRelation.acquired_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ReportsLayout
      title="Land Parcels Report"
      description="Comprehensive report on land parcels with detailed filters"
      filterCount={activeFilterCount}
      onRefresh={fetchData}
      isLoading={isLoading}
      filters={
        <div className="space-y-4">
          {/* Show loading state for options */}
          {isLoadingOptions && (
            <div className="text-sm text-gray-500 italic">Loading filter options...</div>
          )}

          {/* Row 1: Basic filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SubCityFilter
              value={filters.subCityId}
              onChange={(v) => handleFilterChange('subCityId', v)}
              subCities={subCities}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Tabia</label>
              <input
                type="text"
                value={filters.tabia}
                onChange={(e) => handleFilterChange('tabia', e.target.value)}
                placeholder="Enter tabia"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Ketena</label>
              <input
                type="text"
                value={filters.ketena}
                onChange={(e) => handleFilterChange('ketena', e.target.value)}
                placeholder="Enter ketena"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>
          </div>

          {/* Row 2: More filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Block</label>
              <input
                type="text"
                value={filters.block}
                onChange={(e) => handleFilterChange('block', e.target.value)}
                placeholder="Enter block"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>

            <StatusFilter
              label="Parcel Status"
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
              options={STATUS_OPTIONS}
              disabled={isLoadingOptions}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Tender Number</label>
              <input
                type="text"
                value={filters.tender}
                onChange={(e) => handleFilterChange('tender', e.target.value)}
                placeholder="Enter tender number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>
          </div>

          {/* Row 3: Select filters from config */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Land Use</label>
              <select
                value={filters.landUse}
                onChange={(e) => handleFilterChange('landUse', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              >
                <option value="">All Land Uses</option>
                {landUseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.description || option.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Tenure Type</label>
              <select
                value={filters.tenureType}
                onChange={(e) => handleFilterChange('tenureType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              >
                <option value="">All Tenure Types</option>
                {tenureTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.description || option.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Land Grade</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={filters.landGrade || ''}
                onChange={(e) => handleFilterChange('landGrade', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Enter land grade"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>
          </div>

          {/* Row 4: Area range */}
          <NumberRangeFilter
            label="Area Range (m²)"
            minName="Area"
            maxName="Area"
            minValue={filters.minArea}
            maxValue={filters.maxArea}
            onMinChange={(v) => handleFilterChange('minArea', v)}
            onMaxChange={(v) => handleFilterChange('maxArea', v)}
            disabled={isLoadingOptions}
          />

          <FilterActions
            onApply={fetchData}
            onClear={() => setFilters({
              subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
              landUse: '',
              tenureType: '',
              tabia: '',
              ketena: '',
              block: '',
              minArea: undefined,
              maxArea: undefined,
              landGrade: undefined,
              status: '',
              tender: ''
            })}
            onExport={handleExport}
            isLoading={isLoading || isLoadingOptions}
            activeFilterCount={activeFilterCount}
          />
        </div>
      }
    >
      <BaseTable
        data={data}
        columns={columns}
        isLoading={isLoading && !initialLoadDone}
        emptyMessage="No land parcels found"
        onRowClick={renderExpandedRow}
      />
    </ReportsLayout>
  );
};
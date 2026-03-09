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
import { LandParcelsExport } from '../../components/reports/LandParcelsExport';
import { useTranslate } from '../../i18n/useTranslate';


type LandStatus = "ACTIVE" | "RETIRED" | "PENDING"
interface ConfigOption {
  value: string;
  description?: string;
}

export const LandParcelsReportPage: React.FC = () => {
  const { t } = useTranslate('landParcelsReport');
  const { user } = useAuth();
  const [data, setData] = useState<LandParcelReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Filter options from API
  const [subCities, setSubCities] = useState<Array<{ sub_city_id: string; name: string }>>([]);
  const [landUseOptions, setLandUseOptions] = useState<ConfigOption[]>([]);
  const [tenureTypeOptions, setTenureTypeOptions] = useState<ConfigOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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
    status: 'ACTIVE' as LandStatus,
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
        console.error(t('errors.fetchLandUseFailed'), error);
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
        console.error(t('errors.fetchTenureFailed'), error);
        // Fallback options if API fails
        setTenureTypeOptions([
          { value: 'LEASEHOLD', description: 'Leasehold' },
          { value: 'FREEHOLD', description: 'Freehold' },
          { value: 'OLD_POSSESSION', description: 'Old Possession' }
        ]);
      }
    } catch (error) {
      console.error(t('errors.fetchOptionsFailed'), error);
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
      console.error(t('errors.fetchFailed'), error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const columns: Column<LandParcelReportItem>[] = [
    {
      key: 'upin',
      header: t('columns.upin'),
      render: (item) => (
        <div>
          <div className="font-medium">{item.upin}</div>
          <div className="text-xs text-gray-500">{item.file_number}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: t('columns.location'),
      render: (item) => (
        <div>
          <div>{item.sub_city?.name || t('columns.notAvailable')}</div>
          <div className="text-xs text-gray-500">
            {[item.tabia, item.ketena, item.block].filter(Boolean).join(' / ') || t('columns.notAvailable')}
          </div>
        </div>
      )
    },
    {
      key: 'land_details',
      header: t('columns.landDetails'),
      render: (item) => (
        <div>
          <div className="text-sm">{item.land_use || t('columns.notAvailable')}</div>
          <div className="text-xs text-gray-500">
            {t('landDetails.area', { area: item.total_area_m2?.toLocaleString() || 'N/A' })}
          </div>
          {item.land_grade && (
            <div className="text-xs text-gray-500">
              {t('landDetails.grade', { grade: item.land_grade })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'tenure',
      header: t('columns.tenure'),
      render: (item) => item.tenure_type || t('columns.notAvailable')
    },
    {
      key: 'tender',
      header: t('columns.tender'),
      render: (item) => item.tender || '-'
    },
    {
      key: 'status',
      header: t('columns.status'),
      render: (item) => {
        const statusColors = {
          ACTIVE: t('status.colors.active'),
          RETIRED: t('status.colors.retired'),
          PENDING: t('status.colors.pending')
        };
        const colorClass = statusColors[item.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
            {item.status === 'ACTIVE' ? t('status.active') : 
             item.status === 'RETIRED' ? t('status.retired') : 
             item.status === 'PENDING' ? t('status.pending') : item.status}
          </span>
        );
      }
    },
    {
      key: 'owners_count',
      header: t('columns.owners'),
      render: (item) => (
        <div className="text-center">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {t('owners.count', { count: item.owners?.length || 0 })}
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
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expandedRow.parcelDetails')}</h4>
          <div className="space-y-2">
            <ExpandableRow label={t('expandedRow.upin')} value={item.upin} />
            <ExpandableRow label={t('expandedRow.fileNumber')} value={item.file_number} />
            <ExpandableRow label={t('expandedRow.subCity')} value={item.sub_city?.name || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.tabia')} value={item.tabia || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.ketena')} value={item.ketena || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.block')} value={item.block || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.totalArea')} value={item.total_area_m2 ? `${item.total_area_m2.toLocaleString()} m²` : t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.landUse')} value={item.land_use || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.landGrade')} value={item.land_grade?.toString() || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.tender')} value={item.tender || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.status')} value={item.status === 'ACTIVE' ? t('status.active') : 
             item.status === 'RETIRED' ? t('status.retired') : 
             item.status === 'PENDING' ? t('status.pending') : item.status} />
          </div>
        </div>

        {/* Boundaries */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expandedRow.boundaries')}</h4>
          <div className="space-y-2">
            <ExpandableRow label={t('expandedRow.east')} value={item.boundary_east || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.north')} value={item.boundary_north || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.south')} value={item.boundary_south || t('columns.notAvailable')} />
            <ExpandableRow label={t('expandedRow.west')} value={item.boundary_west || t('columns.notAvailable')} />
          </div>
        </div>
      </div>

      {/* Owners Section */}
      {item.owners && item.owners.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('owners.section', { count: item.owners.length })}</h4>
          <div className="bg-white rounded border border-gray-200 divide-y max-h-80 overflow-y-auto">
            {item.owners.map((ownerRelation, index) => (
              <div key={index} className="p-3 hover:bg-gray-50">
                <div className="font-medium">{ownerRelation.owner.full_name}</div>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-1">
                  <span>{t('owners.id', { id: ownerRelation.owner.national_id || t('columns.notAvailable') })}</span>
                  <span>{t('owners.tin', { tin: ownerRelation.owner.tin_number || t('columns.notAvailable') })}</span>
                  <span>{t('owners.phone', { phone: ownerRelation.owner.phone_number || t('columns.notAvailable') })}</span>
                  <span>{t('owners.acquired', { date: new Date(ownerRelation.acquired_at).toLocaleDateString() })}</span>
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
      title={t('title')}
      description={t('description')}
      filterCount={activeFilterCount}
      onRefresh={fetchData}
      isLoading={isLoading}
      filters={
        <div className="space-y-4">
          {/* Show loading state for options */}
          {isLoadingOptions && (
            <div className="text-sm text-gray-500 italic">{t('loadingOptions')}</div>
          )}

          {/* Row 1: Basic filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SubCityFilter
              value={filters.subCityId}
              onChange={(v) => handleFilterChange('subCityId', v)}
              subCities={subCities}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.tabia.label')}</label>
              <input
                type="text"
                value={filters.tabia}
                onChange={(e) => handleFilterChange('tabia', e.target.value)}
                placeholder={t('filters.tabia.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.ketena.label')}</label>
              <input
                type="text"
                value={filters.ketena}
                onChange={(e) => handleFilterChange('ketena', e.target.value)}
                placeholder={t('filters.ketena.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>
          </div>

          {/* Row 2: More filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.block.label')}</label>
              <input
                type="text"
                value={filters.block}
                onChange={(e) => handleFilterChange('block', e.target.value)}
                placeholder={t('filters.block.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>

            <StatusFilter
              label={t('filters.parcelStatus.label')}
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
              options={[
                { value: 'ACTIVE', label: t('statusOptions.active') },
                { value: 'RETIRED', label: t('statusOptions.retired') },
                { value: 'PENDING', label: t('statusOptions.pending') }
              ]}
              disabled={isLoadingOptions}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.tenderNumber.label')}</label>
              <input
                type="text"
                value={filters.tender}
                onChange={(e) => handleFilterChange('tender', e.target.value)}
                placeholder={t('filters.tenderNumber.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>
          </div>

          {/* Row 3: Select filters from config */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.landUse.label')}</label>
              <select
                value={filters.landUse}
                onChange={(e) => handleFilterChange('landUse', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              >
                <option value="">{t('filters.landUse.all')}</option>
                {landUseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.description || option.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.tenureType.label')}</label>
              <select
                value={filters.tenureType}
                onChange={(e) => handleFilterChange('tenureType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              >
                <option value="">{t('filters.tenureType.all')}</option>
                {tenureTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.description || option.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.landGrade.label')}</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={filters.landGrade || ''}
                onChange={(e) => handleFilterChange('landGrade', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder={t('filters.landGrade.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingOptions}
              />
            </div>
          </div>

          {/* Row 4: Area range */}
          <NumberRangeFilter
            label={t('filters.areaRange.label')}
            minName={t('filters.areaRange.label')}
            maxName={t('filters.areaRange.label')}
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
              status: 'ACTIVE' as LandStatus,
              tender: ''
            })}
            onExport={null}
            isLoading={isLoading || isLoadingOptions || isExporting}
            activeFilterCount={activeFilterCount}
          >
            <LandParcelsExport
              data={data}
              filters={filters}
              onExportStart={() => setIsExporting(true)}
              onExportComplete={() => setIsExporting(false)}
              onExportError={() => setIsExporting(false)}
            />
          </FilterActions>
        </div>
      }
    >
      <BaseTable
        data={data}
        columns={columns}
        isLoading={isLoading && !initialLoadDone}
        emptyMessage={t('empty')}
        onRowClick={renderExpandedRow}
      />
    </ReportsLayout>
  );
};
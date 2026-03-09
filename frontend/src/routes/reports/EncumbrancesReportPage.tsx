// EncumbrancesReportPage.tsx
import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable, type Column, ExpandableRow } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  DateRangeFilter,
  StatusFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { EncumbrancesExport } from '../../components/reports/EncumbrancesExport';
import { reportService } from '../../services/reportService';
import { getSubCities } from '../../services/cityAdminService';
import type { EncumbranceReportItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslate } from '../../i18n/useTranslate';

type EncumbranceStatus = 'ACTIVE' | 'RELEASED';

export const EncumbrancesReportPage: React.FC = () => {
  const { t } = useTranslate('encumbrancesReport');
  const { user } = useAuth();
  const [data, setData] = useState<EncumbranceReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [subCities, setSubCities] = useState<Array<{ sub_city_id: string; name: string }>>([]);

const [filters, setFilters] = useState({
    subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    from_date: '',
    to_date: '',
    status: 'ACTIVE' as EncumbranceStatus,
    type: ''
});

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  // Load sub-cities for admin
  useEffect(() => {
    if (user?.role === 'CITY_ADMIN') {
      const fetchSubCities = async () => {
        try {
          const response = await getSubCities();
          setSubCities(response.data?.sub_cities || []);
        } catch (error) {
          console.error(t('errors.subCitiesFailed'), error);
        }
      };
      fetchSubCities();
    }
  }, [user]);

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
      const response = await reportService.getEncumbrancesReport(filters);
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

  const columns: Column<EncumbranceReportItem>[] = [
    {
      key: 'parcel',
      header: t('columns.parcel'),
      render: (item) => (
        <div>
          <div className="font-medium">{item.land_parcel.upin}</div>
          <div className="text-xs text-gray-500">{item.land_parcel.file_number}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: t('columns.location'),
      render: (item) => (
        <div>
          <div>{item.land_parcel.sub_city.name}</div>
          <div className="text-xs text-gray-500">
            {[item.land_parcel.tabia, item.land_parcel.ketena, item.land_parcel.block]
              .filter(Boolean)
              .join(' / ')}
          </div>
        </div>
      )
    },
    {
      key: 'owners',
      header: t('columns.owners'),
      render: (item) => (
        <> 
          <div className="font-bold mb-2">
            {item.land_parcel.owners?.length || 0} Owners
          </div>
          {item.land_parcel.owners?.map((ownerWrapper, index) => (
            <div key={index} className="mb-4"> 
              <div className="text-sm font-medium">
                {ownerWrapper.owner.full_name}
              </div>
              <div className="text-xs text-gray-500">
                {[ownerWrapper.owner.phone_number]
                  .filter(Boolean) 
                  .join(" | ")}
              </div>
            </div>
          ))}
        </>
      )
    },
    {
      key: 'issuing_entity',
      header: t('columns.issuingEntity'),
      render: (item) => item.issuing_entity || '-'
    },
    {
      key: 'status',
      header: t('columns.status'),
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status === 'ACTIVE' ? t('status.active') : t('status.released')}
        </span>
      )
    },
    {
      key: 'registration_date',
      header: t('columns.registrationDate'),
      render: (item) => new Date(item.registration_date).toLocaleDateString()
    }
  ];

  const renderExpandedRow = (item: EncumbranceReportItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('expandedRow.referenceInfo')}</h4>
          <ExpandableRow label={t('expandedRow.referenceNo')} value={item.reference_number || '-'} />
          <ExpandableRow label={t('expandedRow.issuingEntity')} value={item.issuing_entity || '-'} />
        </div>
      </div>
    </div>
  );

  return (
    <ReportsLayout
      title={t('title')}
      description={t('description')}
      filterCount={activeFilterCount}
      onRefresh={fetchData}
      isLoading={isLoading || isExporting}
      filters={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SubCityFilter
              value={filters.subCityId}
              onChange={(v) => handleFilterChange('subCityId', v)}
              subCities={subCities}
            />
            
            <StatusFilter
              label={t('filters.encumbranceStatus.label')}
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'RELEASED', label: 'Released' }
              ]}
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.encumbranceType.label')}</label>
              <input
                type="text"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                placeholder={t('filters.encumbranceType.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <DateRangeFilter
            from_date={filters.from_date}
            to_date={filters.to_date}
            onFromDateChange={(v) => handleFilterChange('from_date', v)}
            onToDateChange={(v) => handleFilterChange('to_date', v)}
          />

          <FilterActions
            onApply={fetchData}
            onClear={() => setFilters({ 
              subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '', 
              from_date: '', 
              to_date: '', 
              status: "ACTIVE", 
              type: '' 
            })}
            onExport={null}
            isLoading={isLoading}
            activeFilterCount={activeFilterCount}
          >
            <EncumbrancesExport
              data={data}
              filters={filters}
              subCities={subCities}
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
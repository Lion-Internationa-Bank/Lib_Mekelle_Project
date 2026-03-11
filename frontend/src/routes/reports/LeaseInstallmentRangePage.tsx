import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable, type Column, ExpandableRow } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  NumberRangeFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { reportService } from '../../services/reportService';
import { getSubCities } from '../../services/cityAdminService';
import type { LeaseInstallmentItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';
import { LeaseInstallmentExport } from '../../components/reports/LeaseInstallmentExport';
import { useTranslate } from '../../i18n/useTranslate';

export const LeaseInstallmentRangePage: React.FC = () => {
  const { t } = useTranslate('leaseInstallmentRange'); // ← namespace matches file name
  const { user } = useAuth();

  const [data, setData] = useState<LeaseInstallmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [subCities, setSubCities] = useState<Array<{ sub_city_id: string; name: string }>>([]);

  const [filters, setFilters] = useState({
    subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    min: 0,
    max: 1000000
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '' && v !== 0 && v !== 1000000).length;

  // Load sub-cities for CITY_ADMIN
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
  }, [user, t]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const validateFilters = (): boolean => {
    if (filters.min > filters.max) {
      setValidationError(t('validation.minGreaterThanMax'));
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
      console.error(t('errors.fetchFailed'), error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const columns: Column<LeaseInstallmentItem>[] = [
    {
      key: 'parcel',
      header: t('columns.parcel'),
      render: (item) => (
        <div>
          <div className="font-medium">{item.parcel.upin}</div>
          <div className="text-xs text-gray-500">{item.parcel.file_number || t('common.notSet')}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: t('columns.location'),
      render: (item) => (
        <div>
          <div>{item.parcel.sub_city_name || t('common.notSet')}</div>
          <div className="text-xs text-gray-500">
            {[item.parcel.tabia, item.parcel.ketena, item.parcel.block]
              .filter(Boolean)
              .join(' / ') || t('common.notSet')}
          </div>
        </div>
      )
    },
    {
      key: 'annual_installment',
      header: t('columns.annualInstallment'),
      render: (item) => (
        <div className="font-medium text-green-600">
          {item.lease.annual_installment.toLocaleString()} {t('common.currency.etb')}
        </div>
      )
    },
    {
      key: 'lease_status',
      header: t('columns.leaseStatus'),
      render: (item) => {
        const status = item.lease.status;
        let className = 'bg-gray-100 text-gray-800';

        if (status === 'ACTIVE') className = 'bg-green-100 text-green-800';
        else if (status === 'EXPIRED') className = 'bg-red-100 text-red-800';
        else if (status === 'PENDING') className = 'bg-yellow-100 text-yellow-800';

        return (
          <span className={`px-2 py-1 text-xs rounded-full ${className}`}>
            {t(`status.${status.toLowerCase()}`, { defaultValue: status })}
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
            {item.owners.length}
          </span>
        </div>
      )
    }
  ];

  const renderExpandedRow = (item: LeaseInstallmentItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expanded.parcelDetails')}</h4>
          <ExpandableRow label={t('expanded.area')} value={`${item.parcel.total_area_m2 || t('common.notSet')} m²`} />
          <ExpandableRow label={t('expanded.landUse')} value={item.parcel.land_use || t('common.notSet')} />
          <ExpandableRow label={t('expanded.tenure')} value={item.parcel.tenure_type || t('common.notSet')} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expanded.leaseDetails')}</h4>
          <ExpandableRow label={t('expanded.leaseId')} value={item.lease.lease_id?.slice(0, 8) + '...' || t('common.notSet')} />
          <ExpandableRow label={t('expanded.annualInstallment')} value={`${item.lease.annual_installment.toLocaleString()} ${t('common.currency.etb')}`} />
          <ExpandableRow label={t('expanded.status')} value={t(`status.${item.lease.status.toLowerCase()}`, { defaultValue: item.lease.status })} />
          <ExpandableRow label={t('expanded.startDate')} value={new Date(item.lease.start_date).toLocaleDateString()} />
          {item.lease.expiry_date && (
            <ExpandableRow label={t('expanded.expiryDate')} value={new Date(item.lease.expiry_date).toLocaleDateString()} />
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('expanded.owners', { count: item.owners.length })}
        </h4>
        <div className="bg-white rounded border border-gray-200 divide-y max-h-64 overflow-y-auto">
          {item.owners.map((owner) => (
            <div key={owner.owner_id} className="p-3 text-sm hover:bg-gray-50">
              <div className="font-medium">{owner.full_name || t('common.notSet')}</div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                <span>ID: {owner.national_id || t('common.notSet')}</span>
                <span>TIN: {owner.tin_number || t('common.notSet')}</span>
                <span>{t('expanded.phone')}: {owner.phone_number || t('common.notSet')}</span>
                <span>{t('expanded.acquired')}: {new Date(owner.acquired_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SubCityFilter
              value={filters.subCityId}
              onChange={(v) => handleFilterChange('subCityId', v)}
              subCities={subCities}
            />
          </div>

          <NumberRangeFilter
            label={t('filters.annualInstallmentRange.label')}
            minName={t('filters.annualInstallmentRange.min')}
            maxName={t('filters.annualInstallmentRange.max')}
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
            onExport={null}
            isLoading={isLoading || isExporting}
            activeFilterCount={activeFilterCount}
          >
            <LeaseInstallmentExport
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
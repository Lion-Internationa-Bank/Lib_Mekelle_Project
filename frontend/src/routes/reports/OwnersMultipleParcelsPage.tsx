import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable, type Column } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { OwnersMultipleParcelsExport } from '../../components/reports/OwnersMultipleParcelsExport';
import { reportService } from '../../services/reportService';
import { getSubCities } from '../../services/cityAdminService';
import type { OwnerMultipleParcelsItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslate } from '../../i18n/useTranslate';

export const OwnersMultipleParcelsPage: React.FC = () => {
  const { t } = useTranslate('ownersMultipleParcels');
  const { user } = useAuth();
  const [data, setData] = useState<OwnerMultipleParcelsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [subCities, setSubCities] = useState<Array<{ sub_city_id: string; name: string }>>([]);
  
  const [filters, setFilters] = useState({
    subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    minParcels: 2
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
  }, [user, t]);

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
      console.error(t('errors.fetchFailed'), error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const columns: Column<OwnerMultipleParcelsItem>[] = [
    {
      key: 'full_name',
      header: t('columns.owner'),
      render: (item) => (
        <div>
          <div className="font-medium">{item.full_name}</div>
          <div className="text-xs text-gray-500">{item.national_id || t('columns.noNationalId')}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: t('columns.contact'),
      render: (item) => (
        <div>
          <div>{item.phone_number || '-'}</div>
          <div className="text-xs text-gray-500">{t('columns.tin', { tin: item.tin_number || '-' })}</div>
        </div>
      )
    },
    {
      key: 'sub_city_name',
      header: t('columns.subCity')
    },
    {
      key: 'parcel_count',
      header: t('columns.parcelCount'),
      render: (item) => (
        <div className="flex flex-col gap-3 p-2">
          <div>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold tracking-wide">
              {t('parcelCount.badge', { count: item.parcel_count })}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {item.parcels.map((parcel, index) => (
              <div 
                key={index} 
                className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-normal">{t('parcelCount.upin')}</span>
                  {parcel.upin}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span className="bg-gray-200 h-1 w-1 rounded-full"></span>
                  {t('parcelCount.details', { 
                    fileNumber: parcel.file_number, 
                    area: parcel.total_area_m2 
                  })}
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
      <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expandedRow.ownedParcels')}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {item.parcels.map((parcel) => (
          <div key={parcel.upin} className="bg-white p-3 rounded border border-gray-200">
            <div className="font-medium text-sm">{t('expandedRow.upin', { upin: parcel.upin })}</div>
            <div className="text-xs text-gray-500">{t('expandedRow.fileNumber', { number: parcel.file_number })}</div>
            <div className="text-xs mt-1">
              <span className="text-gray-600">{t('expandedRow.location', { 
                tabia: parcel.tabia || '-', 
                ketena: parcel.ketena || '-' 
              })}</span>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span>{parcel.total_area_m2 ? t('expandedRow.area', { area: parcel.total_area_m2 }) : 'N/A'}</span>
              <span className={`px-2 py-0.5 rounded-full ${
                parcel.status === 'ACTIVE' ? t('status.colors.active') : 
                parcel.status === 'RETIRED' ? t('status.colors.retired') : 
                parcel.status === 'PENDING' ? t('status.colors.pending') : 'bg-gray-100'
              }`}>
                {parcel.status === 'ACTIVE' ? t('status.active') : 
                 parcel.status === 'RETIRED' ? t('status.retired') : 
                 parcel.status === 'PENDING' ? t('status.pending') : parcel.status}
              </span>
            </div>
          </div>
        ))}
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
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('filters.minimumParcels.label')}</label>
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
            onExport={null}
            isLoading={isLoading || isExporting}
            activeFilterCount={activeFilterCount}
          >
            <OwnersMultipleParcelsExport
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
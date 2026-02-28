import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable,type Column, ExpandableRow } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  DateRangeFilter,
  StatusFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { reportService } from '../../services/reportService';
import { getSubCities } from '../../services/cityAdminService';
import type { EncumbranceReportItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';

export const EncumbrancesReportPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EncumbranceReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [subCities, setSubCities] = useState<Array<{ sub_city_id: string; name: string }>>([]);
  
  // Filter state with default values
  const [filters, setFilters] = useState({
    subCityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    from_date: '',
    to_date: '',
    status: '',
    type: ''
  });

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  // Load sub-cities for admin
  useEffect(() => {
    if (user?.role === 'CITY_ADMIN') {
      // Fetch sub-cities from your API
      const fetchSubCities = async () => {
        try {
          const response = await getSubCities();
          console.log("sub city",response)
          setSubCities(response.data?.sub_cities);
        } catch (error) {
          console.error('Error fetching sub-cities:', error);
        }
      };
      fetchSubCities();
    }
  }, [user]);

  // Auto-fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array = runs once on mount

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getEncumbrancesReport(filters);
      console.log("response from encumbrance data ",response)
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching encumbrances:', error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const handleExport = async () => {
    try {
      await reportService.exportEncumbrancesReport(filters);
    } catch (error) {
      console.error('Error exporting encumbrances:', error);
    }
  };

  const columns: Column<EncumbranceReportItem>[] = [
    {
      key: 'parcel',
      header: 'Parcel',
      render: (item) => (
        <div>
          <div className="font-medium">{item.land_parcel.upin}</div>
          <div className="text-xs text-gray-500">{item.land_parcel.file_number}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
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
    key:'owners',
    header:'Owners',
    render:(item) => (
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
      header: 'Issuing Entity',
      render: (item) => item.issuing_entity || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'registration_date',
      header: 'Registration Date',
      render: (item) => new Date(item.registration_date).toLocaleDateString()
    }
  ];

  const renderExpandedRow = (item: EncumbranceReportItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Reference Information</h4>
          <ExpandableRow label="Reference No" value={item.reference_number || '-'} />
          <ExpandableRow label="Issuing Entity" value={item.issuing_entity || '-'} />
        </div>
      </div>
    </div>
  );

  return (
    <ReportsLayout
      title="Encumbrances Report"
      description="View and filter encumbrances with optional date range"
      filterCount={activeFilterCount}
      onRefresh={fetchData}
      isLoading={isLoading}
      filters={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SubCityFilter
              value={filters.subCityId}
              onChange={(v) => handleFilterChange('subCityId', v)}
              subCities={subCities}
            />
            
            <StatusFilter
              label="Encumbrance Status"
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'RELEASED', label: 'Released' }
              ]}
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Encumbrance Type</label>
              <input
                type="text"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                placeholder="e.g., Mortgage, Lien"
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
              status: '', 
              type: '' 
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
        emptyMessage="No encumbrances found"
        onRowClick={renderExpandedRow}
      />
    </ReportsLayout>
  );
};
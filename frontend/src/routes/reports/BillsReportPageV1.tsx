// src/pages/reports/BillsReportPage.tsx
import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BaseTable, type Column, ExpandableRow } from '../../components/reports/tables/BaseTable';
import {
  SubCityFilter,
  DateRangeFilter,
  StatusFilter,
  FilterActions
} from '../../components/reports/filters/BaseFilters';
import { BillsExport } from '../../components/reports/BillsExport';
import { reportService } from '../../services/reportService';
import { getSubCities } from '../../services/cityAdminService';
import type { BillReportItem } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';

// Status options for bills
const BILL_STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PARTIAL', label: 'Partial' }
];

export const BillsReportPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<BillReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [subCities, setSubCities] = useState<Array<{ sub_city_id: string; name: string }>>([]);
  
  // Filter state with default values
  const [filters, setFilters] = useState({
    subcityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '',
    fromDate: '',
    toDate: '',
    status: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  // Load sub-cities for admin
  useEffect(() => {
    if (user?.role === 'CITY_ADMIN') {
      const fetchSubCities = async () => {
        try {
          const response = await getSubCities();
          setSubCities(response.data?.sub_cities || []);
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
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const validateFilters = (): boolean => {
    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      
      if (from > to) {
        setValidationError('From date cannot be greater than to date');
        return false;
      }
    }
    return true;
  };

  const fetchData = async () => {
    if (!validateFilters()) return;
    
    setIsLoading(true);
    try {
      const response = await reportService.getBillsReport(filters);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const columns: Column<BillReportItem>[] = [
    {
      key: 'upin',
      header: 'UPIN',
      render: (item) => (
        <div>
          <div className="font-medium">{item.upin}</div>
          <div className="text-xs text-gray-500">Installment #{item.installment_number}</div>
        </div>
      )
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (item) => (
        <div>
          <div className="font-medium">{item.full_name}</div>
          <div className="text-xs text-gray-500">{item.phone_number}</div>
        </div>
      )
    },
    {
      key: 'subcity',
      header: 'Sub City',
      render: (item) => item.subcity_name
    },
    {
      key: 'amount',
      header: 'Amount Due',
      render: (item) => (
        <div className="font-medium text-gray-900">
          {item.amount_due.toLocaleString()} ETB
        </div>
      )
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (item) => new Date(item.due_date).toLocaleDateString()
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors = {
          PAID: 'bg-green-100 text-green-800',
          UNPAID: 'bg-yellow-100 text-yellow-800',
          OVERDUE: 'bg-red-100 text-red-800',
          PARTIAL: 'bg-blue-100 text-blue-800'
        };
        const colorClass = statusColors[item.payment_status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
            {item.payment_status}
          </span>
        );
      }
    },
    {
      key: 'fiscal_year',
      header: 'Fiscal Year',
      render: (item) => item.fiscal_year || '-'
    }
  ];

  const renderExpandedRow = (item: BillReportItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-6">
        {/* Bill Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Bill Details</h4>
          <div className="space-y-2">
            <ExpandableRow label="UPIN" value={item.upin} />
            <ExpandableRow label="Installment Number" value={item.installment_number.toString()} />
            <ExpandableRow label="Fiscal Year" value={item.fiscal_year || '-'} />
            <ExpandableRow label="Base Payment" value={`${item.base_payment.toLocaleString()} ETB`} />
            <ExpandableRow label="Amount Due" value={`${item.amount_due.toLocaleString()} ETB`} />
            <ExpandableRow label="Due Date" value={new Date(item.due_date).toLocaleDateString()} />
            <ExpandableRow label="Payment Status" value={item.payment_status} />
          </div>
        </div>

        {/* Interest & Penalty */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Interest & Penalty</h4>
          <div className="space-y-2">
            <ExpandableRow label="Interest Amount" value={`${item.interest_amount?.toLocaleString() || 0} ETB`} />
            <ExpandableRow label="Interest Rate" value={item.interest_rate_used ? `${item.interest_rate_used}%` : '-'} />
            <ExpandableRow label="Penalty Amount" value={`${item.penalty_amount?.toLocaleString() || 0} ETB`} />
            <ExpandableRow label="Penalty Rate" value={item.penalty_rate_used ? `${item.penalty_rate_used}%` : '-'} />
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Owner Information</h4>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Full Name</div>
              <div className="text-sm font-medium">{item.full_name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Phone Number</div>
              <div className="text-sm">{item.phone_number}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Sub City</div>
              <div className="text-sm">{item.subcity_name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ReportsLayout
      title="Bills Report"
      description="View and filter bills by sub-city, date range, and payment status"
      filterCount={activeFilterCount}
      onRefresh={fetchData}
      isLoading={isLoading || isExporting}
      filters={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SubCityFilter
              value={filters.subcityId}
              onChange={(v) => handleFilterChange('subcityId', v)}
              subCities={subCities}
            />
            
            <StatusFilter
              label="Payment Status"
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
              options={BILL_STATUS_OPTIONS}
            />
          </div>

          <DateRangeFilter
            from_date={filters.fromDate}
            to_date={filters.toDate}
            onFromDateChange={(v) => handleFilterChange('fromDate', v)}
            onToDateChange={(v) => handleFilterChange('toDate', v)}
          />

          {validationError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {validationError}
            </div>
          )}

          <FilterActions
            onApply={fetchData}
            onClear={() => setFilters({ 
              subcityId: user?.role !== 'CITY_ADMIN' ? user?.sub_city_id || '' : '', 
              fromDate: '', 
              toDate: '', 
              status: '' 
            })}
            onExport={null}
            isLoading={isLoading || isExporting}
            activeFilterCount={activeFilterCount}
          >
            <BillsExport
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
        emptyMessage="No bills found"
        onRowClick={renderExpandedRow}
      />
    </ReportsLayout>
  );
};
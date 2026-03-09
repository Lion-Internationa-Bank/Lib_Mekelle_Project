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
import { useTranslate } from '../../i18n/useTranslate';



export const BillsReportPage: React.FC = () => {
  const { t } = useTranslate('billsReport');
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
    setValidationError(null);
  };

  const validateFilters = (): boolean => {
    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      
      if (from > to) {
        setValidationError(t('validation.dateRange'));
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
      console.error(t('errors.fetchFailed'), error);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };

  const columns: Column<BillReportItem>[] = [
    {
      key: 'upin',
      header: t('columns.upin'),
      render: (item) => (
        <div>
          <div className="font-medium">{t('upin.upin', { upin: item.upin })}</div>
          <div className="text-xs text-gray-500">{t('upin.installment', { number: item.installment_number })}</div>
        </div>
      )
    },
    {
      key: 'owner',
      header: t('columns.owner'),
      render: (item) => (
        <div>
          <div className="font-medium">{t('owner.name', { name: item.full_name })}</div>
          <div className="text-xs text-gray-500">{t('owner.phone', { phone: item.phone_number })}</div>
        </div>
      )
    },
    {
      key: 'subcity',
      header: t('columns.subCity'),
      render: (item) => item.subcity_name
    },
    {
      key: 'amount',
      header: t('columns.amountDue'),
      render: (item) => (
        <div className="font-medium text-gray-900">
          {t('amount.due', { amount: item.amount_due.toLocaleString() })}
        </div>
      )
    },
    {
      key: 'due_date',
      header: t('columns.dueDate'),
      render: (item) => new Date(item.due_date).toLocaleDateString()
    },
    {
      key: 'status',
      header: t('columns.status'),
      render: (item) => {
        const statusColors = {
          PAID: t('status.colors.paid'),
          UNPAID: t('status.colors.unpaid'),
          OVERDUE: t('status.colors.overdue'),
          PARTIAL: t('status.colors.partial')
        };
        const colorClass = statusColors[item.payment_status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
            {item.payment_status === 'PAID' ? t('status.paid') :
             item.payment_status === 'UNPAID' ? t('status.unpaid') :
             item.payment_status === 'OVERDUE' ? t('status.overdue') :
             item.payment_status === 'PARTIAL' ? t('status.partial') : item.payment_status}
          </span>
        );
      }
    },
    {
      key: 'fiscal_year',
      header: t('columns.fiscalYear'),
      render: (item) => item.fiscal_year || '-'
    }
  ];

  const renderExpandedRow = (item: BillReportItem) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-6">
        {/* Bill Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expandedRow.billDetails')}</h4>
          <div className="space-y-2">
            <ExpandableRow label={t('expandedRow.upin')} value={item.upin} />
            <ExpandableRow label={t('expandedRow.installmentNumber')} value={item.installment_number.toString()} />
            <ExpandableRow label={t('expandedRow.fiscalYear')} value={item.fiscal_year || t('expandedRow.notAvailable')} />
            <ExpandableRow label={t('expandedRow.basePayment')} value={t('expandedRow.value', { value: item.base_payment.toLocaleString() })} />
            <ExpandableRow label={t('expandedRow.amountDue')} value={t('expandedRow.value', { value: item.amount_due.toLocaleString() })} />
            <ExpandableRow label={t('expandedRow.dueDate')} value={new Date(item.due_date).toLocaleDateString()} />
            <ExpandableRow label={t('expandedRow.paymentStatus')} value={
              item.payment_status === 'PAID' ? t('status.paid') :
              item.payment_status === 'UNPAID' ? t('status.unpaid') :
              item.payment_status === 'OVERDUE' ? t('status.overdue') :
              item.payment_status === 'PARTIAL' ? t('status.partial') : item.payment_status
            } />
          </div>
        </div>

        {/* Interest & Penalty */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expandedRow.interestAndPenalty')}</h4>
          <div className="space-y-2">
            <ExpandableRow label={t('expandedRow.interestAmount')} value={t('expandedRow.value', { value: item.interest_amount?.toLocaleString() || 0 })} />
            <ExpandableRow label={t('expandedRow.interestRate')} value={item.interest_rate_used ? t('expandedRow.rate', { rate: item.interest_rate_used }) : t('expandedRow.notAvailable')} />
            <ExpandableRow label={t('expandedRow.penaltyAmount')} value={t('expandedRow.value', { value: item.penalty_amount?.toLocaleString() || 0 })} />
            <ExpandableRow label={t('expandedRow.penaltyRate')} value={item.penalty_rate_used ? t('expandedRow.rate', { rate: item.penalty_rate_used }) : t('expandedRow.notAvailable')} />
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">{t('expandedRow.ownerInformation')}</h4>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">{t('expandedRow.fullName')}</div>
              <div className="text-sm font-medium">{item.full_name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t('expandedRow.phoneNumber')}</div>
              <div className="text-sm">{item.phone_number}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t('expandedRow.subCity')}</div>
              <div className="text-sm">{item.subcity_name}</div>
            </div>
          </div>
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
              value={filters.subcityId}
              onChange={(v) => handleFilterChange('subcityId', v)}
              subCities={subCities}
            />
            
            <StatusFilter
              label={t('filters.paymentStatus.label')}
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
              options={[
                { value: 'PAID', label: t('statusOptions.paid') },
                { value: 'UNPAID', label: t('statusOptions.unpaid') },
                { value: 'OVERDUE', label: t('statusOptions.overdue') },
                { value: 'PARTIAL', label: t('statusOptions.partial') }
              ]}
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
        emptyMessage={t('empty')}
        onRowClick={renderExpandedRow}
      />
    </ReportsLayout>
  );
};
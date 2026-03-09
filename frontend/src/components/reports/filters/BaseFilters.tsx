// src/components/reports/filters/BaseFilters.tsx
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslate } from '../../../i18n/useTranslate';

export interface FilterProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onApply: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export const SubCityFilter: React.FC<{
  value?: string;
  onChange: (value: string) => void;
  subCities?: Array<{ sub_city_id: string; name: string }>;
  disabled?: boolean;
}> = ({ value, onChange, subCities = [], disabled = false }) => {
  const { t } = useTranslate('reportFilters');
  const { user } = useAuth();

  // If user is not CITY_ADMIN, they can only see their own sub-city
  if (user?.role !== 'CITY_ADMIN') {
    return null;
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{t('subCity.label')}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">{t('subCity.all')}</option>
        {subCities.map((sc) => (
          <option key={sc.sub_city_id} value={sc.sub_city_id}>
            {sc.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export const DateRangeFilter: React.FC<{
  from_date?: string;
  to_date?: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  disabled?: boolean;
}> = ({ from_date, to_date, onFromDateChange, onToDateChange, disabled = false }) => {
  const { t } = useTranslate('reportFilters');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{t('dateRange.from')}</label>
        <input
          type="date"
          value={from_date || ''}
          onChange={(e) => onFromDateChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{t('dateRange.to')}</label>
        <input
          type="date"
          value={to_date || ''}
          onChange={(e) => onToDateChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export const NumberRangeFilter: React.FC<{
  label: string;
  minName: string;
  maxName: string;
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  disabled?: boolean;
}> = ({ label, minName, maxName, minValue, maxValue, onMinChange, onMaxChange, disabled = false }) => {
  const { t } = useTranslate('reportFilters');

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder={t('numberRange.min', { name: minName })}
          value={minValue || ''}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
          disabled={disabled}
          min={0}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder={t('numberRange.max', { name: maxName })}
          value={maxValue || ''}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
          disabled={disabled}
          min={0}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export const StatusFilter: React.FC<{
  value?: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label?: string;
  disabled?: boolean;
}> = ({ value, onChange, options, label, disabled = false }) => {
  const { t } = useTranslate('reportFilters');
  const filterLabel = label || t('status.label');

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{filterLabel}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">{t('status.all')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const FilterActions: React.FC<{
  onApply: () => void;
  onClear: () => void;
  onExport?: (() => void) | null;
  isLoading?: boolean;
  activeFilterCount?: number;
  children?: React.ReactNode;
}> = ({ onApply, onClear, onExport, isLoading = false, activeFilterCount = 0, children }) => {
  const { t } = useTranslate('reportFilters');

  return (
    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
      <button
        onClick={onApply}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {t('filterActions.apply')}
      </button>
      <button
        onClick={onClear}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {t('filterActions.clear')}
      </button>
      
      {/* Use either the onExport prop or children for export functionality */}
      {onExport && (
        <button
          onClick={onExport}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ml-auto"
        >
          {t('filterActions.export')}
        </button>
      )}
      
      {children}
      
      {activeFilterCount > 0 && (
        <span className="text-xs text-gray-500">
          {activeFilterCount === 1 
            ? t('filterActions.activeFilter', { count: activeFilterCount })
            : t('filterActions.activeFilters', { count: activeFilterCount })
          }
        </span>
      )}
    </div>
  );
};
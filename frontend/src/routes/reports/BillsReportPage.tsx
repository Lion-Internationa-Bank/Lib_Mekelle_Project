// src/routes/reports/BillsReportPage.tsx
import React, { useState, useEffect } from 'react';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
// import { reportApi, type BillFilters } from '../../services/reportApi';
import { reportApi,type BillFilters } from '../../services/api/reportApi';
import { getSubCities, type SubCity } from '../../services/cityAdminService';

const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'OVERDUE', label: 'Overdue' },
];

export const BillsReportPage: React.FC = () => {
  const [filters, setFilters] = useState<BillFilters>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [subCities, setSubCities] = useState<SubCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<{
    from: boolean;
    to: boolean;
  }>({ from: false, to: false });

  // Fetch subcities for filter dropdown using cityAdminService
  useEffect(() => {
    const fetchSubCities = async () => {
      const response = await getSubCities();
      if (response.success && response.data) {
        setSubCities(response.data.sub_cities);
      } else {
        console.error('Failed to fetch subcities:', response.error);
      }
    };
    fetchSubCities();
  }, []);

  // Update active filter count
  useEffect(() => {
    let count = 0;
    if (filters.subcityId) count++;
    if (filters.status) count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    setActiveFilterCount(count);
  }, [filters]);

  const formatDateToISO = (date: Date): string => {
    // Format as ISO string (e.g., 2024-01-15T00:00:00.000Z)
    return date.toISOString();
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare filters with ISO date format
      const apiFilters: BillFilters = {
        ...filters,
        fromDate: filters.fromDate ? formatDateToISO(new Date(filters.fromDate)) : undefined,
        toDate: filters.toDate ? formatDateToISO(new Date(filters.toDate)) : undefined,
      };
      
      console.log('Sending filters with ISO dates:', apiFilters); // For debugging
      
      const blob = await reportApi.downloadBillsReport(apiFilters);
      
      if (!blob) {
        setError('Failed to download report');
        return;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp and filters (using YYYY-MM-DD for filename)
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      let filename = `bills_report_${timestamp}`;
      
      if (filters.subcityId) {
        const subcity = subCities.find(s => s.sub_city_id === filters.subcityId);
        if (subcity) filename += `_${subcity.name.replace(/\s+/g, '_')}`;
      }
      if (filters.status) filename += `_${filters.status.toLowerCase()}`;
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filename += `_from_${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
      }
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        filename += `_to_${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
      }
      
      filename += '.xlsx';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Report downloaded successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setError(null);
  };

  // Custom Date Picker Component
  const DatePicker = ({ 
    date, 
    onSelect, 
    isOpen, 
    onToggle,
    placeholder = "Select date"
  }: { 
    date?: Date; 
    onSelect: (date: Date | undefined) => void; 
    isOpen: boolean; 
    onToggle: () => void;
    placeholder?: string;
  }) => {
    const pickerRef = React.useRef<HTMLDivElement>(null);
    const [currentMonth, setCurrentMonth] = useState(date || new Date());

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          onToggle();
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggle]);

    const daysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const days = daysInMonth(currentMonth);
      
      const calendar = [];
      let day = 1;
      
      for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
          if (i === 0 && j < firstDay) {
            week.push(null);
          } else if (day <= days) {
            week.push(new Date(year, month, day));
            day++;
          } else {
            week.push(null);
          }
        }
        calendar.push(week);
      }
      
      return calendar;
    };

    const isSameDay = (d1: Date, d2: Date) => {
      return d1 && d2 && 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
    };

    const formatDisplayDate = (date: Date): string => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const formatMonthYear = (date: Date): string => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
      <div className="relative" ref={pickerRef}>
        <button
          onClick={onToggle}
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/10 focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] focus:border-transparent text-[#2a2718]"
        >
          <span className={date ? 'text-[#2a2718]' : 'text-[#2a2718]/70'}>
            {date ? formatDisplayDate(date) : placeholder}
          </span>
          <svg className="w-4 h-4 text-[#f0cd6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-[#f0cd6e] p-3 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-1 hover:bg-[#f0cd6e]/10 rounded"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-[#2a2718]">
                {formatMonthYear(currentMonth)}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-1 hover:bg-[#f0cd6e]/10 rounded"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-[#2a2718]/70 text-center w-8">
                  {day}
                </div>
              ))}
            </div>

            {generateCalendarDays().map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <button
                    key={dayIndex}
                    onClick={() => {
                      if (day) {
                        onSelect(day);
                        onToggle();
                      }
                    }}
                    disabled={!day}
                    type="button"
                    className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors
                      ${!day ? 'text-[#2a2718]/30 cursor-default' : 'hover:bg-[#f0cd6e]/20 text-[#2a2718]'}
                      ${day && date && isSameDay(day, date)
                        ? 'bg-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]'
                        : ''
                      }
                    `}
                  >
                    {day?.getDate()}
                  </button>
                ))}
              </div>
            ))}

            {date && (
              <div className="mt-2 pt-2 border-t border-[#f0cd6e]">
                <button
                  onClick={() => {
                    onSelect(undefined);
                    onToggle();
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                  type="button"
                >
                  Clear date
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const FilterSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Subcity Filter - Using data from cityAdminService */}
        <div>
          <label className="block text-sm font-medium text-[#2a2718] mb-1">Subcity</label>
          <select
            value={filters.subcityId || ''}
            onChange={(e) => setFilters({ ...filters, subcityId: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] focus:border-transparent text-[#2a2718]"
          >
            <option value="">All Subcities</option>
            {subCities.map((city) => (
              <option key={city.sub_city_id} value={city.sub_city_id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-[#2a2718] mb-1">Payment Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
            className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] focus:border-transparent text-[#2a2718]"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* From Date Filter */}
        <div>
          <label className="block text-sm font-medium text-[#2a2718] mb-1">From Date</label>
          <DatePicker
            date={filters.fromDate ? new Date(filters.fromDate) : undefined}
            onSelect={(date) => {
              // Store the date object, will convert to ISO on download
              setFilters({ 
                ...filters, 
                fromDate: date ? date.toISOString() : undefined 
              });
            }}
            isOpen={showDatePicker.from}
            onToggle={() => setShowDatePicker({ ...showDatePicker, from: !showDatePicker.from })}
            placeholder="Select from date"
          />
        </div>

        {/* To Date Filter */}
        <div>
          <label className="block text-sm font-medium text-[#2a2718] mb-1">To Date</label>
          <DatePicker
            date={filters.toDate ? new Date(filters.toDate) : undefined}
            onSelect={(date) => {
              // Store the date object, will convert to ISO on download
              setFilters({ 
                ...filters, 
                toDate: date ? date.toISOString() : undefined 
              });
            }}
            isOpen={showDatePicker.to}
            onToggle={() => setShowDatePicker({ ...showDatePicker, to: !showDatePicker.to })}
            placeholder="Select to date"
          />
        </div>
      </div>

      {/* Date Range Validation Message */}
      {filters.fromDate && filters.toDate && new Date(filters.fromDate) > new Date(filters.toDate) && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Warning: From date is after To date
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-[#2a2718] bg-white border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/10 focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] focus:ring-offset-2"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </span>
          </button>
        )}
        <button
          onClick={handleDownload}
          disabled={isLoading || (filters.fromDate && filters.toDate && new Date(filters.fromDate) > new Date(filters.toDate))}
          className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] rounded-lg hover:from-[#2a2718] hover:to-[#f0cd6e] focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Report
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
    </div>
  );

  return (
    <ReportsLayout
      title="Bills Report"
      description="Download bills report with filtering by subcity, status, and date range"
      filters={<FilterSection />}
      isLoading={isLoading}
      filterCount={activeFilterCount}
    >
      <div className="p-8 text-center text-[#2a2718]/70 border border-[#f0cd6e] rounded-lg">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-[#f0cd6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#2a2718] mb-2">Download Bills Report</h3>
        <p className="text-sm text-[#2a2718]/70 max-w-md mx-auto">
          Select filters above and click the Download button to generate an Excel report with all bills matching your criteria.
        </p>
        <div className="mt-4 text-xs text-[#2a2718]/70 bg-[#f0cd6e]/5 p-3 rounded-lg max-w-md mx-auto border border-[#f0cd6e]">
          <p className="font-medium text-[#2a2718] mb-1">Report includes:</p>
          <p>UPIN, Installment Number, Fiscal Year, Base Payment, Amount Due, Due Date, Payment Status, Interest Amount, Interest Rate, Penalty Amount, Penalty Rate, Owner Name, and Phone Number</p>
        </div>
      </div>
    </ReportsLayout>
  );
};
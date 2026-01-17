// src/components/DateDisplay.tsx
import React from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import { 
 
  gregorianToEthiopian,
  ethiopianToGregorian,
  type GregorianDate,
  type EthiopianDate,
  getMonthName,
  inputFormatDate
} from '../utils/calendarUtils';

interface DateDisplayProps {
  date: Date | string | GregorianDate | null;
  format?: 'short' | 'medium' | 'full' | 'iso';
  className?: string;
  fallbackText?: string;
  showTooltip?: boolean;
  showCalendarIndicator?: boolean;
  dateOnly?: boolean;
}

const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'medium',
  className = '',
  fallbackText = '-',
  showTooltip = true,
  showCalendarIndicator = true,
  dateOnly = false,
}) => {
  const { 
    formatDateForDisplay, 
    isEthiopian, 
    calendarType,
    convertDateToCalendar 
  } = useCalendar();
  
  const displayText = formatDateForDisplay(date, format);
  
  if (displayText === '-') {
    return <span className={className}>{fallbackText}</span>;
  }
  
  // Get the opposite calendar date for tooltip
  const getOppositeCalendarDate = (): string => {
    if (!date) return '';
    
    try {
      let oppositeDate: string;
      
      if (isEthiopian) {
        // Current is Ethiopian, convert to Gregorian for tooltip
        if (typeof date === 'string' || date instanceof Date || 'month' in date && date.month <= 12) {
          // Input is Gregorian (from backend), use as-is
          const formatted = inputFormatDate(date, 'GREGORIAN', 'full');
          oppositeDate = formatted;
        } else {
          // Input is Ethiopian, need to convert
          const ethDate = date as EthiopianDate;
          const gregDate = ethiopianToGregorian(ethDate);
          oppositeDate = gregDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } else {
        // Current is Gregorian, convert to Ethiopian for tooltip
        if (typeof date === 'string' || date instanceof Date || 'month' in date && date.month <= 12) {
          // Input is Gregorian, need to convert
          let gregDate: GregorianDate;
          
          if (date instanceof Date) {
            gregDate = {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate()
            };
          } else if (typeof date === 'string') {
            const dateObj = new Date(date);
            gregDate = {
              year: dateObj.getFullYear(),
              month: dateObj.getMonth() + 1,
              day: dateObj.getDate()
            };
          } else {
            gregDate = date;
          }
          
          const ethDate = gregorianToEthiopian(gregDate);
          const monthName = getMonthName(ethDate.month, 'ETHIOPIAN');
          oppositeDate = `${ethDate.day} ${monthName} ${ethDate.year} ዓ/ም`;
        } else {
          // Input is already Ethiopian, just format it
          const ethDate = date as EthiopianDate;
          const monthName = getMonthName(ethDate.month, 'ETHIOPIAN');
          oppositeDate = `${ethDate.day} ${monthName} ${ethDate.year} ዓ/ም`;
        }
      }
      
      return oppositeDate;
    } catch (error) {
      console.error('Error converting opposite calendar date:', error);
      return '';
    }
  };
  
  const oppositeDate = showTooltip ? getOppositeCalendarDate() : '';
  
  // Format for display with optional calendar indicator
  const formatDisplayText = (): React.ReactNode => {
    if (dateOnly || !showCalendarIndicator) {
      return displayText;
    }
    
    // Add calendar type indicator as superscript
    const indicator = isEthiopian ? 'EC' : 'GC';
    
    return (
      <>
        {displayText}
        <sup className="text-xs text-gray-500 ml-1" title={`${isEthiopian ? 'Ethiopian' : 'Gregorian'} Calendar`}>
          {indicator}
        </sup>
      </>
    );
  };
  
  // Tooltip content
  const getTooltipContent = (): string => {
    if (!oppositeDate) return '';
    
    const currentCalendar = isEthiopian ? 'Ethiopian' : 'Gregorian';
    const oppositeCalendar = isEthiopian ? 'Gregorian' : 'Ethiopian';
    
    return `${currentCalendar}: ${displayText}\n${oppositeCalendar}: ${oppositeDate}`;
  };
  
  return (
    <span 
      className={`relative inline-block ${className}`}
      title={showTooltip && oppositeDate ? getTooltipContent() : undefined}
    >
      <span className="inline-flex items-center">
        {formatDisplayText()}
      </span>
      
      {/* Enhanced tooltip with better styling */}
      {showTooltip && oppositeDate && (
        <span className="
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 whitespace-pre-line
          shadow-lg z-50 min-w-[180px] text-center
          after:absolute after:top-full after:left-1/2 after:-translate-x-1/2
          after:border-4 after:border-transparent after:border-t-gray-900
        ">
          <div className="font-semibold text-gray-300 mb-1 border-b border-gray-700 pb-1">
            {isEthiopian ? 'Ethiopian → Gregorian' : 'Gregorian → Ethiopian'}
          </div>
          <div className="text-left">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">{isEthiopian ? 'EC' : 'GC'}:</span>
              <span>{displayText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-xs">{isEthiopian ? 'GC' : 'EC'}:</span>
              <span>{oppositeDate}</span>
            </div>
          </div>
        </span>
      )}
    </span>
  );
};

// Enhanced version with date/time display
interface DateTimeDisplayProps extends Omit<DateDisplayProps, 'date'> {
  dateTime: Date | string | GregorianDate | null;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  dateFormat?: DateDisplayProps['format']; // Add dateFormat prop instead
}

export const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  dateTime,
  showTime = true,
  timeFormat = '12h',
  dateFormat = 'short', // Default to 'short' for date portion
  ...props
}) => {
  const { formatDateForDisplay } = useCalendar();
  
  if (!dateTime) {
    return <span className={props.className}>{props.fallbackText || '-'}</span>;
  }
  
  const formatTime = (dateInput: Date | string | GregorianDate): string => {
    try {
      let dateObj: Date;
      
      if (dateInput instanceof Date) {
        dateObj = dateInput;
      } else if (typeof dateInput === 'string') {
        dateObj = new Date(dateInput);
      } else {
        // GregorianDate object
        dateObj = new Date(dateInput.year, dateInput.month - 1, dateInput.day);
      }
      
      if (isNaN(dateObj.getTime())) return '';
      
      if (timeFormat === '12h') {
        return dateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else {
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    } catch {
      return '';
    }
  };
  
  const timeStr = showTime ? formatTime(dateTime) : '';
  const dateStr = formatDateForDisplay(dateTime, dateFormat);
  
  if (!dateStr || dateStr === '-') {
    return <span className={props.className}>{props.fallbackText || '-'}</span>;
  }
  
  return (
    <span className={`inline-flex flex-col ${props.className}`}>
      <DateDisplay 
        date={dateTime} 
        {...props} 
        format={dateFormat} // Use the dateFormat prop
      />
      {showTime && timeStr && (
        <span className="text-xs text-gray-500 mt-0.5">
          {timeStr}
        </span>
      )}
    </span>
  );
};

// Compact version for tables/lists
export const CompactDateDisplay: React.FC<DateDisplayProps> = (props) => {
  return (
    <DateDisplay
      {...props}
      format="short"
      showTooltip={false}
      showCalendarIndicator={false}
      className={`text-sm ${props.className || ''}`}
    />
  );
};

// Date range display component
interface DateRangeDisplayProps {
  startDate: Date | string | GregorianDate | null;
  endDate: Date | string | GregorianDate | null;
  separator?: string;
  className?: string;
  showTooltip?: boolean;
  format?: DateDisplayProps['format'];
}

export const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({
  startDate,
  endDate,
  separator = '→',
  className = '',
  showTooltip = true,
  format = 'short',
}) => {
  const { formatDateForDisplay } = useCalendar();
  
  const startText = formatDateForDisplay(startDate, format);
  const endText = formatDateForDisplay(endDate, format);
  
  if (startText === '-' && endText === '-') {
    return <span className={className}>-</span>;
  }
  
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <DateDisplay 
        date={startDate} 
        format={format}
        showTooltip={showTooltip}
        showCalendarIndicator={false}
      />
      <span className="text-gray-400">{separator}</span>
      <DateDisplay 
        date={endDate} 
        format={format}
        showTooltip={showTooltip}
        showCalendarIndicator={false}
      />
    </span>
  );
};

export default DateDisplay;
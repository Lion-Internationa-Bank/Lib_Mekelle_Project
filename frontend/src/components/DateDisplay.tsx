// src/components/DateDisplay.tsx
import React from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import { gregorianToEthiopian } from '../utils/calendarUtils';

interface DateDisplayProps {
  date: Date | string | null;
  format?: 'short' | 'medium' | 'full';
  className?: string;
  fallbackText?: string;
  showTooltip?: boolean;
}

const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'medium',
  className = '',
  fallbackText = '-',
  showTooltip = true,
}) => {
  const { formatDateForDisplay, isEthiopian } = useCalendar();
  
  const displayText = formatDateForDisplay(date, format);
  
  if (displayText === '-') {
    return <span className={className}>{fallbackText}</span>;
  }
  
  // Get the opposite calendar date for tooltip
  const getOppositeCalendarDate = () => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      
      if (isEthiopian) {
        // If current is Ethiopian, show Gregorian in tooltip
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        // If current is Gregorian, show Ethiopian in tooltip
        const ethDate = gregorianToEthiopian(dateObj);
        const monthNames = ['መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 
                          'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'];
        return `${ethDate.day} ${monthNames[ethDate.month - 1]} ${ethDate.year} ዓ/ም`;
      }
    } catch {
      return '';
    }
  };
  
  const oppositeDate = getOppositeCalendarDate();
  
  return (
    <span 
      className={`relative group ${className}`}
      title={showTooltip && oppositeDate ? `${isEthiopian ? 'Gregorian' : 'Ethiopian'}: ${oppositeDate}` : undefined}
    >
      {displayText}
      {showTooltip && oppositeDate && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {isEthiopian ? 'Gregorian' : 'Ethiopian'}: {oppositeDate}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </span>
      )}
    </span>
  );
};

export default DateDisplay;
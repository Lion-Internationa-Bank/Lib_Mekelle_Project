// src/contexts/CalendarContext.tsx
import React, { createContext, useContext, useState, useEffect,type ReactNode } from 'react';
import { type CalendarType,formatDate, gregorianToEthiopian,ethiopianToGregorian } from '../utils/calendarUtils';

interface CalendarContextType {
  calendarType: CalendarType;
  setCalendarType: (type: CalendarType) => void;
  formatDateForDisplay: (date: Date | string | null, format?: 'short' | 'medium' | 'full') => string;
  parseDisplayDate: (displayDate: string) => Date | null;
  isEthiopian: boolean;
  toggleCalendar: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
  defaultType?: CalendarType;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children, 
  defaultType = 'ETHIOPIAN' 
}) => {
  const [calendarType, setCalendarType] = useState<CalendarType>(() => {
    // Try to get from localStorage first
    const saved = localStorage.getItem('preferredCalendarType');
    return (saved as CalendarType) || defaultType;
  });

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferredCalendarType', calendarType);
  }, [calendarType]);

  const formatDateForDisplay = (
    date: Date | string | null, 
    format: 'short' | 'medium' | 'full' = 'medium'
  ): string => {
    if (!date) return '-';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return '-';
      }
      
      return formatDate(dateObj, calendarType, format);
    } catch {
      return '-';
    }
  };

  const parseDisplayDate = (displayDate: string): Date | null => {
    if (!displayDate.trim()) return null;
    
    try {
      // This would need proper parsing logic based on calendarType
      // For now, assume it's already in Gregorian format for backend
      return new Date(displayDate);
    } catch {
      return null;
    }
  };

  const isEthiopian = calendarType === 'ETHIOPIAN';

  const toggleCalendar = () => {
    setCalendarType(current => current === 'ETHIOPIAN' ? 'GREGORIAN' : 'ETHIOPIAN');
  };

  return (
    <CalendarContext.Provider value={{
      calendarType,
      setCalendarType,
      formatDateForDisplay,
      parseDisplayDate,
      isEthiopian,
      toggleCalendar,
    }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
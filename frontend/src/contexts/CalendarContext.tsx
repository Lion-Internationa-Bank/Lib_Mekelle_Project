// src/contexts/CalendarContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  type CalendarType, 
  type GregorianDate,
  inputFormatDate,
   compitableformatDate,
  parseDateString,
  gregorianToEthiopian,
  ethiopianToGregorian,
  convertEthiopianToBackendFormat,
} from '../utils/calendarUtils';


interface CalendarContextType {
  calendarType: CalendarType;
  setCalendarType: (type: CalendarType) => void;
  formatDateForDisplay: (date: Date | string | GregorianDate | null, format?: 'short' | 'medium' | 'full' | 'iso') => string;
  parseDisplayDate: (displayDate: string, targetCalendarType?: CalendarType) => Date | null;
  convertToBackendFormat: (date: string | GregorianDate | EthiopianDate) => string;
  validateDateInput: (dateStr: string) => { isValid: boolean; error?: string };
  getCurrentDate: () => GregorianDate;
  isEthiopian: boolean;
  toggleCalendar: () => void;
  convertDateToCalendar: (date: Date | string | GregorianDate, targetCalendarType: CalendarType) => GregorianDate | EthiopianDate;
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

  /**
   * Format date for display based on current calendar preference
   * Handles backend dates (always Gregorian) and converts if needed
   */
  const formatDateForDisplay = (
    date: Date | string | GregorianDate | null, 
    format: 'short' | 'medium' | 'full' | 'iso' = 'medium'
  ): string => {
    if (!date) return '-';
    
    try {
      // Use the updated formatDate from calendarUtils
      return compitableformatDate(date, calendarType, format);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

    const formatDate = (
    date: Date | string | GregorianDate | null, 
    format: 'short' | 'medium' | 'full' | 'iso' = 'medium'
  ): string => {
    if (!date) return '-';
    
    try {
      // Use the updated formatDate from calendarUtils
      return inputFormatDate(date, calendarType, format);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  /**
   * Parse display date string to Date object
   * If targetCalendarType is provided, parse according to that calendar
   * Otherwise, use the current calendar context
   */
  const parseDisplayDate = (
    displayDate: string, 
    targetCalendarType?: CalendarType
  ): Date | null => {
    if (!displayDate.trim()) return null;
    
    const targetType = targetCalendarType || calendarType;
    const result = parseDateString(displayDate, targetType);
    
    if (result.isValid && result.date) {
      if (targetType === 'ETHIOPIAN') {
        // Convert Ethiopian date to Gregorian Date object
        return ethiopianToGregorian(result.date as EthiopianDate);
      } else {
        // Gregorian date - create Date object
        const gregDate = result.date as GregorianDate;
        return new Date(gregDate.year, gregDate.month - 1, gregDate.day);
      }
    }
    
    return null;
  };

  /**
   * Convert date to backend format (Gregorian ISO string)
   * Accepts various input formats and converts if needed
   */
  const convertToBackendFormat = (
    date: string | GregorianDate | EthiopianDate
  ): string => {
    try {
      if (typeof date === 'string') {
        // Already in backend format or needs parsing
        return new Date(date).toISOString().split('T')[0];
      }
      
      if ('month' in date && date.month <= 12) {
        // Gregorian date object
        return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
      } else {
        // Ethiopian date object - convert to Gregorian first
        return convertEthiopianToBackendFormat(date);
      }
    } catch (error) {
      console.error('Error converting to backend format:', error);
      return '';
    }
  };

  /**
   * Validate date input string according to current calendar type
   */
  const validateDateInput = (dateStr: string): { isValid: boolean; error?: string } => {
    const result = parseDateString(dateStr, calendarType);
    return {
      isValid: result.isValid,
      error: result.error
    };
  };

  /**
   * Get current date in Gregorian format (backend format)
   */
  const getCurrentDate = (): GregorianDate => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  };

  /**
   * Convert date to a specific calendar type
   */
  const convertDateToCalendar = (
    date: Date | string | GregorianDate,
    targetCalendarType: CalendarType
  ): GregorianDate | EthiopianDate => {
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
    
    if (targetCalendarType === 'ETHIOPIAN') {
      return gregorianToEthiopian(gregDate);
    } else {
      return gregDate;
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
      convertToBackendFormat,
      validateDateInput,
      getCurrentDate,
      isEthiopian,
      toggleCalendar,
      convertDateToCalendar,
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

// Helper type for EthiopianDate (needs to be imported or defined)
interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}
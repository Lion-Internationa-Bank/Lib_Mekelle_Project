// src/utils/calendarUtils.ts

/**
 * Comprehensive Calendar Utilities
 * Supports both Ethiopian and Gregorian calendars with full conversion capabilities
 */

// ========== TYPES ==========
export type CalendarType = 'ETHIOPIAN' | 'GREGORIAN';

export interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number;   // 1-30 (1-5/6 for Pagume)
}

export interface GregorianDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export type CalendarDate = EthiopianDate | GregorianDate;

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  date?: CalendarDate;
}

// ========== CONSTANTS ==========
export const ETHIOPIAN_MONTHS = [
  'መስከረም',    // Meskerem (September)
  'ጥቅምት',     // Tikimt (October)
  'ህዳር',       // Hidar (November)
  'ታህሳስ',      // Tahsas (December)
  'ጥር',         // Tir (January)
  'የካቲት',      // Yekatit (February)
  'መጋቢት',      // Megabit (March)
  'ሚያዝያ',      // Miyazya (April)
  'ግንቦት',      // Ginbot (May)
  'ሰኔ',         // Sene (June)
  'ሐምሌ',        // Hamle (July)
  'ነሐሴ',        // Nehasse (August)
  'ጳጉሜ',        // Pagume (Leap month)
] as const;

export const GREGORIAN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

// Ethiopian weekdays (starting with Monday)
export const ETHIOPIAN_WEEKDAYS = ['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'ከ'];

// Gregorian weekdays (starting with Sunday)
export const GREGORIAN_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ========== CORE CONVERSION FUNCTIONS ==========

/**
 * Convert Gregorian date to Ethiopian date
 */
export function gregorianToEthiopian(date: Date | GregorianDate): EthiopianDate {
  let gregYear: number, gregMonth: number, gregDay: number;
  
  if (date instanceof Date) {
    gregYear = date.getFullYear();
    gregMonth = date.getMonth() + 1; // Convert 0-11 to 1-12
    gregDay = date.getDate();
  } else {
    gregYear = date.year;
    gregMonth = date.month;
    gregDay = date.day;
  }
  
  // September 11 is the start of Ethiopian New Year in Gregorian calendar
  const isBeforeSept11 = gregMonth < 9 || (gregMonth === 9 && gregDay < 11);
  
  // Calculate Ethiopian year
  let ethYear = gregYear - 8;
  if (isBeforeSept11) {
    ethYear--;
  }
  
  // Calculate days since September 11
  const sept11 = new Date(gregYear, 8, 11); // September 11
  const currentDate = date instanceof Date ? date : new Date(gregYear, gregMonth - 1, gregDay);
  
  let daysDiff: number;
  if (currentDate >= sept11) {
    daysDiff = Math.floor((currentDate.getTime() - sept11.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // Use previous year's September 11
    const prevSept11 = new Date(gregYear - 1, 8, 11);
    daysDiff = Math.floor((currentDate.getTime() - prevSept11.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Calculate Ethiopian month and day
  let ethMonth = Math.floor(daysDiff / 30) + 1;
  let ethDay = (daysDiff % 30) + 1;
  
  // Handle Pagume and year boundary
  if (ethMonth > 13) {
    ethYear++;
    ethMonth -= 13;
  } else if (ethMonth === 13) {
    const maxDays = isEthiopianLeapYear(ethYear) ? 6 : 5;
    if (ethDay > maxDays) {
      ethYear++;
      ethMonth = 1;
      ethDay -= maxDays;
    }
  }
  
  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
  };
}

/**
 * Convert Ethiopian date to Gregorian date
 */
export function ethiopianToGregorian(ethDate: EthiopianDate): Date {
  const { year, month, day } = ethDate;
  
  // Gregorian year starts 8 years after Ethiopian year
  let gregYear = year + 8;
  
  // Calculate days from start of Ethiopian year (Meskerem 1 = September 11)
  let daysFromStart = (month - 1) * 30 + (day - 1);
  
  // Start from September 11 of the Gregorian year
  const startDate = new Date(gregYear, 8, 11); // September 11
  
  // Create result date
  const result = new Date(startDate);
  result.setDate(startDate.getDate() + daysFromStart);
  
  // Adjust for Pagume leap year if needed
  if (month === 13 && day > (isEthiopianLeapYear(year) ? 6 : 5)) {
    // Move to next Gregorian year
    const nextYearStart = new Date(gregYear + 1, 8, 11);
    const remainingDays = daysFromStart - (isEthiopianLeapYear(year) ? 366 : 365);
    result.setTime(nextYearStart.getTime() + remainingDays * 24 * 60 * 60 * 1000);
  }
  
  return result;
}

/**
 * Check if Ethiopian year is a leap year
 * Ethiopian leap years occur every 4 years, 3 years after Gregorian leap years
 */
export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

// ========== VALIDATION FUNCTIONS ==========

/**
 * Validate Ethiopian date
 */
export function validateEthiopianDate(date: EthiopianDate): DateValidationResult {
  const { year, month, day } = date;
  
  // Basic range checks
  if (year < 1900 || year > 2200) {
    return { isValid: false, error: 'Year must be between 1900 and 2200 ዓ/ም' };
  }
  
  if (month < 1 || month > 13) {
    return { isValid: false, error: 'Month must be between 1 and 13' };
  }
  
  if (day < 1) {
    return { isValid: false, error: 'Day cannot be less than 1' };
  }
  
  // Validate days based on month
  if (month === 13) {
    // Pagume - has 5 or 6 days depending on leap year
    const maxDays = isEthiopianLeapYear(year) ? 6 : 5;
    if (day > maxDays) {
      return { 
        isValid: false, 
        error: `Pagume in year ${year} ዓ/ም has only ${maxDays} days` 
      };
    }
  } else if (day > 30) {
    // All other months have 30 days
    return { isValid: false, error: 'Day cannot exceed 30 for this month' };
  }
  
  return { isValid: true, date };
}

/**
 * Validate Gregorian date
 */
export function validateGregorianDate(date: GregorianDate): DateValidationResult {
  const { year, month, day } = date;
  
  // Basic range checks
  if (year < 1900 || year > 2200) {
    return { isValid: false, error: 'Year must be between 1900 and 2200' };
  }
  
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Month must be between 1 and 12' };
  }
  
  if (day < 1) {
    return { isValid: false, error: 'Day cannot be less than 1' };
  }
  
  // Check max days in month
  const maxDays = new Date(year, month, 0).getDate();
  if (day > maxDays) {
    return { 
      isValid: false, 
      error: `${GREGORIAN_MONTHS[month - 1]} ${year} has only ${maxDays} days` 
    };
  }
  
  return { isValid: true, date };
}

// ========== FORMATTING FUNCTIONS ==========

/**
 * Format date according to calendar type
 */
export function formatDate(
  date: Date | string | GregorianDate, // Only Gregorian from backend
  calendarType: CalendarType,
  format: 'short' | 'medium' | 'full' | 'iso' = 'medium'
): string {
  // Convert input to Gregorian date object
  let gregDate: GregorianDate;
  
  if (date instanceof Date) {
    // Already Date object
    gregDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  } else if (typeof date === 'string') {
    // ISO string from backend
    const dateObj = new Date(date);
    gregDate = {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate()
    };
  } else {
    // Already Gregorian date object
    gregDate = date;
  }
  
  if (calendarType === 'ETHIOPIAN') {
    // Convert Gregorian to Ethiopian for display
    const ethDate = gregorianToEthiopian(new Date(gregDate.year, gregDate.month - 1, gregDate.day));
    const monthName = ETHIOPIAN_MONTHS[ethDate.month - 1];
    
    switch (format) {
      case 'short':
        return `${ethDate.day.toString().padStart(2, '0')}/${ethDate.month.toString().padStart(2, '0')}/${ethDate.year}`;
      case 'medium':
        return `${ethDate.day} ${monthName} ${ethDate.year}`;
      case 'full':
        return `${ethDate.day} ${monthName} ${ethDate.year} ዓ/ም`;
      case 'iso':
        return `${ethDate.year}-${ethDate.month.toString().padStart(2, '0')}-${ethDate.day.toString().padStart(2, '0')}`;
      default:
        return `${ethDate.day}/${ethDate.month}/${ethDate.year}`;
    }
  } else {
    // Just format the Gregorian date
    const monthName = GREGORIAN_MONTHS[gregDate.month - 1];
    
    switch (format) {
      case 'short':
        return `${gregDate.month.toString().padStart(2, '0')}/${gregDate.day.toString().padStart(2, '0')}/${gregDate.year}`;
      case 'medium':
        return `${monthName} ${gregDate.day}, ${gregDate.year}`;
      case 'full':
        return `${monthName} ${gregDate.day}, ${gregDate.year}`;
      case 'iso':
        return `${gregDate.year}-${gregDate.month.toString().padStart(2, '0')}-${gregDate.day.toString().padStart(2, '0')}`;
      default:
        return `${gregDate.month}/${gregDate.day}/${gregDate.year}`;
    }
  }
}

// ========== PARSING FUNCTIONS ==========

/**
 * Parse date string based on calendar type
 */
export function parseDateString(
  dateString: string,
  calendarType: CalendarType
): DateValidationResult {
  const cleanString = dateString.trim();
  
  if (!cleanString) {
    return { isValid: false, error: 'Date is required' };
  }
  
  // Try common separators
  const separators = ['/', '-', '.', ' '];
  
  for (const sep of separators) {
    const parts = cleanString.split(sep);
    if (parts.length === 3) {
      const num1 = parseInt(parts[0], 10);
      const num2 = parseInt(parts[1], 10);
      const num3 = parseInt(parts[2], 10);
      
      if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
        continue;
      }
      
      if (calendarType === 'ETHIOPIAN') {
        // Ethiopian: DD/MM/YYYY
        const ethDate: EthiopianDate = { year: num3, month: num2, day: num1 };
        return validateEthiopianDate(ethDate);
      } else {
        // Gregorian: try both MM/DD/YYYY and DD/MM/YYYY
        // Try MM/DD/YYYY first
        const gregDate1: GregorianDate = { year: num3, month: num1, day: num2 };
        const result1 = validateGregorianDate(gregDate1);
        if (result1.isValid) return result1;
        
        // Try DD/MM/YYYY
        const gregDate2: GregorianDate = { year: num3, month: num2, day: num1 };
        const result2 = validateGregorianDate(gregDate2);
        if (result2.isValid) return result2;
      }
    }
  }
  
  return { 
    isValid: false, 
    error: calendarType === 'ETHIOPIAN' 
      ? 'Invalid format. Use: ቀን/ወር/ዓመት (e.g., 12/03/2015)' 
      : 'Invalid format. Use: MM/DD/YYYY or DD/MM/YYYY' 
  };
}

// ========== HELPER FUNCTIONS ==========

/**
 * Get current date in specified calendar type
 */
export function getCurrentDate(calendarType: CalendarType): CalendarDate {
  const now = new Date();
  
  if (calendarType === 'ETHIOPIAN') {
    return gregorianToEthiopian(now);
  } else {
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }
}

/**
 * Get month name
 */
export function getMonthName(month: number, calendarType: CalendarType): string {
  if (calendarType === 'ETHIOPIAN' && month >= 1 && month <= 13) {
    return ETHIOPIAN_MONTHS[month - 1];
  } else if (calendarType === 'GREGORIAN' && month >= 1 && month <= 12) {
    return GREGORIAN_MONTHS[month - 1];
  }
  return '';
}

/**
 * Get number of days in month
 */
export function getDaysInMonth(month: number, year: number, calendarType: CalendarType): number {
  if (calendarType === 'ETHIOPIAN') {
    if (month === 13) {
      return isEthiopianLeapYear(year) ? 6 : 5;
    }
    return 30;
  } else {
    return new Date(year, month, 0).getDate(); // month is 1-indexed
  }
}

/**
 * Get Ethiopian date from Gregorian components
 */
export function getEthiopianDateFromGregorian(
  year: number,
  month: number,
  day: number
): EthiopianDate {
  return gregorianToEthiopian(new Date(year, month - 1, day));
}

/**
 * Get Gregorian date from Ethiopian components
 */
export function getGregorianDateFromEthiopian(
  year: number,
  month: number,
  day: number
): GregorianDate {
  const date = ethiopianToGregorian({ year, month, day });
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}

/**
 * Check if two dates are equal in the specified calendar
 */
export function areDatesEqual(
  date1: CalendarDate | Date,
  date2: CalendarDate | Date,
  calendarType: CalendarType
): boolean {
  let calDate1: CalendarDate;
  let calDate2: CalendarDate;
  
  // Convert first date
  if (date1 instanceof Date) {
    calDate1 = calendarType === 'ETHIOPIAN' 
      ? gregorianToEthiopian(date1)
      : { year: date1.getFullYear(), month: date1.getMonth() + 1, day: date1.getDate() };
  } else {
    calDate1 = date1;
  }
  
  // Convert second date
  if (date2 instanceof Date) {
    calDate2 = calendarType === 'ETHIOPIAN' 
      ? gregorianToEthiopian(date2)
      : { year: date2.getFullYear(), month: date2.getMonth() + 1, day: date2.getDate() };
  } else {
    calDate2 = date2;
  }
  
  return (
    calDate1.year === calDate2.year &&
    calDate1.month === calDate2.month &&
    calDate1.day === calDate2.day
  );
}

/**
 * Add days to a date in the specified calendar
 */
export function addDays(
  date: CalendarDate | Date,
  days: number,
  calendarType: CalendarType
): CalendarDate {
  let gregDate: Date;
  
  if (date instanceof Date) {
    gregDate = date;
  } else if (calendarType === 'ETHIOPIAN') {
    gregDate = ethiopianToGregorian(date as EthiopianDate);
  } else {
    const gDate = date as GregorianDate;
    gregDate = new Date(gDate.year, gDate.month - 1, gDate.day);
  }
  
  gregDate.setDate(gregDate.getDate() + days);
  
  if (calendarType === 'ETHIOPIAN') {
    return gregorianToEthiopian(gregDate);
  } else {
    return {
      year: gregDate.getFullYear(),
      month: gregDate.getMonth() + 1,
      day: gregDate.getDate()
    };
  }
}

/**
 * Get the day of the week for a date
 * Returns 0-6 where 0 is Sunday for Gregorian, 0 is Monday for Ethiopian
 */
export function getDayOfWeek(
  date: CalendarDate | Date,
  calendarType: CalendarType
): number {
  let gregDate: Date;
  
  if (date instanceof Date) {
    gregDate = date;
  } else if (calendarType === 'ETHIOPIAN') {
    gregDate = ethiopianToGregorian(date as EthiopianDate);
  } else {
    const gDate = date as GregorianDate;
    gregDate = new Date(gDate.year, gDate.month - 1, gDate.day);
  }
  
  const day = gregDate.getDay(); // 0=Sunday, 1=Monday, etc.
  
  if (calendarType === 'ETHIOPIAN') {
    // Ethiopian week starts with Monday (0 = Monday, 6 = Sunday)
    return day === 0 ? 6 : day - 1;
  } else {
    return day;
  }
}

/**
 * Compare two dates
 * Returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(
  date1: CalendarDate | Date,
  date2: CalendarDate | Date,
  calendarType: CalendarType
): number {
  let gregDate1: Date;
  let gregDate2: Date;
  
  // Convert first date to Gregorian
  if (date1 instanceof Date) {
    gregDate1 = date1;
  } else if (calendarType === 'ETHIOPIAN') {
    gregDate1 = ethiopianToGregorian(date1 as EthiopianDate);
  } else {
    const gDate1 = date1 as GregorianDate;
    gregDate1 = new Date(gDate1.year, gDate1.month - 1, gDate1.day);
  }
  
  // Convert second date to Gregorian
  if (date2 instanceof Date) {
    gregDate2 = date2;
  } else if (calendarType === 'ETHIOPIAN') {
    gregDate2 = ethiopianToGregorian(date2 as EthiopianDate);
  } else {
    const gDate2 = date2 as GregorianDate;
    gregDate2 = new Date(gDate2.year, gDate2.month - 1, gDate2.day);
  }
  
  if (gregDate1 < gregDate2) return -1;
  if (gregDate1 > gregDate2) return 1;
  return 0;
}

export default {

  
  // Constants
  ETHIOPIAN_MONTHS,
  GREGORIAN_MONTHS,
  ETHIOPIAN_WEEKDAYS,
  GREGORIAN_WEEKDAYS,
  
  // Core functions
  gregorianToEthiopian,
  ethiopianToGregorian,
  isEthiopianLeapYear,
  
  // Validation
  validateEthiopianDate,
  validateGregorianDate,
  
  // Formatting
  formatDate,
  
  // Parsing
  parseDateString,
  
  // Helpers
  getCurrentDate,
  getMonthName,
  getDaysInMonth,
  getEthiopianDateFromGregorian,
  getGregorianDateFromEthiopian,
  areDatesEqual,
  addDays,
  getDayOfWeek,
  compareDates,
};
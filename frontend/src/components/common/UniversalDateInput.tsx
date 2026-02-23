// src/components/UniversalDateInput.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Calendar, ChevronDown, ChevronUp, X, Info } from "lucide-react";
import { useCalendar } from "../../contexts/CalendarContext";
import Portal from "./Portal";
import {
  type CalendarDate,
  type EthiopianDate,
  type GregorianDate,
  ETHIOPIAN_WEEKDAYS,
  GREGORIAN_WEEKDAYS,
  parseDateString,
  // compitableformatDate as formatDateUtil,
  inputFormatDate,
  getCurrentDate,
  getMonthName,
  getDaysInMonth,
  gregorianToEthiopian,
  ethiopianToGregorian,
} from "../../utils/calendarUtils";

interface UniversalDateInputProps {
  value?: Date | string | null;
  onChange: (date: Date | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  allowManualEntry?: boolean;
  showPicker?: boolean;
  inline?: boolean;
  size?: "sm" | "md" | "lg";
}

const UniversalDateInput: React.FC<UniversalDateInputProps> = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error: externalError,
  className = "",
  minDate,
  maxDate,
  placeholder,
  allowManualEntry = true,
  showPicker = true,
  inline = false,
  size = "md",
}) => {
  const { calendarType, isEthiopian } = useCalendar();

  const [internalDate, setInternalDate] = useState<CalendarDate>(
    getCurrentDate(calendarType)
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [viewYear, setViewYear] = useState<number>(internalDate.year);
  const [viewMonth, setViewMonth] = useState<number>(internalDate.month);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "py-1.5 text-sm",
    md: "py-2.5",
    lg: "py-3 text-lg",
  };

  const getDefaultPlaceholder = useCallback(() => {
    if (placeholder) return placeholder;
    return isEthiopian
      ? "ቀን/ወር/ዓመት (ምሳሌ: 12/03/2015)"
      : "MM/DD/YYYY (e.g., 09/11/2023)";
  }, [isEthiopian, placeholder]);

  const parseExternalValue = useCallback(
    (val: Date | string | null | undefined): Date | null => {
      if (!val) return null;
      try {
        const dateObj = typeof val === "string" ? new Date(val) : val;
        if (isNaN(dateObj.getTime())) return null;
        return dateObj;
      } catch {
        return null;
      }
    },
    []
  );

  const toDisplayDate = useCallback(
    (gregDate: Date | null): CalendarDate => {
      if (!gregDate || isNaN(gregDate.getTime())) {
        return getCurrentDate(calendarType);
      }

      if (isEthiopian) {
        return gregorianToEthiopian(gregDate);
      } else {
        return {
          year: gregDate.getFullYear(),
          month: gregDate.getMonth() + 1,
          day: gregDate.getDate(),
        };
      }
    },
    [calendarType, isEthiopian]
  );

  
const toGregorian = useCallback(
  (displayDate: CalendarDate): Date => {
    console.log("display date", displayDate);
    
    let result: Date;
    
    if (isEthiopian) {
      // Get the Gregorian date from Ethiopian
      const gregDate = ethiopianToGregorian(displayDate as EthiopianDate);
      
      // Create a new date at UTC midnight to avoid timezone shifts
      // Then convert to local date by adding the timezone offset
      const utcDate = new Date(Date.UTC(
        gregDate.getFullYear(),
        gregDate.getMonth(),
        gregDate.getDate()
      ));
      
      // Adjust for local timezone
      result = new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate()
      );
    } else {
      const gDate = displayDate as GregorianDate;
      // Create date in UTC to avoid timezone shifts
      result = new Date(Date.UTC(gDate.year, gDate.month - 1, gDate.day));
    }
    
    console.log("after to greg date", result);
    return result;
  },
  [isEthiopian]
);

  const updatePickerPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      setPickerPosition({
        top: rect.bottom + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Sync internal date from external value
  useEffect(() => {
    const gregDate = parseExternalValue(value);
    const displayDate = toDisplayDate(gregDate);

    setInternalDate(displayDate);
    setViewYear(displayDate.year);
    setViewMonth(displayDate.month);
    setValidationError(null);
  }, [value, calendarType, parseExternalValue, toDisplayDate]);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
        setViewMode("days");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update picker position on resize/scroll
  useEffect(() => {
    if (isPickerOpen) {
      updatePickerPosition();

      const handleResize = () => {
        updatePickerPosition();
      };
      const handleScroll = () => {
        updatePickerPosition();
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isPickerOpen, updatePickerPosition]);

  // Focus input when picker opens
  useEffect(() => {
    if (isPickerOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPickerOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allowManualEntry || disabled) return;

    const newValue = e.target.value;
    // console.log("newvalue",newValue)
    if (newValue.trim() === "") {
      setValidationError(null);
      onChange(null);
      return;
    }

    const result = parseDateString(newValue, calendarType);
// console.log("result",result)
    if (result.isValid && result.date) {
      setInternalDate(result.date);
      setViewYear(result.date.year);
      setViewMonth(result.date.month);
      setValidationError(null);

      const gregDate = toGregorian(result.date);
      // console.log("gregdage",gregDate)
      onChange(gregDate);
    } else {
      setValidationError(result.error || "Invalid date format");
    }
  };

  const handleDateSelect = (selectedDate: CalendarDate) => {
    console.log("selected date",selectedDate)
    setInternalDate(selectedDate);

    setValidationError(null);
    setIsPickerOpen(false);
    setViewMode("days");

    const gregDate = toGregorian(selectedDate);
    console.log(" after to greg date",gregDate)
    onChange(gregDate);
  };

  const isDateDisabled = (testDate: CalendarDate): boolean => {
    try {
      const gregDate = toGregorian(testDate);
      if (minDate && gregDate < minDate) return true;
      if (maxDate && gregDate > maxDate) return true;
      return false;
    } catch {
      return true;
    }
  };

  const generateDays = () => {
    const days: (CalendarDate | null)[] = [];
    const daysInMonth = getDaysInMonth(viewMonth, viewYear, calendarType);

    const firstDate: CalendarDate = {
      year: viewYear,
      month: viewMonth,
      day: 1,
    };

    const firstGregDate = toGregorian(firstDate);
    const firstDayOfWeek = firstGregDate.getDay(); // 0 = Sunday

    const startOffset = isEthiopian
      ? firstDayOfWeek === 0
        ? 6
        : firstDayOfWeek - 1
      : firstDayOfWeek;

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date: CalendarDate = {
        year: viewYear,
        month: viewMonth,
        day,
      };
      days.push(date);
    }

    return days;
  };

  const generateMonths = () => {
    const months: { month: number; name: string }[] = [];
    const monthCount = isEthiopian ? 13 : 12;
    for (let month = 1; month <= monthCount; month++) {
      months.push({
        month,
        name: getMonthName(month, calendarType),
      });
    }
    return months;
  };

  const generateYears = () => {
    const years: number[] = [];
    const startYear = viewYear - 12;
    const endYear = viewYear + 12;

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const getWeekdays = () => {
    return isEthiopian ? ETHIOPIAN_WEEKDAYS : GREGORIAN_WEEKDAYS;
  };

  const handleTodayClick = () => {
    const today = getCurrentDate(calendarType);
    handleDateSelect(today);
  };

  const handleClearClick = () => {
    setValidationError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleTogglePicker = () => {
    if (disabled) return;
    const newOpenState = !isPickerOpen;
    setIsPickerOpen(newOpenState);
    if (newOpenState) {
      updatePickerPosition();
    } else {
      setViewMode("days");
    }
  };

  const error = externalError || validationError;
  const hasError = !!error;

  const isTodaySelected = (() => {
    const today = getCurrentDate(calendarType);
    return (
      internalDate.year === today.year &&
      internalDate.month === today.month &&
      internalDate.day === today.day
    );
  })();



 

const displayedValue = useMemo(() => {
  if (!value) return "";
  
  const greg = parseExternalValue(value);
  if (!greg) return "";
  
  const displayCal = toDisplayDate(greg);
  
  // Use inputFormatDate instead of compitableformatDate
  // because displayCal is already in the correct calendar type
  return inputFormatDate(displayCal, calendarType, "short");
}, [value, calendarType, parseExternalValue, toDisplayDate]);

  const getAdjustedPickerStyle = () => {
    if (!pickerPosition) return {};

    const style: React.CSSProperties = {
      top: `${pickerPosition.top}px`,
      left: `${pickerPosition.left}px`,
      width: "320px",
      maxWidth: "95vw",
      zIndex: 10000,
    };

    if (typeof window !== "undefined") {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (pickerPosition.top + 380 > viewportHeight) {
        style.top = `${pickerPosition.top - 380 - 8}px`;
      }

      if (pickerPosition.left + 320 > viewportWidth) {
        style.left = `${Math.max(8, viewportWidth - 320 - 8)}px`;
      }
    }

    return style;
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${inline ? "inline-block" : "w-full"} ${className}`}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
          {isEthiopian && (
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (የኢትዮጵያ ቀን መቁጠሪያ)
            </span>
          )}
        </label>
      )}

      <div className={`relative ${inline ? "inline-flex" : "flex"}`}>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={displayedValue}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (showPicker && !disabled) {
                setIsPickerOpen(true);
                updatePickerPosition();
              }
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={getDefaultPlaceholder()}
            disabled={disabled}
            className={`w-full ${sizeClasses[size]} pl-10 pr-28 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              hasError
                ? "border-red-500 ring-red-100"
                : isFocused
                ? "border-blue-500 ring-blue-100"
                : "border-gray-300"
            } ${
              disabled
                ? "bg-gray-100 cursor-not-allowed text-gray-500"
                : "bg-white text-gray-900"
            }`}
            aria-invalid={hasError}
          />

          <Calendar
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              hasError ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-400"
            }`}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1.5">
            {displayedValue && (
              <button
                type="button"
                onClick={handleClearClick}
                disabled={disabled}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-gray-100"
                title="Clear date"
                aria-label="Clear date"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {showPicker && (
              <button
                type="button"
                onClick={handleTogglePicker}
                disabled={disabled}
                className={`p-1 rounded transition-colors ${
                  disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : hasError
                    ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title={isPickerOpen ? "Close calendar" : "Open calendar"}
                aria-label={isPickerOpen ? "Close date picker" : "Open date picker"}
              >
                {isPickerOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isPickerOpen && !disabled && showPicker && pickerPosition && (
        <Portal>
          <div
            ref={pickerRef}
            className="fixed bg-white border border-gray-300 rounded-xl shadow-2xl"
            style={getAdjustedPickerStyle()}
          >
            {/* Picker Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (viewMode === "days") {
                        setViewYear((prev) => prev - 1);
                      } else if (viewMode === "months") {
                        setViewYear((prev) => prev - 1);
                      } else if (viewMode === "years") {
                        setViewYear((prev) => prev - 24);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={viewMode === "years" && viewYear <= 1900}
                    aria-label="Previous period"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() => {
                      if (viewMode === "days") setViewMode("months");
                      else if (viewMode === "months") setViewMode("years");
                      else setViewMode("days");
                    }}
                    className="font-semibold text-gray-900 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 min-w-[140px] text-center"
                  >
                    {viewMode === "days" && (
                      <>
                        {getMonthName(viewMonth, calendarType)} {viewYear}
                        {isEthiopian && " ዓ/ም"}
                      </>
                    )}
                    {viewMode === "months" && (
                      <>
                        {viewYear}
                        {isEthiopian && " ዓ/ም"}
                      </>
                    )}
                    {viewMode === "years" && (
                      <>
                        {viewYear - 12} - {viewYear + 12}
                        {isEthiopian && " ዓ/ም"}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (viewMode === "days") {
                        setViewYear((prev) => prev + 1);
                      } else if (viewMode === "months") {
                        setViewYear((prev) => prev + 1);
                      } else if (viewMode === "years") {
                        setViewYear((prev) => prev + 24);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={viewMode === "years" && viewYear >= 2200}
                    aria-label="Next period"
                  >
                    ›
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {isEthiopian ? "ዓ/ም" : "GC"}
                  </span>
                  <button
                    onClick={handleTodayClick}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg"
                  >
                    Today
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Selected:{" "}
                  <span className="font-semibold text-gray-900">
                    {displayedValue || "None"}
                  </span>
                </div>
                {isTodaySelected && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Today
                  </span>
                )}
              </div>
            </div>

            {/* Picker Body */}
            <div className="p-4 max-h-[360px] overflow-y-auto">
              {viewMode === "days" && (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {getWeekdays().map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs text-gray-500 font-medium py-1.5"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {generateDays().map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="p-2" />;
                      }

                      const isSelected =
                        internalDate.year === date.year &&
                        internalDate.month === date.month &&
                        internalDate.day === date.day;

                      const isDisabled = isDateDisabled(date);
                      const isToday = (() => {
                        const today = getCurrentDate(calendarType);
                        return (
                          today.year === date.year &&
                          today.month === date.month &&
                          today.day === date.day
                        );
                      })();

                      return (
                        <button
                          key={`${date.year}-${date.month}-${date.day}`}
                          onClick={() => !isDisabled && handleDateSelect(date)}
                          disabled={isDisabled}
                          className={`
                            p-2 rounded-lg text-sm font-medium transition-all
                            ${
                              isSelected
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                                : isDisabled
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-gray-100 text-gray-700 hover:scale-105"
                            }
                            ${
                              isToday && !isSelected
                                ? "ring-2 ring-blue-200 bg-blue-50"
                                : ""
                            }
                          `}
                          aria-label={`Select ${date.day} ${getMonthName(
                            date.month,
                            calendarType
                          )} ${date.year}`}
                          aria-current={isSelected ? "date" : undefined}
                        >
                          <div className="flex flex-col items-center">
                            <span>{date.day}</span>
                            {isToday && !isSelected && (
                              <div className="w-1 h-1 mt-0.5 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {viewMode === "months" && (
                <div className="grid grid-cols-3 gap-2">
                  {generateMonths().map(({ month, name }) => (
                    <button
                      key={month}
                      onClick={() => {
                        setViewMonth(month);
                        setViewMode("days");
                      }}
                      className={`
                        p-3 text-center rounded-lg transition-colors font-medium
                        ${
                          viewMonth === month
                            ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                            : "hover:bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {viewMode === "years" && (
                <div className="grid grid-cols-4 gap-2">
                  {generateYears().map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setViewYear(year);
                        setViewMode("months");
                      }}
                      className={`
                        p-3 text-center rounded transition-colors text-sm
                        ${
                          year === viewYear
                            ? "bg-blue-100 text-blue-700 font-semibold ring-2 ring-blue-200"
                            : "hover:bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="w-3.5 h-3.5" />
                  <span>
                    {isEthiopian
                      ? "የኢትዮጵያ ቀን መቁጠሪያ - ዓመተ ምሕረት"
                      : "Gregorian Calendar"}
                  </span>
                </div>
                <button
                  onClick={() => setIsPickerOpen(false)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default UniversalDateInput;

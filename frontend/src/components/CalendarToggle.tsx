// src/components/CalendarToggle.tsx
import React from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { useCalendar } from '../contexts/CalendarContext';

const CalendarToggle: React.FC = () => {
  const { calendarType, toggleCalendar, isEthiopian } = useCalendar();
  
  return (
    <button
      onClick={toggleCalendar}
      className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] group"
      title={`Switch to ${isEthiopian ? 'Gregorian' : 'Ethiopian'} calendar`}
      aria-label={`Current calendar: ${calendarType}. Click to switch to ${isEthiopian ? 'Gregorian' : 'Ethiopian'}`}
    >
      <div className={`p-1.5 rounded-lg ${isEthiopian ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
        <Globe className="w-4 h-4" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium text-gray-500">
          Calendar
        </span>
        <span className="text-sm font-semibold text-gray-800">
          {isEthiopian ? 'ዓ/ም' : 'GC'}
        </span>
      </div>
      <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${isEthiopian ? 'bg-blue-500' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${isEthiopian ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm font-medium text-gray-700 hidden md:inline">
        {isEthiopian ? 'Ethiopian' : 'Gregorian'}
      </span>
      <RefreshCw className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </button>
  );
};

export default CalendarToggle;
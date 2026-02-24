// src/components/CalendarToggle.tsx
import React from 'react';
import { Globe } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';

const CalendarToggle: React.FC = () => {
  const { toggleCalendar, isEthiopian } = useCalendar();
  
  return (
    <button
      onClick={toggleCalendar}
      className="relative flex items-center justify-center p-2 bg-white border rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-sm group"
      style={{ borderColor: '#f0cd6e' }}
      title={`Switch to ${isEthiopian ? 'Gregorian' : 'Ethiopian'}`}
    >
      <Globe className={`w-5 h-5`} style={{ color: isEthiopian ? '#f0cd6e' : '#040707' }} />
      
      {/* Small Badge for Context */}
      <span 
        className="absolute -bottom-1 -right-1 flex items-center justify-center px-1 min-w-[1.25rem] h-4 text-[10px] font-bold text-white rounded-full border border-white"
        style={{ backgroundColor: '#040707' }}
      >
        {isEthiopian ? 'ዓ/ም' : 'GC'}
      </span>
    </button>
  );
};

export default CalendarToggle;
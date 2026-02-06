import React from 'react';
import { ChevronLeft, ChevronRight, Code2 } from 'lucide-react';

interface NavbarProps {
  currentDay: number;
  totalDays: number;
  onDayChange: (day: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentDay, totalDays, onDayChange }) => {
  return (
    <nav className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">CodeDaily</h1>
      </div>

      <div className="flex items-center gap-4 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
        <button 
          onClick={() => onDayChange(currentDay - 1)}
          disabled={currentDay === 1}
          className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <span className="font-medium text-gray-700 w-32 text-center text-sm">
          Day {currentDay} of {totalDays}
        </span>

        <button 
          onClick={() => onDayChange(currentDay + 1)}
          disabled={currentDay === totalDays}
          className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex items-center justify-end">
        <button 
          onClick={() => onDayChange(currentDay + 1)}
          disabled={currentDay === totalDays}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
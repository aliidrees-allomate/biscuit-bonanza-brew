
import React from 'react';

interface CupProps {
  position: number;
  isMobile: boolean;
}

const Cup: React.FC<CupProps> = ({ position, isMobile }) => {
  // Size adjustment for mobile vs desktop
  const cupSize = isMobile ? 70 : 90;
  
  return (
    <div 
      style={{ 
        left: `${position}px`, 
        width: `${cupSize}px`, 
        height: `${cupSize * 0.8}px`,
      }}
      className="absolute bottom-10 transform -translate-x-1/2 transition-all duration-100 ease-out"
    >
      <div className="relative w-full h-full">
        {/* Cup body */}
        <div className="absolute bottom-0 w-full h-3/4 bg-teal-900 rounded-b-xl rounded-t-3xl border-2 border-amber-100 overflow-hidden">
          {/* Cup tea content */}
          <div className="absolute bottom-0 w-full h-3/5 bg-amber-700 opacity-80"></div>
          
          {/* TAPAL logo on cup */}
          <div className="absolute top-2 w-full flex justify-center">
            <div className="bg-red-600 text-white text-xs font-bold px-2 rounded-sm">
              TAPAL
            </div>
          </div>
        </div>
        
        {/* Cup handle */}
        <div className="absolute right-0 top-1/3 w-1/3 h-1/3 border-4 border-teal-900 rounded-r-full transform translate-x-1/4"></div>
        
        {/* Cup saucer */}
        <div className="absolute bottom-0 w-full h-1/6 bg-teal-800 rounded-full transform translate-y-1/4 shadow-md"></div>
      </div>
    </div>
  );
};

export default Cup;

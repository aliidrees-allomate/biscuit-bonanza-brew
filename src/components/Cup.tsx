
import React from 'react';

interface CupProps {
  position: number;
  isMobile: boolean;
}

const Cup: React.FC<CupProps> = ({ position, isMobile }) => {
  // Size adjustment for mobile vs desktop
  const cupSize = isMobile ? 60 : 80;
  
  return (
    <div 
      style={{ 
        left: `${position}px`, 
        width: `${cupSize}px`, 
        height: `${cupSize}px`,
      }}
      className="absolute bottom-10 transform -translate-x-1/2 transition-all duration-100 ease-out"
    >
      <div className="relative w-full h-full">
        {/* Cup body */}
        <div className="absolute bottom-0 w-full h-3/4 bg-blue-500 rounded-b-xl rounded-t-3xl border-2 border-white overflow-hidden">
          {/* Cup pattern/decoration */}
          <div className="absolute top-1/4 w-full h-1/4 bg-blue-400 opacity-70"></div>
        </div>
        {/* Cup handle */}
        <div className="absolute right-0 top-1/3 w-1/3 h-1/3 border-4 border-blue-500 rounded-r-full transform translate-x-1/4"></div>
      </div>
    </div>
  );
};

export default Cup;

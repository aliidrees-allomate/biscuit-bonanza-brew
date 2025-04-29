
import React from 'react';

interface CupProps {
  position: number;
  isMobile: boolean;
}

const Cup: React.FC<CupProps> = ({ position, isMobile }) => {
  // Size adjustment for mobile vs desktop
  const cupSize = isMobile ? 80 : 100;
  
  return (
    <div 
      style={{ 
        left: `${position}px`, 
        width: `${cupSize}px`, 
        height: `${cupSize}px`,
      }}
      className="absolute bottom-10 transform -translate-x-1/2 transition-all duration-100 ease-out"
    >
      <img 
        src="/lovable-uploads/8ebccf9d-4894-44ea-80d9-db7722b88e7c.png" 
        alt="TAPAL Tea Cup" 
        className="w-full h-full object-contain"
        style={{
          filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.3))"
        }}
      />
    </div>
  );
};

export default Cup;

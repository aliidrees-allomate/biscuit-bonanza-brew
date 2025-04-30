
import React from 'react';

interface CupProps {
  position: number;
  isMobile: boolean;
  hasCaughtItem?: boolean;
  caughtItemType?: 'biscuit' | 'egg';
}

const Cup: React.FC<CupProps> = ({ position, isMobile, hasCaughtItem, caughtItemType }) => {
  // Size adjustment for mobile vs desktop
  const cupSize = isMobile ? 90 : 160;
  
  return (
    <div 
      style={{ 
        left: `${position}px`, 
        width: `${cupSize}px`, 
        height: `${cupSize}px`,
        zIndex: 10,
      }}
      className="absolute bottom-10 transform -translate-x-1/2 transition-all duration-100 ease-out"
    >
      {/* Show caught item inside the cup */}
      {hasCaughtItem && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-20 w-1/2 h-1/2">
          <img 
            src={caughtItemType === 'biscuit' ? "/lovable-uploads/biscuit-vector.png" : "/lovable-uploads/egg-vector.png"}
            alt={caughtItemType === 'biscuit' ? "Caught biscuit" : "Caught egg"}
            className="w-full h-full object-contain animate-bounce opacity-75"
          />
        </div>
      )}
      
      <img 
        src="/lovable-uploads/cup-vector.png" 
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

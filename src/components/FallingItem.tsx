
import React, { useEffect, useRef } from 'react';

interface FallingItemProps {
  id: string;
  type: 'biscuit' | 'egg';
  x: number;
  y: number;
  speed: number;
  onRemove: (id: string) => void;
  onCatch: (type: 'biscuit' | 'egg') => void;
  cupPosition: number;
  cupWidth: number;
  gameHeight: number;
}

const FallingItem: React.FC<FallingItemProps> = ({ 
  id, 
  type, 
  x, 
  y, 
  speed, 
  onRemove, 
  onCatch, 
  cupPosition, 
  cupWidth,
  gameHeight 
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const size = type === 'biscuit' ? 40 : 30;
  const caught = useRef(false);
  
  // Animation frame handling for smooth falling
  useEffect(() => {
    let currentY = y;
    let animationFrameId: number;
    
    const animate = () => {
      currentY += speed;
      
      if (itemRef.current) {
        itemRef.current.style.transform = `translate(${x}px, ${currentY}px)`;
        
        // Check for collision with cup
        const itemBottom = currentY + size;
        const cupTop = gameHeight - 90; // Approximate cup position from bottom
        
        // If item is at cup level and within cup bounds
        if (itemBottom >= cupTop && itemBottom <= cupTop + 20 && 
            x > cupPosition - cupWidth/2 && x < cupPosition + cupWidth/2) {
          
          if (!caught.current) {
            caught.current = true;
            onCatch(type);
            onRemove(id);
            return;
          }
        }
        
        // Remove if out of bounds
        if (currentY > gameHeight) {
          onRemove(id);
          return;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [id, x, y, speed, onRemove, onCatch, cupPosition, cupWidth, gameHeight, type, size]);
  
  return (
    <div
      ref={itemRef}
      className="absolute"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {type === 'biscuit' ? (
        <div className="w-full h-full rounded-full bg-amber-500 border-2 border-amber-600 flex items-center justify-center">
          <div className="w-2/3 h-2/3 rounded-full bg-amber-400 border border-amber-600"></div>
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-yellow-50 border border-yellow-200"></div>
      )}
    </div>
  );
};

export default FallingItem;

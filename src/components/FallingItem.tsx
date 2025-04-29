
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
  const positionRef = useRef({ x, y });
  const size = type === 'biscuit' ? 50 : 30;
  const caught = useRef(false);
  const initialRender = useRef(true);
  
  // Animation frame handling for smooth falling
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      // Update only y position, keep x position stable
      positionRef.current.y += speed;
      
      if (itemRef.current) {
        itemRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
        
        // Check for collision with cup
        const itemBottom = positionRef.current.y + size;
        const cupTop = gameHeight - 90; // Approximate cup position from bottom
        
        // If item is at cup level and within cup bounds
        if (itemBottom >= cupTop && itemBottom <= cupTop + 20 && 
            positionRef.current.x > cupPosition - cupWidth/2 && positionRef.current.x < cupPosition + cupWidth/2) {
          
          if (!caught.current) {
            caught.current = true;
            onCatch(type);
            onRemove(id);
            return;
          }
        }
        
        // Remove if out of bounds
        if (positionRef.current.y > gameHeight) {
          onRemove(id);
          return;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Set initial position only once on first render
    if (initialRender.current) {
      positionRef.current = { x, y };
      initialRender.current = false;
    }
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [id, speed, onRemove, onCatch, cupPosition, cupWidth, gameHeight, type, size, x, y]);
  
  return (
    <div
      ref={itemRef}
      className="absolute"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
      }}
    >
      {type === 'biscuit' ? (
        <div className="w-full h-full rounded-full bg-amber-200 border-2 border-amber-600 flex items-center justify-center shadow-md overflow-hidden">
          {/* TAPAL butter biscuit styling */}
          <div className="w-5/6 h-5/6 rounded-full bg-amber-300 flex items-center justify-center">
            <div className="w-2/3 h-2/3 rounded-full bg-amber-400 flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full bg-amber-500"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-yellow-50 border border-yellow-200 shadow-sm"></div>
      )}
    </div>
  );
};

export default FallingItem;

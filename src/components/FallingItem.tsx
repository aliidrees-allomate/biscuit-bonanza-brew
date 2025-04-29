
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
  const size = type === 'biscuit' ? 70 : 50;
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
        const cupTop = gameHeight - 110; // Approximate cup position from bottom
        
        // If item is at cup level and within cup bounds
        if (itemBottom >= cupTop && itemBottom <= cupTop + 30 && 
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
        <img 
          src="/lovable-uploads/df61d8ad-4ad1-4860-ab9c-2dfcea460c6e.png" 
          alt="TAPAL Butter Biscuit"
          className="w-full h-full object-contain"
          style={{
            filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15))"
          }}
        />
      ) : (
        <img 
          src="/lovable-uploads/89319c6f-3312-47f0-8aa4-f553cc33eb92.png" 
          alt="Egg"
          className="w-full h-full object-contain"
          style={{
            filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15))"
          }}
        />
      )}
    </div>
  );
};

export default FallingItem;

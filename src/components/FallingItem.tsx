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
        const itemCenter = positionRef.current.x;
        const itemLeft = positionRef.current.x - size/2;
        const itemRight = positionRef.current.x + size/2;
        const itemBottom = positionRef.current.y + size;
        const itemPreviousBottom = itemBottom - speed; // Position before this frame
        
        const cupTop = gameHeight - 110; // Approximate cup position from bottom
        const cupLeft = cupPosition - cupWidth/2;
        const cupRight = cupPosition + cupWidth/2;
        
        // For top collision detection:
        // 1. Item must have just crossed the cup's top edge in this frame
        // 2. Item must be within the horizontal bounds of the cup
        const justCrossedTopEdge = itemPreviousBottom <= cupTop && itemBottom >= cupTop;
        const isWithinCupWidth = (itemLeft <= cupRight && itemRight >= cupLeft) || 
                                (itemCenter >= cupLeft && itemCenter <= cupRight);
        
        if (justCrossedTopEdge && isWithinCupWidth) {
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
          src="/lovable-uploads/biscuit-vector.png" 
          alt="TAPAL Butter Biscuit"
          className="w-full h-full object-contain"
          style={{
            filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15))"
          }}
        />
      ) : (
        <img 
          src="/lovable-uploads/egg-vector.png" 
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

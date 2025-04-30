
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  isMobile: boolean;
  gameStarted: boolean;
  gameOver: boolean;
  countdown: number | null;
  moveLeft: () => void;
  moveRight: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  isMobile, 
  gameStarted, 
  gameOver, 
  countdown,
  moveLeft, 
  moveRight 
}) => {
  if (!isMobile || !gameStarted || gameOver || countdown !== null) {
    return null;
  }
  
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-between p-2">
      <Button 
        variant="secondary" 
        size="lg" 
        className="h-16 w-16 rounded-full bg-[hsl(var(--tapal-cream))] text-[hsl(var(--tapal-green))] border-2 border-[hsl(var(--tapal-gold))]"
        onTouchStart={moveLeft}
        onClick={moveLeft}
      >
        <ArrowLeft size={24} />
      </Button>
      <Button 
        variant="secondary" 
        size="lg" 
        className="h-16 w-16 rounded-full bg-[hsl(var(--tapal-cream))] text-[hsl(var(--tapal-green))] border-2 border-[hsl(var(--tapal-gold))]"
        onTouchStart={moveRight}
        onClick={moveRight}
      >
        <ArrowRight size={24} />
      </Button>
    </div>
  );
};

export default GameControls;

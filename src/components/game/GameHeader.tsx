
import React from 'react';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  countdown: number | null;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  startCountdown: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  level,
  gameStarted,
  gameOver,
  countdown,
  elapsedTime,
  formatTime,
  startCountdown
}) => {
  return (
    <div className="flex justify-between w-full max-w-md mb-4 items-center">
      <div className="flex items-center gap-4">
        <div className="bg-[hsl(var(--tapal-green))] text-[hsl(var(--tapal-cream))] px-4 py-1 rounded font-bold">
          Score: {score}
        </div>
        <div className="bg-[hsl(var(--tapal-gold))] text-[hsl(var(--tapal-green))] px-4 py-1 rounded font-bold">
          Level: {level}
        </div>
      </div>
      
      {/* Timer display */}
      {gameStarted && !gameOver && countdown === null && (
        <div className="flex items-center gap-2 bg-[hsl(var(--tapal-cream))] text-[hsl(var(--tapal-green))] px-4 py-1 rounded font-bold">
          <Timer size={16} />
          {formatTime(elapsedTime)}
        </div>
      )}
      
      {!gameStarted && !gameOver && (
        <Button 
          onClick={startCountdown} 
          className="bg-[hsl(var(--tapal-red))] hover:bg-[hsl(var(--tapal-red))] hover:brightness-90 text-white"
        >
          Start Game
        </Button>
      )}
      {gameOver && (
        <Button 
          onClick={startCountdown}
          className="bg-[hsl(var(--tapal-red))] hover:bg-[hsl(var(--tapal-red))] hover:brightness-90 text-white"
        >
          Play Again
        </Button>
      )}
    </div>
  );
};

export default GameHeader;

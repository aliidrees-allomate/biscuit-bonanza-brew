
import React from 'react';
import Cup from '../Cup';
import FallingItem from '../FallingItem';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FallingItemType, ScoreAnimationType } from '@/types/game';
import GameControls from './GameControls';

interface GameAreaProps {
  gameRef: React.RefObject<HTMLDivElement>;
  gameStarted: boolean;
  gameOver: boolean;
  countdown: number | null;
  cupPosition: number;
  isMobile: boolean;
  recentlyCaughtItem: {type: 'biscuit' | 'egg', show: boolean};
  fallingItems: FallingItemType[];
  cupWidth: number;
  gameSize: { width: number; height: number };
  scoreAnimations: ScoreAnimationType[];
  showLevelUp: boolean;
  level: number;
  score: number;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  onRemoveItem: (id: string) => void;
  onCatchItem: (type: 'biscuit' | 'egg') => void;
  onStartCountdown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
}

const GameArea: React.FC<GameAreaProps> = ({
  gameRef,
  gameStarted,
  gameOver,
  countdown,
  cupPosition,
  isMobile,
  recentlyCaughtItem,
  fallingItems,
  cupWidth,
  gameSize,
  scoreAnimations,
  showLevelUp,
  level,
  score,
  elapsedTime,
  formatTime,
  onRemoveItem,
  onCatchItem,
  onStartCountdown,
  moveLeft,
  moveRight
}) => {
  return (
    <div 
      ref={gameRef}
      className="relative w-full max-w-md h-[500px] bg-[hsl(var(--tapal-dark-green))] rounded-lg border-4 border-[hsl(var(--tapal-gold))] overflow-hidden shadow-lg"
      style={{animation: gameStarted ? 'border-glow 2s infinite' : 'none'}}
    >
      {/* Game content */}
      {gameStarted && !gameOver && countdown === null && (
        <>
          <Cup 
            position={cupPosition} 
            isMobile={isMobile}
            hasCaughtItem={recentlyCaughtItem.show} 
            caughtItemType={recentlyCaughtItem.type}
          />
          {fallingItems.map(item => (
            <FallingItem
              key={item.id}
              id={item.id}
              type={item.type}
              x={item.x}
              y={item.y}
              speed={item.speed}
              onRemove={onRemoveItem}
              onCatch={onCatchItem}
              cupPosition={cupPosition}
              cupWidth={cupWidth}
              gameHeight={gameSize.height}
            />
          ))}
          
          {/* Score animations */}
          {scoreAnimations.map(animation => (
            <div
              key={animation.id}
              className="absolute pointer-events-none"
              style={{
                left: animation.x,
                top: animation.y,
                transform: 'translate(-50%, -50%)',
                opacity: animation.opacity,
                zIndex: 30
              }}
            >
              <img 
                src="/lovable-uploads/23fcb4bb-42b0-4b93-af55-028ede504b86.png" 
                alt="+10" 
                className="w-12 h-12 object-contain"
              />
            </div>
          ))}
          
          {/* Level up notification */}
          {showLevelUp && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[hsl(var(--tapal-gold))] text-[hsl(var(--tapal-green))] px-6 py-4 rounded-lg shadow-lg animate-scale-in z-20">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Award className="text-[hsl(var(--tapal-gold))] stroke-[hsl(var(--tapal-green))]" size={24} />
                <span className="text-xl font-bold">Level Up!</span>
              </div>
              <p className="text-center">You've reached level {level}!</p>
            </div>
          )}
        </>
      )}
      
      {/* Countdown animation */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <div className="text-white font-bold animate-scale-in text-8xl">
            {countdown > 0 ? countdown : "Start!"}
          </div>
        </div>
      )}
      
      {/* Start screen */}
      {!gameStarted && !gameOver && countdown === null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="mb-6 text-center">
            <img 
              src="/lovable-uploads/d201fdbc-6c15-41be-bd57-956888ac27b1.png" 
              alt="TAPAL Classic Butter Biscuit" 
              className="w-32 h-32 object-contain mx-auto mb-4"
            />
            <div className="text-xl font-bold mb-2 text-[hsl(var(--tapal-cream))]">
              TAPAL Butter Biscuit Challenge
            </div>
            <p className="text-[hsl(var(--tapal-cream))] text-sm opacity-90 mb-2">
              Catch the delicious Classic Butter Biscuits in your cup of TAPAL tea, but avoid the eggs!
            </p>
            <p className="text-[hsl(var(--tapal-gold))] text-sm mb-4">
              Game level will be up after every minute
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={onStartCountdown}
            className="bg-[hsl(var(--tapal-red))] hover:bg-[hsl(var(--tapal-red))] hover:brightness-90 text-white"
          >
            Start Game
          </Button>
        </div>
      )}
      
      {/* Game over screen */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
          <div className="text-xl font-bold mb-2 text-white">Game Over!</div>
          <div className="text-lg mb-2 text-[hsl(var(--tapal-gold))]">Final Score: {score}</div>
          <div className="text-md mb-4 text-white">
            <span className="text-[hsl(var(--tapal-cream))]">Level Reached: {level}</span> • Time: {formatTime(elapsedTime)}
          </div>
          <div className="mb-4 text-center text-white text-sm">
            Nothing goes better with TAPAL tea than our delicious Classic Butter Biscuits!
          </div>
          <Button 
            size="lg" 
            onClick={onStartCountdown}
            className="bg-[hsl(var(--tapal-red))] hover:bg-[hsl(var(--tapal-red))] hover:brightness-90 text-white"
          >
            Play Again
          </Button>
        </div>
      )}
      
      {/* Mobile controls */}
      <GameControls 
        isMobile={isMobile}
        gameStarted={gameStarted}
        gameOver={gameOver}
        countdown={countdown}
        moveLeft={moveLeft}
        moveRight={moveRight}
      />
    </div>
  );
};

export default GameArea;

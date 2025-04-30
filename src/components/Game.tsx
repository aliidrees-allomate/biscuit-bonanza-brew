
import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import GameHeader from './game/GameHeader';
import GameArea from './game/GameArea';
import { useGameLogic } from '@/hooks/useGameLogic';

const Game: React.FC = () => {
  const isMobile = useIsMobile();
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameSize, setGameSize] = useState({ width: 0, height: 0 });
  
  // Constants
  const cupWidth = isMobile ? 70 : 90;
  const cupSpeed = isMobile ? 15 : 25;
  
  // Get game logic from custom hook
  const {
    cupPosition,
    setCupPosition,
    score,
    gameStarted,
    gameOver,
    fallingItems,
    level,
    showLevelUp,
    countdown,
    elapsedTime,
    scoreAnimations,
    recentlyCaughtItem,
    formatTime,
    handleCatchItem,
    removeItem,
    startCountdown
  } = useGameLogic(gameSize);
  
  // Setup game area
  useEffect(() => {
    if (gameRef.current) {
      const updateSize = () => {
        if (gameRef.current) {
          const { width, height } = gameRef.current.getBoundingClientRect();
          setGameSize({ width, height });
          setCupPosition(width / 2);
        }
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      
      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }
  }, []);
  
  // Handle keyboard controls
  useEffect(() => {
    if (!gameStarted || gameOver || countdown !== null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && cupPosition > cupWidth/2) {
        setCupPosition(prev => Math.max(cupWidth/2, prev - cupSpeed));
      } else if (e.key === 'ArrowRight' && cupPosition < gameSize.width - cupWidth/2) {
        setCupPosition(prev => Math.min(gameSize.width - cupWidth/2, prev + cupSpeed));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameOver, cupPosition, gameSize.width, cupWidth, cupSpeed, countdown]);
  
  // Handle mobile controls
  const moveLeft = () => {
    if (countdown !== null) return;
    
    if (cupPosition > cupWidth/2) {
      setCupPosition(prev => Math.max(cupWidth/2, prev - cupSpeed));
    }
  };
  
  const moveRight = () => {
    if (countdown !== null) return;
    
    if (cupPosition < gameSize.width - cupWidth/2) {
      setCupPosition(prev => Math.min(gameSize.width - cupWidth/2, prev + cupSpeed));
    }
  };
  
  return (
    <div className="w-full flex flex-col items-center">
      <GameHeader 
        score={score}
        level={level}
        gameStarted={gameStarted}
        gameOver={gameOver}
        countdown={countdown}
        elapsedTime={elapsedTime}
        formatTime={formatTime}
        startCountdown={startCountdown}
      />
      
      <GameArea 
        gameRef={gameRef}
        gameStarted={gameStarted}
        gameOver={gameOver}
        countdown={countdown}
        cupPosition={cupPosition}
        isMobile={isMobile}
        recentlyCaughtItem={recentlyCaughtItem}
        fallingItems={fallingItems}
        cupWidth={cupWidth}
        gameSize={gameSize}
        scoreAnimations={scoreAnimations}
        showLevelUp={showLevelUp}
        level={level}
        score={score}
        elapsedTime={elapsedTime}
        formatTime={formatTime}
        onRemoveItem={removeItem}
        onCatchItem={handleCatchItem}
        onStartCountdown={startCountdown}
        moveLeft={moveLeft}
        moveRight={moveRight}
      />
      
      <div className="mt-4 text-sm text-[hsl(var(--tapal-green))] opacity-80 text-center px-4">
        Use left/right arrow keys to move cup, or tap arrow buttons on mobile. Catch the TAPAL Classic Butter Biscuits!
      </div>
    </div>
  );
};

export default Game;

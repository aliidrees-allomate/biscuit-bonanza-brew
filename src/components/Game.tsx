
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Award, Timer } from 'lucide-react';
import Cup from './Cup';
import FallingItem from './FallingItem';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface FallingItemType {
  id: string;
  type: 'biscuit' | 'egg';
  x: number;
  y: number;
  speed: number;
}

interface ScoreAnimationType {
  id: string;
  x: number;
  y: number;
  opacity: number;
}

const Game: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameSize, setGameSize] = useState({ width: 0, height: 0 });
  const [cupPosition, setCupPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [fallingItems, setFallingItems] = useState<FallingItemType[]>([]);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scoreAnimations, setScoreAnimations] = useState<ScoreAnimationType[]>([]);
  const [recentlyCaughtItem, setRecentlyCaughtItem] = useState<{type: 'biscuit' | 'egg', show: boolean}>({type: 'biscuit', show: false});
  
  // Constants
  const cupWidth = isMobile ? 70 : 90;
  const cupSpeed = isMobile ? 15 : 25;
  const maxItems = 15;
  const gameSpeed = useRef(1);
  const lastSpawnTime = useRef(0);
  const levelTimer = useRef<number | null>(null);
  const gameTimer = useRef<number | null>(null);
  const levelDuration = 60000; // 1 minute per level
  
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
  
  // Game timer for elapsed time
  useEffect(() => {
    if (!gameStarted || gameOver || countdown !== null) {
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
        gameTimer.current = null;
      }
      return;
    }
    
    gameTimer.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
      }
    };
  }, [gameStarted, gameOver, countdown]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Level management
  useEffect(() => {
    if (!gameStarted || gameOver || countdown !== null) {
      if (levelTimer.current) {
        clearTimeout(levelTimer.current);
        levelTimer.current = null;
      }
      return;
    }
    
    // Start level timer
    levelTimer.current = window.setTimeout(() => {
      const newLevel = level + 1;
      setLevel(newLevel);
      setShowLevelUp(true);
      
      // Increase game speed based on level
      gameSpeed.current = Math.min(4, 1 + (newLevel * 0.5));
      
      // Show level up toast
      toast({
        title: `Level ${newLevel}!`,
        description: `You've reached level ${newLevel}! The difficulty increases!`,
        duration: 3000,
      });
      
      // Hide level up message after 3 seconds
      setTimeout(() => setShowLevelUp(false), 3000);
      
      // Schedule next level
      levelTimer.current = window.setTimeout(() => {
        // This will be set in the next iteration of this effect
      }, levelDuration);
    }, levelDuration);
    
    return () => {
      if (levelTimer.current) {
        clearTimeout(levelTimer.current);
      }
    };
  }, [gameStarted, gameOver, level, toast, countdown]);
  
  // Item spawning logic
  useEffect(() => {
    if (!gameStarted || gameOver || countdown !== null || gameSize.width === 0) return;
    
    const spawnInterval = 1500 / gameSpeed.current;
    
    const spawnItem = () => {
      const now = Date.now();
      if (now - lastSpawnTime.current < spawnInterval) return;
      
      lastSpawnTime.current = now;
      
      // Increase egg probability based on level
      const eggProbability = 0.1 + (level * 0.02); // Increases by 2% per level
      const isEgg = Math.random() < eggProbability; 
      
      const newItem: FallingItemType = {
        id: Math.random().toString(36).substring(2, 9),
        type: isEgg ? 'egg' : 'biscuit',
        x: Math.random() * (gameSize.width - 60) + 30,
        y: -50,
        speed: (1.5 + Math.random() + (level * 0.2)) * gameSpeed.current, // Increase speed based on level
      };
      
      setFallingItems(prev => {
        if (prev.length >= maxItems) {
          return [...prev.slice(1), newItem];
        }
        return [...prev, newItem];
      });
    };
    
    const gameLoop = setInterval(() => {
      spawnItem();
    }, 1000 / level); // Spawn items faster as level increases
    
    return () => {
      clearInterval(gameLoop);
    };
  }, [gameStarted, gameOver, gameSize.width, level, countdown]);

  // Score animation effects
  useEffect(() => {
    if (scoreAnimations.length === 0) return;
    
    const animationInterval = setInterval(() => {
      setScoreAnimations(prev => 
        prev.map(anim => ({
          ...anim,
          y: anim.y - 2, // Move upward
          opacity: Math.max(0, anim.opacity - 0.02) // Fade out
        })).filter(anim => anim.opacity > 0) // Remove completely faded animations
      );
    }, 16); // ~60fps
    
    return () => {
      clearInterval(animationInterval);
    };
  }, [scoreAnimations]);
  
  // Handle catching items
  const handleCatchItem = (type: 'biscuit' | 'egg') => {
    // Show the caught item inside the cup
    setRecentlyCaughtItem({ type, show: true });
    setTimeout(() => setRecentlyCaughtItem({ type, show: false }), 500);
    
    if (type === 'biscuit') {
      // Add 10 points instead of 1
      setScore(prev => prev + 10);
      
      // Create score animation
      const newAnimation: ScoreAnimationType = {
        id: Math.random().toString(36).substring(2, 9),
        x: cupPosition,
        y: gameSize.height - 120,
        opacity: 1
      };
      
      setScoreAnimations(prev => [...prev, newAnimation]);
      
      toast({
        title: "Delicious!",
        description: "TAPAL Butter Biscuit caught! +10 points",
        duration: 1000,
      });
    } else {
      setGameOver(true);
      toast({
        variant: "destructive",
        title: "Oh no!",
        description: "You caught an egg! Game over.",
      });
    }
  };
  
  // Handle removing items
  const removeItem = (id: string) => {
    setFallingItems(prev => prev.filter(item => item.id !== id));
  };
  
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
  
  // Start countdown and then game
  const startCountdown = () => {
    setCountdown(3);
    setGameOver(false);
    setScore(0);
    setFallingItems([]);
    setLevel(1);
    setShowLevelUp(false);
    setElapsedTime(0);
    gameSpeed.current = 1;
    
    // Start countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setCountdown(null);
          setGameStarted(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  return (
    <div className="w-full flex flex-col items-center">
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
                onRemove={removeItem}
                onCatch={handleCatchItem}
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
              onClick={startCountdown}
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
              onClick={startCountdown}
              className="bg-[hsl(var(--tapal-red))] hover:bg-[hsl(var(--tapal-red))] hover:brightness-90 text-white"
            >
              Play Again
            </Button>
          </div>
        )}
        
        {/* Mobile controls */}
        {isMobile && gameStarted && !gameOver && countdown === null && (
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
        )}
      </div>
      
      <div className="mt-4 text-sm text-[hsl(var(--tapal-green))] opacity-80 text-center px-4">
        Use left/right arrow keys to move cup, or tap arrow buttons on mobile. Catch the TAPAL Classic Butter Biscuits!
      </div>
    </div>
  );
};

export default Game;

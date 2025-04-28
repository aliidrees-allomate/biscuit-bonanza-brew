
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Cup from './Cup';
import FallingItem from './FallingItem';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface FallingItemType {
  id: string;
  type: 'biscuit' | 'egg';
  x: number;
  y: number;
  speed: number;
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
  
  // Constants
  const cupWidth = isMobile ? 60 : 80;
  const cupSpeed = isMobile ? 10 : 20;
  const maxItems = 20;
  const gameSpeed = useRef(1);
  const lastSpawnTime = useRef(0);
  
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
    if (!gameStarted || gameOver) return;
    
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
  }, [gameStarted, gameOver, cupPosition, gameSize.width, cupWidth, cupSpeed]);
  
  // Item spawning logic
  useEffect(() => {
    if (!gameStarted || gameOver || gameSize.width === 0) return;
    
    const spawnInterval = 1500 / gameSpeed.current;
    
    const spawnItem = () => {
      const now = Date.now();
      if (now - lastSpawnTime.current < spawnInterval) return;
      
      lastSpawnTime.current = now;
      
      const isEgg = Math.random() < 0.2; // 20% chance of spawning an egg
      const newItem: FallingItemType = {
        id: Math.random().toString(36).substring(2, 9),
        type: isEgg ? 'egg' : 'biscuit',
        x: Math.random() * (gameSize.width - 40) + 20,
        y: -40,
        speed: (1 + Math.random()) * gameSpeed.current,
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
      // Increase game speed over time
      gameSpeed.current = Math.min(3, 1 + score / 50);
    }, 1000);
    
    return () => {
      clearInterval(gameLoop);
    };
  }, [gameStarted, gameOver, gameSize.width, score]);
  
  // Handle catching items
  const handleCatchItem = (type: 'biscuit' | 'egg') => {
    if (type === 'biscuit') {
      setScore(prev => prev + 1);
      toast({
        title: "Yum!",
        description: "Biscuit caught. +1 point!",
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
    if (cupPosition > cupWidth/2) {
      setCupPosition(prev => Math.max(cupWidth/2, prev - cupSpeed));
    }
  };
  
  const moveRight = () => {
    if (cupPosition < gameSize.width - cupWidth/2) {
      setCupPosition(prev => Math.min(gameSize.width - cupWidth/2, prev + cupSpeed));
    }
  };
  
  // Start a new game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setFallingItems([]);
    gameSpeed.current = 1;
  };
  
  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-2xl md:text-4xl font-bold mb-4">Biscuit Bonanza Brew</h1>
      
      <div className="flex justify-between w-full max-w-md mb-4">
        <div className="text-lg font-bold">Score: {score}</div>
        {!gameStarted && !gameOver && (
          <Button onClick={startGame}>Start Game</Button>
        )}
        {gameOver && (
          <Button onClick={startGame}>Play Again</Button>
        )}
      </div>
      
      <div 
        ref={gameRef}
        className="relative w-full max-w-md h-[500px] bg-[hsl(var(--game-bg))] rounded-lg border-4 border-amber-600 overflow-hidden"
      >
        {/* Game content */}
        {gameStarted && !gameOver && (
          <>
            <Cup position={cupPosition} isMobile={isMobile} />
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
          </>
        )}
        
        {/* Start screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold mb-6 text-center px-4">
              Catch the falling biscuits, but avoid the eggs!
            </div>
            <Button size="lg" onClick={startGame}>
              Start Game
            </Button>
          </div>
        )}
        
        {/* Game over screen */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <div className="text-xl font-bold mb-2 text-white">Game Over!</div>
            <div className="text-lg mb-6 text-white">Final Score: {score}</div>
            <Button size="lg" onClick={startGame}>
              Play Again
            </Button>
          </div>
        )}
        
        {/* Mobile controls */}
        {isMobile && gameStarted && !gameOver && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between p-2">
            <Button 
              variant="secondary" 
              size="lg" 
              className="h-16 w-16 rounded-full"
              onTouchStart={moveLeft}
              onClick={moveLeft}
            >
              <ArrowLeft size={24} />
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="h-16 w-16 rounded-full"
              onTouchStart={moveRight}
              onClick={moveRight}
            >
              <ArrowRight size={24} />
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm opacity-70 text-center px-4">
        Use left/right arrow keys to move cup. On mobile, use the arrow buttons.
      </div>
    </div>
  );
};

export default Game;

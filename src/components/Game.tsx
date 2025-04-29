
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
  const cupWidth = isMobile ? 70 : 90;
  const cupSpeed = isMobile ? 15 : 25;
  const maxItems = 15;
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
        x: Math.random() * (gameSize.width - 60) + 30,
        y: -50,
        speed: (1.5 + Math.random()) * gameSpeed.current,
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
      gameSpeed.current = Math.min(3.5, 1 + score / 40);
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
        title: "Delicious!",
        description: "TAPAL Butter Biscuit caught! +1 point",
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
      <div className="flex justify-between w-full max-w-md mb-4 items-center">
        <div className="bg-[hsl(var(--tapal-green))] text-[hsl(var(--tapal-cream))] px-4 py-1 rounded font-bold">
          Score: {score}
        </div>
        {!gameStarted && !gameOver && (
          <Button 
            onClick={startGame} 
            className="bg-[hsl(var(--tapal-red))] hover:bg-[hsl(var(--tapal-red))] hover:brightness-90 text-white"
          >
            Start Game
          </Button>
        )}
        {gameOver && (
          <Button 
            onClick={startGame}
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
              <p className="text-[hsl(var(--tapal-cream))] text-sm opacity-90">
                Catch the delicious Classic Butter Biscuits in your cup of TAPAL tea, but avoid the eggs!
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={startGame}
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
            <div className="text-lg mb-6 text-[hsl(var(--tapal-gold))]">Final Score: {score}</div>
            <div className="mb-4 text-center text-white text-sm">
              Nothing goes better with TAPAL tea than our delicious Classic Butter Biscuits!
            </div>
            <Button 
              size="lg" 
              onClick={startGame}
              className="bg-[hsl(var(--tapal-red))] hover:bg-[hsl(var(--tapal-red))] hover:brightness-90 text-white"
            >
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

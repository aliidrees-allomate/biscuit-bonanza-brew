import { useState, useEffect, useRef } from 'react';
import { FallingItemType, ScoreAnimationType } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

export function useGameLogic(gameSize: { width: number; height: number }) {
  const { toast } = useToast();
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
  
  // Game parameters
  const maxItems = 15;
  const gameSpeed = useRef(1);
  const lastSpawnTime = useRef(0);
  const levelTimer = useRef<number | null>(null);
  const gameTimer = useRef<number | null>(null);
  const levelDuration = 60000; // 1 minute per level
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
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
      
      // Continue to the next level (fix: don't end game here)
      levelTimer.current = window.setTimeout(() => {
        // Schedule the next level increase
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
      
      // Increase egg probability based on level - increased from previous value
      const eggProbability = 0.15 + (level * 0.03); // Increased from 0.1 + (level * 0.02)
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
      // Add 10 points
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

  return {
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
  };
}

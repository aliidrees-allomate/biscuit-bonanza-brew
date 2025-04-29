
import React from 'react';
import Game from '@/components/Game';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 md:pt-8 bg-[hsl(var(--tapal-cream))] px-4">
      <div className="text-center mb-4">
        <div className="inline-block bg-[hsl(var(--tapal-red))] text-white font-bold px-4 py-1 rounded mb-2">
          TAPAL
        </div>
        <h1 className="text-[hsl(var(--tapal-green))] text-xl md:text-2xl font-bold">
          Classic Butter Biscuit Game
        </h1>
        <p className="text-sm text-[hsl(var(--tapal-green))] opacity-80">
          ROYAL TRADITIONAL PAKISTANI TASTE
        </p>
      </div>
      
      <div className="w-full max-w-md ornamental-border">
        <Game />
      </div>
      
      <footer className="mt-6 text-xs text-center text-[hsl(var(--tapal-green))] opacity-70">
        © {new Date().getFullYear()} TAPAL - Classic Butter Biscuit
      </footer>
    </div>
  );
};

export default Index;

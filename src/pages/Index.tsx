
import React from 'react';
import Game from '@/components/Game';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 md:pt-8 bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <Game />
      </div>
    </div>
  );
};

export default Index;

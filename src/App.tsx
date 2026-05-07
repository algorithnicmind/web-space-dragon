import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';

function formatScore(n: number) {
  return String(n).padStart(5, '0');
}

function App() {
  const {
    canvasRef,
    gameState,
    score,
    highScore,
    handleInput
  } = useGameEngine();

  return (
    <div className="min-h-screen bg-white text-[#535353] font-press-start overflow-hidden relative flex flex-col items-center justify-center select-none">
      <main className="relative w-full max-w-3xl px-4 flex flex-col items-center">
        
        {/* HUD */}
        <div className="w-full flex justify-end gap-6 text-[10px] md:text-sm tracking-widest mb-2 z-10 opacity-70">
          <div>HI {formatScore(highScore)}</div>
          <div>{formatScore(score)}</div>
        </div>

        {/* Game Container */}
        <div 
          className="relative w-full aspect-[3/1] cursor-pointer touch-none outline-none"
          onMouseDown={handleInput}
          onTouchStart={(e) => { e.preventDefault(); handleInput(); }}
          tabIndex={0}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />

          {/* Overlays */}
          {gameState === 'START' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
              <h1 className="text-xl md:text-2xl text-center leading-relaxed tracking-widest text-[#535353]">
                PRESS SPACE TO START
              </h1>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none gap-4">
              <h2 className="text-lg md:text-xl text-[#535353] tracking-widest">
                G A M E &nbsp; O V E R
              </h2>
              <div className="animate-pulse text-xs text-[#535353]">
                Press Space to Restart
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

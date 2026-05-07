import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { motion, AnimatePresence } from 'framer-motion';

function formatScore(n: number) {
  return String(n).padStart(5, '0');
}

function App() {
  const {
    canvasRef,
    gameState,
    score,
    highScore,
    gameSpeed,
    isNewRecord,
    handleInput
  } = useGameEngine();

  return (
    <div className="min-h-screen bg-black text-white font-orbitron overflow-hidden relative selection:bg-cyan-500/30">
      {/* Aceternity Style Background Beams */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(72,0,128,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(0,128,128,0.15)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Ambient Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] pointer-events-none opacity-50" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-8">
        
        {/* Game Container Wrapper */}
        <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/20 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_rgba(0,255,255,0.08),0_0_120px_rgba(138,43,226,0.06),inset_0_0_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700">
          
          {/* Top Bar Decoration (Mac style) */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2 z-20">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="ml-auto text-[10px] text-white/30 tracking-widest uppercase">WEB SPACE DRAGON</div>
          </div>

          <div 
            className="relative w-full aspect-[2/1] mt-8 cursor-pointer touch-none"
            onMouseDown={handleInput}
            onTouchStart={(e) => { e.preventDefault(); handleInput(); }}
          >
            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4 md:p-6 pointer-events-none z-10">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs tracking-widest font-bold">SPD</span>
                <span className="text-orange-400 font-bold text-sm drop-shadow-[0_0_6px_rgba(255,159,67,0.5)]">
                  {(gameSpeed / 4.5).toFixed(1)}x
                </span>
              </div>
              <div className="flex items-center gap-6 font-press-start text-xs md:text-sm">
                <div className="text-white/40 tracking-widest">
                  HI <span className="text-white/60">{formatScore(highScore)}</span>
                </div>
                <div className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] tracking-widest">
                  {formatScore(score)}
                </div>
              </div>
            </div>

            {/* Overlays */}
            <AnimatePresence>
              {gameState === 'START' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none"
                >
                  <motion.h1 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="font-press-start text-2xl md:text-4xl text-center text-cyan-400 leading-relaxed mb-4 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]"
                  >
                    WEB SPACE<br />DRAGON
                  </motion.h1>
                  <p className="text-white/50 text-xs md:text-sm tracking-[0.2em] uppercase mb-8">
                    Navigate the cosmic void. Avoid the asteroids.
                  </p>
                  
                  <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-3 text-sm text-white/80"
                  >
                    <span className="bg-cyan-500/10 border border-cyan-500/30 rounded px-3 py-1 font-press-start text-[10px] text-cyan-400">SPACE</span>
                    <span>or</span>
                    <span className="bg-cyan-500/10 border border-cyan-500/30 rounded px-3 py-1 font-press-start text-[10px] text-cyan-400">CLICK</span>
                    <span>to launch</span>
                  </motion.div>
                </motion.div>
              )}

              {gameState === 'GAMEOVER' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md pointer-events-none"
                >
                  <motion.h2 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="font-press-start text-3xl md:text-5xl text-rose-500 mb-8 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]"
                  >
                    GAME OVER
                  </motion.h2>
                  
                  <div className="flex gap-12 mb-8">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Score</span>
                      <span className="font-press-start text-2xl md:text-3xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{score}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Best</span>
                      <span className="font-press-start text-2xl md:text-3xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{highScore}</span>
                    </div>
                  </div>

                  {isNewRecord && (
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="font-press-start text-yellow-400 text-sm mb-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                    >
                      🏆 NEW RECORD!
                    </motion.div>
                  )}

                  <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-3 text-sm text-white/80"
                  >
                    <span className="bg-cyan-500/10 border border-cyan-500/30 rounded px-3 py-1 font-press-start text-[10px] text-cyan-400">SPACE</span>
                    <span>or</span>
                    <span className="bg-cyan-500/10 border border-cyan-500/30 rounded px-3 py-1 font-press-start text-[10px] text-cyan-400">CLICK</span>
                    <span>to retry</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        <footer className="mt-8 text-white/20 text-[10px] tracking-[0.2em] uppercase text-center w-full max-w-4xl">
          Web Space Dragon &copy; 2026 AlgorithmicMind
        </footer>
      </main>
    </div>
  );
}

export default App;

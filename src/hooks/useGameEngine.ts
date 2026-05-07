import { useEffect, useRef, useState } from 'react';

// Game Constants
const CONFIG = {
  GRAVITY: 0.6,
  JUMP_FORCE: -11,
  INITIAL_SPEED: 6,
  MAX_SPEED: 18,
  SPEED_INCREMENT: 0.2,
  SPEED_MILESTONE: 100,
  GROUND_HEIGHT_RATIO: 0.1,
  DRAGON_WIDTH_RATIO: 0.04,
  OBSTACLE_MIN_GAP: 60,
  OBSTACLE_MAX_GAP: 140,
  HITBOX_PADDING: 4,
  STAR_COUNT: 20, // Reduced count, acting as space dust
  GROUND_SEGMENT_WIDTH: 30,
};

const DINO_COLOR = '#535353'; // Chrome dino gray

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('webSpaceDragonHI') || '0', 10));
  const [gameSpeed, setGameSpeed] = useState(CONFIG.INITIAL_SPEED);

  const stateRef = useRef({
    current: 'START' as GameState,
    score: 0,
    highScore: parseInt(localStorage.getItem('webSpaceDragonHI') || '0', 10),
    gameSpeed: CONFIG.INITIAL_SPEED,
    frameCount: 0,
    nextObstacleIn: 80,
    groundOffset: 0,
  });

  const entitiesRef = useRef({
    dragon: {
      x: 0, y: 0, width: 0, height: 0, dy: 0, isJumping: false, animFrame: 0, animTimer: 0
    },
    obstacles: [] as any[],
    stars: [] as any[],
  });

  const groundY = (canvas: HTMLCanvasElement) => canvas.height - canvas.height * CONFIG.GROUND_HEIGHT_RATIO;
  const randRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas to White
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Space Dust (Stars)
    ctx.fillStyle = DINO_COLOR;
    entitiesRef.current.stars.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
      if (stateRef.current.current === 'PLAYING') {
        star.x -= star.speed * (stateRef.current.gameSpeed / CONFIG.INITIAL_SPEED);
        if (star.x < 0) {
          star.x = canvas.width + Math.random() * 20;
          star.y = Math.random() * canvas.height * 0.7;
        }
      }
    });

    // Draw Ground Line
    const gY = groundY(canvas);
    ctx.strokeStyle = DINO_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.lineTo(canvas.width, gY);
    ctx.stroke();

    // Draw Ground Bumps/Texture
    const segW = CONFIG.GROUND_SEGMENT_WIDTH;
    const totalSegs = Math.ceil(canvas.width / segW) + 2;

    if (stateRef.current.current === 'PLAYING') {
      stateRef.current.groundOffset = (stateRef.current.groundOffset + stateRef.current.gameSpeed) % segW;
    }

    ctx.fillStyle = DINO_COLOR;
    for (let i = 0; i < totalSegs; i++) {
      const sx = i * segW - stateRef.current.groundOffset;
      // Random deterministic bumps based on index
      if (i % 3 === 0) ctx.fillRect(sx + 5, gY + 2, 2, 1);
      if (i % 5 === 0) ctx.fillRect(sx + 15, gY + 4, 3, 1);
      if (i % 7 === 0) ctx.fillRect(sx + 8, gY + 1, 1, 1);
    }

    // Draw Dragon (Monochrome)
    const dragon = entitiesRef.current.dragon;
    const cx = dragon.x;
    const cy = dragon.y;
    const w = dragon.width;
    const h = dragon.height;

    ctx.save();
    ctx.fillStyle = DINO_COLOR;
    
    // Body
    ctx.fillRect(cx + w * 0.2, cy + h * 0.2, w * 0.6, h * 0.5);
    // Head
    ctx.fillRect(cx + w * 0.5, cy, w * 0.5, h * 0.4);
    // Snout
    ctx.fillRect(cx + w * 0.6, cy + h * 0.1, w * 0.4, h * 0.2);

    // Eye (White cutout)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + w * 0.7, cy + h * 0.08, w * 0.1, h * 0.1);

    ctx.fillStyle = DINO_COLOR;

    // Legs
    const isRunning = stateRef.current.current === 'PLAYING' && !dragon.isJumping;
    const leg1Up = isRunning && dragon.animFrame === 0;
    const leg2Up = isRunning && dragon.animFrame === 1;

    // Back leg
    ctx.fillRect(cx + w * 0.3, cy + h * 0.7, w * 0.15, leg1Up ? h * 0.15 : h * 0.3);
    // Front leg
    ctx.fillRect(cx + w * 0.55, cy + h * 0.7, w * 0.15, leg2Up ? h * 0.15 : h * 0.3);

    // Tail
    ctx.fillRect(cx, cy + h * 0.3, w * 0.2, h * 0.1);
    ctx.fillRect(cx - w * 0.1, cy + h * 0.2, w * 0.1, h * 0.1);
    
    ctx.restore();

    // Draw Obstacles (Cacti-like objects, but let's make them space rocks)
    entitiesRef.current.obstacles.forEach(obs => {
      ctx.save();
      ctx.fillStyle = DINO_COLOR;
      
      if (obs.type === 'crystal') {
        // Simple triangle
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
      } else {
        // Blocky rock (Cactus style)
        ctx.fillRect(obs.x + obs.width * 0.2, obs.y, obs.width * 0.6, obs.height);
        ctx.fillRect(obs.x, obs.y + obs.height * 0.3, obs.width * 0.3, obs.height * 0.3);
        ctx.fillRect(obs.x + obs.width * 0.7, obs.y + obs.height * 0.2, obs.width * 0.3, obs.height * 0.4);
      }
      ctx.restore();
    });
  };

  const updateGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (stateRef.current.current === 'PLAYING') {
      const dragon = entitiesRef.current.dragon;
      
      // Update Dragon
      dragon.dy += CONFIG.GRAVITY;
      dragon.y += dragon.dy;
      const floor = groundY(canvas) - dragon.height;
      if (dragon.y >= floor) {
        dragon.y = floor;
        dragon.dy = 0;
        dragon.isJumping = false;
      }
      
      // Running animation
      dragon.animTimer++;
      if (dragon.animTimer > 5) {
        dragon.animTimer = 0;
        dragon.animFrame = (dragon.animFrame + 1) % 2;
      }

      // Update Obstacles
      stateRef.current.nextObstacleIn--;
      if (stateRef.current.nextObstacleIn <= 0) {
        const minW = 15; const maxW = 25; const minH = 20; const maxH = 40;
        const w = randRange(minW, maxW);
        const h = randRange(minH, maxH);
        const isElevated = Math.random() > 0.8; // mostly ground
        const baseY = groundY(canvas) - h;
        const y = isElevated ? baseY - randRange(20, 45) : baseY;

        entitiesRef.current.obstacles.push({
          x: canvas.width + 10, y, width: w, height: h, type: isElevated ? 'crystal' : 'rock',
        });
        
        const gapRange = CONFIG.OBSTACLE_MAX_GAP - CONFIG.OBSTACLE_MIN_GAP;
        const speedRatio = (stateRef.current.gameSpeed - CONFIG.INITIAL_SPEED) / (CONFIG.MAX_SPEED - CONFIG.INITIAL_SPEED);
        const gap = CONFIG.OBSTACLE_MAX_GAP - gapRange * speedRatio;
        stateRef.current.nextObstacleIn = Math.floor(randRange(gap * 0.8, gap * 1.2));
      }

      for (let i = entitiesRef.current.obstacles.length - 1; i >= 0; i--) {
        const obs = entitiesRef.current.obstacles[i];
        obs.x -= stateRef.current.gameSpeed;
        if (obs.x + obs.width < -10) {
          entitiesRef.current.obstacles.splice(i, 1);
          continue;
        }
        
        // Collision (AABB with padding)
        const p = CONFIG.HITBOX_PADDING;
        const hb = {
          x: dragon.x + p + dragon.width * 0.2,
          y: dragon.y + p,
          w: dragon.width * 0.6 - p * 2,
          h: dragon.height - p * 2,
        };
        
        if (hb.x < obs.x + obs.width && hb.x + hb.w > obs.x && hb.y < obs.y + obs.height && hb.y + hb.h > obs.y) {
          gameOver();
        }
      }

      // Score
      stateRef.current.frameCount++;
      if (stateRef.current.frameCount % 5 === 0) {
        stateRef.current.score++;
        setScore(stateRef.current.score);
        if (stateRef.current.score % CONFIG.SPEED_MILESTONE === 0 && stateRef.current.gameSpeed < CONFIG.MAX_SPEED) {
          stateRef.current.gameSpeed += CONFIG.SPEED_INCREMENT;
          setGameSpeed(stateRef.current.gameSpeed);
        }
      }
    }
  };

  const gameLoop = () => {
    if (stateRef.current.current !== 'PLAYING' && stateRef.current.current !== 'GAMEOVER') return;
    updateGame();
    renderGame();
    if (stateRef.current.current === 'PLAYING') {
      requestAnimationFrame(gameLoop);
    }
  };

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dragon = entitiesRef.current.dragon;
    dragon.width = Math.max(30, canvas.width * CONFIG.DRAGON_WIDTH_RATIO);
    dragon.height = dragon.width * 0.9;
    dragon.x = canvas.width * 0.05;
    dragon.y = groundY(canvas) - dragon.height;
    dragon.dy = 0;
    dragon.isJumping = false;
    
    entitiesRef.current.stars = Array.from({ length: CONFIG.STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.2 + 0.1,
    }));
    
    entitiesRef.current.obstacles = [];
  };

  const startGame = () => {
    initGame();
    stateRef.current.current = 'PLAYING';
    stateRef.current.score = 0;
    stateRef.current.frameCount = 0;
    stateRef.current.gameSpeed = CONFIG.INITIAL_SPEED;
    stateRef.current.nextObstacleIn = 80;
    
    setGameState('PLAYING');
    setScore(0);
    setGameSpeed(CONFIG.INITIAL_SPEED);
    
    requestAnimationFrame(gameLoop);
  };

  const gameOver = () => {
    stateRef.current.current = 'GAMEOVER';
    setGameState('GAMEOVER');
    
    if (stateRef.current.score > stateRef.current.highScore) {
      stateRef.current.highScore = stateRef.current.score;
      localStorage.setItem('webSpaceDragonHI', String(stateRef.current.score));
      setHighScore(stateRef.current.score);
    }
    
    // Render one last time to show the crash state
    renderGame();
  };

  const handleInput = () => {
    if (stateRef.current.current === 'START' || stateRef.current.current === 'GAMEOVER') {
      startGame();
    } else if (stateRef.current.current === 'PLAYING') {
      const dragon = entitiesRef.current.dragon;
      if (!dragon.isJumping) {
        dragon.dy = CONFIG.JUMP_FORCE;
        dragon.isJumping = true;
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleInput();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        if (stateRef.current.current === 'START' || stateRef.current.current === 'GAMEOVER') {
          initGame();
          renderGame();
        }
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return {
    canvasRef,
    gameState,
    score,
    highScore,
    handleInput
  };
}

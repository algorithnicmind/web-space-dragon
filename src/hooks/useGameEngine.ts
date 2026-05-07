import { useEffect, useRef, useState } from 'react';

// Game Constants
const CONFIG = {
  GRAVITY: 0.55,
  JUMP_FORCE: -11,
  INITIAL_SPEED: 4.5,
  MAX_SPEED: 14,
  SPEED_INCREMENT: 0.3,
  SPEED_MILESTONE: 100,
  GROUND_HEIGHT_RATIO: 0.12,
  DRAGON_WIDTH_RATIO: 0.055,
  OBSTACLE_MIN_GAP: 60,
  OBSTACLE_MAX_GAP: 120,
  HITBOX_PADDING: 4,
  STAR_COUNT: 120,
  GROUND_SEGMENT_WIDTH: 20,
};

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('webSpaceDragonHI') || '0', 10));
  const [gameSpeed, setGameSpeed] = useState(CONFIG.INITIAL_SPEED);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Mutable game state to avoid dependency cycles in requestAnimationFrame
  const stateRef = useRef({
    current: 'START' as GameState,
    score: 0,
    highScore: parseInt(localStorage.getItem('webSpaceDragonHI') || '0', 10),
    gameSpeed: CONFIG.INITIAL_SPEED,
    frameCount: 0,
    nextObstacleIn: 80,
    isNewRecord: false,
    groundOffset: 0,
  });

  const entitiesRef = useRef({
    dragon: {
      x: 0, y: 0, width: 0, height: 0, dy: 0, isJumping: false, animFrame: 0, animTimer: 0
    },
    obstacles: [] as any[],
    stars: [] as any[],
    particles: [] as any[],
  });

  // Helpers
  const groundY = (canvas: HTMLCanvasElement) => canvas.height - canvas.height * CONFIG.GROUND_HEIGHT_RATIO;
  const randRange = (min: number, max: number) => Math.random() * (max - min) + min;

  // Render methods
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Sky
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, '#020111');
    grd.addColorStop(0.5, '#0a0520');
    grd.addColorStop(1, '#150a30');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Stars
    entitiesRef.current.stars.forEach(star => {
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = '#fff';
      ctx.fillRect(star.x, star.y, star.size, star.size);
      if (stateRef.current.current === 'PLAYING') {
        star.x -= star.speed * (stateRef.current.gameSpeed / CONFIG.INITIAL_SPEED);
        if (star.x < 0) {
          star.x = canvas.width + Math.random() * 20;
          star.y = Math.random() * canvas.height * 0.85;
        }
      }
    });
    ctx.globalAlpha = 1;

    // Draw Ground
    const gY = groundY(canvas);
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.lineTo(canvas.width, gY);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(100, 100, 140, 0.2)';
    ctx.lineWidth = 1;
    const segW = CONFIG.GROUND_SEGMENT_WIDTH;
    const totalSegs = Math.ceil(canvas.width / segW) + 2;

    if (stateRef.current.current === 'PLAYING') {
      stateRef.current.groundOffset = (stateRef.current.groundOffset + stateRef.current.gameSpeed) % segW;
    }

    for (let i = 0; i < totalSegs; i++) {
      const sx = i * segW - stateRef.current.groundOffset;
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(sx, gY + 8);
        ctx.lineTo(sx + segW * 0.6, gY + 8);
        ctx.stroke();
      }
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.moveTo(sx + 5, gY + 18);
        ctx.lineTo(sx + segW * 0.4, gY + 18);
        ctx.stroke();
      }
    }

    const groundGrd = ctx.createLinearGradient(0, gY, 0, canvas.height);
    groundGrd.addColorStop(0, 'rgba(10, 5, 30, 0.8)');
    groundGrd.addColorStop(1, 'rgba(5, 2, 15, 1)');
    ctx.fillStyle = groundGrd;
    ctx.fillRect(0, gY + 1, canvas.width, canvas.height - gY);

    // Draw Dragon
    const dragon = entitiesRef.current.dragon;
    const cx = dragon.x;
    const cy = dragon.y;
    const w = dragon.width;
    const h = dragon.height;

    ctx.save();
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.roundRect(cx + w * 0.15, cy + h * 0.15, w * 0.7, h * 0.6, 6);
    ctx.fill();

    ctx.fillStyle = '#00bcd4';
    ctx.beginPath();
    ctx.roundRect(cx + w * 0.55, cy, w * 0.45, h * 0.45, 5);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + w * 0.82, cy + h * 0.18, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx + w * 0.84, cy + h * 0.18, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00acc1';
    const legOffset = dragon.isJumping ? 0 : Math.sin(dragon.animFrame * Math.PI / 2) * 4;
    ctx.fillRect(cx + w * 0.55, cy + h * 0.7, 5, h * 0.25 + legOffset);
    ctx.fillRect(cx + w * 0.25, cy + h * 0.7, 5, h * 0.25 - legOffset);

    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.15, cy + h * 0.4);
    ctx.quadraticCurveTo(
      cx - w * 0.1,
      cy + h * 0.2 + Math.sin(dragon.animTimer * 0.5) * 5,
      cx - w * 0.05,
      cy + h * 0.55
    );
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.35, cy + h * 0.15);
    ctx.lineTo(cx + w * 0.2, cy - h * 0.15 - (dragon.isJumping ? 5 : Math.sin(dragon.animTimer * 0.4) * 3));
    ctx.lineTo(cx + w * 0.55, cy + h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw Obstacles
    entitiesRef.current.obstacles.forEach(obs => {
      ctx.save();
      if (obs.type === 'crystal') {
        ctx.shadowColor = '#b24bf3';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#9b30ff';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(200, 150, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y + obs.height * 0.25);
        ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height * 0.85);
        ctx.lineTo(obs.x + obs.width * 0.3, obs.y + obs.height * 0.85);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#cc0044';

        ctx.beginPath();
        ctx.moveTo(obs.x + 3, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height * 0.3);
        ctx.lineTo(obs.x + obs.width * 0.3, obs.y);
        ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height * 0.1);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height * 0.25);
        ctx.lineTo(obs.x + obs.width - 2, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw Particles
    entitiesRef.current.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
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
      dragon.animTimer++;
      if (dragon.animTimer > 6) {
        dragon.animTimer = 0;
        dragon.animFrame = (dragon.animFrame + 1) % 4;
      }

      // Update Obstacles
      stateRef.current.nextObstacleIn--;
      if (stateRef.current.nextObstacleIn <= 0) {
        const minW = 20; const maxW = 35; const minH = 25; const maxH = 55;
        const w = randRange(minW, maxW);
        const h = randRange(minH, maxH);
        const isElevated = Math.random() > 0.85;
        const baseY = groundY(canvas) - h;
        const y = isElevated ? baseY - randRange(30, 60) : baseY;

        entitiesRef.current.obstacles.push({
          x: canvas.width + 10, y, width: w, height: h, type: isElevated ? 'crystal' : 'rock',
        });
        
        const gapRange = CONFIG.OBSTACLE_MAX_GAP - CONFIG.OBSTACLE_MIN_GAP;
        const speedRatio = (stateRef.current.gameSpeed - CONFIG.INITIAL_SPEED) / (CONFIG.MAX_SPEED - CONFIG.INITIAL_SPEED);
        const gap = CONFIG.OBSTACLE_MAX_GAP - gapRange * speedRatio * 0.7;
        stateRef.current.nextObstacleIn = Math.floor(randRange(gap * 0.7, gap));
      }

      for (let i = entitiesRef.current.obstacles.length - 1; i >= 0; i--) {
        const obs = entitiesRef.current.obstacles[i];
        obs.x -= stateRef.current.gameSpeed;
        if (obs.x + obs.width < -10) {
          entitiesRef.current.obstacles.splice(i, 1);
          continue;
        }
        
        // Collision
        const p = CONFIG.HITBOX_PADDING;
        const hb = {
          x: dragon.x + p + dragon.width * 0.15,
          y: dragon.y + p,
          w: dragon.width * 0.75 - p * 2,
          h: dragon.height - p * 2,
        };
        
        if (hb.x < obs.x + obs.width && hb.x + hb.w > obs.x && hb.y < obs.y + obs.height && hb.y + hb.h > obs.y) {
          gameOver();
        }
      }

      // Score
      stateRef.current.frameCount++;
      if (stateRef.current.frameCount % 6 === 0) {
        stateRef.current.score++;
        setScore(stateRef.current.score);
        if (stateRef.current.score % CONFIG.SPEED_MILESTONE === 0 && stateRef.current.gameSpeed < CONFIG.MAX_SPEED) {
          stateRef.current.gameSpeed += CONFIG.SPEED_INCREMENT;
          setGameSpeed(stateRef.current.gameSpeed);
        }
      }
    }

    // Update Particles
    for (let i = entitiesRef.current.particles.length - 1; i >= 0; i--) {
      const p = entitiesRef.current.particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.1;
      p.life -= p.decay;
      if (p.life <= 0) {
        entitiesRef.current.particles.splice(i, 1);
      }
    }
  };

  const gameLoop = () => {
    if (stateRef.current.current !== 'PLAYING' && stateRef.current.current !== 'GAMEOVER') return;
    
    updateGame();
    renderGame();
    
    if (stateRef.current.current === 'PLAYING' || entitiesRef.current.particles.length > 0) {
      requestAnimationFrame(gameLoop);
    }
  };

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Setup Dragon
    const dragon = entitiesRef.current.dragon;
    dragon.width = Math.max(36, canvas.width * CONFIG.DRAGON_WIDTH_RATIO);
    dragon.height = dragon.width * 0.85;
    dragon.x = canvas.width * 0.08;
    dragon.y = groundY(canvas) - dragon.height;
    dragon.dy = 0;
    dragon.isJumping = false;
    
    // Setup Stars
    entitiesRef.current.stars = Array.from({ length: CONFIG.STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.85,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.05,
      opacity: Math.random() * 0.6 + 0.4,
    }));
    
    entitiesRef.current.obstacles = [];
    entitiesRef.current.particles = [];
  };

  const startGame = () => {
    initGame();
    stateRef.current.current = 'PLAYING';
    stateRef.current.score = 0;
    stateRef.current.frameCount = 0;
    stateRef.current.gameSpeed = CONFIG.INITIAL_SPEED;
    stateRef.current.nextObstacleIn = 80;
    stateRef.current.isNewRecord = false;
    
    setGameState('PLAYING');
    setScore(0);
    setGameSpeed(CONFIG.INITIAL_SPEED);
    setIsNewRecord(false);
    
    requestAnimationFrame(gameLoop);
  };

  const gameOver = () => {
    stateRef.current.current = 'GAMEOVER';
    setGameState('GAMEOVER');
    
    const dragon = entitiesRef.current.dragon;
    const cx = dragon.x + dragon.width / 2;
    const cy = dragon.y + dragon.height / 2;
    
    for (let i = 0; i < 30; i++) {
      entitiesRef.current.particles.push({
        x: cx, y: cy,
        dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 2, life: 1, decay: Math.random() * 0.03 + 0.015,
        color: Math.random() > 0.5 ? '#0ff' : '#ff0055',
      });
    }
    
    if (stateRef.current.score > stateRef.current.highScore) {
      stateRef.current.highScore = stateRef.current.score;
      stateRef.current.isNewRecord = true;
      localStorage.setItem('webSpaceDragonHI', String(stateRef.current.score));
      setHighScore(stateRef.current.score);
      setIsNewRecord(true);
    }
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
        if (stateRef.current.current === 'START') {
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
    gameSpeed,
    isNewRecord,
    handleInput
  };
}

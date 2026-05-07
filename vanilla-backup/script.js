/* ============================================================
   WEB SPACE DRAGON — Production Game Engine
   Vanilla JS + HTML5 Canvas
   ============================================================ */

// ── Canvas Setup ──────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ── DOM References ────────────────────────────────────────────
const DOM = {
    score: document.getElementById('score'),
    highScore: document.getElementById('high-score'),
    speedValue: document.getElementById('speed-value'),
    startScreen: document.getElementById('start-screen'),
    gameoverScreen: document.getElementById('gameover-screen'),
    finalScore: document.getElementById('final-score'),
    finalHighScore: document.getElementById('final-high-score'),
    newRecord: document.getElementById('new-record'),
};

// ── Constants ─────────────────────────────────────────────────
const CONFIG = {
    GRAVITY: 0.55,
    JUMP_FORCE: -11,
    INITIAL_SPEED: 4.5,
    MAX_SPEED: 14,
    SPEED_INCREMENT: 0.3,
    SPEED_MILESTONE: 100,
    GROUND_HEIGHT_RATIO: 0.12,    // ground height as ratio of canvas height
    DRAGON_WIDTH_RATIO: 0.055,     // dragon width as ratio of canvas width
    OBSTACLE_MIN_GAP: 60,         // minimum frames between obstacle spawns
    OBSTACLE_MAX_GAP: 120,
    HITBOX_PADDING: 4,            // pixels of forgiveness on collision
    STAR_COUNT: 120,
    GROUND_SEGMENT_WIDTH: 20,
};

// ── State ─────────────────────────────────────────────────────
const State = {
    current: 'START',   // START | PLAYING | GAMEOVER
    score: 0,
    highScore: parseInt(localStorage.getItem('webSpaceDragonHI') || '0', 10),
    gameSpeed: CONFIG.INITIAL_SPEED,
    frameCount: 0,
    nextObstacleIn: 80,
    isNewRecord: false,
};

DOM.highScore.textContent = formatScore(State.highScore);

// ── Utility ───────────────────────────────────────────────────
function formatScore(n) {
    return String(n).padStart(5, '0');
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function groundY() {
    return canvas.height - canvas.height * CONFIG.GROUND_HEIGHT_RATIO;
}

// ── Dragon Entity ─────────────────────────────────────────────
const dragon = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dy: 0,
    isJumping: false,
    animFrame: 0,
    animTimer: 0,

    init() {
        this.width = Math.max(36, canvas.width * CONFIG.DRAGON_WIDTH_RATIO);
        this.height = this.width * 0.85;
        this.x = canvas.width * 0.08;
        this.y = groundY() - this.height;
        this.dy = 0;
        this.isJumping = false;
        this.animFrame = 0;
        this.animTimer = 0;
    },

    update(dt) {
        // Gravity
        this.dy += CONFIG.GRAVITY;
        this.y += this.dy;

        // Ground clamp
        const floor = groundY() - this.height;
        if (this.y >= floor) {
            this.y = floor;
            this.dy = 0;
            this.isJumping = false;
        }

        // Running animation timer
        this.animTimer++;
        if (this.animTimer > 6) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    },

    jump() {
        if (!this.isJumping) {
            this.dy = CONFIG.JUMP_FORCE;
            this.isJumping = true;
        }
    },

    draw() {
        const cx = this.x;
        const cy = this.y;
        const w = this.width;
        const h = this.height;

        ctx.save();

        // Glow
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 18;

        // Body
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.roundRect(cx + w * 0.15, cy + h * 0.15, w * 0.7, h * 0.6, 6);
        ctx.fill();

        // Head
        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.roundRect(cx + w * 0.55, cy, w * 0.45, h * 0.45, 5);
        ctx.fill();

        // Eye
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx + w * 0.82, cy + h * 0.18, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx + w * 0.84, cy + h * 0.18, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Legs (animated)
        ctx.fillStyle = '#00acc1';
        const legOffset = this.isJumping ? 0 : Math.sin(this.animFrame * Math.PI / 2) * 4;
        // Front leg
        ctx.fillRect(cx + w * 0.55, cy + h * 0.7, 5, h * 0.25 + legOffset);
        // Back leg
        ctx.fillRect(cx + w * 0.25, cy + h * 0.7, 5, h * 0.25 - legOffset);

        // Tail
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx + w * 0.15, cy + h * 0.4);
        ctx.quadraticCurveTo(
            cx - w * 0.1,
            cy + h * 0.2 + Math.sin(this.animTimer * 0.5) * 5,
            cx - w * 0.05,
            cy + h * 0.55
        );
        ctx.stroke();

        // Wing (small triangle)
        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(cx + w * 0.35, cy + h * 0.15);
        ctx.lineTo(cx + w * 0.2, cy - h * 0.15 - (this.isJumping ? 5 : Math.sin(this.animTimer * 0.4) * 3));
        ctx.lineTo(cx + w * 0.55, cy + h * 0.15);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    getHitbox() {
        const p = CONFIG.HITBOX_PADDING;
        return {
            x: this.x + p + this.width * 0.15,
            y: this.y + p,
            w: this.width * 0.75 - p * 2,
            h: this.height - p * 2,
        };
    }
};

// ── Obstacle Pool ─────────────────────────────────────────────
const obstacles = [];

function createObstacle() {
    const gY = groundY();
    const minW = 20;
    const maxW = 35;
    const minH = 25;
    const maxH = 55;
    const w = randRange(minW, maxW);
    const h = randRange(minH, maxH);
    // Decide type: 85% ground, 15% elevated
    const isElevated = Math.random() > 0.85;
    const baseY = gY - h;
    const y = isElevated ? baseY - randRange(30, 60) : baseY;

    obstacles.push({
        x: canvas.width + 10,
        y: y,
        width: w,
        height: h,
        type: isElevated ? 'crystal' : 'rock',
        passed: false,
    });
}

function updateObstacles() {
    // Spawn control
    State.nextObstacleIn--;
    if (State.nextObstacleIn <= 0) {
        createObstacle();
        const gapRange = CONFIG.OBSTACLE_MAX_GAP - CONFIG.OBSTACLE_MIN_GAP;
        const speedRatio = (State.gameSpeed - CONFIG.INITIAL_SPEED) / (CONFIG.MAX_SPEED - CONFIG.INITIAL_SPEED);
        const gap = CONFIG.OBSTACLE_MAX_GAP - gapRange * speedRatio * 0.7;
        State.nextObstacleIn = Math.floor(randRange(gap * 0.7, gap));
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= State.gameSpeed;

        // Remove off-screen
        if (obs.x + obs.width < -10) {
            obstacles.splice(i, 1);
            continue;
        }

        // Draw obstacle
        drawObstacle(obs);

        // Collision check
        if (checkCollision(dragon.getHitbox(), obs)) {
            triggerGameOver();
            return;
        }
    }
}

function drawObstacle(obs) {
    ctx.save();

    if (obs.type === 'crystal') {
        // Crystal — purple glowing polygon
        ctx.shadowColor = '#b24bf3';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#9b30ff';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        // Inner shine
        ctx.fillStyle = 'rgba(200, 150, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y + obs.height * 0.25);
        ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height * 0.85);
        ctx.lineTo(obs.x + obs.width * 0.3, obs.y + obs.height * 0.85);
        ctx.closePath();
        ctx.fill();
    } else {
        // Rock — jagged red/orange block
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

        // Highlight edge
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    ctx.restore();
}

function checkCollision(hb, obs) {
    return (
        hb.x < obs.x + obs.width &&
        hb.x + hb.w > obs.x &&
        hb.y < obs.y + obs.height &&
        hb.y + hb.h > obs.y
    );
}

// ── Background: Stars ─────────────────────────────────────────
const stars = [];
function initStars() {
    stars.length = 0;
    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.85,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.4 + 0.05,
            opacity: Math.random() * 0.6 + 0.4,
        });
    }
}
initStars();

function drawStars() {
    stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = '#fff';
        ctx.fillRect(star.x, star.y, star.size, star.size);

        if (State.current === 'PLAYING') {
            star.x -= star.speed * (State.gameSpeed / CONFIG.INITIAL_SPEED);
            if (star.x < 0) {
                star.x = canvas.width + Math.random() * 20;
                star.y = Math.random() * canvas.height * 0.85;
            }
        }
    });
    ctx.globalAlpha = 1;
}

// ── Background: Ground ────────────────────────────────────────
let groundOffset = 0;

function drawGround() {
    const gY = groundY();

    // Ground surface line (glowing)
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

    // Ground texture — scrolling dashes
    ctx.strokeStyle = 'rgba(100, 100, 140, 0.2)';
    ctx.lineWidth = 1;
    const segW = CONFIG.GROUND_SEGMENT_WIDTH;
    const totalSegs = Math.ceil(canvas.width / segW) + 2;

    if (State.current === 'PLAYING') {
        groundOffset = (groundOffset + State.gameSpeed) % segW;
    }

    for (let i = 0; i < totalSegs; i++) {
        const sx = i * segW - groundOffset;
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

    // Ground fill (subtle gradient)
    const grd = ctx.createLinearGradient(0, gY, 0, canvas.height);
    grd.addColorStop(0, 'rgba(10, 5, 30, 0.8)');
    grd.addColorStop(1, 'rgba(5, 2, 15, 1)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, gY + 1, canvas.width, canvas.height - gY);
}

// ── Background: Gradient Sky ──────────────────────────────────
function drawSky() {
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, '#020111');
    grd.addColorStop(0.5, '#0a0520');
    grd.addColorStop(1, '#150a30');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ── Particle System (death explosion) ─────────────────────────
const particles = [];

function spawnDeathParticles() {
    const cx = dragon.x + dragon.width / 2;
    const cy = dragon.y + dragon.height / 2;
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: cx,
            y: cy,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            size: Math.random() * 4 + 2,
            life: 1,
            decay: Math.random() * 0.03 + 0.015,
            color: Math.random() > 0.5 ? '#0ff' : '#ff0055',
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.1;
        p.life -= p.decay;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
    }
}

// ── Score & Speed ─────────────────────────────────────────────
function updateScore() {
    State.frameCount++;
    if (State.frameCount % 6 === 0) {
        State.score++;
        DOM.score.textContent = formatScore(State.score);

        // Speed increase milestone
        if (State.score % CONFIG.SPEED_MILESTONE === 0 && State.gameSpeed < CONFIG.MAX_SPEED) {
            State.gameSpeed += CONFIG.SPEED_INCREMENT;
            DOM.speedValue.textContent = (State.gameSpeed / CONFIG.INITIAL_SPEED).toFixed(1) + 'x';
        }
    }
}

// ── Game State Transitions ────────────────────────────────────
function startGame() {
    resetGame();
    State.current = 'PLAYING';
    DOM.startScreen.classList.remove('active');
    DOM.gameoverScreen.classList.remove('active');
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    dragon.init();
    obstacles.length = 0;
    particles.length = 0;
    State.score = 0;
    State.frameCount = 0;
    State.gameSpeed = CONFIG.INITIAL_SPEED;
    State.nextObstacleIn = 80;
    State.isNewRecord = false;
    groundOffset = 0;
    DOM.score.textContent = formatScore(0);
    DOM.speedValue.textContent = '1.0x';
    DOM.newRecord.classList.add('hidden');
}

function triggerGameOver() {
    State.current = 'GAMEOVER';

    spawnDeathParticles();

    // High score check
    if (State.score > State.highScore) {
        State.highScore = State.score;
        State.isNewRecord = true;
        localStorage.setItem('webSpaceDragonHI', String(State.highScore));
        DOM.highScore.textContent = formatScore(State.highScore);
    }

    DOM.finalScore.textContent = State.score;
    DOM.finalHighScore.textContent = State.highScore;

    if (State.isNewRecord) {
        DOM.newRecord.classList.remove('hidden');
    } else {
        DOM.newRecord.classList.add('hidden');
    }

    // Slight delay before showing overlay (let particles show)
    setTimeout(() => {
        DOM.gameoverScreen.classList.add('active');
    }, 400);
}

// ── Game Loop ─────────────────────────────────────────────────
let lastTime = 0;

function gameLoop(timestamp) {
    if (State.current !== 'PLAYING' && State.current !== 'GAMEOVER') return;

    // Draw scene
    drawSky();
    drawStars();
    drawGround();

    if (State.current === 'PLAYING') {
        dragon.update();
        dragon.draw();
        updateObstacles();
        updateScore();
    }

    // Always render particles (even in GAMEOVER for the death effect)
    updateParticles();

    // In GAMEOVER we still keep rendering to show particles fading
    if (State.current === 'GAMEOVER' && particles.length > 0) {
        requestAnimationFrame(gameLoop);
    } else if (State.current === 'PLAYING') {
        requestAnimationFrame(gameLoop);
    }
}

// ── Initial Render (START screen background) ──────────────────
function renderStartScreen() {
    resizeCanvas();
    initStars();
    dragon.init();
    drawSky();
    drawStars();
    drawGround();
    dragon.draw();
}
renderStartScreen();

// ── Input Handling ────────────────────────────────────────────
function handleInput(e) {
    // Filter keyboard events
    if (e.type === 'keydown') {
        if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
        e.preventDefault();
    }

    switch (State.current) {
        case 'START':
        case 'GAMEOVER':
            startGame();
            break;
        case 'PLAYING':
            dragon.jump();
            break;
    }
}

window.addEventListener('keydown', handleInput);
document.addEventListener('mousedown', handleInput);
document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput(e);
}, { passive: false });

// Re-render on resize while on start screen
window.addEventListener('resize', () => {
    if (State.current === 'START') {
        renderStartScreen();
    }
});

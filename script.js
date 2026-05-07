const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const INITIAL_SPEED = 5;
const GROUND_HEIGHT = 50;

// Game State
let currentState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let highScore = localStorage.getItem('webSpaceDragonHighScore') || 0;
let gameSpeed = INITIAL_SPEED;
let frameCount = 0;

highScoreElement.innerText = highScore;

// Entities
const dragon = {
    x: 50,
    y: 0,
    width: 40,
    height: 40,
    dy: 0,
    isJumping: false,
    
    draw() {
        // Draw Dragon (simple shape with some glow for space theme)
        ctx.save();
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#0ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eye
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 25, this.y + 10, 5, 5);
        ctx.restore();
    },
    
    update() {
        this.dy += GRAVITY;
        this.y += this.dy;
        
        // Ground collision
        if (this.y + this.height > canvas.height - GROUND_HEIGHT) {
            this.y = canvas.height - GROUND_HEIGHT - this.height;
            this.dy = 0;
            this.isJumping = false;
        }
    },
    
    jump() {
        if (!this.isJumping) {
            this.dy = JUMP_FORCE;
            this.isJumping = true;
        }
    }
};

let obstacles = [];

class Obstacle {
    constructor() {
        this.width = 30 + Math.random() * 20;
        this.height = 30 + Math.random() * 40;
        this.x = canvas.width;
        this.y = canvas.height - GROUND_HEIGHT - this.height;
        // Sometimes spawn floating obstacles
        if (Math.random() > 0.8) {
            this.y -= 50 + Math.random() * 40;
        }
        this.color = '#ff0055';
    }
    
    draw() {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
    
    update() {
        this.x -= gameSpeed;
    }
}

// Background Stars
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

function drawBackground() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        if (currentState === 'PLAYING') {
            star.x -= star.speed * (gameSpeed / 5);
            if (star.x < 0) star.x = canvas.width;
        }
    });
    
    // Draw ground line
    ctx.strokeStyle = '#20124d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - GROUND_HEIGHT);
    ctx.lineTo(canvas.width, canvas.height - GROUND_HEIGHT);
    ctx.stroke();
}

function handleObstacles() {
    // Spawn obstacles
    if (frameCount % Math.floor(100 * (INITIAL_SPEED / gameSpeed)) === 0) {
        obstacles.push(new Obstacle());
    }
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();
        
        // Collision Detection (AABB)
        const obs = obstacles[i];
        if (
            dragon.x < obs.x + obs.width &&
            dragon.x + dragon.width > obs.x &&
            dragon.y < obs.y + obs.height &&
            dragon.y + dragon.height > obs.y
        ) {
            gameOver();
        }
        
        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function updateScore() {
    frameCount++;
    if (frameCount % 10 === 0) {
        score++;
        scoreElement.innerText = score;
        
        // Increase speed slightly
        if (score % 100 === 0) {
            gameSpeed += 0.5;
        }
    }
}

function resetGame() {
    dragon.y = canvas.height - GROUND_HEIGHT - dragon.height;
    dragon.dy = 0;
    dragon.isJumping = false;
    obstacles = [];
    score = 0;
    frameCount = 0;
    gameSpeed = INITIAL_SPEED;
    scoreElement.innerText = score;
}

function gameOver() {
    currentState = 'GAMEOVER';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('webSpaceDragonHighScore', highScore);
        highScoreElement.innerText = highScore;
    }
    finalScoreElement.innerText = score;
    gameOverScreen.classList.add('active');
}

function startGame() {
    resetGame();
    currentState = 'PLAYING';
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    gameLoop();
}

function gameLoop() {
    if (currentState !== 'PLAYING') return;
    
    drawBackground();
    dragon.update();
    dragon.draw();
    handleObstacles();
    updateScore();
    
    requestAnimationFrame(gameLoop);
}

// Initial draw for START screen
drawBackground();
dragon.y = canvas.height - GROUND_HEIGHT - dragon.height;
dragon.draw();

// Input Handling
function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
    
    // Prevent default scrolling for spacebar/up arrow
    if (e.type === 'keydown') e.preventDefault();
    
    if (currentState === 'START' || currentState === 'GAMEOVER') {
        startGame();
    } else if (currentState === 'PLAYING') {
        dragon.jump();
    }
}

window.addEventListener('keydown', handleInput);
// Use mousedown/touchstart on document to allow clicking anywhere
document.addEventListener('mousedown', handleInput);
document.addEventListener('touchstart', (e) => {
    // Prevent default to stop emulated mousedown
    e.preventDefault();
    handleInput(e);
}, { passive: false });

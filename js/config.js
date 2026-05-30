/* ============================================================
   config.js — Game Constants & Default Settings
   ============================================================ */

// Canvas dimensions (internal resolution)
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 300;

// Ground
export const GROUND_Y = 250; // Y position of the ground line
export const GROUND_HEIGHT = 50; // Height of the ground area

// Player
export const PLAYER_X = 60; // Fixed horizontal position
export const PLAYER_WIDTH = 44;
export const PLAYER_HEIGHT = 48;
export const PLAYER_DUCK_HEIGHT = 30;
export const PLAYER_DUCK_WIDTH = 56;
export const JUMP_FORCE = -550; // Negative = upward
export const GRAVITY = 1800;
export const HITBOX_INSET = 6; // Pixels inset from visual bounds

// Speeds
export const INITIAL_SPEED = 300; // px/s
export const MAX_SPEED = 900;
export const SPEED_SCALE_FACTOR = 0.05; // Speed increase per point

// Obstacles
export const OBSTACLE_MIN_GAP = 250; // Minimum px between obstacles
export const OBSTACLE_GAP_FLOOR = 150; // Absolute minimum gap
export const OBSTACLE_GAP_SCALE = 0.02; // Gap reduction per point

// Birds
export const BIRD_SCORE_THRESHOLD = 300;
export const BIRD_WIDTH = 46;
export const BIRD_HEIGHT = 32;
export const BIRD_LOW_Y = GROUND_Y - 36; // Duck height
export const BIRD_HIGH_Y = GROUND_Y - 75; // Jump height

// Cactus
export const CACTUS_SMALL_WIDTH = 18;
export const CACTUS_SMALL_HEIGHT = 36;
export const CACTUS_LARGE_WIDTH = 26;
export const CACTUS_LARGE_HEIGHT = 52;
export const CACTUS_GROUP_WIDTH = 50;
export const CACTUS_GROUP_HEIGHT = 36;

// Scoring
export const SCORE_INTERVAL = 100; // Points between milestone dings
export const SCORE_MULTIPLIERS = [
    { threshold: 0, multiplier: 1.0 },
    { threshold: 500, multiplier: 1.2 },
    { threshold: 1000, multiplier: 1.5 },
    { threshold: 2000, multiplier: 2.0 },
    { threshold: 5000, multiplier: 2.5 },
];

// Day/Night cycle
export const DAY_NIGHT_INTERVAL = 700; // Points between transitions

// Power-ups
export const POWERUP_SCORE_THRESHOLD = 200;
export const POWERUP_SPAWN_CHANCE = 0.02; // 2% per spawn cycle
export const POWERUP_WIDTH = 24;
export const POWERUP_HEIGHT = 24;
export const POWERUP_DURATIONS = {
    shield: Infinity, // Until hit
    slowmo: 5000,
    doublejump: 8000,
    invincible: 4000,
};
export const SLOWMO_FACTOR = 0.6; // 40% speed reduction

// Animation
export const DINO_RUN_FRAME_RATE = 8; // Frames per second for leg animation
export const BIRD_FRAME_RATE = 6;

// Difficulty presets
export const DIFFICULTY_PRESETS = {
    easy: { speedMultiplier: 0.7, gapMultiplier: 1.4, label: 'Easy' },
    normal: { speedMultiplier: 1.0, gapMultiplier: 1.0, label: 'Normal' },
    hard: { speedMultiplier: 1.3, gapMultiplier: 0.75, label: 'Hard' },
    insane: { speedMultiplier: 1.6, gapMultiplier: 0.55, label: 'Insane' },
};

// Skins
export const SKINS = [
    { id: 'classic', name: 'Classic', body: '#535353', accent: '#444', eye: '#fff', unlockScore: 0 },
    { id: 'midnight', name: 'Midnight', body: '#4a2d7a', accent: '#3a1d6a', eye: '#c8a2ff', unlockScore: 500 },
    { id: 'ember', name: 'Ember', body: '#c0392b', accent: '#a93226', eye: '#ffd700', unlockScore: 1000 },
    { id: 'arctic', name: 'Arctic', body: '#5dade2', accent: '#3498db', eye: '#ecf0f1', unlockScore: 2000 },
    { id: 'golden', name: 'Golden', body: '#d4ac0d', accent: '#b7950b', eye: '#fff', unlockScore: 3000 },
    { id: 'shadow', name: 'Shadow', body: '#1a1a2e', accent: '#0f0f1e', eye: '#e94560', unlockScore: 5000 },
    { id: 'neon', name: 'Neon', body: '#00e5ff', accent: '#00b8d4', eye: '#ff1744', unlockScore: 7500 },
    { id: 'rainbow', name: 'Rainbow', body: 'rainbow', accent: 'rainbow', eye: '#fff', unlockScore: 10000 },
];

// Default settings
export const DEFAULT_SETTINGS = {
    volume: 70,
    difficulty: 'normal',
    graphics: 'high',
    selectedSkin: 'classic',
    muted: false,
};

// Game states
export const GameState = {
    LOADING: 'loading',
    START: 'start',
    RUNNING: 'running',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
};

// Object pool sizes
export const MAX_OBSTACLES = 10;
export const MAX_POWERUPS = 3;
export const MAX_CLOUDS = 6;
export const MAX_STARS = 30;

/* ============================================================
   sprites.js — Programmatic Pixel-Art Drawing
   All game visuals drawn via Canvas 2D API primitives.
   Each function draws onto a provided CanvasRenderingContext2D.
   ============================================================ */

/**
 * Pre-renders a sprite onto an off-screen canvas for fast blitting.
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {Function} drawFn - Function(ctx, w, h, colors) that draws the sprite
 * @param {Object} colors - Color palette for the skin
 * @returns {HTMLCanvasElement}
 */
export function createSpriteCanvas(w, h, drawFn, colors) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, w, h, colors);
    return canvas;
}

// ======================== DINOSAUR SPRITES ========================

/**
 * Draws the dino's body shape (shared between frames).
 */
function drawDinoBody(ctx, x, y, colors) {
    const c = colors;
    ctx.fillStyle = c.body;

    // Head
    ctx.fillRect(x + 22, y, 22, 18);
    // Eye socket
    ctx.fillStyle = c.eye;
    ctx.fillRect(x + 36, y + 4, 5, 5);
    // Pupil
    ctx.fillStyle = '#111';
    ctx.fillRect(x + 38, y + 5, 3, 3);

    // Mouth gap
    ctx.fillStyle = c.body;
    ctx.fillRect(x + 32, y + 14, 12, 4);

    // Jaw
    ctx.fillRect(x + 26, y + 16, 18, 6);

    // Neck
    ctx.fillRect(x + 18, y + 12, 10, 14);

    // Body
    ctx.fillRect(x + 8, y + 18, 22, 20);

    // Arm
    ctx.fillStyle = c.accent;
    ctx.fillRect(x + 28, y + 24, 4, 10);
    ctx.fillRect(x + 30, y + 32, 4, 3);

    // Tail
    ctx.fillStyle = c.body;
    ctx.fillRect(x, y + 22, 10, 6);
    ctx.fillRect(x - 4, y + 24, 6, 4);
}

/**
 * Dino running frame 1 (left leg forward).
 */
export function drawDinoRun1(ctx, w, h, colors) {
    const x = 2, y = 2;
    drawDinoBody(ctx, x, y, colors);
    ctx.fillStyle = colors.body;
    // Left leg (forward)
    ctx.fillRect(x + 12, y + 38, 6, 10);
    // Right leg (back, lifted)
    ctx.fillRect(x + 24, y + 38, 6, 6);
}

/**
 * Dino running frame 2 (right leg forward).
 */
export function drawDinoRun2(ctx, w, h, colors) {
    const x = 2, y = 2;
    drawDinoBody(ctx, x, y, colors);
    ctx.fillStyle = colors.body;
    // Left leg (back, lifted)
    ctx.fillRect(x + 12, y + 38, 6, 6);
    // Right leg (forward)
    ctx.fillRect(x + 24, y + 38, 6, 10);
}

/**
 * Dino jump pose (both legs together).
 */
export function drawDinoJump(ctx, w, h, colors) {
    const x = 2, y = 2;
    drawDinoBody(ctx, x, y, colors);
    ctx.fillStyle = colors.body;
    // Both legs down
    ctx.fillRect(x + 12, y + 38, 6, 10);
    ctx.fillRect(x + 24, y + 38, 6, 10);
}

/**
 * Dino dead pose (X eyes).
 */
export function drawDinoDead(ctx, w, h, colors) {
    const x = 2, y = 2;
    drawDinoBody(ctx, x, y, colors);
    ctx.fillStyle = colors.body;
    // Both legs down
    ctx.fillRect(x + 12, y + 38, 6, 10);
    ctx.fillRect(x + 24, y + 38, 6, 10);

    // X eyes
    ctx.fillStyle = colors.eye;
    ctx.fillRect(x + 36, y + 4, 5, 5);
    ctx.fillStyle = '#e94560';
    // X pattern
    ctx.fillRect(x + 36, y + 4, 2, 2);
    ctx.fillRect(x + 39, y + 4, 2, 2);
    ctx.fillRect(x + 37, y + 5, 2, 2);
    ctx.fillRect(x + 36, y + 7, 2, 2);
    ctx.fillRect(x + 39, y + 7, 2, 2);
}

// ======================== DUCKING DINO ========================

function drawDinoDuckBody(ctx, x, y, colors) {
    ctx.fillStyle = colors.body;
    // Flat body
    ctx.fillRect(x, y + 4, 48, 16);
    // Head (forward)
    ctx.fillRect(x + 40, y, 16, 14);
    // Eye
    ctx.fillStyle = colors.eye;
    ctx.fillRect(x + 50, y + 3, 4, 4);
    ctx.fillStyle = '#111';
    ctx.fillRect(x + 51, y + 4, 2, 2);
    // Jaw
    ctx.fillStyle = colors.body;
    ctx.fillRect(x + 44, y + 12, 12, 4);
    // Tail
    ctx.fillRect(x - 4, y + 6, 6, 8);
}

export function drawDinoDuck1(ctx, w, h, colors) {
    const x = 2, y = 4;
    drawDinoDuckBody(ctx, x, y, colors);
    ctx.fillStyle = colors.body;
    // Left leg (forward)
    ctx.fillRect(x + 10, y + 20, 6, 8);
    // Right leg (back)
    ctx.fillRect(x + 30, y + 20, 6, 4);
}

export function drawDinoDuck2(ctx, w, h, colors) {
    const x = 2, y = 4;
    drawDinoDuckBody(ctx, x, y, colors);
    ctx.fillStyle = colors.body;
    // Left leg (back)
    ctx.fillRect(x + 10, y + 20, 6, 4);
    // Right leg (forward)
    ctx.fillRect(x + 30, y + 20, 6, 8);
}

// ======================== CACTUS SPRITES ========================

export function drawCactusSmall(ctx, w, h) {
    ctx.fillStyle = '#2d6b22';
    // Main trunk
    ctx.fillRect(5, 4, 8, 32);
    // Left arm
    ctx.fillRect(0, 10, 6, 4);
    ctx.fillRect(0, 8, 4, 6);
    // Right arm
    ctx.fillRect(12, 16, 6, 4);
    ctx.fillRect(14, 14, 4, 6);
    // Spines
    ctx.fillStyle = '#3a8a2e';
    ctx.fillRect(4, 2, 2, 4);
    ctx.fillRect(10, 2, 2, 4);
}

export function drawCactusLarge(ctx, w, h) {
    ctx.fillStyle = '#2d6b22';
    // Main trunk
    ctx.fillRect(7, 4, 12, 48);
    // Left arm
    ctx.fillRect(0, 12, 8, 6);
    ctx.fillRect(0, 8, 4, 10);
    // Right arm
    ctx.fillRect(18, 22, 8, 6);
    ctx.fillRect(22, 18, 4, 14);
    // Spines
    ctx.fillStyle = '#3a8a2e';
    ctx.fillRect(6, 0, 3, 6);
    ctx.fillRect(14, 0, 3, 6);
}

export function drawCactusGroup(ctx, w, h) {
    ctx.fillStyle = '#2d6b22';
    // Cactus 1 (left)
    ctx.fillRect(2, 8, 8, 28);
    ctx.fillRect(0, 14, 4, 4);
    // Cactus 2 (center, taller)
    ctx.fillRect(14, 2, 10, 34);
    ctx.fillRect(10, 10, 6, 4);
    ctx.fillRect(22, 16, 6, 4);
    // Cactus 3 (right)
    ctx.fillRect(32, 10, 8, 26);
    ctx.fillRect(38, 16, 4, 4);
    // Spines
    ctx.fillStyle = '#3a8a2e';
    ctx.fillRect(4, 4, 2, 5);
    ctx.fillRect(17, 0, 3, 4);
    ctx.fillRect(34, 6, 2, 5);
}

// ======================== BIRD SPRITES ========================

export function drawBirdWingUp(ctx, w, h) {
    ctx.fillStyle = '#555';
    // Body
    ctx.fillRect(10, 14, 26, 8);
    // Head
    ctx.fillRect(34, 12, 10, 10);
    // Beak
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(42, 16, 6, 3);
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(38, 14, 3, 3);
    // Wing up
    ctx.fillStyle = '#666';
    ctx.fillRect(14, 4, 16, 4);
    ctx.fillRect(18, 0, 10, 6);
    // Tail
    ctx.fillStyle = '#555';
    ctx.fillRect(4, 12, 8, 4);
    ctx.fillRect(0, 10, 6, 4);
}

export function drawBirdWingDown(ctx, w, h) {
    ctx.fillStyle = '#555';
    // Body
    ctx.fillRect(10, 8, 26, 8);
    // Head
    ctx.fillRect(34, 6, 10, 10);
    // Beak
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(42, 10, 6, 3);
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(38, 8, 3, 3);
    // Wing down
    ctx.fillStyle = '#666';
    ctx.fillRect(14, 16, 16, 4);
    ctx.fillRect(18, 18, 10, 8);
    // Tail
    ctx.fillStyle = '#555';
    ctx.fillRect(4, 6, 8, 4);
    ctx.fillRect(0, 8, 6, 4);
}

// ======================== ENVIRONMENT ========================

export function drawCloud(ctx, w, h) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(20, 18, 12, 0, Math.PI * 2);
    ctx.arc(36, 14, 16, 0, Math.PI * 2);
    ctx.arc(54, 18, 12, 0, Math.PI * 2);
    ctx.arc(37, 22, 14, 0, Math.PI * 2);
    ctx.fill();
}

export function drawMoon(ctx, w, h) {
    // Main moon circle
    ctx.fillStyle = '#e8e8d0';
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0, Math.PI * 2);
    ctx.fill();
    // Crescent shadow
    ctx.fillStyle = '#c8c8b0';
    ctx.beginPath();
    ctx.arc(26, 18, 14, 0, Math.PI * 2);
    ctx.fill();
    // Restore main color for visible part
    ctx.fillStyle = '#e8e8d0';
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0, Math.PI * 2);
    ctx.fill();
    // Dark crescent cutout
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(28, 18, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // Craters
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.arc(14, 16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(18, 26, 2, 0, Math.PI * 2);
    ctx.fill();
}

// ======================== POWER-UP ICONS ========================

export function drawShieldIcon(ctx, w, h) {
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.moveTo(12, 3);
    ctx.lineTo(22, 6);
    ctx.lineTo(22, 14);
    ctx.quadraticCurveTo(22, 22, 12, 24);
    ctx.quadraticCurveTo(2, 22, 2, 14);
    ctx.lineTo(2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.lineTo(8, 8);
    ctx.lineTo(8, 14);
    ctx.quadraticCurveTo(8, 18, 12, 20);
    ctx.lineTo(12, 6);
    ctx.fill();
}

export function drawSlowMoIcon(ctx, w, h) {
    // Clock face
    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.arc(12, 13, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Clock hands
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 13);
    ctx.lineTo(12, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 13);
    ctx.lineTo(17, 13);
    ctx.stroke();
    // Center dot
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(12, 13, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

export function drawDoubleJumpIcon(ctx, w, h) {
    ctx.fillStyle = '#2ecc71';
    // Two upward arrows
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(20, 10);
    ctx.lineTo(15, 10);
    ctx.lineTo(15, 14);
    ctx.lineTo(9, 14);
    ctx.lineTo(9, 10);
    ctx.lineTo(4, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(46,204,113,0.5)';
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.lineTo(20, 18);
    ctx.lineTo(15, 18);
    ctx.lineTo(15, 22);
    ctx.lineTo(9, 22);
    ctx.lineTo(9, 18);
    ctx.lineTo(4, 18);
    ctx.closePath();
    ctx.fill();
}

export function drawInvincibleIcon(ctx, w, h) {
    // Star shape
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    const cx = 12, cy = 12, spikes = 5, outerR = 11, innerR = 5;
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ======================== GROUND TEXTURE ========================

/**
 * Creates a repeatable ground texture pattern canvas.
 * @param {number} segWidth - Width of one segment
 * @returns {HTMLCanvasElement}
 */
export function createGroundPattern(segWidth = 100) {
    const canvas = document.createElement('canvas');
    canvas.width = segWidth;
    canvas.height = 20;
    const ctx = canvas.getContext('2d');

    // Base ground line
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, 0, segWidth, 2);

    // Random pebbles / texture
    ctx.fillStyle = '#444';
    const rng = mulberry32(42); // Deterministic RNG for consistent pattern
    for (let i = 0; i < 15; i++) {
        const px = Math.floor(rng() * segWidth);
        const py = 4 + Math.floor(rng() * 14);
        const size = 1 + Math.floor(rng() * 3);
        ctx.fillRect(px, py, size, 1);
    }

    return canvas;
}

/**
 * Simple deterministic pseudo-random number generator.
 */
function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ======================== SPRITE CACHE ========================

/**
 * Pre-renders all game sprites for a given skin color palette.
 * Returns a dict of sprite name → off-screen canvas.
 */
export function buildSpriteCache(skinColors) {
    return {
        dinoRun1: createSpriteCanvas(48, 52, drawDinoRun1, skinColors),
        dinoRun2: createSpriteCanvas(48, 52, drawDinoRun2, skinColors),
        dinoJump: createSpriteCanvas(48, 52, drawDinoJump, skinColors),
        dinoDead: createSpriteCanvas(48, 52, drawDinoDead, skinColors),
        dinoDuck1: createSpriteCanvas(60, 34, drawDinoDuck1, skinColors),
        dinoDuck2: createSpriteCanvas(60, 34, drawDinoDuck2, skinColors),
        cactusSmall: createSpriteCanvas(18, 36, drawCactusSmall, null),
        cactusLarge: createSpriteCanvas(26, 52, drawCactusLarge, null),
        cactusGroup: createSpriteCanvas(50, 36, drawCactusGroup, null),
        birdUp: createSpriteCanvas(48, 32, drawBirdWingUp, null),
        birdDown: createSpriteCanvas(48, 32, drawBirdWingDown, null),
        cloud: createSpriteCanvas(70, 36, drawCloud, null),
        moon: createSpriteCanvas(40, 40, drawMoon, null),
        powerShield: createSpriteCanvas(24, 28, drawShieldIcon, null),
        powerSlowmo: createSpriteCanvas(24, 28, drawSlowMoIcon, null),
        powerDoublejump: createSpriteCanvas(24, 28, drawDoubleJumpIcon, null),
        powerInvincible: createSpriteCanvas(24, 28, drawInvincibleIcon, null),
        ground: createGroundPattern(200),
    };
}

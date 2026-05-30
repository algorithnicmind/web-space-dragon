/* ============================================================
   background.js — Ground Scrolling, Clouds, Day/Night Cycle
   ============================================================ */

import {
    CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, GROUND_HEIGHT,
    MAX_CLOUDS, MAX_STARS, DAY_NIGHT_INTERVAL,
} from './config.js';

// Sky color palettes for each phase
const SKY_PHASES = [
    { top: '#87CEEB', bottom: '#E0F7FA' },  // Day
    { top: '#FF7043', bottom: '#FFAB91' },  // Dusk
    { top: '#0a0a2e', bottom: '#1a1a4e' },  // Night
    { top: '#4A148C', bottom: '#CE93D8' },  // Dawn
];

/**
 * Lerp between two hex colors.
 */
function lerpColor(a, b, t) {
    const ar = parseInt(a.slice(1, 3), 16);
    const ag = parseInt(a.slice(3, 5), 16);
    const ab = parseInt(a.slice(5, 7), 16);
    const br = parseInt(b.slice(1, 3), 16);
    const bg = parseInt(b.slice(3, 5), 16);
    const bb = parseInt(b.slice(5, 7), 16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bv = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bv})`;
}

/**
 * Cloud entity for parallax scrolling.
 */
class Cloud {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
    }

    activate(x, y, speed) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    update(dt) {
        if (!this.active) return;
        this.x -= this.speed * dt;
        if (this.x < -80) {
            // Respawn on the right
            this.x = CANVAS_WIDTH + 20 + Math.random() * 100;
            this.y = 20 + Math.random() * 80;
        }
    }

    render(ctx, sprite) {
        if (!this.active || !sprite) return;
        ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
    }
}

/**
 * Star for night sky.
 */
class Star {
    constructor() {
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = Math.random() * (GROUND_Y - 40);
        this.size = 1 + Math.random() * 2;
        this.twinkleSpeed = 2 + Math.random() * 4;
        this.twinkleOffset = Math.random() * Math.PI * 2;
    }
}

export class Background {
    constructor(sprites) {
        this.sprites = sprites;

        // Ground scrolling
        this._groundX = 0;
        this._groundPatternWidth = 200;

        // Clouds
        this.clouds = [];
        for (let i = 0; i < MAX_CLOUDS; i++) {
            const cloud = new Cloud();
            cloud.activate(
                Math.random() * CANVAS_WIDTH,
                20 + Math.random() * 80,
                20 + Math.random() * 30
            );
            this.clouds.push(cloud);
        }

        // Stars
        this.stars = Array.from({ length: MAX_STARS }, () => new Star());

        // Day/Night
        this._phaseIndex = 0; // 0=day, 1=dusk, 2=night, 3=dawn
        this._phaseProgress = 0; // 0–1 interpolation between current and next phase
        this._isTransitioning = false;
        this._transitionSpeed = 0.3; // Progress per second during transition
        this._lastPhaseScore = 0;
        this._nightAmount = 0; // 0=day, 1=full night (for star/moon visibility)

        // Moon
        this._moonX = CANVAS_WIDTH * 0.75;
        this._moonY = 30;
    }

    setSprites(sprites) {
        this.sprites = sprites;
    }

    reset() {
        this._groundX = 0;
        this._phaseIndex = 0;
        this._phaseProgress = 0;
        this._isTransitioning = false;
        this._lastPhaseScore = 0;
        this._nightAmount = 0;
    }

    /**
     * Update ground scroll, clouds, and day/night cycle.
     */
    update(dt, speed, score) {
        // Scroll ground
        this._groundX = (this._groundX + speed * dt) % this._groundPatternWidth;

        // Update clouds (parallax = slower than ground)
        for (const cloud of this.clouds) {
            cloud.speed = speed * 0.15;
            cloud.update(dt);
        }

        // Day/Night transitions
        if (score - this._lastPhaseScore >= DAY_NIGHT_INTERVAL && !this._isTransitioning) {
            this._isTransitioning = true;
        }

        if (this._isTransitioning) {
            this._phaseProgress += this._transitionSpeed * dt;
            if (this._phaseProgress >= 1) {
                this._phaseProgress = 0;
                this._phaseIndex = (this._phaseIndex + 1) % SKY_PHASES.length;
                this._isTransitioning = false;
                this._lastPhaseScore = score;
            }
        }

        // Calculate night amount for star/moon visibility
        const currentPhase = this._phaseIndex;
        const nextPhase = (currentPhase + 1) % SKY_PHASES.length;
        const t = this._phaseProgress;

        if (currentPhase === 2) {
            // In night phase
            this._nightAmount = this._isTransitioning ? 1 - t : 1;
        } else if (nextPhase === 2 && this._isTransitioning) {
            // Transitioning TO night
            this._nightAmount = t;
        } else if (currentPhase === 3) {
            // Dawn (fading from night)
            this._nightAmount = this._isTransitioning ? 1 - t : 0.5;
        } else {
            this._nightAmount = 0;
        }
    }

    /**
     * Render the full background.
     */
    render(ctx, time) {
        // --- Sky gradient ---
        const current = SKY_PHASES[this._phaseIndex];
        const next = SKY_PHASES[(this._phaseIndex + 1) % SKY_PHASES.length];
        const t = this._isTransitioning ? this._phaseProgress : 0;

        const topColor = lerpColor(current.top, next.top, t);
        const bottomColor = lerpColor(current.bottom, next.bottom, t);

        const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

        // --- Stars (visible during night) ---
        if (this._nightAmount > 0.1) {
            ctx.globalAlpha = this._nightAmount;
            for (const star of this.stars) {
                const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
                ctx.globalAlpha = this._nightAmount * twinkle;
                ctx.fillStyle = '#fff';
                ctx.fillRect(
                    Math.round(star.x),
                    Math.round(star.y),
                    Math.round(star.size),
                    Math.round(star.size)
                );
            }
            ctx.globalAlpha = 1;

            // Moon
            if (this.sprites.moon) {
                ctx.globalAlpha = this._nightAmount * 0.9;
                ctx.drawImage(this.sprites.moon, Math.round(this._moonX), Math.round(this._moonY));
                ctx.globalAlpha = 1;
            }
        }

        // --- Clouds ---
        for (const cloud of this.clouds) {
            cloud.render(ctx, this.sprites.cloud);
        }

        // --- Ground ---
        // Ground background
        ctx.fillStyle = this._nightAmount > 0.5 ? '#1a1a2e' : '#f7f7f7';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, GROUND_HEIGHT);

        // Ground texture (scrolling)
        if (this.sprites.ground) {
            const gw = this._groundPatternWidth;
            const startX = -Math.floor(this._groundX);
            for (let x = startX; x < CANVAS_WIDTH; x += gw) {
                ctx.drawImage(this.sprites.ground, x, GROUND_Y);
            }
        }
    }
}

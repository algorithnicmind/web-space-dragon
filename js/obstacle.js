/* ============================================================
   obstacle.js — Obstacle Manager with Object Pooling
   Handles cactus and bird spawning, movement, and recycling.
   ============================================================ */

import {
    CANVAS_WIDTH, GROUND_Y,
    CACTUS_SMALL_WIDTH, CACTUS_SMALL_HEIGHT,
    CACTUS_LARGE_WIDTH, CACTUS_LARGE_HEIGHT,
    CACTUS_GROUP_WIDTH, CACTUS_GROUP_HEIGHT,
    BIRD_WIDTH, BIRD_HEIGHT, BIRD_LOW_Y, BIRD_HIGH_Y,
    BIRD_SCORE_THRESHOLD, BIRD_FRAME_RATE,
    OBSTACLE_MIN_GAP, OBSTACLE_GAP_FLOOR, OBSTACLE_GAP_SCALE,
    MAX_OBSTACLES, HITBOX_INSET,
} from './config.js';
import { getInsetHitbox } from './collision.js';

// Obstacle type definitions
const ObstacleType = {
    CACTUS_SMALL: 'cactusSmall',
    CACTUS_LARGE: 'cactusLarge',
    CACTUS_GROUP: 'cactusGroup',
    BIRD: 'bird',
};

const TYPE_DATA = {
    [ObstacleType.CACTUS_SMALL]: { w: CACTUS_SMALL_WIDTH, h: CACTUS_SMALL_HEIGHT, sprite: 'cactusSmall' },
    [ObstacleType.CACTUS_LARGE]: { w: CACTUS_LARGE_WIDTH, h: CACTUS_LARGE_HEIGHT, sprite: 'cactusLarge' },
    [ObstacleType.CACTUS_GROUP]: { w: CACTUS_GROUP_WIDTH, h: CACTUS_GROUP_HEIGHT, sprite: 'cactusGroup' },
    [ObstacleType.BIRD]: { w: BIRD_WIDTH, h: BIRD_HEIGHT, sprite: null }, // Bird has animated sprite
};

/**
 * Single obstacle instance (pooled).
 */
class Obstacle {
    constructor() {
        this.active = false;
        this.type = null;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this._birdFrame = 0;
        this._birdTimer = 0;
    }

    /**
     * Activate this obstacle with a given type and position.
     */
    activate(type, x) {
        this.active = true;
        this.type = type;
        this.x = x;
        const data = TYPE_DATA[type];
        this.width = data.w;
        this.height = data.h;

        if (type === ObstacleType.BIRD) {
            // Randomly choose high or low bird
            this.y = Math.random() < 0.5 ? BIRD_LOW_Y : BIRD_HIGH_Y;
            this._birdFrame = 0;
            this._birdTimer = 0;
        } else {
            // Ground-level cactus
            this.y = GROUND_Y - this.height;
        }
    }

    deactivate() {
        this.active = false;
    }

    getHitbox() {
        return getInsetHitbox({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        }, this.type === ObstacleType.BIRD ? HITBOX_INSET + 2 : HITBOX_INSET);
    }

    update(dt, speed) {
        if (!this.active) return;
        this.x -= speed * dt;

        // Bird wing animation
        if (this.type === ObstacleType.BIRD) {
            this._birdTimer += dt;
            if (this._birdTimer >= 1 / BIRD_FRAME_RATE) {
                this._birdTimer = 0;
                this._birdFrame = (this._birdFrame + 1) % 2;
            }
        }

        // Deactivate if off-screen left
        if (this.x + this.width < -20) {
            this.deactivate();
        }
    }

    render(ctx, sprites) {
        if (!this.active) return;

        let sprite;
        if (this.type === ObstacleType.BIRD) {
            sprite = this._birdFrame === 0 ? sprites.birdUp : sprites.birdDown;
        } else {
            sprite = sprites[TYPE_DATA[this.type].sprite];
        }

        if (sprite) {
            ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
        }
    }
}

/**
 * Manages the obstacle pool, spawning, and difficulty scaling.
 */
export class ObstacleManager {
    constructor(sprites) {
        this.sprites = sprites;
        this.pool = Array.from({ length: MAX_OBSTACLES }, () => new Obstacle());
        this._spawnTimer = 0;
        this._nextSpawnDist = OBSTACLE_MIN_GAP;
        this._distanceSinceSpawn = 0;
    }

    setSprites(sprites) {
        this.sprites = sprites;
    }

    reset() {
        this.pool.forEach(o => o.deactivate());
        this._spawnTimer = 0;
        this._nextSpawnDist = OBSTACLE_MIN_GAP;
        this._distanceSinceSpawn = 0;
    }

    /**
     * Get all active obstacles.
     */
    getActive() {
        return this.pool.filter(o => o.active);
    }

    /**
     * Acquire an inactive obstacle from the pool.
     */
    _acquire() {
        return this.pool.find(o => !o.active) || null;
    }

    /**
     * Choose a random obstacle type based on current score.
     */
    _pickType(score) {
        const types = [
            ObstacleType.CACTUS_SMALL,
            ObstacleType.CACTUS_SMALL,
            ObstacleType.CACTUS_LARGE,
            ObstacleType.CACTUS_GROUP,
        ];

        // Add birds after threshold
        if (score >= BIRD_SCORE_THRESHOLD) {
            const birdWeight = score >= 1000 ? 3 : score >= 600 ? 2 : 1;
            for (let i = 0; i < birdWeight; i++) {
                types.push(ObstacleType.BIRD);
            }
        }

        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Calculate minimum gap based on score.
     */
    _getMinGap(score) {
        const gap = OBSTACLE_MIN_GAP - score * OBSTACLE_GAP_SCALE;
        return Math.max(gap, OBSTACLE_GAP_FLOOR);
    }

    /**
     * Update all obstacles and handle spawning.
     */
    update(dt, speed, score, gapMultiplier = 1) {
        // Update existing obstacles
        for (const obs of this.pool) {
            obs.update(dt, speed);
        }

        // Track distance for spawning
        this._distanceSinceSpawn += speed * dt;

        if (this._distanceSinceSpawn >= this._nextSpawnDist) {
            const obs = this._acquire();
            if (obs) {
                const type = this._pickType(score);
                obs.activate(type, CANVAS_WIDTH + 20);
                this._distanceSinceSpawn = 0;

                // Calculate next spawn gap with randomness
                const minGap = this._getMinGap(score) * gapMultiplier;
                this._nextSpawnDist = minGap + Math.random() * 150;
            }
        }
    }

    /**
     * Render all active obstacles.
     */
    render(ctx) {
        for (const obs of this.pool) {
            obs.render(ctx, this.sprites);
        }
    }
}

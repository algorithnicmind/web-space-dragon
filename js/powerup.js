/* ============================================================
   powerup.js — Power-Up System
   Shield, Slow Motion, Double Jump, Invincibility
   ============================================================ */

import {
    CANVAS_WIDTH, GROUND_Y,
    POWERUP_WIDTH, POWERUP_HEIGHT,
    POWERUP_SCORE_THRESHOLD, POWERUP_SPAWN_CHANCE,
    POWERUP_DURATIONS, MAX_POWERUPS, HITBOX_INSET,
} from './config.js';
import { getInsetHitbox } from './collision.js';

const TYPES = ['shield', 'slowmo', 'doublejump', 'invincible'];

const SPRITE_MAP = {
    shield: 'powerShield',
    slowmo: 'powerSlowmo',
    doublejump: 'powerDoublejump',
    invincible: 'powerInvincible',
};

/**
 * Single power-up entity (pooled).
 */
class PowerUp {
    constructor() {
        this.active = false;
        this.type = null;
        this.x = 0;
        this.y = 0;
        this.width = POWERUP_WIDTH;
        this.height = POWERUP_HEIGHT;
        this._bobTimer = 0;
        this._baseY = 0;
    }

    activate(type, x) {
        this.active = true;
        this.type = type;
        this.x = x;
        this._baseY = GROUND_Y - POWERUP_HEIGHT - 8;
        this.y = this._baseY;
        this._bobTimer = Math.random() * Math.PI * 2;
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
        }, 2);
    }

    update(dt, speed) {
        if (!this.active) return;
        this.x -= speed * dt;

        // Gentle bobbing animation
        this._bobTimer += dt * 4;
        this.y = this._baseY + Math.sin(this._bobTimer) * 4;

        if (this.x + this.width < -20) {
            this.deactivate();
        }
    }

    render(ctx, sprites) {
        if (!this.active) return;
        const spriteKey = SPRITE_MAP[this.type];
        const sprite = sprites[spriteKey];
        if (sprite) {
            // Glow effect
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = this.type === 'shield' ? '#3498db'
                : this.type === 'slowmo' ? '#9b59b6'
                : this.type === 'doublejump' ? '#2ecc71'
                : '#f1c40f';
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2 + 4,
                0, Math.PI * 2
            );
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
        }
    }
}

/**
 * Manages power-up pool, spawning, and active effect tracking.
 */
export class PowerUpManager {
    constructor(sprites) {
        this.sprites = sprites;
        this.pool = Array.from({ length: MAX_POWERUPS }, () => new PowerUp());

        // Active effect tracking
        this.activeEffect = null; // { type, timer, duration }
    }

    setSprites(sprites) {
        this.sprites = sprites;
    }

    reset() {
        this.pool.forEach(p => p.deactivate());
        this.activeEffect = null;
    }

    getActive() {
        return this.pool.filter(p => p.active);
    }

    _acquire() {
        return this.pool.find(p => !p.active) || null;
    }

    /**
     * Try to spawn a power-up.
     */
    trySpawn(score) {
        if (score < POWERUP_SCORE_THRESHOLD) return;

        // Don't spawn if one is already on screen
        if (this.getActive().length > 0) return;

        if (Math.random() < POWERUP_SPAWN_CHANCE) {
            const pu = this._acquire();
            if (pu) {
                const type = TYPES[Math.floor(Math.random() * TYPES.length)];
                pu.activate(type, CANVAS_WIDTH + 40);
            }
        }
    }

    /**
     * Activate a power-up effect on the player.
     */
    activateEffect(type, player) {
        const duration = POWERUP_DURATIONS[type];

        // Clear previous timed effect (shield is not timed)
        if (this.activeEffect && this.activeEffect.type !== 'shield') {
            this._deactivateEffect(player);
        }

        switch (type) {
            case 'shield':
                player.hasShield = true;
                this.activeEffect = { type, timer: 0, duration };
                break;
            case 'slowmo':
                this.activeEffect = { type, timer: 0, duration: duration / 1000 };
                break;
            case 'doublejump':
                player.hasDoubleJump = true;
                this.activeEffect = { type, timer: 0, duration: duration / 1000 };
                break;
            case 'invincible':
                player.isInvincible = true;
                this.activeEffect = { type, timer: 0, duration: duration / 1000 };
                break;
        }
    }

    /**
     * Remove current power-up effect.
     */
    _deactivateEffect(player) {
        if (!this.activeEffect) return;

        switch (this.activeEffect.type) {
            case 'shield':
                player.hasShield = false;
                break;
            case 'doublejump':
                player.hasDoubleJump = false;
                break;
            case 'invincible':
                player.isInvincible = false;
                break;
        }
        this.activeEffect = null;
    }

    /**
     * Use shield on collision (break it).
     */
    breakShield(player) {
        if (player.hasShield) {
            player.hasShield = false;
            if (this.activeEffect && this.activeEffect.type === 'shield') {
                this.activeEffect = null;
            }
            return true;
        }
        return false;
    }

    /**
     * Get the slow-mo speed multiplier (1.0 if no slow-mo active).
     */
    getSpeedMultiplier() {
        if (this.activeEffect && this.activeEffect.type === 'slowmo') {
            return 0.6; // 40% speed reduction
        }
        return 1.0;
    }

    /**
     * Update pool and active effect timer.
     */
    update(dt, speed, player) {
        // Update entities
        for (const pu of this.pool) {
            pu.update(dt, speed);
        }

        // Update active effect timer
        if (this.activeEffect && this.activeEffect.type !== 'shield') {
            this.activeEffect.timer += dt;
            if (this.activeEffect.timer >= this.activeEffect.duration) {
                this._deactivateEffect(player);
            }
        }
    }

    /**
     * Get remaining duration fraction for HUD display (0–1).
     */
    getEffectProgress() {
        if (!this.activeEffect) return null;
        if (this.activeEffect.type === 'shield') {
            return { type: 'shield', progress: 1 };
        }
        const frac = 1 - this.activeEffect.timer / this.activeEffect.duration;
        return { type: this.activeEffect.type, progress: Math.max(0, frac) };
    }

    render(ctx) {
        for (const pu of this.pool) {
            pu.render(ctx, this.sprites);
        }
    }
}

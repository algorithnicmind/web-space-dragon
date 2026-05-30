/* ============================================================
   player.js — Dinosaur Player Entity
   Physics, animation states, hitbox, and rendering.
   ============================================================ */

import {
    PLAYER_X, PLAYER_WIDTH, PLAYER_HEIGHT,
    PLAYER_DUCK_WIDTH, PLAYER_DUCK_HEIGHT,
    JUMP_FORCE, GRAVITY, GROUND_Y,
    HITBOX_INSET, DINO_RUN_FRAME_RATE,
} from './config.js';
import { getInsetHitbox } from './collision.js';

/** Possible player animation states */
const State = {
    RUN: 'run',
    JUMP: 'jump',
    DUCK: 'duck',
    DEAD: 'dead',
};

export class Player {
    constructor(sprites) {
        this.sprites = sprites;
        this.x = PLAYER_X;
        this.y = GROUND_Y - PLAYER_HEIGHT;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;

        this.vy = 0; // Vertical velocity
        this.grounded = true;
        this.state = State.RUN;

        // Animation
        this._runFrame = 0;
        this._runTimer = 0;
        this._duckFrame = 0;

        // Power-up state
        this.hasDoubleJump = false;
        this._doubleJumpUsed = false;
        this.hasShield = false;
        this.isInvincible = false;
        this._invincibleTimer = 0;
        this._invincibleFlash = false;
    }

    /**
     * Rebuild sprite references when skin changes.
     */
    setSprites(sprites) {
        this.sprites = sprites;
    }

    /**
     * Reset to initial state (for game restart).
     */
    reset() {
        this.y = GROUND_Y - PLAYER_HEIGHT;
        this.vy = 0;
        this.grounded = true;
        this.state = State.RUN;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this._runFrame = 0;
        this._runTimer = 0;
        this.hasDoubleJump = false;
        this._doubleJumpUsed = false;
        this.hasShield = false;
        this.isInvincible = false;
        this._invincibleTimer = 0;
    }

    /**
     * Attempt to jump.
     * @returns {boolean} Whether a jump was initiated
     */
    jump() {
        if (this.state === State.DEAD) return false;

        if (this.grounded) {
            this.vy = JUMP_FORCE;
            this.grounded = false;
            this.state = State.JUMP;
            this.width = PLAYER_WIDTH;
            this.height = PLAYER_HEIGHT;
            this._doubleJumpUsed = false;
            return true;
        } else if (this.hasDoubleJump && !this._doubleJumpUsed) {
            // Double jump in air
            this.vy = JUMP_FORCE * 0.85;
            this._doubleJumpUsed = true;
            return true;
        }

        return false;
    }

    /**
     * Start or maintain duck state.
     */
    duck() {
        if (this.state === State.DEAD) return;

        if (this.grounded) {
            this.state = State.DUCK;
            this.width = PLAYER_DUCK_WIDTH;
            this.height = PLAYER_DUCK_HEIGHT;
            this.y = GROUND_Y - PLAYER_DUCK_HEIGHT;
        } else {
            // Fast-fall when ducking in air
            this.vy += GRAVITY * 0.03;
        }
    }

    /**
     * Stop ducking — return to running.
     */
    standUp() {
        if (this.state === State.DUCK) {
            this.state = State.RUN;
            this.width = PLAYER_WIDTH;
            this.height = PLAYER_HEIGHT;
            this.y = GROUND_Y - PLAYER_HEIGHT;
        }
    }

    /**
     * Trigger death state.
     */
    die() {
        this.state = State.DEAD;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
    }

    /**
     * Update physics and animation per frame.
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Invincibility flash timer
        if (this.isInvincible) {
            this._invincibleTimer += dt;
            this._invincibleFlash = Math.sin(this._invincibleTimer * 20) > 0;
        }

        // Gravity & vertical movement
        if (!this.grounded) {
            this.vy += GRAVITY * dt;
            this.y += this.vy * dt;

            // Land on ground
            const groundLevel = this.state === State.DUCK
                ? GROUND_Y - PLAYER_DUCK_HEIGHT
                : GROUND_Y - PLAYER_HEIGHT;

            if (this.y >= groundLevel) {
                this.y = groundLevel;
                this.vy = 0;
                this.grounded = true;
                if (this.state === State.JUMP) {
                    this.state = State.RUN;
                }
            }
        }

        // Running animation
        if (this.state === State.RUN || this.state === State.DUCK) {
            this._runTimer += dt;
            if (this._runTimer >= 1 / DINO_RUN_FRAME_RATE) {
                this._runTimer = 0;
                this._runFrame = (this._runFrame + 1) % 2;
                this._duckFrame = (this._duckFrame + 1) % 2;
            }
        }
    }

    /**
     * Get collision hitbox (inset from visual bounds).
     */
    getHitbox() {
        return getInsetHitbox({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        });
    }

    /**
     * Render the player onto the canvas.
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        // Invincibility flash: skip rendering every other frame
        if (this.isInvincible && this._invincibleFlash) {
            // Draw with reduced alpha for flash effect
            ctx.globalAlpha = 0.3;
        }

        let sprite;
        switch (this.state) {
            case State.DEAD:
                sprite = this.sprites.dinoDead;
                break;
            case State.JUMP:
                sprite = this.sprites.dinoJump;
                break;
            case State.DUCK:
                sprite = this._duckFrame === 0
                    ? this.sprites.dinoDuck1
                    : this.sprites.dinoDuck2;
                break;
            case State.RUN:
            default:
                sprite = this._runFrame === 0
                    ? this.sprites.dinoRun1
                    : this.sprites.dinoRun2;
                break;
        }

        if (sprite) {
            ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
        }

        // Shield bubble effect
        if (this.hasShield) {
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                Math.max(this.width, this.height) / 2 + 6,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            // Inner glow
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }
}

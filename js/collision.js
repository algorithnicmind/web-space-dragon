/* ============================================================
   collision.js — AABB Collision Detection
   ============================================================ */

import { HITBOX_INSET } from './config.js';

/**
 * Returns an inset hitbox (more forgiving than visual bounds).
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @param {number} inset - Pixels to shrink on each side
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function getInsetHitbox(rect, inset = HITBOX_INSET) {
    return {
        x: rect.x + inset,
        y: rect.y + inset,
        width: rect.width - inset * 2,
        height: rect.height - inset * 2,
    };
}

/**
 * AABB overlap test between two rectangles.
 * @returns {boolean}
 */
export function aabbOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * Checks if the player collides with any obstacle in the list.
 * @param {Object} player - Must have getHitbox() method
 * @param {Array} obstacles - Each must have getHitbox() and active property
 * @returns {Object|null} The obstacle that was hit, or null
 */
export function checkPlayerObstacleCollision(player, obstacles) {
    const playerBox = player.getHitbox();

    for (const obs of obstacles) {
        if (!obs.active) continue;

        const obsBox = obs.getHitbox();

        // Quick X-axis culling
        if (obsBox.x + obsBox.width < playerBox.x) continue;
        if (obsBox.x > playerBox.x + playerBox.width) continue;

        if (aabbOverlap(playerBox, obsBox)) {
            return obs;
        }
    }

    return null;
}

/**
 * Checks if the player collides with any power-up in the list.
 * Uses a slightly larger hitbox for easier pickup.
 * @param {Object} player
 * @param {Array} powerups
 * @returns {Object|null}
 */
export function checkPlayerPowerupCollision(player, powerups) {
    const playerBox = player.getHitbox();
    // Expand player hitbox slightly for power-up pickup
    const expandedBox = {
        x: playerBox.x - 4,
        y: playerBox.y - 4,
        width: playerBox.width + 8,
        height: playerBox.height + 8,
    };

    for (const pu of powerups) {
        if (!pu.active) continue;
        const puBox = pu.getHitbox();
        if (aabbOverlap(expandedBox, puBox)) {
            return pu;
        }
    }

    return null;
}

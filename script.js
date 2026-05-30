/* ============================================================
   script.js — Entry Point
   Bootstraps the game when the DOM is ready.
   ============================================================ */

import { Game } from './js/game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Space Dragon: Canvas element #game-canvas not found.');
        return;
    }

    // Handle high-DPI displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    // The internal resolution is set by Game constructor (800×300).
    // CSS handles the responsive scaling.

    // Create game instance
    const game = new Game(canvas);

    // Handle window resize — recalculate canvas bounds for touch events
    window.addEventListener('resize', () => {
        // Canvas CSS size adapts automatically via CSS rules.
        // No manual resize needed since we use fixed internal resolution.
    });

    // Log startup
    console.log('🦕 Space Dragon — Ready!');
});

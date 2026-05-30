/* ============================================================
   input.js — Keyboard & Touch Input Manager
   Handles key presses, touch taps, and swipe gestures.
   ============================================================ */

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;

        // Current frame state
        this.jumpPressed = false;
        this.duckHeld = false;
        this.pausePressed = false;
        this.anyPressed = false; // For start/restart

        // Internal tracking
        this._jumpBuffer = false;
        this._pauseBuffer = false;
        this._anyBuffer = false;
        this._keysDown = new Set();

        // Touch tracking
        this._touchStartY = null;
        this._touchStartTime = 0;
        this._swipeThreshold = 30; // px

        // Key bindings (defaults)
        this.bindings = {
            jump: ['Space', 'ArrowUp'],
            duck: ['ArrowDown'],
            pause: ['Escape'],
        };

        this._bindEvents();
    }

    /**
     * Update key bindings from settings.
     */
    setBindings(bindings) {
        if (bindings) {
            this.bindings = { ...this.bindings, ...bindings };
        }
    }

    /**
     * Called once per frame to consume buffered inputs.
     */
    poll() {
        this.jumpPressed = this._jumpBuffer;
        this.pausePressed = this._pauseBuffer;
        this.anyPressed = this._anyBuffer;

        // Duck is held, not buffered
        this.duckHeld = this._isDuckHeld();

        // Clear single-frame buffers
        this._jumpBuffer = false;
        this._pauseBuffer = false;
        this._anyBuffer = false;
    }

    _isDuckHeld() {
        return this.bindings.duck.some(k => this._keysDown.has(k));
    }

    _isJumpKey(code) {
        return this.bindings.jump.includes(code);
    }

    _isDuckKey(code) {
        return this.bindings.duck.includes(code);
    }

    _isPauseKey(code) {
        return this.bindings.pause.includes(code);
    }

    _bindEvents() {
        // ---- Keyboard ----
        document.addEventListener('keydown', (e) => {
            const code = e.code;

            // Prevent default for game keys (no page scroll)
            if (this._isJumpKey(code) || this._isDuckKey(code)) {
                e.preventDefault();
            }

            if (this._keysDown.has(code)) return; // Ignore repeats
            this._keysDown.add(code);

            if (this._isJumpKey(code)) {
                this._jumpBuffer = true;
                this._anyBuffer = true;
            }
            if (this._isPauseKey(code)) {
                this._pauseBuffer = true;
            }
            // Any key for start/restart
            this._anyBuffer = true;
        });

        document.addEventListener('keyup', (e) => {
            this._keysDown.delete(e.code);
        });

        // ---- Touch ----
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._touchStartY = touch.clientY;
            this._touchStartTime = Date.now();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this._touchStartY === null) return;

            const touch = e.changedTouches[0];
            const dy = touch.clientY - this._touchStartY;
            const dt = Date.now() - this._touchStartTime;

            if (dy > this._swipeThreshold && dt < 500) {
                // Swipe down → duck (brief)
                this._triggerTouchDuck();
            } else {
                // Tap → jump
                this._jumpBuffer = true;
                this._anyBuffer = true;
            }

            this._touchStartY = null;
        }, { passive: false });

        // ---- Mouse click on canvas (for restart etc) ----
        this.canvas.addEventListener('click', () => {
            this._anyBuffer = true;
        });

        // Reset keys when window loses focus
        window.addEventListener('blur', () => {
            this._keysDown.clear();
        });
    }

    /**
     * Simulates a brief duck via touch (since touch can't "hold").
     */
    _triggerTouchDuck() {
        this._keysDown.add(this.bindings.duck[0]);
        this._anyBuffer = true;
        // Release after 300ms
        setTimeout(() => {
            this._keysDown.delete(this.bindings.duck[0]);
        }, 300);
    }

    /**
     * Clean up event listeners (if needed).
     */
    destroy() {
        // In a real scenario, we'd store bound handler refs and remove them.
        // For this game, the listeners live for the page lifetime.
    }
}

/* ============================================================
   audio.js — Web Audio API Sound Synthesis
   All sounds are generated procedurally — no audio files needed.
   ============================================================ */

export class AudioManager {
    constructor() {
        this._ctx = null; // Created lazily on first user gesture
        this._masterGain = null;
        this._muted = false;
        this._volume = 0.7; // 0–1
    }

    /**
     * Initialize AudioContext (must be called from a user gesture handler).
     */
    init() {
        if (this._ctx) return;
        try {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._masterGain = this._ctx.createGain();
            this._masterGain.gain.value = this._muted ? 0 : this._volume;
            this._masterGain.connect(this._ctx.destination);
        } catch {
            // Web Audio not supported — sounds will silently fail
            this._ctx = null;
        }
    }

    /**
     * Ensure context is running (required after browser autoplay suspend).
     */
    _resume() {
        if (this._ctx && this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
    }

    setVolume(vol) {
        this._volume = Math.max(0, Math.min(1, vol));
        if (this._masterGain) {
            this._masterGain.gain.value = this._muted ? 0 : this._volume;
        }
    }

    setMuted(muted) {
        this._muted = muted;
        if (this._masterGain) {
            this._masterGain.gain.value = muted ? 0 : this._volume;
        }
    }

    get muted() {
        return this._muted;
    }

    // ---- Sound Effects ----

    /**
     * Short rising blip for jump.
     */
    playJump() {
        if (!this._ctx) return;
        this._resume();
        const now = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    /**
     * Low buzz/crunch for collision.
     */
    playHit() {
        if (!this._ctx) return;
        this._resume();
        const now = this._ctx.currentTime;

        // Noise burst approximation using detuned oscillators
        for (let i = 0; i < 3; i++) {
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80 + i * 30, now);
            osc.frequency.linearRampToValueAtTime(40, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this._masterGain);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    }

    /**
     * Bright ding for 100-point milestones.
     */
    playScore() {
        if (!this._ctx) return;
        this._resume();
        const now = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1100, now + 0.06);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    /**
     * Ascending arpeggio for power-up pickup.
     */
    playPowerUp() {
        if (!this._ctx) return;
        this._resume();
        const now = this._ctx.currentTime;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            const t = now + i * 0.07;

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

            osc.connect(gain);
            gain.connect(this._masterGain);
            osc.start(t);
            osc.stop(t + 0.12);
        });
    }

    /**
     * Quick click for UI button press.
     */
    playClick() {
        if (!this._ctx) return;
        this._resume();
        const now = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
    }
}

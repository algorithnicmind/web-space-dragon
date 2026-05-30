/* ============================================================
   game.js — Game Engine & State Machine
   Central orchestrator for all game systems.
   ============================================================ */

import {
    CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y,
    INITIAL_SPEED, MAX_SPEED, SPEED_SCALE_FACTOR,
    SCORE_INTERVAL, SCORE_MULTIPLIERS,
    DIFFICULTY_PRESETS, SKINS, GameState,
} from './config.js';
import { buildSpriteCache } from './sprites.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacle.js';
import { Background } from './background.js';
import { PowerUpManager } from './powerup.js';
import { InputManager } from './input.js';
import { AudioManager } from './audio.js';
import { UIManager } from './ui.js';
import { storage } from './storage.js';
import {
    checkPlayerObstacleCollision,
    checkPlayerPowerupCollision,
} from './collision.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set canvas internal resolution
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        // State
        this.state = GameState.START;
        this._audioInitialized = false;

        // Settings
        this._settings = storage.getSettings();
        this._difficultyPreset = DIFFICULTY_PRESETS[this._settings.difficulty] || DIFFICULTY_PRESETS.normal;
        this._graphicsQuality = this._settings.graphics || 'high';

        // Score
        this.score = 0;
        this.highScore = storage.getHighScore();
        this._lastMilestone = 0;

        // Game-over restart cooldown (prevents instant restart)
        this._gameOverCooldown = 0;

        // Speed
        this.gameSpeed = INITIAL_SPEED;

        // Time
        this._lastTimestamp = 0;
        this._gameTime = 0; // Total elapsed game time

        // Build sprites for current skin
        const skinData = SKINS.find(s => s.id === this._settings.selectedSkin) || SKINS[0];
        this._currentSkinId = skinData.id;
        this._rainbowHue = 0;
        this.sprites = buildSpriteCache(this._getSkinColors(skinData));

        // Initialize subsystems
        this.audio = new AudioManager();
        this.input = new InputManager(canvas);
        this.player = new Player(this.sprites);
        this.obstacles = new ObstacleManager(this.sprites);
        this.background = new Background(this.sprites);
        this.powerups = new PowerUpManager(this.sprites);
        this.ui = new UIManager(this);

        // Apply saved settings
        this.audio.setMuted(this._settings.muted || false);
        this.audio.setVolume((this._settings.volume || 70) / 100);

        // Show start screen
        this.ui.showStart();

        // Start game loop
        this._boundLoop = this._loop.bind(this);
        requestAnimationFrame(this._boundLoop);
    }

    // ==================== SKIN HELPERS ====================

    _getSkinColors(skin) {
        if (skin.body === 'rainbow') {
            // Use current rainbow hue
            const h = this._rainbowHue || 0;
            return {
                body: `hsl(${h}, 80%, 55%)`,
                accent: `hsl(${(h + 30) % 360}, 80%, 45%)`,
                eye: skin.eye,
            };
        }
        return { body: skin.body, accent: skin.accent, eye: skin.eye };
    }

    /**
     * Called when skin is changed in settings.
     */
    onSkinChange(skinId) {
        this._currentSkinId = skinId;
        const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
        this.sprites = buildSpriteCache(this._getSkinColors(skin));
        this.player.setSprites(this.sprites);
        this.obstacles.setSprites(this.sprites);
        this.background.setSprites(this.sprites);
        this.powerups.setSprites(this.sprites);
    }

    // ==================== SETTINGS ====================

    toggleMute() {
        this._settings.muted = !this.audio.muted;
        this.audio.setMuted(this._settings.muted);
        storage.setSettings(this._settings);
    }

    setVolume(vol) {
        this._settings.volume = Math.round(vol * 100);
        this.audio.setVolume(vol);
        storage.setSettings(this._settings);
    }

    setDifficulty(difficulty) {
        this._settings.difficulty = difficulty;
        this._difficultyPreset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
        storage.setSettings(this._settings);
    }

    setGraphicsQuality(quality) {
        this._settings.graphics = quality;
        this._graphicsQuality = quality;
        storage.setSettings(this._settings);
    }

    // ==================== STATE TRANSITIONS ====================

    start() {
        // Init audio on first user gesture
        if (!this._audioInitialized) {
            this.audio.init();
            this._audioInitialized = true;
        }

        this.state = GameState.RUNNING;
        this.ui.hideStart();
        this.ui.hideGameOver();
        this._resetGameState();
    }

    pause() {
        if (this.state !== GameState.RUNNING) return;
        this.state = GameState.PAUSED;
        this.ui.showPause();
    }

    resume() {
        if (this.state !== GameState.PAUSED) return;
        this.state = GameState.RUNNING;
        this.ui.hidePause();
        this._lastTimestamp = performance.now();
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        this.player.die();
        this.audio.playHit();
        this._gameOverCooldown = 0.5; // 500ms before restart is allowed

        // Check high score
        const isNewBest = this.score > this.highScore;
        if (isNewBest) {
            this.highScore = Math.floor(this.score);
            storage.setHighScore(this.highScore);
        }

        // Check skin unlocks
        this._checkSkinUnlocks();

        this.ui.showGameOver(this.score, this.highScore, isNewBest);
    }

    restart() {
        this.ui.hideGameOver();
        this.ui.hidePause();
        this._resetGameState();
        this.state = GameState.RUNNING;
        this._lastTimestamp = performance.now();
    }

    _resetGameState() {
        this.score = 0;
        this._lastMilestone = 0;
        this.gameSpeed = INITIAL_SPEED * this._difficultyPreset.speedMultiplier;
        this.player.reset();
        this.obstacles.reset();
        this.powerups.reset();
        this.background.reset();
    }

    // ==================== SKIN UNLOCKS ====================

    _checkSkinUnlocks() {
        const floorScore = Math.floor(this.score);
        let unlocked = false;

        for (const skin of SKINS) {
            if (skin.unlockScore > 0 && floorScore >= skin.unlockScore) {
                const current = storage.getUnlockedSkins();
                if (!current.includes(skin.id)) {
                    storage.unlockSkin(skin.id);
                    this.ui.showToast(`🎨 Skin Unlocked: ${skin.name}!`);
                    unlocked = true;
                }
            }
        }

        if (unlocked) {
            this.ui.refreshSkinGrid();
        }
    }

    // ==================== GAME LOOP ====================

    _loop(timestamp) {
        // Calculate delta time
        if (this._lastTimestamp === 0) {
            this._lastTimestamp = timestamp;
        }
        const dt = Math.min((timestamp - this._lastTimestamp) / 1000, 0.05);
        this._lastTimestamp = timestamp;
        this._gameTime += dt;

        // Poll input
        this.input.poll();

        // State-specific logic
        switch (this.state) {
            case GameState.START:
                this._handleStartState();
                break;
            case GameState.RUNNING:
                this._handleRunningState(dt);
                break;
            case GameState.PAUSED:
                this._handlePausedState();
                break;
            case GameState.GAME_OVER:
                this._handleGameOverState(dt);
                break;
        }

        // Render (always)
        this._render();

        // Continue loop
        requestAnimationFrame(this._boundLoop);
    }

    _handleStartState() {
        if (this.input.anyPressed) {
            this.start();
        }
    }

    _handleRunningState(dt) {
        // Handle pause
        if (this.input.pausePressed) {
            this.pause();
            return;
        }

        // Handle input
        if (this.input.jumpPressed) {
            if (this.player.jump()) {
                this.audio.playJump();
            }
        }

        if (this.input.duckHeld) {
            this.player.duck();
        } else {
            this.player.standUp();
        }

        // Get speed multiplier from power-ups (slow-mo)
        const speedMult = this.powerups.getSpeedMultiplier();
        const effectiveSpeed = this.gameSpeed * speedMult;

        // Update systems
        this.player.update(dt);
        this.obstacles.update(dt, effectiveSpeed, this.score, this._difficultyPreset.gapMultiplier);
        this.background.update(dt, effectiveSpeed, this.score);
        this.powerups.update(dt, effectiveSpeed, this.player);

        // Try spawning power-ups
        this.powerups.trySpawn(this.score);

        // Collision: player vs obstacles
        if (!this.player.isInvincible) {
            const hitObs = checkPlayerObstacleCollision(this.player, this.obstacles.getActive());
            if (hitObs) {
                // Check shield
                if (this.powerups.breakShield(this.player)) {
                    this.audio.playHit();
                    hitObs.deactivate();
                } else {
                    this.gameOver();
                    return;
                }
            }
        }

        // Collision: player vs power-ups
        const hitPU = checkPlayerPowerupCollision(this.player, this.powerups.getActive());
        if (hitPU) {
            this.powerups.activateEffect(hitPU.type, this.player);
            hitPU.deactivate();
            this.audio.playPowerUp();
        }

        // Update score
        this._updateScore(dt, effectiveSpeed);

        // Update game speed (difficulty scaling)
        this._updateSpeed();

        // Rainbow skin animation
        if (this._currentSkinId === 'rainbow') {
            this._rainbowHue = (this._rainbowHue + dt * 60) % 360;
            const skin = SKINS.find(s => s.id === 'rainbow');
            this.sprites = buildSpriteCache(this._getSkinColors(skin));
            this.player.setSprites(this.sprites);
        }
    }

    _handlePausedState() {
        if (this.input.pausePressed) {
            this.resume();
        }
    }

    _handleGameOverState(dt) {
        // Cooldown prevents instant restart from the key that caused game over
        if (this._gameOverCooldown > 0) {
            this._gameOverCooldown -= dt;
            return;
        }
        if (this.input.anyPressed) {
            this.restart();
        }
    }

    // ==================== SCORING & DIFFICULTY ====================

    _updateScore(dt, speed) {
        // Get current multiplier
        let multiplier = 1;
        for (const tier of SCORE_MULTIPLIERS) {
            if (this.score >= tier.threshold) {
                multiplier = tier.multiplier;
            }
        }

        this.score += speed * dt * multiplier * 0.01;

        // Milestone check
        const currentMilestone = Math.floor(this.score / SCORE_INTERVAL);
        if (currentMilestone > this._lastMilestone) {
            this._lastMilestone = currentMilestone;
            this.audio.playScore();
            this.ui.triggerScoreFlash();
        }
    }

    _updateSpeed() {
        const baseSpeed = INITIAL_SPEED * this._difficultyPreset.speedMultiplier;
        this.gameSpeed = Math.min(
            baseSpeed + this.score * SPEED_SCALE_FACTOR,
            MAX_SPEED * this._difficultyPreset.speedMultiplier
        );
    }

    // ==================== RENDERING ====================

    _render() {
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background (always render — sky, ground, clouds)
        this.background.render(ctx, this._gameTime);

        // Game objects (only when running/paused/gameover)
        if (this.state !== GameState.START && this.state !== GameState.LOADING) {
            this.obstacles.render(ctx);
            this.powerups.render(ctx);
            this.player.render(ctx);

            // HUD
            this.ui.renderHUD(ctx, this.score, this.highScore, this.powerups.getEffectProgress());
        }

        // Slow-mo tint effect
        if (this.state === GameState.RUNNING && this.powerups.getSpeedMultiplier() < 1) {
            ctx.fillStyle = 'rgba(100, 50, 150, 0.08)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }
}

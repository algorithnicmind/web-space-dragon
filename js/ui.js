/* ============================================================
   ui.js — UI Manager
   Manages HUD (canvas-drawn), HTML overlays, settings panel,
   skin selector, and toast notifications.
   ============================================================ */

import { CANVAS_WIDTH, SKINS, SCORE_INTERVAL } from './config.js';
import { storage } from './storage.js';
import { buildSpriteCache } from './sprites.js';

export class UIManager {
    constructor(game) {
        this.game = game;

        // DOM references
        this._startScreen = document.getElementById('start-screen');
        this._gameoverScreen = document.getElementById('gameover-screen');
        this._pauseScreen = document.getElementById('pause-screen');
        this._settingsPanel = document.getElementById('settings-panel');
        this._finalScoreEl = document.getElementById('final-score-value');
        this._finalHighScoreEl = document.getElementById('final-highscore-value');
        this._newBestEl = document.getElementById('new-best');
        this._restartBtn = document.getElementById('restart-btn');
        this._soundBtn = document.getElementById('sound-btn');
        this._settingsBtn = document.getElementById('settings-btn');
        this._settingsCloseBtn = document.getElementById('settings-close-btn');
        this._volumeSlider = document.getElementById('volume-slider');
        this._volumeValue = document.getElementById('volume-value');
        this._difficultySelect = document.getElementById('difficulty-select');
        this._graphicsSelect = document.getElementById('graphics-select');
        this._skinGrid = document.getElementById('skin-grid');

        // Score flash animation
        this._scoreFlash = false;
        this._scoreFlashTimer = 0;

        this._bindEvents();
        this._buildSkinGrid();
        this._loadSettingsUI();
    }

    // ==================== EVENT BINDING ====================

    _bindEvents() {
        // Restart button
        this._restartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.game.audio.playClick();
            this.game.restart();
        });

        // Sound toggle
        this._soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.game.toggleMute();
            this._updateSoundBtn();
        });

        // Settings open/close
        this._settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.game.audio.playClick();
            this.toggleSettings();
        });

        this._settingsCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSettings(false);
        });

        // Volume slider
        this._volumeSlider.addEventListener('input', () => {
            const vol = parseInt(this._volumeSlider.value, 10);
            this._volumeValue.textContent = vol + '%';
            this.game.setVolume(vol / 100);
        });

        // Difficulty
        this._difficultySelect.addEventListener('change', () => {
            this.game.setDifficulty(this._difficultySelect.value);
        });

        // Graphics quality
        this._graphicsSelect.addEventListener('change', () => {
            this.game.setGraphicsQuality(this._graphicsSelect.value);
        });

        // Prevent settings panel clicks from propagating to canvas
        this._settingsPanel.addEventListener('click', (e) => e.stopPropagation());
        this._settingsPanel.addEventListener('touchstart', (e) => e.stopPropagation());
    }

    // ==================== OVERLAY MANAGEMENT ====================

    showStart() {
        this._show(this._startScreen);
        this._hide(this._gameoverScreen);
        this._hide(this._pauseScreen);
    }

    hideStart() {
        this._hide(this._startScreen);
    }

    showGameOver(score, highScore, isNewBest) {
        this._finalScoreEl.textContent = Math.floor(score);
        this._finalHighScoreEl.textContent = Math.floor(highScore);

        if (isNewBest) {
            this._newBestEl.classList.remove('hidden');
        } else {
            this._newBestEl.classList.add('hidden');
        }

        this._show(this._gameoverScreen);
    }

    hideGameOver() {
        this._hide(this._gameoverScreen);
    }

    showPause() {
        this._show(this._pauseScreen);
    }

    hidePause() {
        this._hide(this._pauseScreen);
    }

    toggleSettings(forceState) {
        const isHidden = this._settingsPanel.classList.contains('hidden');
        const shouldShow = forceState !== undefined ? forceState : isHidden;

        if (shouldShow) {
            this._show(this._settingsPanel);
            if (this.game.state === 'running') {
                this.game.pause();
            }
        } else {
            this._hide(this._settingsPanel);
        }
    }

    _show(el) {
        el.classList.remove('hidden');
    }

    _hide(el) {
        el.classList.add('hidden');
    }

    // ==================== HUD RENDERING (Canvas) ====================

    /**
     * Render the in-game HUD onto the canvas.
     */
    renderHUD(ctx, score, highScore, powerUpProgress) {
        // Score display
        const scoreText = String(Math.floor(score)).padStart(5, '0');
        const hiText = 'HI ' + String(Math.floor(highScore)).padStart(5, '0');

        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'right';

        // Score flash animation
        if (this._scoreFlash) {
            this._scoreFlashTimer -= 0.016;
            if (this._scoreFlashTimer <= 0) {
                this._scoreFlash = false;
            }
        }

        // High score (muted)
        ctx.fillStyle = 'rgba(120, 120, 120, 0.7)';
        ctx.fillText(hiText, CANVAS_WIDTH - 120, 28);

        // Current score
        ctx.fillStyle = this._scoreFlash ? '#e94560' : 'rgba(80, 80, 80, 0.9)';
        ctx.fillText(scoreText, CANVAS_WIDTH - 16, 28);

        ctx.textAlign = 'left';

        // Power-up indicator
        if (powerUpProgress) {
            this._renderPowerUpIndicator(ctx, powerUpProgress);
        }
    }

    /**
     * Flash the score (called at milestones).
     */
    triggerScoreFlash() {
        this._scoreFlash = true;
        this._scoreFlashTimer = 0.4;
    }

    /**
     * Render power-up duration bar.
     */
    _renderPowerUpIndicator(ctx, { type, progress }) {
        const x = 16;
        const y = 18;
        const barWidth = 60;
        const barHeight = 8;

        // Icon label
        const icons = { shield: '🛡️', slowmo: '⏳', doublejump: '⬆️', invincible: '⭐' };
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'left';
        ctx.fillText(icons[type] || '', x, y + 8);

        // Bar background
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 20, y, barWidth, barHeight);

        // Bar fill
        const colors = {
            shield: '#3498db',
            slowmo: '#9b59b6',
            doublejump: '#2ecc71',
            invincible: '#f1c40f',
        };
        ctx.fillStyle = colors[type] || '#888';
        ctx.fillRect(x + 20, y, barWidth * progress, barHeight);

        // Bar border
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 20, y, barWidth, barHeight);
    }

    // ==================== SOUND BUTTON ====================

    _updateSoundBtn() {
        this._soundBtn.textContent = this.game.audio.muted ? '🔇' : '🔊';
    }

    // ==================== SKIN GRID ====================

    _buildSkinGrid() {
        this._skinGrid.innerHTML = '';
        const unlocked = storage.getUnlockedSkins();
        const settings = storage.getSettings();
        const selected = settings.selectedSkin || 'classic';

        SKINS.forEach(skin => {
            const item = document.createElement('div');
            item.className = 'skin-item';
            item.dataset.skinId = skin.id;

            const isUnlocked = unlocked.includes(skin.id);
            const isSelected = skin.id === selected;

            if (isSelected) item.classList.add('selected');
            if (!isUnlocked) item.classList.add('locked');

            // Color preview
            const preview = document.createElement('div');
            preview.className = 'skin-preview';
            if (skin.body === 'rainbow') {
                preview.style.background = 'linear-gradient(135deg, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #8800ff)';
            } else {
                preview.style.background = skin.body;
            }
            item.appendChild(preview);

            // Name
            const name = document.createElement('div');
            name.className = 'skin-name';
            name.textContent = skin.name;
            item.appendChild(name);

            // Unlock info
            if (!isUnlocked) {
                const unlock = document.createElement('div');
                unlock.className = 'skin-unlock';
                unlock.textContent = `${skin.unlockScore}pts`;
                item.appendChild(unlock);
            }

            item.addEventListener('click', () => {
                if (!isUnlocked) return;
                this._selectSkin(skin.id);
            });

            this._skinGrid.appendChild(item);
        });
    }

    _selectSkin(skinId) {
        const settings = storage.getSettings();
        settings.selectedSkin = skinId;
        storage.setSettings(settings);

        // Update grid UI
        this._skinGrid.querySelectorAll('.skin-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.skinId === skinId);
        });

        // Notify game to rebuild sprites
        this.game.onSkinChange(skinId);
        this.game.audio.playClick();
    }

    /**
     * Refresh skin grid (e.g., after unlocking a new skin).
     */
    refreshSkinGrid() {
        this._buildSkinGrid();
    }

    // ==================== SETTINGS LOAD ====================

    _loadSettingsUI() {
        const settings = storage.getSettings();
        this._volumeSlider.value = settings.volume;
        this._volumeValue.textContent = settings.volume + '%';
        this._difficultySelect.value = settings.difficulty;
        this._graphicsSelect.value = settings.graphics;
        this._updateSoundBtn();
    }

    // ==================== TOAST NOTIFICATIONS ====================

    /**
     * Show a brief toast notification (e.g., "Skin Unlocked!").
     */
    showToast(message) {
        // Create a temporary toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(233, 69, 96, 0.9);
            color: #fff;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.45rem;
            padding: 8px 16px;
            border-radius: 8px;
            z-index: 50;
            pointer-events: none;
            animation: fadeIn 0.3s ease;
            white-space: nowrap;
        `;
        toast.textContent = message;

        const wrapper = document.getElementById('game-wrapper');
        wrapper.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

/* ============================================================
   storage.js — LocalStorage Manager
   Handles high scores, settings, and unlocked skins.
   Gracefully degrades when localStorage is unavailable.
   ============================================================ */

import { DEFAULT_SETTINGS } from './config.js';

const KEYS = {
    highScore: 'spaceDragon_highScore',
    settings: 'spaceDragon_settings',
    skins: 'spaceDragon_skins',
};

class StorageManager {
    constructor() {
        this._available = this._checkAvailability();
    }

    /**
     * Tests if localStorage is available.
     */
    _checkAvailability() {
        try {
            const key = '__storage_test__';
            localStorage.setItem(key, '1');
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    _get(key) {
        if (!this._available) return null;
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    _set(key, value) {
        if (!this._available) return;
        try {
            localStorage.setItem(key, value);
        } catch {
            // Storage full or unavailable — silently fail
        }
    }

    // ---- High Score ----

    getHighScore() {
        const val = this._get(KEYS.highScore);
        return val ? parseInt(val, 10) || 0 : 0;
    }

    setHighScore(score) {
        this._set(KEYS.highScore, String(Math.floor(score)));
    }

    // ---- Settings ----

    getSettings() {
        const raw = this._get(KEYS.settings);
        if (!raw) return { ...DEFAULT_SETTINGS };
        try {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }

    setSettings(settings) {
        this._set(KEYS.settings, JSON.stringify(settings));
    }

    // ---- Skins ----

    getUnlockedSkins() {
        const raw = this._get(KEYS.skins);
        if (!raw) return ['classic'];
        try {
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : ['classic'];
        } catch {
            return ['classic'];
        }
    }

    unlockSkin(skinId) {
        const unlocked = this.getUnlockedSkins();
        if (!unlocked.includes(skinId)) {
            unlocked.push(skinId);
            this._set(KEYS.skins, JSON.stringify(unlocked));
        }
    }
}

// Singleton export
export const storage = new StorageManager();

# Gameplay Mechanics

## Controls

### Desktop
| Input | Action | Notes |
|-------|--------|-------|
| `Space` | Jump | Can double-jump with power-up |
| `Arrow Up (↑)` | Jump | Alternative jump key |
| `Arrow Down (↓)` | Duck | Reduces hitbox height; dino crouches |
| `Escape` | Pause / Resume | Toggles pause overlay |

### Mobile
| Gesture | Action | Notes |
|---------|--------|-------|
| Tap anywhere | Jump | Touch event on canvas |
| Swipe Down | Duck | Minimum 30px downward swipe |

### Key Rebinding
Players can rebind Jump, Duck, and Pause keys via the Settings panel. Custom bindings are stored in localStorage.

---

## Scoring

### Formula
```
scoreIncrement = gameSpeed × deltaTime × scoreMultiplier × 0.01
```

### Score Multiplier Table
| Score Range | Multiplier |
|-------------|------------|
| 0 – 499 | 1.0× |
| 500 – 999 | 1.2× |
| 1000 – 1999 | 1.5× |
| 2000 – 4999 | 2.0× |
| 5000+ | 2.5× |

### Milestones
- Every **100 points**, a score ding sound plays.
- The score display briefly flashes/pulses at each milestone.
- High score is saved to localStorage whenever the current score exceeds it.

---

## Difficulty Curve

### Speed Scaling
```
gameSpeed = initialSpeed + (score × speedScaleFactor)
gameSpeed = min(gameSpeed, maxSpeed)
```

| Parameter | Value |
|-----------|-------|
| Initial Speed | 300 px/s |
| Max Speed | 900 px/s |
| Speed Scale Factor | 0.05 per point |

### Obstacle Spacing
```
minGap = max(MIN_GAP_FLOOR, baseMinGap - score × gapScaleFactor)
```
Obstacles never spawn closer than `MIN_GAP_FLOOR` pixels apart.

### Bird Frequency
| Score | Bird Spawn Probability |
|-------|----------------------|
| 0 – 299 | 0% (no birds) |
| 300 – 599 | 15% |
| 600 – 999 | 25% |
| 1000+ | 35% |

Birds fly at two possible heights: low (requires ducking) and high (can be ignored or jumped).

### Difficulty Presets
Players can select a difficulty in Settings:

| Preset | Speed Multiplier | Obstacle Density |
|--------|-----------------|------------------|
| Easy | 0.7× | Sparse |
| Normal | 1.0× | Standard |
| Hard | 1.3× | Dense |
| Insane | 1.6× | Very Dense |

---

## Day/Night Cycle

The background theme transitions every ~700 points scored:

```
Day → Dusk → Night → Dawn → Day → ...
```

- **Day**: Light sky gradient, white clouds
- **Dusk**: Orange-pink sky gradient
- **Night**: Dark navy sky, stars twinkling, moon visible
- **Dawn**: Purple-pink sky gradient

Transitions last approximately 3 seconds (smooth color interpolation).

---

## Power-Ups

Power-ups spawn randomly on the playing field and are collected by running into them.

| Power-Up | Effect | Duration | Visual |
|----------|--------|----------|--------|
| 🛡️ Shield | Absorbs one hit (then breaks) | Until hit | Blue bubble around dino |
| ⏳ Slow Motion | Reduces game speed by 40% | 5 seconds | Blue-tinted screen |
| ⬆️ Double Jump | Allows a second jump while airborne | 8 seconds | Upward arrows icon |
| ⭐ Invincibility | No collision damage | 4 seconds | Rainbow flash on dino |

### Spawn Rules
- Power-ups begin spawning after score reaches 200.
- Maximum one active power-up on screen at a time.
- Spawn chance: ~2% per obstacle spawn cycle.
- Power-ups float at ground level and move with game speed.

---

## Character Skins

| Skin Name | Colors | Unlock Condition |
|-----------|--------|-----------------|
| Classic | Green body, dark eye | Default (always unlocked) |
| Midnight | Dark purple body | Score 500 |
| Ember | Orange-red body | Score 1000 |
| Arctic | Ice blue body | Score 2000 |
| Golden | Gold body | Score 3000 |
| Shadow | All black body | Score 5000 |
| Neon | Bright cyan body | Score 7500 |
| Rainbow | Shifting hue body | Score 10000 |

Unlocked skins persist in localStorage. Players select skins in the Settings panel.

---

## Game Over

When a collision occurs:
1. Game speed drops to zero.
2. Dino plays death animation (eyes become X's).
3. Hit sound plays.
4. Game Over overlay appears with:
   - Final score
   - High score (updated if beaten)
   - "Press Space to Restart" text
   - Restart button (for mouse/touch)
5. The game resets to the Running state upon restart input.

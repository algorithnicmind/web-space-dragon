# System Architecture

## Overview

Space Dragon is a client-side browser game built with vanilla HTML5, CSS3, and JavaScript. All rendering is done on a single `<canvas>` element using the Canvas 2D API. The game is structured as a collection of ES6 modules that communicate through a central `Game` orchestrator.

---

## Module Dependency Graph

```
index.html
  └── script.js (entry point)
        └── Game (js/game.js) — central orchestrator
              ├── Config (js/config.js) — constants & settings
              ├── InputManager (js/input.js) — keyboard & touch
              ├── Player (js/player.js) — dino entity
              │     └── Sprites (js/sprites.js) — drawing functions
              ├── ObstacleManager (js/obstacle.js) — cactus & birds
              │     └── Sprites
              ├── Background (js/background.js) — ground, sky, clouds
              │     └── Sprites
              ├── PowerUpManager (js/powerup.js) — power-up entities
              │     └── Sprites
              ├── CollisionDetector (js/collision.js) — AABB checks
              ├── UIManager (js/ui.js) — HUD & overlays
              ├── AudioManager (js/audio.js) — Web Audio synthesis
              └── StorageManager (js/storage.js) — localStorage
```

---

## Game States

```
     ┌──────────┐
     │ LOADING  │
     └────┬─────┘
          │ (assets ready)
     ┌────▼─────┐
     │  START   │◄────────────────────┐
     └────┬─────┘                     │
          │ (Space / Tap)             │
     ┌────▼─────┐    ESC    ┌────────┴──┐
     │ RUNNING  │◄─────────►│  PAUSED   │
     └────┬─────┘           └───────────┘
          │ (collision)
     ┌────▼─────┐
     │ GAME_OVER│─── (Space / Tap) ───►  RUNNING
     └──────────┘
```

---

## Game Loop (per frame)

```
1. Calculate deltaTime = (now - lastTimestamp) / 1000
2. Clamp deltaTime to prevent spiral-of-death (max 0.05s)
3. IF state === RUNNING:
     a. inputManager.poll()
     b. player.update(dt)
     c. obstacleManager.update(dt, gameSpeed)
     d. powerUpManager.update(dt, gameSpeed)
     e. background.update(dt, gameSpeed)
     f. collisionDetector.check(player, obstacles, powerUps)
     g. updateScore(dt, gameSpeed)
     h. updateDifficulty(score)
     i. updateDayNightCycle(score)
4. RENDER (always, in all states):
     a. background.render(ctx)
     b. obstacles.render(ctx)
     c. powerUps.render(ctx)
     d. player.render(ctx)
     e. ui.renderHUD(ctx)
5. requestAnimationFrame(loop)
```

---

## Key Design Decisions

### 1. Programmatic Sprites
All game art is drawn using Canvas 2D drawing primitives (`fillRect`, `arc`, `lineTo`, etc.) rather than loading sprite sheet images. This:
- Eliminates external asset loading / CORS issues
- Allows dynamic color theming for character skins
- Keeps the project fully self-contained
- Enables runtime resolution scaling

### 2. Web Audio Synthesis
All sound effects are generated at runtime using the Web Audio API's `OscillatorNode` and `GainNode`. This:
- Eliminates audio file dependencies
- Allows dynamic volume control
- Enables procedural variation in sounds
- Avoids mobile autoplay restrictions (context created on user gesture)

### 3. Object Pooling
Obstacles and power-ups use a fixed-size pool. Objects that scroll off-screen are deactivated and reused rather than garbage-collected. This prevents frame hitches from GC pauses.

### 4. Delta-Time Compensation
All physics and movement multiply by `deltaTime` to ensure consistent gameplay speed regardless of frame rate variations. A deltaTime clamp of 50ms prevents physics explosions if a tab is backgrounded.

### 5. ES6 Modules
The project uses native `<script type="module">` imports. This provides clean namespacing and dependency management without requiring a bundler (Webpack/Vite). The tradeoff is that the game cannot be opened as `file://` in some browsers — a simple HTTP server suffices.

---

## Rendering Architecture

The game uses a single `<canvas>` element for all gameplay rendering. UI overlays (start screen, game over, settings panel) use HTML/CSS positioned over the canvas for richer styling (glassmorphism, animations, fonts).

```
┌──────────────────────────────────────────┐
│  HTML Body                               │
│  ┌────────────────────────────────────┐  │
│  │  Canvas (game rendering)           │  │
│  │  - Background (sky, ground, clouds)│  │
│  │  - Obstacles (cacti, birds)        │  │
│  │  - Power-ups                       │  │
│  │  - Player (dinosaur)               │  │
│  │  - HUD (score, drawn on canvas)    │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  HTML Overlays (positioned above)  │  │
│  │  - Start screen                    │  │
│  │  - Game over screen                │  │
│  │  - Settings panel                  │  │
│  │  - Pause indicator                 │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Collision System

Uses Axis-Aligned Bounding Box (AABB) collision with inset hitboxes for forgiving gameplay.

```
Visual Bounds:        Collision Hitbox:
┌──────────────┐      ┌──────────────┐
│              │      │  ┌────────┐  │
│  Dino Sprite │  →   │  │ Hitbox │  │
│              │      │  └────────┘  │
└──────────────┘      └──────────────┘
                       (inset ~20% on each side)
```

Collision check: two AABBs overlap if and only if they overlap on both the X and Y axes simultaneously.

---

## Data Persistence

```
localStorage
├── "spaceDragon_highScore"    → number
├── "spaceDragon_settings"     → JSON {volume, difficulty, keys, graphics}
└── "spaceDragon_skins"        → JSON {unlocked: [...], selected: "..."}
```

All reads/writes go through `StorageManager` which handles JSON serialization and graceful fallback if localStorage is unavailable.

# Requirements Specification

## Functional Requirements

### FR-01: Player Character
- The game SHALL render a dinosaur character on-screen at all times during gameplay.
- The dinosaur SHALL have animated running, jumping, ducking, and death states.
- The dinosaur SHALL respond to jump input within 1 frame (~16ms).
- The dinosaur SHALL follow gravity physics when airborne.
- Ducking SHALL reduce the dinosaur's hitbox height.

### FR-02: Game Engine
- The game SHALL run at a target of 60 frames per second.
- The game loop SHALL use `requestAnimationFrame` with delta-time compensation.
- The game SHALL support five states: Loading, Start, Running, Paused, Game Over.
- The game SHALL allow pausing and resuming during the Running state.
- The game SHALL allow restarting from the Game Over state.

### FR-03: Obstacle System
- The game SHALL spawn obstacles of varying types: small cactus, large cactus, cactus groups, and flying birds.
- Obstacle types SHALL be randomly selected with difficulty-weighted probability.
- Obstacles SHALL move at the current game speed, synchronized with the ground.
- Obstacles SHALL be recycled (object-pooled) after passing off-screen.
- Minimum spacing between obstacles SHALL decrease as difficulty increases.

### FR-04: Collision Detection
- The game SHALL detect collisions between the player hitbox and obstacle hitboxes.
- Hitboxes SHALL be inset from visual bounds to provide forgiving gameplay.
- Collision with an obstacle SHALL trigger the Game Over state (unless shielded/invincible).

### FR-05: Scoring System
- Score SHALL increment continuously based on distance traveled.
- Score SHALL be displayed on the HUD in real-time.
- High score SHALL be persisted in localStorage.
- A sound SHALL play every 100 points.

### FR-06: Difficulty Scaling
- Game speed SHALL increase linearly over time, up to a maximum cap.
- Bird obstacle probability SHALL increase after score reaches 300.
- Minimum obstacle gap SHALL decrease as speed increases.
- Score multiplier SHALL increase at difficulty thresholds.

### FR-07: Day/Night Cycle
- The background SHALL transition between day and night themes automatically.
- Transitions SHALL occur approximately every 700 points.
- Night mode SHALL display stars and a moon.
- Transitions SHALL be smooth color interpolations.

### FR-08: Power-Up System
- Four power-up types SHALL be available: Shield, Slow Motion, Double Jump, Invincibility.
- Power-ups SHALL spawn randomly on the playfield.
- Each power-up SHALL have a timed duration with a HUD indicator.
- Shield SHALL absorb one hit. Invincibility SHALL prevent all damage for its duration.

### FR-09: Sound System
- Sound effects SHALL be synthesized using the Web Audio API.
- Sounds SHALL include: jump, collision, score milestone, and power-up pickup.
- The player SHALL be able to mute/unmute all sounds.
- Volume SHALL be adjustable via the settings panel.

### FR-10: User Interface
- A start screen SHALL display the game title and "Press Space to Start" instruction.
- A game-over screen SHALL display the final score, high score, and a restart button.
- A HUD SHALL display current score, high score, and active power-up.
- A settings panel SHALL be accessible to adjust volume, difficulty, key bindings, and graphics quality.
- A skin selector SHALL allow choosing from available dinosaur color themes.

### FR-11: Mobile Support
- Tapping the screen SHALL trigger a jump.
- Swiping downward SHALL trigger a duck.
- The canvas and UI SHALL scale responsively to fit mobile and tablet screens.

### FR-12: Character Customization
- At least 8 dinosaur skin color themes SHALL be available.
- Skins SHALL be unlockable based on score achievements.
- Unlocked skins SHALL persist in localStorage.

---

## Non-Functional Requirements

### NFR-01: Performance
- The game SHALL maintain 60fps on mid-range desktop and mobile hardware.
- Frame drops below 30fps SHALL not occur during normal gameplay.
- Memory usage SHALL remain stable over extended play sessions (no leaks).

### NFR-02: Compatibility
- The game SHALL work in the latest versions of Chrome, Firefox, Safari, and Edge.
- The game SHALL work on iOS Safari and Android Chrome.
- The game SHALL function without any external dependencies or build tools.

### NFR-03: Accessibility
- All interactive elements SHALL be keyboard-accessible.
- The game SHALL respect `prefers-reduced-motion` by disabling non-essential animations.
- Font sizes SHALL scale responsively.

### NFR-04: Code Quality
- Code SHALL be organized into ES6 modules with clear separation of concerns.
- Complex logic SHALL be commented.
- No global namespace pollution (all code inside modules/classes).

### NFR-05: Deployability
- The project SHALL be deployable to GitHub Pages, Netlify, and Vercel with zero configuration.
- The project SHALL work when opened directly as a local file (with module-capable browsers).

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Frame Rate | 60 fps sustained |
| Input Latency | < 16ms (1 frame) |
| First Paint | < 500ms |
| Memory (steady state) | < 50MB |
| Bundle Size | < 200KB total (no dependencies) |
| Object Pool Reuse | 100% (no runtime allocation during gameplay) |

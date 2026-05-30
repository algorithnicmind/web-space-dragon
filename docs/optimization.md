# Performance Optimization Guide

## FPS Optimization

### Delta-Time Game Loop
The game loop uses `requestAnimationFrame` with delta-time compensation:
```javascript
const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
```
- All movement and physics multiply by `dt` for frame-rate independence.
- The 50ms clamp prevents physics explosions if the tab is backgrounded.

### Render Only What Changed
- The entire canvas is cleared and redrawn each frame (standard for canvas games).
- Drawing operations are ordered back-to-front: background → obstacles → power-ups → player → HUD.
- No off-screen objects are rendered — visibility culling is implicit in the update loop.

---

## Collision Optimization

### Spatial Culling
Only obstacles within the player's X-range are checked for collision:
```javascript
if (obstacle.x + obstacle.width < player.x || obstacle.x > player.x + player.width) {
    skip; // No possible overlap
}
```

### AABB Only
Full pixel-perfect collision is not used. Instead, hitboxes are inset from visual bounds by ~20%, providing forgiving yet accurate gameplay feel without computational overhead.

### Single Pass
Collision checking runs once per frame in a single loop over active obstacles + power-ups. The loop breaks early on the first collision detected.

---

## Memory Optimization

### Object Pooling
Obstacles and power-ups use fixed-size pools:
```javascript
class ObstaclePool {
    constructor(maxSize) {
        this.pool = Array.from({ length: maxSize }, () => new Obstacle());
    }
    acquire() { /* return an inactive obstacle */ }
    release(obstacle) { obstacle.active = false; }
}
```
- **Zero runtime allocation** during gameplay.
- Objects are deactivated and reused, never created or garbage-collected.
- Pool sizes are tuned to the maximum number of concurrent on-screen objects.

### No String Concatenation in Hot Path
Score display uses `Math.floor()` and cached number-to-string conversion rather than template literals in the render loop.

### Minimal Closure Allocation
Event handlers and callbacks are bound once during initialization, not re-created per frame.

---

## Rendering Optimization

### Canvas State Management
- `ctx.save()` / `ctx.restore()` are used sparingly (only when transforms are needed).
- Fill styles are set once and reused across similar draw calls.
- Text rendering (score HUD) uses `fillText` with a cached font string.

### Sprite Caching
Complex sprites (dino in each animation frame, cactus variants) are pre-rendered to off-screen canvases during initialization. During gameplay, only `drawImage()` from the cached canvas is called — far faster than re-executing dozens of draw commands per frame.

```javascript
// Pre-render during init
const dinoRunFrame1 = document.createElement('canvas');
const ctx = dinoRunFrame1.getContext('2d');
drawDinoRunFrame1(ctx, colors);

// During gameplay (fast)
gameCtx.drawImage(dinoRunFrame1, x, y);
```

### Integer Coordinates
All draw coordinates are rounded to integers to avoid sub-pixel anti-aliasing overhead:
```javascript
ctx.drawImage(sprite, Math.round(x), Math.round(y));
```

---

## Input Optimization

### Passive Event Listeners
Touch events use `{ passive: false }` only when `preventDefault()` is needed (to prevent scrolling). All other listeners use `{ passive: true }`.

### Input Buffering
Jump and duck inputs are buffered so that a key pressed during a transition frame is not lost. The buffer is consumed on the next update tick.

---

## Audio Optimization

### Lazy AudioContext
The `AudioContext` is created only on the first user gesture (click/tap/keypress). This complies with browser autoplay policies and avoids creating an unused context.

### Short-Lived Nodes
Each sound effect creates short-lived `OscillatorNode` + `GainNode` chains that auto-disconnect after playback. No persistent audio nodes are kept alive.

---

## Mobile Optimization

### Canvas Resolution Scaling
The canvas internal resolution matches the CSS display size × `devicePixelRatio` for crisp rendering on high-DPI screens, with a cap at 2× to prevent performance issues on ultra-high-DPI devices.

### Touch Event Handling
- Uses `touchstart` / `touchmove` / `touchend` (not `click`) for zero-delay input.
- `preventDefault()` on the canvas touch events prevents scrolling and zooming.

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```
Prevents pinch-zoom and double-tap-zoom during gameplay.

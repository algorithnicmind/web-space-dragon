# Web Space Dragon - Task Tracker

## Phase 1: Project Setup & Foundation
- [ ] Initialize basic project files (`index.html`, `style.css`, `script.js`).
- [ ] Set up the HTML5 Canvas element.
- [ ] Implement the core Game Loop (`requestAnimationFrame`).
- [ ] Implement basic State Management (Start, Playing, Game Over).

## Phase 2: Environment & Rendering
- [ ] Create rendering utility functions.
- [ ] Implement space background styling.
- [ ] Implement scrolling ground mechanic.
- [ ] Setup basic UI overlays (Start text, Game Over text).

## Phase 3: Player Mechanics (The Space Dragon)
- [ ] Create the Player entity class/object.
- [ ] Implement gravity and physics variables.
- [ ] Implement jump logic (velocity, gravity pulling down).
- [ ] Map keyboard (Space/Up) and mouse/touch (Click) inputs to jump action.
- [ ] Draw the basic visual representation of the dragon.

## Phase 4: Obstacle System
- [ ] Create Obstacle entity class/object.
- [ ] Implement obstacle spawner with randomized intervals.
- [ ] Make obstacles move left towards the player.
- [ ] Remove obstacles once they exit the screen to free memory.
- [ ] Draw the basic visual representation of obstacles.

## Phase 5: Game Logic & Interaction
- [ ] Implement AABB collision detection between Player and Obstacles.
- [ ] Trigger Game Over state upon collision.
- [ ] Stop game loop/movement on Game Over.
- [ ] Implement restart mechanism.

## Phase 6: Scoring System
- [ ] Track score based on time survived.
- [ ] Display current score on screen.
- [ ] Save High Score to `localStorage`.
- [ ] Display High Score on screen.
- [ ] Gradually increase game speed as score increases.

## Phase 7: Polish & Aesthetics
- [ ] Refine graphics (colors, glow effects, shapes).
- [ ] Add starfield parallax background effect.
- [ ] Fine-tune jump physics for responsive feel.
- [ ] Final testing and debugging.

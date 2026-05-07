# Web Space Dragon - Task Tracker

## Phase 1: Project Setup & Foundation
- [x] Initialize basic project files (`index.html`, `style.css`, `script.js`).
- [x] Set up the HTML5 Canvas element.
- [x] Implement the core Game Loop (`requestAnimationFrame`).
- [x] Implement basic State Management (Start, Playing, Game Over).

## Phase 2: Environment & Rendering
- [x] Create rendering utility functions.
- [x] Implement space background styling.
- [x] Implement scrolling ground mechanic.
- [x] Setup basic UI overlays (Start text, Game Over text).

## Phase 3: Player Mechanics (The Space Dragon)
- [x] Create the Player entity class/object.
- [x] Implement gravity and physics variables.
- [x] Implement jump logic (velocity, gravity pulling down).
- [x] Map keyboard (Space/Up) and mouse/touch (Click) inputs to jump action.
- [x] Draw the basic visual representation of the dragon.

## Phase 4: Obstacle System
- [x] Create Obstacle entity class/object.
- [x] Implement obstacle spawner with randomized intervals.
- [x] Make obstacles move left towards the player.
- [x] Remove obstacles once they exit the screen to free memory.
- [x] Draw the basic visual representation of obstacles.

## Phase 5: Game Logic & Interaction
- [x] Implement AABB collision detection between Player and Obstacles.
- [x] Trigger Game Over state upon collision.
- [x] Stop game loop/movement on Game Over.
- [x] Implement restart mechanism.

## Phase 6: Scoring System
- [x] Track score based on time survived.
- [x] Display current score on screen.
- [x] Save High Score to `localStorage`.
- [x] Display High Score on screen.
- [x] Gradually increase game speed as score increases.

## Phase 7: Polish & Aesthetics
- [x] Refine graphics (colors, glow effects, shapes).
- [x] Add starfield parallax background effect.
- [x] Fine-tune jump physics for responsive feel.
- [x] Final testing and debugging.

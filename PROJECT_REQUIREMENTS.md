# Web Space Dragon - Project Requirements

## Overview
Web Space Dragon is an endless runner web game inspired by the classic Chrome offline dinosaur game. Instead of a dinosaur, the player controls a "Space Dragon" navigating through a cosmic environment. The objective is to survive as long as possible by avoiding approaching obstacles.

## Core Gameplay Mechanics
1. **The Player (Space Dragon)**:
   - Positioned on the left side of the screen.
   - Automatically runs forward (environment scrolls left).
   - Can jump to avoid ground-based obstacles.
   - Action: The user presses the Spacebar, Up Arrow, or clicks/taps the screen to make the dragon jump.

2. **The Environment**:
   - A space-themed background (stars, nebulae).
   - A "ground" or path that the dragon runs on (e.g., an asteroid surface or space station hull).
   - Scrolling effect to simulate forward movement.
   - Game speed gradually increases over time to raise the difficulty.

3. **Obstacles**:
   - Spawn on the right side of the screen and move towards the left.
   - Types of obstacles:
     - Ground obstacles (e.g., jagged space rocks, alien crystals) that must be jumped over.
     - (Optional for later) Aerial obstacles that require ducking.
   - Collision with an obstacle results in a "Game Over".

4. **Scoring**:
   - Score increases automatically as the game progresses (based on time or distance).
   - The current score is displayed in the top right corner.
   - A "High Score" is tracked and saved using local storage.

## Game States
1. **Start Screen**:
   - Displays the title "Web Space Dragon".
   - Instruction: "Press Space or Click to Start".
2. **Playing State**:
   - The active game loop where the dragon runs, obstacles spawn, and score increments.
3. **Game Over Screen**:
   - Triggers upon collision.
   - Displays "Game Over".
   - Shows Final Score and High Score.
   - Instruction: "Press Space or Click to Restart".

## Technical Stack & Architecture
- **HTML5**: Structure of the page.
- **CSS3**: Styling, layout, and visual aesthetics (using modern, vibrant, space-themed aesthetics).
- **JavaScript (Vanilla)**:
  - Game Loop (`requestAnimationFrame`).
  - HTML5 `<canvas>` API for rendering game graphics efficiently.
  - Entity-Component approach for Game Objects (Dragon, Obstacle, Background).
  - AABB (Axis-Aligned Bounding Box) for collision detection.

## UI / UX Design
- **Theme**: Deep space, neon accents, retro-arcade mixed with modern crisp graphics.
- **Animations**: Smooth jumping curve (using gravity and velocity physics).
- **Responsiveness**: The canvas should scale appropriately to fit different screen sizes.

## Development Phases (Atomic Approach)
Every single logical change will be committed and pushed immediately.
1. **Setup**: Repository initialization, initial HTML/CSS/JS files.
2. **Game Engine Engine Foundation**: Setup canvas, game loop, and state management.
3. **Environment**: Implement scrolling background and ground.
4. **Player Mechanics**: Implement the Dragon entity, physics (gravity, jump velocity), and input handling.
5. **Obstacle System**: Implement obstacle spawning, movement, and pooling.
6. **Collision Detection**: Implement hitbox logic to detect Game Over conditions.
7. **Scoring & Polish**: Add score tracking, High Score storage, Game Over UI, and visual enhancements.

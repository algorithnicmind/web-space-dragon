# 🐉 Web Space Dragon

> An endless-runner web game inspired by Chrome's offline Dinosaur game — set in outer space with a neon dragon.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/Canvas_API-FF6F00?style=for-the-badge&logo=html5&logoColor=white)

---

## 📖 Overview

**Web Space Dragon** is a browser-based, single-player endless runner game. The player controls a Space Dragon running across an asteroid surface in deep space. Obstacles spawn from the right and rush towards the dragon — the player must jump to avoid them. The game gets progressively faster, and the goal is to survive as long as possible and beat your high score.

**No frameworks. No build tools. Pure HTML5 + CSS3 + Vanilla JavaScript.**

---

## 🎮 How to Play

| Action | Keyboard | Mouse / Touch |
|--------|----------|---------------|
| Jump | `Space` or `↑ Arrow` | Click / Tap anywhere |
| Start Game | `Space` or Click | Click / Tap anywhere |
| Restart | `Space` or Click | Click / Tap anywhere |

---

## 🏗️ Architecture

### Game State Machine

```mermaid
stateDiagram-v2
    [*] --> START
    START --> PLAYING : User presses Space / Clicks
    PLAYING --> GAMEOVER : Collision detected
    GAMEOVER --> PLAYING : User presses Space / Clicks
    PLAYING --> PLAYING : Each frame (requestAnimationFrame)
```

### Game Loop Flowchart

```mermaid
flowchart TD
    A[requestAnimationFrame] --> B[Clear Canvas]
    B --> C[Draw Background & Stars]
    C --> D[Update & Draw Ground]
    D --> E[Update Dragon Physics]
    E --> F[Draw Dragon]
    F --> G[Spawn Obstacles?]
    G -->|Yes| H[Create New Obstacle]
    G -->|No| I[Update Existing Obstacles]
    H --> I
    I --> J[Draw Obstacles]
    J --> K{Collision Detected?}
    K -->|Yes| L[Trigger GAMEOVER]
    K -->|No| M[Update Score]
    M --> N[Increase Speed?]
    N --> A
    L --> O[Show Game Over Screen]
    O --> P[Wait for Restart Input]
    P --> A
```

### Entity Relationship Diagram

```mermaid
erDiagram
    GAME ||--o{ OBSTACLE : spawns
    GAME ||--|| DRAGON : controls
    GAME ||--o{ STAR : renders
    GAME ||--|| GROUND : renders
    GAME {
        string currentState
        int score
        int highScore
        float gameSpeed
        int frameCount
    }
    DRAGON {
        float x
        float y
        float dy
        int width
        int height
        boolean isJumping
        int animFrame
    }
    OBSTACLE {
        float x
        float y
        int width
        int height
        string type
    }
    STAR {
        float x
        float y
        float size
        float speed
        float opacity
    }
    GROUND {
        float offset
        float speed
    }
```

### Input Handling Flow

```mermaid
flowchart LR
    A[User Input] --> B{Event Type?}
    B -->|keydown| C{Space or ArrowUp?}
    B -->|mousedown| D[Proceed]
    B -->|touchstart| D
    C -->|Yes| D
    C -->|No| E[Ignore]
    D --> F{Current State?}
    F -->|START| G[startGame]
    F -->|PLAYING| H[dragon.jump]
    F -->|GAMEOVER| G
```

### Collision Detection (AABB)

```mermaid
flowchart TD
    A[For each Obstacle] --> B{dragon.x < obs.x + obs.width?}
    B -->|No| C[No Collision - Next]
    B -->|Yes| D{dragon.x + dragon.width > obs.x?}
    D -->|No| C
    D -->|Yes| E{dragon.y < obs.y + obs.height?}
    E -->|No| C
    E -->|Yes| F{dragon.y + dragon.height > obs.y?}
    F -->|No| C
    F -->|Yes| G[💥 COLLISION - Game Over!]
```

### Scoring & Difficulty Progression

```mermaid
flowchart TD
    A[Every Frame] --> B[frameCount++]
    B --> C{frameCount % 10 == 0?}
    C -->|Yes| D[score++]
    C -->|No| A
    D --> E{score % 100 == 0?}
    E -->|Yes| F[gameSpeed += 0.5]
    E -->|No| G[Update Score Display]
    F --> G
    G --> A
```

---

## 📂 Project Structure

```
web-space-dragon/
├── index.html              # Main HTML entry point with Canvas & UI overlays
├── style.css               # All game styling, animations, responsive design
├── script.js               # Complete game engine (loop, physics, entities, input)
├── PROJECT_REQUIREMENTS.md # Detailed game design document
├── TASK_TRACKER.md         # Development task checklist
└── README.md               # This file
```

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/algorithnicmind/web-space-dragon.git
   ```
2. **Open in browser:**
   ```bash
   cd web-space-dragon
   start index.html
   ```
   Or simply double-click `index.html` — no server required.

3. **Play!** Press `Space` or click to start.

---

## 🛠️ Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Structure | HTML5 | Canvas element, UI overlays, SEO meta tags |
| Styling | CSS3 | Neon glow effects, glassmorphism, animations, responsive layout |
| Logic | Vanilla JS | Game loop, physics engine, collision detection, state machine |
| Rendering | Canvas API | 2D sprite drawing, particle effects, parallax backgrounds |
| Storage | localStorage | High score persistence across sessions |

---

## ✨ Features

- 🐉 Animated space dragon with running & jumping sprites
- 🌌 Multi-layer parallax starfield background
- 🪨 Randomized obstacle spawning with variable sizes
- ⚡ Progressive difficulty (speed increases every 100 points)
- 🏆 Persistent high score via localStorage
- 📱 Fully responsive — works on desktop, tablet, and mobile
- 🎨 Neon cyberpunk aesthetic with glow effects
- 🖱️ Keyboard, mouse, and touch input support
- 🔄 Smooth 60fps game loop via requestAnimationFrame

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ by **AlgorithmicMind**
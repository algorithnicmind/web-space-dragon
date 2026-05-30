# 🦕 Space Dragon — Advanced Chrome Dino Game Clone

A fully functional, modern, responsive, and visually polished clone of the Google Chrome Dinosaur offline game — built with **vanilla HTML5, CSS3, and JavaScript** using the **Canvas API**.

> An endless runner where your dinosaur sprints across a procedurally generated desert landscape. Jump over cacti, duck under birds, collect power-ups, and survive as long as you can while the speed relentlessly increases!

---

## ✨ Features

### Core Gameplay
- 🏃 **Endless Runner** — Infinite procedurally-generated desert with scrolling ground and parallax clouds
- 🦖 **Dino Character** — Pixel-art dinosaur with running, jumping, ducking, and death animations
- 🌵 **Obstacles** — Small cacti, large cacti, cactus groups, and flying pterodactyls
- 💥 **Collision System** — Bounding-box collision with forgiving hitbox insets
- 📈 **Difficulty Scaling** — Speed, obstacle frequency, and bird spawn rate increase over time

### Modern Additions
- 🌗 **Day/Night Cycle** — Automatic smooth sky transitions with stars and moon at night
- ⚡ **Power-Ups** — Shield, Slow Motion, Double Jump, and Invincibility
- 🎨 **Character Skins** — 8 unlockable dinosaur color themes (achievement-based)
- ⚙️ **Settings Panel** — Volume, difficulty, key rebinding, graphics quality
- 🔊 **Sound System** — All sounds synthesized via Web Audio API (zero audio files)
- 📱 **Mobile Controls** — Tap to jump, swipe down to duck, fully responsive

### Technical
- 🎮 **Game States** — Loading → Start → Running → Paused → Game Over
- 💾 **Persistent Storage** — High scores, settings, and unlocked skins via localStorage
- 🖼️ **Programmatic Art** — All visuals drawn via Canvas API (zero image dependencies)
- 🚀 **60fps Performance** — Delta-time game loop, object pooling, optimized rendering
- ♿ **Accessibility** — Keyboard-navigable, reduced-motion support, responsive font scaling

---

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in any modern browser — no build step, no server required.

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/web-space-dragon.git

# Open in browser
start index.html    # Windows
open index.html     # macOS
xdg-open index.html # Linux
```

### Option 2: Local Dev Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

---

## 🎮 Controls

### Desktop
| Key | Action |
|-----|--------|
| `SPACE` / `↑ UP` | Jump |
| `↓ DOWN` | Duck |
| `ESC` | Pause / Resume |

### Mobile
| Gesture | Action |
|---------|--------|
| **Tap** | Jump |
| **Swipe Down** | Duck |

---

## 📁 Project Structure

```
web-space-dragon/
├── index.html              # Entry point
├── style.css               # Main styles
├── script.js               # ES6 module entry
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
│
├── js/
│   ├── config.js           # Game constants & settings
│   ├── game.js             # Game engine & state machine
│   ├── player.js           # Dino physics & animation
│   ├── obstacle.js         # Obstacle spawning & pooling
│   ├── collision.js        # Hitbox collision detection
│   ├── background.js       # Ground, clouds, day/night
│   ├── sprites.js          # Programmatic pixel-art
│   ├── powerup.js          # Power-up system
│   ├── ui.js               # HUD, overlays, settings
│   ├── audio.js            # Web Audio sound synthesis
│   ├── input.js            # Keyboard & touch input
│   └── storage.js          # localStorage manager
│
├── css/
│   └── responsive.css      # Mobile/tablet breakpoints
│
├── docs/
│   ├── README.md           # This file
│   ├── requirements.md     # Requirements spec
│   ├── architecture.md     # System architecture
│   ├── gameplay.md         # Gameplay mechanics
│   ├── optimization.md     # Performance guide
│   └── deployment.md       # Deployment guide
│
└── tests/
    └── testing-checklist.md
```

---

## 🏗️ Deployment

### GitHub Pages
1. Push to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Site will be live at `https://USERNAME.github.io/web-space-dragon/`

### Netlify
1. Connect your GitHub repo on [netlify.com](https://netlify.com)
2. Build command: *(leave empty)*
3. Publish directory: `.`
4. Deploy!

### Vercel
1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Framework preset: **Other**
3. Output directory: `.`
4. Deploy!

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup, Canvas element
- **CSS3** — Custom properties, animations, glassmorphism, responsive design
- **JavaScript (ES6+)** — Modules, classes, requestAnimationFrame, Web Audio API
- **Canvas 2D API** — All game rendering
- **Web Audio API** — Synthesized sound effects
- **localStorage** — Score and settings persistence

**Zero external dependencies.** No frameworks, no libraries, no build tools.

---

## 📄 License

Licensed under the [Apache License 2.0](../LICENSE).

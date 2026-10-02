# 💎 THE GREAT HEIST

<div align="center">

![Three.js](https://img.shields.io/badge/Three.js-0.186.0-black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision-00897B?style=for-the-badge&logo=google)
![JavaScript](https://img.shields.io/badge/ES_Modules-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**A high-stakes 3D tactical cyber-infiltration simulator built with WebGL, Three.js, and Google MediaPipe.**

[Live Gameplay](#-controls--navigation) • [Key Features](#-key-features) • [Installation](#-getting-started) • [Architecture](#-project-structure)

</div>

---

## 📖 Overview

In **The Great Heist**, you play as a solo cyber-operative infiltrating a high-security multi-floor corporate compound. Your objective: bypass security systems, evade volumetric surveillance cones, crack armored safes, unlock keycard-restricted zones, activate the underground vault's synchronized switches, and extract with the maximum amount of secured loot before the **15-minute** match timer expires.

The game is completely client-side, runs in modern web browsers at 60 FPS, and features an immersive hands-free control protocol powered by **3 Neural Webcam Hand Gestures + Mouse Look**.

---

## ⚡ Key Features

- **🏢 4-Story Unified Facility:**
  - **Underground (B):** High-security blast vault, dual sync switches, backup generators.
  - **Ground Floor (G):** Grand marble lobby, main reception, garage corridor, security checkpoint.
  - **2nd Floor (2):** Research laboratories, executive offices, server racks, laser security grid.
  - **Rooftop Helipad (R):** High-altitude helipad extraction zone offering top bonuses.
  - **Central Elevator:** Fully interactive multi-level elevator linking all four facility tiers.

- **🖐️ 3 Hand Gestures + Mouse Look Control Protocol:**
  - **Webcam Hand Gestures** powered by `@mediapipe/tasks-vision` (Open Palm to walk, Pinch to interact/loot, Closed Fist to stop).
  - **Mouse Look** with pointer lock for seamless 360° aiming, camera turning, and directional steering.

- **⏱️ 15-Minute Tactical Infiltration:**
  - Tight 15-minute high-stakes countdown window to infiltrate, crack vaults, and extract.

- **🚨 Intelligent Security AI & Surveillance Cones:**
  - Dynamic CCTV cameras with real-time volumetric light cones.
  - Suspicious detection meter filling up if caught in line-of-sight.
  - Full facility lockdown alarm sirens, flashing red emergency lighting, and jammed interactive tumblers.

- **🔐 Keycard Progression & Laser Grid:**
  - Tiered keycard hierarchy: 🔵 **Blue**, 🔴 **Red**, and 🟣 **Master** keycards.
  - Electronic sliding security doors that respond only to authorized clearances.
  - Overhead laser grid that trips emergency alarms unless deactivated at the Master terminal.

- **💼 Inventory & Weight Capacity System:**
  - Dynamic carrying capacity capped at **10 Weight units**.
  - Choose between high-density jewels or heavy high-value technology packages.
  - In-game drop menu (`[I]` or `[Q]`) to manage carrying load on the fly.

- **⏱️ Timed Vault Puzzle:**
  - The underground vault door requires flipping two remote industrial switches within a 22-second synchronization window.

- **🚁 Risk vs. Reward Extractions:**
  - Carried loot is temporary! If caught or time runs out, unbanked loot is lost.
  - Choose between three extraction routes:
    - 🟢 **Main Lobby:** Quick, low risk.
    - 🟡 **Garage Exit:** Moderate distance and stealth requirement.
    - 🔴 **Rooftop Helipad:** Highest thrill, requires both Blue & Red clearances to access.

- **🏆 Hall of Master Heists (Persistent Leaderboard):**
  - LocalStorage high scores tracking operative callsign, extracted wealth, completion time, items collected, and final score.

- **🔊 Procedural Audio Engine:**
  - Built-in Web Audio API synthesizer for retro-cyberpunk background music, spatial footsteps, keycard chimes, and alarm sirens without external audio file loading overhead.

---

## 🎮 Controls & Navigation

Operative movement and interactions are driven exclusively using **3 Neural Hand Gestures** alongside **Mouse Looking**:

### 🖐️ Neural Hand Gestures (MediaPipe)
| Hand Gesture | In-Game Action | Description |
|---|---|---|
| 🖐️ **Open Palm** | Walk Forward | Move operative forward toward current mouse aim direction |
| 👌 **Pinch** (Thumb + Index) | Interact / Collect Loot / Flip Switch | Crack safes, open keycard doors, loot valuables, push buttons |
| ✊ **Closed Fist** | Stop / Stand Still (Idle) | Halt operative movement immediately |

### 🖱️ Mouse Look & Tactical Aim
| Input | Action |
|---|---|
| <kbd>MOUSE</kbd> | Look Around, Aim & Steer Direction (Pointer Lock) |
| <kbd>LEFT CLICK</kbd> | Re-engage Mouse Aim Pointer Lock |

### ⌨️ Tactical HUD & Utility Shortcuts
| Key | Action |
|---|---|
| <kbd>I</kbd> | Open Inventory Modal / Weight Management |
| <kbd>Q</kbd> | Quick Drop Last Carried Item |
| <kbd>G</kbd> | Toggle Webcam Picture-in-Picture (PIP) Window |
| <kbd>H</kbd> | Toggle Mission Briefing & Controls Modal |
| <kbd>ESC</kbd> | Pause Menu / Release Mouse Lock |

---

## 💎 Valuable Loot Table

| Loot Item | Value (₹) | Weight | Location |
|---|---|---|---|
| 🪙 **Gold Coins** | ₹1,000 | 2 W | Lobby Desks & Security Tables |
| 💎 **Diamond** | ₹5,000 | 1 W | Glass Display Cases |
| 📱 **Prototype Device** | ₹8,000 | 5 W | 2F Research Labs |
| ⌚ **Luxury Watch** | ₹10,000 | 2 W | Executive Suites |
| 👑 **Royal Crown** | ₹15,000 | 4 W | Armored Safes |
| 💼 **Vault Package** | ₹30,000 | 10 W | Main Underground Blast Vault |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sohamdeshpande1812/The-Great-Heist.git
   cd The-Great-Heist
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Launch development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000/`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static assets will be output to the `dist/` directory, ready to be deployed to GitHub Pages, Vercel, Netlify, or any static web host.

---

## 📁 Project Structure

```
the-great-heist/
├── index.html               # Main entrypoint & UI HUD / modal overlays
├── package.json             # NPM dependencies and scripts
├── vite.config.js           # Vite development and bundle configuration
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
└── src/
    ├── main.js              # Central game loop and state coordinator
    ├── engine/
    │   ├── AudioManager.js      # Procedural Web Audio API sound generator
    │   ├── GestureController.js # MediaPipe AI HandLandmarker controller
    │   ├── InputManager.js      # Pointer lock, keyboard & mouse listeners
    │   ├── Physics.js           # AABB collision resolution & raycasting
    │   └── Renderer.js          # Three.js WebGL scene, lighting & cameras
    ├── entities/
    │   ├── GlassCase.js         # Interactive museum display cases
    │   ├── InteractiveSafe.js   # Crackable wall & floor safes
    │   ├── LaserGrid.js         # Overhead alarm-tripping laser barriers
    │   ├── LootItem.js          # Physical loot items in world
    │   ├── Player.js            # Character controller, camera & mesh
    │   └── SecurityCamera.js    # Sweeping CCTV cameras with detection cones
    ├── mechanics/
    │   ├── ExtractionSystem.js  # Zone detection & risk multipliers
    │   ├── KeycardSystem.js     # Color-coded clearance doors
    │   ├── SecuritySystem.js    # Camera alerts & lockdown timers
    │   └── VaultPuzzle.js       # Timed dual-switch puzzle logic
    ├── styles/
    │   └── main.css             # Cyberpunk HUD & modal theme stylesheets
    ├── ui/
    │   ├── HUD.js               # In-game HUD, telemetry, radar & toasts
    │   ├── LeaderboardView.js   # LocalStorage high score records
    │   ├── MainMenu.js          # Start screen, controls & audio settings
    │   └── ResultsModal.js      # Game over & score calculation view
    ├── utils/
    │   └── MathUtils.js         # Coordinate clamping & formatting helpers
    └── world/
        ├── FacilityMap.js       # Complete 4-floor architectural building
        ├── Minimap.js           # Real-time top-down 2D radar overlay
        └── Props.js             # Procedural 3D environmental furniture
```

---

## 🛠️ Built With

- **[Three.js](https://threejs.org/)** — 3D graphics rendering, lighting, and materials.
- **[Google MediaPipe](https://developers.google.com/mediapipe)** — Real-time on-device machine learning hand tracking.
- **[Vite](https://vite.dev/)** — Next generation frontend tooling and bundler.
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** — Procedural audio synthesis.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

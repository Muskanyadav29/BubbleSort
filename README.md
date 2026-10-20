# BUBBLE BLAST ADVENTURE — Full-Stack Bubble Shooter Game

A production-quality, responsive full-stack web puzzle game inspired by classic bubble shooter mechanics. Engineered with a custom 60 FPS HTML5 Canvas engine, native Web Audio synthesizer, JWT authentication, persistent player progress, anti-cheat server score validation, and 45 data-driven levels.

---

## 1. Project Name
**BUBBLE BLAST ADVENTURE** (Fully dynamic via `GAME_NAME` / `VITE_GAME_NAME` environment configuration).

## 2. Project Description
**BUBBLE BLAST ADVENTURE** is an interactive puzzle game and full-stack web application designed for both desktop and mobile platforms. Players aim and fire colored bubbles from a rotating cannon to match 3 or more connected spheres of the same color, popping them and causing unsupported bubbles to drop under gravity. The game features multiple mission types (Classic Clear, Rescue Trapped Critters, Drop Targets, Color Hunt, Combo Streaks, and Score Milestones), power boosters, persistent career statistics, and a certified anti-cheat global leaderboard.

## 3. Reference Game
- **Reference Game**: Bubble Shooter (Dragon Pop mechanics)
- **Reference URL**: [Google Play Store Reference](https://play.google.com/store/apps/details?id=game.bubble.shooter.dragon.pop)
- **Study & Implementation**: All graphics, characters, sounds, levels, and source code are original web implementations engineered from scratch without proprietary APK assets.

## 4. Gameplay Mechanics
- **Aiming & Trajectory Guide**: Precise mouse and touch aiming with reflective laser trajectory calculating side-wall bank shots and target collision indicators.
- **Hexagonal Close-Packed Grid**: Odd-row offset hexagonal grid packing (8/7 alternating columns) producing natural bubble bouncing, docking, and cluster formations.
- **Match-3+ Flood Fill**: Breadth-First Search (BFS) graph traversal detects all connected same-color bubbles touching the impact point.
- **Floating / Disconnected Bubble Detection**: BFS graph traversal anchored to the ceiling (Row 0). Any bubble no longer connected to the ceiling falls with simulated gravity and rotation for cascade points.
- **Ammunition & Queue System**: Limited shots per level with active bubble loading, next-bubble preview, and instant bubble swap (`⇄`).
- **Combo Multipliers**: Consecutive popping shots build combo streaks (x2, x3, x4...) with escalating sound frequencies and floating score popups.
- **Special Spheres & Boosters**:
  - 💣 **Bomb Bubble**: Radial detonation destroying clusters within a 2-hex radius.
  - 🌈 **Rainbow Star**: Universal wildcard matching any touched color.
  - ⚡ **Lightning Bubble**: Pierces and clears an entire horizontal row.
  - 🎯 **Super Guide**: Extends laser trajectory across multiple reflections.
  - ➕ **Extra Shot**: Restores +5 ammo shots in emergencies.
  - 🔀 **Shuffle**: Rearranges grid colors while preserving formations.

## 5. Features
- **45 Playable Levels**: Data-driven levels across Tutorial, Beginner, Easy, Medium, Hard, and Expert difficulties.
- **Procedural Auto-Level Generation**: Endless level scalability beyond Level 40.
- **Original Cartoon Mascot**: *Pip the Star Sprite* provides responsive feedback, cheers on combos, reacts to victories, and gives strategic hints.
- **Daily Nebula Quest**: Date-seeded daily puzzle with daily coin and booster bounties.
- **Visual Level Editor**: Admin panel to visually create, color-code, test, and save custom levels.
- **10 Career Achievements**: First Pop, Bubble Beginner, Perfect Aim, Combo Master, Bubble Hunter, Rescue Hero, Star Collector, Booster Expert, Level Master, Bubble Legend.
- **Complete Sound System**: Zero-latency Web Audio API synthesizers for pops, launches, bounces, fanfare, and ambient background music with independent SFX/Music toggles.
- **Undo & Hint System**: Undo previous shots and preview recommended bank shot angles.

## 6. Tech Stack
- **Frontend**:
  - React 19 + Vite 8
  - HTML5 Canvas (60 FPS Game Engine)
  - Web Audio API (Synthesizer & Background Music Engine)
  - React Router DOM 7
  - Lucide React Icons & Canvas Confetti
  - Custom Glassmorphism CSS Design System
- **Backend**:
  - Node.js (v22+)
  - Express.js 4 (ES Modules)
  - JSON / MongoDB Persistence Store (Zero-config local fallback)
  - JWT (JSON Web Tokens) & bcryptjs
  - CORS Middleware
- **Security & Anti-Cheat**:
  - Server-side game session token verification (`/api/games/start` -> `/api/games/complete`)
  - Verification of completion time, shot counts, bubble pop bounds, and session replay attack prevention.

## 7. Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Step 1: Clone or Navigate to Directory
```bash
cd "bubble-blast-adventure"
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4: Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend Server on port 5000):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend Client on port 5173):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 8. Environment Variables

### Root / Server `.env`
```env
GAME_NAME=BUBBLE BLAST ADVENTURE
PORT=5000
MONGODB_URI=
JWT_SECRET=super_secret_bubble_blast_jwt_key_2026
NODE_ENV=development
```

### Client `.env`
```env
VITE_GAME_NAME=BUBBLE BLAST ADVENTURE
VITE_API_URL=http://localhost:5000/api
```

> **Mandatory Game Name Test**: To change the branding throughout the entire platform, update `VITE_GAME_NAME=POP DRAGON` in `client/.env` and `GAME_NAME=POP DRAGON` in `server/.env`. Restart the servers or rebuild the client bundle; the new game name will appear dynamically everywhere without editing any component code! Note: Frontend Vite environment variables require a restart or rebuild to update the production bundle.

## 9. Database Setup
The backend supports **dual database modes**:
1. **Zero-Config Local Store (Default)**: Automatically writes to `server/data/db.json` when `MONGODB_URI` is blank. This ensures the app works immediately upon cloning without needing a live remote database connection.
2. **MongoDB Atlas Mode**: Supply your connection string in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bubbleblast?retryWrites=true&w=majority
   ```

## 10. API Documentation

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `confirmPassword`).
- `POST /api/auth/login` — Login and receive JWT (`email`, `password`).
- `GET /api/auth/me` — Retrieve authenticated user profile.
- `POST /api/auth/logout` — Invalidate user session.

### Levels
- `GET /api/levels` — Get metadata for all 45+ levels.
- `GET /api/levels/:id` — Get full layout and bubble queue for a specific level.
- `POST /api/levels` — Admin create a custom level.
- `PUT /api/levels/:id` — Admin update custom level.
- `DELETE /api/levels/:id` — Admin delete custom level.

### Game Sessions & Anti-Cheat
- `POST /api/games/start` — Start verified session (`levelId`). Returns `{ sessionId, sessionToken, startedAt }`.
- `POST /api/games/complete` — Submit completed game for anti-cheat scoring analysis and level unlocking.
- `GET /api/games/history` — Fetch user's completed game sessions.

### Leaderboard & Achievements
- `GET /api/leaderboard?type=global|weekly|friends` — Get ranked player standings.
- `GET /api/leaderboard/me` — Get authenticated player's rank.
- `GET /api/achievements` — Get all career achievements.
- `GET /api/achievements/me` — Get user's unlocked trophies.

### Daily Challenge
- `GET /api/daily-challenge` — Get today's deterministic daily quest.
- `POST /api/daily-challenge/complete` — Claim daily bounties.

## 11. Game Architecture
```
client/src/
├── components/
│   ├── GameHUD/       # Displays level, stars, score, shots remaining, and combo streaks
│   ├── BoosterBar/    # Interactive booster dock with inventory badges
│   ├── LevelComplete/ # Celebratory modal with stars, score breakdown, and confetti
│   ├── GameOver/      # Out-of-shots screen with booster continue and retry options
│   ├── PauseModal/    # True game pause overlay with independent audio controls
│   ├── Mascot.jsx     # Original animated mascot Pip the Star Sprite
│   └── Navbar.jsx     # Navigation bar with audio toggles and auth links
├── game/
│   ├── collision.js         # Hex grid coordinate math, neighbor graph, and wall bounce physics
│   ├── matchDetector.js     # BFS cluster search for same-colored and special bubbles
│   ├── floatingDetector.js  # Ceiling BFS anchor search identifying unsupported bubbles
│   ├── scoreManager.js      # Combo bonuses, cascade drops, and 3-star thresholds
│   ├── shotManager.js       # Ammo tracking, queue management, and bubble swapping
│   ├── objectiveManager.js  # Multi-objective criteria evaluator
│   ├── levelManager.js      # Level progression and unlock persistence
│   └── gameEngine.js        # 60 FPS requestAnimationFrame loop, particle systems, and raycast
├── config/
│   └── gameConfig.js        # Centralized GAME_NAME and visual theme constants
└── utils/
    └── soundEngine.js       # Native Web Audio API synthesizer for SFX and ambient music
```

## 12. Authentication
- Secured using industry-standard `bcryptjs` salted password hashing.
- Stateless `jsonwebtoken` (JWT) passed in `Authorization: Bearer <token>` header.
- Guest play seamlessly supported with automatic local progression and synchronization upon registration.

## 13. Server-Side Score Validation & Anti-Cheat
The server strictly rejects forged or unearned scores:
1. **Cryptographic Session Tokens**: Every session generated at `/api/games/start` requires a matched single-use `sessionToken`.
2. **Replay Protection**: Completed sessions cannot be resubmitted.
3. **Plausible Velocity Checks**: Completion times faster than humanly possible (< 2.5s) are rejected.
4. **Shot Bounds**: Shots used cannot exceed `level.shots` plus registered extra-shot boosters.
5. **Score Verification**: Reported scores exceeding theoretical maximums for bubbles popped are flagged and rejected.

## 14. Leaderboard System
- Ranked by career score and stars.
- Includes category filtering: Global Hall, Weekly Rush, and Friends.
- Real-time personal rank indicator (`Your Standings`).

## 15. Deployment
- **Live Frontend (Netlify):** [https://bubblesort-muskan.netlify.app](https://bubblesort-muskan.netlify.app)
- **Live Backend API:** [https://bubblesort-muskan.netlify.app/api](https://bubblesort-muskan.netlify.app/api)
- **GitHub Repository:** [https://github.com/Muskanyadav29/BubbleSort](https://github.com/Muskanyadav29/BubbleSort)

### Deployment Configuration
- **Frontend (Vercel / Netlify)**:
  - Base / Root directory: `client`
  - Build command: `npm run build`
  - Publish / Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://bubblesort-muskan.netlify.app/api`, `VITE_GAME_NAME=BUBBLE BLAST ADVENTURE`
- **Backend (Render / Railway / Vercel Serverless)**:
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `node server.js`
  - Environment variables: `GAME_NAME`, `PORT`, `JWT_SECRET`, `MONGODB_URI`

## 16. Screenshots
The project includes a complete glassmorphism UI design, responsive canvas aiming, interactive Level Select with 45+ stages, global leaderboard standings, career achievements, and an in-engine Level Editor.

## 17. Demo Video
- **Demonstration Walkthrough:** [Demo Video Link]
- Video covers: Landing page, registration, login, dashboard, level selection, aiming guide, shooting, wall bounce, match-3 BFS detection, popping animations, floating bubble cascade drops, combo streaks, boosters, rescue objectives, 3-star level completion, failure states, game history, leaderboards, achievements, audio toggles, and mobile responsiveness.

## 18. Known Limitations
- **Web Audio Autoplay Policy:** Modern web browsers require an initial user interaction (click/touch) on the page before the Web Audio API context can begin playback.
- **Offline Mode Synchronization:** When playing offline without an active internet connection, completed levels are stored securely in local browser storage and synchronize with backend leaderboards once connectivity is restored.

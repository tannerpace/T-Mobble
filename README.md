# dino jump knock-off
## no wifi game
#### Needs wifi https://tannerpace.github.io/T-Mobble/

A fun, installable Progressive Web App (PWA) recreation of the classic Chrome dinosaur game. Jump over obstacles, collect power-ups, shoot bullets, and beat your high score - all offline!

![Build Status](https://github.com/tannerpace/T-Mobble/actions/workflows/deploy.yml/badge.svg)
![T-Mobble Game](https://img.shields.io/badge/game-playable-brightgreen)

## Setup on Chromebook (No Linux Required)

This game works perfectly on Chromebooks without needing Linux or developer mode. Choose one of these methods:

### Method 1: GitHub Pages (Easiest - Just Click and Play!)

**Play Now:** Visit the live game at:
```
https://tannerpace.github.io/T-Mobble/
```

That's it! The game is already hosted and ready to play.

---

### First Time? Create Your Own Copy

If you want to make your own version or edit the code:

1. **Create a GitHub Account** (if you don't have one)
   - Go to [github.com/signup](https://github.com/signup)
   - Follow the steps to create your free account
   - Verify your email address

2. **Fork This Repository**
   - Make sure you're logged into GitHub
   - Visit: [github.com/tannerpace/T-Mobble](https://github.com/tannerpace/T-Mobble)
   - Click the **Fork** button in the top-right corner
   - Click **Create fork**
   - Now you have your own copy at `github.com/YOUR-USERNAME/T-Mobble`

3. **Enable GitHub Pages** (to host your version)
   - In your forked repository, click **Settings**
   - Click **Pages** in the left sidebar
   - Under "Source", select **main** branch
   - Click **Save**
   - Wait 1-2 minutes, then visit: `https://YOUR-USERNAME.github.io/T-Mobble/`

Now you can play your own hosted version!

---

### Method 2: VS Code for the Web (Edit Code in Your Browser)

**Prerequisites:** You need a GitHub account and to fork the repo (see "First Time?" section above)

1. **Open Your Forked Repository in VS Code**
   - Go to [vscode.dev](https://vscode.dev) in your Chrome browser
   - Sign in with your GitHub account
   - Press `Ctrl + O`
   - Select "Open Remote Repository"
   - Type: `YOUR-USERNAME/T-Mobble` (use your GitHub username)
   - Press Enter

3. **Install Live Preview Extension (One-time setup)**
   - When prompted to install recommended extensions, click "Install"
   - Or manually: Click the Extensions icon (puzzle piece) on the left sidebar
   - Search for "Live Preview"
   - Install the "Live Preview" extension by Microsoft

4. **Preview the Game**
   - Click on `index.html` in the file explorer
   - Right-click on `index.html` and select "Show Preview"
   - OR click the preview icon (magnifying glass with play button) in the top right
   - Start playing!

**Quick Link:** Open directly at:
```
https://vscode.dev/github/YOUR-USERNAME/T-Mobble
```
(Replace `YOUR-USERNAME` with your GitHub username)

5. **Make Changes and Save**
   - Edit any files in VS Code
   - Click the Source Control icon (branch icon) on the left
   - Enter a commit message describing your changes
   - Click the checkmark to commit
   - Click "Sync Changes" to push to GitHub
   - Your changes will appear on your GitHub Pages site in 1-2 minutes!

---

### Keeping Your Fork Up to Date

If the original repository gets updates, you can sync your fork:

**On GitHub (Easiest):**
1. Go to your forked repository: `github.com/YOUR-USERNAME/T-Mobble`
2. You'll see a message if your fork is behind: "This branch is X commits behind tannerpace:main"
3. Click **Sync fork** button
4. Click **Update branch**
5. Done! Your fork now has the latest updates

**In VS Code for the Web:**
1. Open your fork in vscode.dev
2. Open the Terminal: View → Terminal (or press `` Ctrl + ` ``)
3. Run these commands:
   ```bash
   git remote add upstream https://github.com/tannerpace/T-Mobble.git
   git fetch upstream
   git merge upstream/main
   ```
4. Click "Sync Changes" to push the updates to your fork
5. Your GitHub Pages site will update automatically

---

## How to Play

- Press **SPACE** or **↑ (Up Arrow)** to jump
- Press **Z** to shoot bullets (after collecting power-ups)
- Avoid obstacles (palm trees) to keep playing
- Collect power-ups to gain shooting ability
- Your score increases the longer you survive
- Game speed increases as you progress
- Beat your high score!

## Features

- 🦖 Detailed T-Rex raptor character
- 🎮 Smooth jumping mechanics
- 🔫 Shooting mechanic with power-ups
- 🌴 Palm tree obstacles
- 📊 Score tracking with persistent high scores
- 🏃 Progressive difficulty (game speeds up over time)
- 💾 Installable PWA - works offline
- ☁️ Animated background clouds
- 🎨 Retro pixel-art style graphics
- 📱 Perfect for Chromebooks and mobile devices
- 🎵 Sound effects for jumps and power-ups
- 🏗️ Modular ES6 architecture
- 🧩 Clean, organized codebase

## Project Structure

This project follows modern JavaScript best practices with a modular architecture:

```
T-Mobble/
├── assets/           # Game assets (audio, images, icons)
├── public/           # Public files (HTML, CSS, manifest)
├── src/              # Source code (ES6 modules)
│   ├── entities/     # Game entities (Dino, Obstacle, etc.)
│   ├── game/         # Core game systems
│   └── utils/        # Utility modules
└── tools/            # Development tools
```

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

## License

Free to use and modify for personal or educational purposes.

---

**Have fun playing! 🦖**

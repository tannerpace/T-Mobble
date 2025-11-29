# T-Mobble Quick Reference

## Project Structure at a Glance

```
T-Mobble/
│
├── 📁 assets/              Game assets organized by type
│   ├── audio/             Sound effects (.m4a files)
│   ├── icons/             PWA icons (192x192, 512x512)
│   └── images/            Game sprites (trex, palm)
│
├── 📁 public/              Public-facing files (served to users)
│   ├── index.html         Main HTML file
│   ├── style.css          Styling and layout
│   └── manifest.json      PWA configuration
│
├── 📁 src/                 Source code (ES6 modules)
│   ├── entities/          Game entities (Dino, Obstacle, Cloud, PowerUp, Bullet)
│   ├── game/              Core systems (Game, Renderer, InputHandler)
│   ├── utils/             Utilities (AssetManager, ScoreManager, collision)
│   └── main.js            Entry point
│
├── 📁 tools/               Development utilities
│
├── 📄 config.js            Environment configuration
├── 📄 service-worker.js    PWA offline support
│
└── 📚 Documentation
    ├── README.md           Project overview & setup
    ├── ARCHITECTURE.md     Detailed architecture guide
    ├── DEVELOPMENT.md      Developer guide
    └── REFACTORING.md      What changed & why
```

## File Responsibilities

### Entities (src/entities/)
- **Dino.js** - Player character with jump physics
- **Obstacle.js** - Palm tree obstacles to avoid
- **Cloud.js** - Animated background clouds
- **PowerUp.js** - Collectible items that give ammo
- **Bullet.js** - Projectiles that destroy obstacles

### Game Systems (src/game/)
- **Game.js** - Main orchestrator, game loop, state management
- **Renderer.js** - All canvas drawing operations
- **InputHandler.js** - Keyboard, mouse, and touch events

### Utilities (src/utils/)
- **AssetManager.js** - Load and cache images/audio
- **ScoreManager.js** - Score tracking with localStorage
- **collision.js** - Collision detection functions

## Quick Commands

### Development
```bash
# Start local server (Python)
python3 -m http.server 8000

# Start local server (Node)
npx serve .

# View in browser
open http://localhost:8000/public/
```

### Git
```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "your message"

# Push to GitHub
git push origin main
```

## Common Tasks

### Add New Entity
1. Create class in `src/entities/NewEntity.js`
2. Export with `export class NewEntity`
3. Import in `src/game/Game.js`
4. Add to game array and loop

### Add New Asset
1. Place file in `assets/audio/` or `assets/images/`
2. Register in `src/utils/AssetManager.js`
3. Add path to `service-worker.js` cache
4. Increment cache version number

### Change Game Mechanic
1. Find relevant entity or game system
2. Modify the specific method
3. Test in browser
4. Commit changes

## Important Notes

### Always Use
- ✅ ES6 module syntax (`import`/`export`)
- ✅ `.js` extension in imports
- ✅ Relative paths (`./` or `../`)
- ✅ `type="module"` in script tags

### Path Examples
```javascript
// Correct
import { Dino } from './entities/Dino.js';
import { checkCollision } from '../utils/collision.js';

// Wrong
import { Dino } from './entities/Dino';  // Missing .js
import { Dino } from 'entities/Dino.js'; // Not relative
```

### Service Worker
- Increment `CACHE_NAME` when deploying changes
- Clear browser cache during development
- Check Application tab in DevTools

## Game Constants

### Physics
- `gravity` = 0.6
- `jumpPower` = -12
- `initialGameSpeed` = 3

### Spawning
- Obstacles: Every 100 frames
- Power-ups: Every 250 frames (30% chance)
- Minimum obstacle distance: 200px

### Scoring
- 1 point per frame
- Display score: `Math.floor(score / 10)`
- Speed increase: Every 200 points (+0.5)

## Keyboard Controls
- `SPACE` or `↑` - Jump / Start / Restart
- `Z` - Shoot (when have power-ups)

## Touch Controls
- Tap canvas - Jump / Start / Restart
- `↑` button - Jump
- `⚡` button - Shoot

## Browser Console Commands

```javascript
// Access game instance (if exposed)
game.gameSpeed = 10;          // Change speed
game.powerUpCount = 99;       // Give ammo
game.dino.jumpPower = -20;    // Super jump
game.resetGame();             // Reset game
```

## File Sizes (Approximate)
- Total JS: ~2.5 KB (12 modules, well-organized)
- HTML: ~3 KB
- CSS: ~2 KB
- Assets: Variable (images, audio)

## Browser Compatibility
- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ✅ Mobile browsers (iOS, Android)
- ❌ IE11 (no ES6 module support)

## Deployment Checklist
- [ ] Increment service worker cache version
- [ ] Test game functionality
- [ ] Check PWA installation
- [ ] Verify offline mode
- [ ] Test on mobile
- [ ] Push to main branch
- [ ] Verify GitHub Pages deployment

## Troubleshooting

### Game won't load
1. Check browser Console for errors
2. Verify all file paths are correct
3. Check that script is `type="module"`
4. Clear browser cache

### Assets not loading
1. Check Network tab for 404s
2. Verify paths in `AssetManager.js`
3. Check base path in `config.js`

### Module errors
1. Ensure `.js` extension on all imports
2. Check relative paths (`./` or `../`)
3. Verify exports match imports

## Documentation

- **README.md** - Start here for setup
- **ARCHITECTURE.md** - Understand the code structure
- **DEVELOPMENT.md** - Learn how to develop
- **REFACTORING.md** - See what changed

## Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [PWA Guide](https://web.dev/progressive-web-apps/)

---

**Need more detail? Check the other documentation files!**

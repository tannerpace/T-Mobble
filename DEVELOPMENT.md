# Development Guide

## Quick Start

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/tannerpace/T-Mobble.git
   cd T-Mobble
   ```

2. **Open in browser**
   - Navigate to `public/index.html`
   - Open with your preferred browser
   - Or use a local server (recommended)

3. **Using a local server** (recommended)
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Node.js (if you have npx)
   npx serve .
   
   # VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

4. **Access the game**
   - Open browser to `http://localhost:8000/public/`

## Development Environment

### Recommended Tools

- **VS Code** - Code editor with great JavaScript support
  - Extensions:
    - Live Server (preview changes instantly)
    - ESLint (code quality)
    - Prettier (code formatting)
    - JavaScript (ES6) code snippets

- **Chrome DevTools** - Debugging and testing
  - Console for logs and errors
  - Network tab for asset loading
  - Application tab for PWA testing

### Code Structure

#### ES6 Modules
All code uses ES6 module syntax:

```javascript
// Export
export class MyClass { }
export function myFunction() { }

// Import
import { MyClass } from './MyClass.js';
import { myFunction } from './utils.js';
```

**Important**: 
- Always include `.js` extension in imports
- Use relative paths (`./` or `../`)
- HTML must use `<script type="module">`

## Making Changes

### Adding a New Entity

1. **Create the entity file** in `src/entities/`:

```javascript
// src/entities/NewEntity.js
export class NewEntity {
  constructor(canvas, otherParams) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.width = 20;
    this.height = 20;
  }

  draw(ctx) {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x += 1; // Move right
  }
}
```

2. **Import in Game.js**:

```javascript
import { NewEntity } from '../entities/NewEntity.js';
```

3. **Add to game state**:

```javascript
constructor(canvas, assets) {
  // ... existing code
  this.newEntities = [];
}
```

4. **Update game loop**:

```javascript
update() {
  // Spawn
  if (this.frameCount % 100 === 0) {
    this.newEntities.push(new NewEntity(this.canvas));
  }
  
  // Update
  this.newEntities.forEach(entity => entity.update());
}

render() {
  // Draw
  this.newEntities.forEach(entity => entity.draw(this.ctx));
}
```

### Adding New Assets

1. **Place file in appropriate folder**:
   - Images → `assets/images/`
   - Audio → `assets/audio/`
   - Icons → `assets/icons/`

2. **Register in AssetManager** (`src/utils/AssetManager.js`):

```javascript
loadGameAssets() {
  // Add new asset
  this.loadImage('newSprite', 'assets/images/new-sprite.png');
  this.loadSound('newSound', 'assets/audio/new-sound.m4a', 0.5);

  return {
    // ... existing assets
    newSpriteImg: this.getImage('newSprite'),
    newSound: this.getSound('newSound')
  };
}
```

3. **Update service worker cache** (`service-worker.js`):

```javascript
const CACHE_NAME = 'dino-game-v3'; // Increment version!

const urlsToCache = [
  // ... existing files
  `${BASE_PATH}/assets/images/new-sprite.png`,
  `${BASE_PATH}/assets/audio/new-sound.m4a`
];
```

### Modifying Game Mechanics

#### Example: Change Jump Height

In `src/entities/Dino.js`:

```javascript
constructor(canvas, gravity, assets) {
  // ... existing code
  this.jumpPower = -15; // Higher = bigger jump (was -12)
}
```

#### Example: Adjust Difficulty Curve

In `src/game/Game.js`:

```javascript
update() {
  // ... existing code
  
  // Speed up every 100 points instead of 200
  if (this.scoreManager.score % 100 === 0) {
    this.gameSpeed += 0.5;
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Game starts on SPACE press
- [ ] Jump works with SPACE/Arrow/Tap
- [ ] Shooting works with Z key
- [ ] Obstacles spawn and move
- [ ] Power-ups spawn and can be collected
- [ ] Bullets destroy obstacles
- [ ] Collision detection works
- [ ] Game over triggers correctly
- [ ] High score persists on refresh
- [ ] Sound effects play
- [ ] Mobile controls work on touch devices

### Testing PWA Features

1. **Service Worker Registration**
   - Open Chrome DevTools → Application tab
   - Check "Service Workers" section
   - Should show "Activated and running"

2. **Offline Mode**
   - Open DevTools → Network tab
   - Select "Offline" from throttling dropdown
   - Refresh page
   - Game should still load and play

3. **Installation**
   - Chrome should show install prompt
   - Test on mobile: Add to Home Screen
   - Launch standalone app

### Debugging Tips

#### Console Logging
Strategic `console.log()` statements already in place:
- Jump events in `Dino.js`
- Power-up collection in `Game.js`
- Bullet firing and hits in `Game.js`

#### Common Issues

**Module not found errors**:
- Check file paths use correct casing
- Verify `.js` extension included
- Use relative paths (`./` or `../`)

**Assets not loading**:
- Check browser Console for 404 errors
- Verify paths in `AssetManager.js`
- Check base path in `config.js`

**Game not starting**:
- Check for JavaScript errors in Console
- Verify `main.js` is loaded as module
- Check that canvas element exists

## Code Style

### Formatting
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings (unless apostrophe needed)
- Trailing commas in multi-line arrays/objects

### Naming
- Classes: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: prefix with `_` (convention only)

### Comments
- JSDoc for public methods
- Inline comments for complex logic
- File headers describing purpose

### Example:
```javascript
/**
 * Handle collision between two entities
 * @param {Object} entityA - First entity
 * @param {Object} entityB - Second entity
 * @returns {boolean} True if collision detected
 */
export function checkCollision(entityA, entityB) {
  // AABB collision detection
  return (
    entityA.x < entityB.x + entityB.width &&
    entityA.x + entityA.width > entityB.x &&
    entityA.y < entityB.y + entityB.height &&
    entityA.y + entityA.height > entityB.y
  );
}
```

## Git Workflow

### Branching
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature
```

### Commit Messages
Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `style`: Formatting
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat: add double jump mechanic
fix: correct collision detection on obstacles
refactor: separate rendering logic into Renderer class
docs: update README with new controls
```

## Deployment

### GitHub Pages
1. Push changes to `main` branch
2. GitHub Actions automatically deploys
3. Live in 1-2 minutes at `https://username.github.io/T-Mobble/`

### After Deployment
- Test all features on live site
- Check PWA installation works
- Verify offline mode functions
- Test on mobile devices

### Updating Service Worker
**Important**: Increment `CACHE_NAME` version when deploying:

```javascript
const CACHE_NAME = 'dino-game-v3'; // Increment this!
```

This ensures users get fresh assets on next visit.

## Performance Optimization

### Current Optimizations
- `requestAnimationFrame` for smooth 60fps
- Efficient array operations (reverse iteration for deletions)
- Minimal DOM manipulation
- Asset preloading

### Future Improvements
- Object pooling for bullets/obstacles
- Canvas layer separation (static vs dynamic)
- Sprite sheet usage
- Web Workers for complex calculations

## Resources

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## Getting Help

- Check existing GitHub Issues
- Review ARCHITECTURE.md for code structure
- Use browser DevTools Console for errors
- Test in different browsers

Happy coding! 🚀

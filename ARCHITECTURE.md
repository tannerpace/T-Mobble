# T-Mobble Project Structure

## 📁 Directory Organization

```
T-Mobble/
├── assets/                    # All game assets
│   ├── audio/                # Sound effects
│   │   ├── pop.m4a          # Jump sound
│   │   └── yumyum.m4a       # Power-up collection sound
│   ├── icons/               # PWA icons
│   │   ├── icon-192.png     # 192x192 icon
│   │   └── icon-512.png     # 512x512 icon
│   └── images/              # Game sprites
│       ├── trex.png         # T-Rex character
│       └── palm.png         # Obstacle sprite
│
├── public/                   # Public-facing files
│   ├── index.html           # Main HTML file
│   ├── style.css            # Styling
│   └── manifest.json        # PWA manifest
│
├── src/                     # Source code (ES6 modules)
│   ├── entities/            # Game entity classes
│   │   ├── Bullet.js        # Bullet projectile
│   │   ├── Cloud.js         # Background clouds
│   │   ├── Dino.js          # Player character
│   │   ├── Obstacle.js      # Palm tree obstacles
│   │   └── PowerUp.js       # Collectible power-ups
│   │
│   ├── game/                # Core game systems
│   │   ├── Game.js          # Main game orchestrator
│   │   ├── InputHandler.js  # Keyboard/touch controls
│   │   └── Renderer.js      # Canvas rendering
│   │
│   ├── utils/               # Utility modules
│   │   ├── AssetManager.js  # Asset loading and caching
│   │   ├── collision.js     # Collision detection utilities
│   │   └── ScoreManager.js  # Score tracking and persistence
│   │
│   └── main.js              # Application entry point
│
├── tools/                   # Development utilities
│   ├── crop-resize-raptor.html
│   ├── generate-icons.html
│   └── generate-icons.js
│
├── config.js                # Environment configuration
├── service-worker.js        # PWA service worker
├── package.json             # Project metadata
└── README.md                # Project documentation
```

## 🏗️ Architecture

### Module System
- **ES6 Modules**: All source code uses modern ES6 module syntax (`import`/`export`)
- **Separation of Concerns**: Each class has a single, well-defined responsibility
- **Dependency Injection**: Dependencies are passed to constructors for better testability

### Key Components

#### **Entities** (`src/entities/`)
Game objects that can be drawn and updated:
- Each entity has `draw()` and `update()` methods
- Self-contained collision detection where applicable
- Minimal dependencies on other systems

#### **Game Systems** (`src/game/`)
Core game logic and orchestration:
- **Game.js**: Main game loop, state management, entity spawning
- **Renderer.js**: All canvas drawing operations
- **InputHandler.js**: Event handling for keyboard, mouse, and touch

#### **Utilities** (`src/utils/`)
Reusable helper modules:
- **AssetManager**: Centralized asset loading
- **ScoreManager**: Score tracking with localStorage persistence
- **collision.js**: Pure functions for collision detection

### Data Flow

```
User Input → InputHandler → Game → Entities
                              ↓
                          Renderer → Canvas
```

## 🎮 Game Mechanics

### Entity Lifecycle
1. **Spawn**: Entities created based on frame count or random chance
2. **Update**: Position and state updated each frame
3. **Collision Check**: Detect interactions with other entities
4. **Draw**: Rendered to canvas
5. **Cleanup**: Removed when off-screen or destroyed

### State Management
- Game state stored in `Game` class
- Scores persisted via `ScoreManager` + localStorage
- No global state (except for DOM elements)

## 🚀 Performance Considerations

- **requestAnimationFrame**: Smooth 60fps game loop
- **Object Pooling**: Could be added for bullets/obstacles (future optimization)
- **Efficient Collision Detection**: AABB algorithm with early exits
- **Minimal DOM Manipulation**: Score updates only when changed

## 📝 Code Style Guide

### Naming Conventions
- **Classes**: PascalCase (`Game`, `Dino`, `AssetManager`)
- **Files**: PascalCase for classes, camelCase for utilities
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### Documentation
- JSDoc comments for all public methods
- Inline comments for complex logic
- File headers describing module purpose

### Best Practices
- Single Responsibility Principle
- Don't Repeat Yourself (DRY)
- Composition over inheritance
- Explicit is better than implicit

## 🔧 Development Workflow

1. **Local Development**: Open `public/index.html` in browser
2. **Testing**: Manual testing + browser DevTools
3. **Debugging**: Console logs strategically placed
4. **Asset Changes**: Update `AssetManager.js` and `service-worker.js`

## 📦 PWA Features

- **Offline Play**: Service worker caches all assets
- **Installable**: Can be added to home screen
- **Responsive**: Touch controls on mobile devices
- **Cross-platform**: Works on desktop and mobile

## 🔄 Adding New Features

### New Entity
1. Create class in `src/entities/` with `draw()` and `update()`
2. Import in `Game.js`
3. Add to appropriate game array
4. Update game loop to handle new entity

### New Asset
1. Add file to appropriate `assets/` subfolder
2. Register in `AssetManager.loadGameAssets()`
3. Add path to `service-worker.js` cache list

### New Game Mechanic
1. Add to `Game` class or create new system in `src/game/`
2. Update `Renderer` if visual changes needed
3. Wire up controls in `InputHandler` if interactive

## 🐛 Common Issues

### Module Loading Errors
- Ensure file paths use relative imports (`./` or `../`)
- Check that script tag has `type="module"`
- Verify file extensions are `.js`

### Asset Loading Failures
- Check base path configuration in `config.js`
- Verify paths in `AssetManager.js` match file structure
- Use browser DevTools Network tab to debug

### Service Worker Caching
- Update `CACHE_NAME` version when deploying changes
- Clear browser cache during development
- Check Application tab in DevTools

## 🎯 Future Improvements

- [ ] Add unit tests for core logic
- [ ] Implement object pooling for performance
- [ ] Add particle effects for collisions
- [ ] Progressive difficulty scaling
- [ ] Leaderboard system
- [ ] Multiple themes/skins
- [ ] Sound on/off toggle
- [ ] Mobile landscape orientation lock

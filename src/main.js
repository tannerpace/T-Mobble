/**
 * Main entry point for the game
 */
import { Game } from './game/Game.js';
import { AssetManager } from './utils/AssetManager.js';

// Get canvas element
const canvas = document.getElementById('gameCanvas');

// Base aspect ratio (4:1 for runner game)
const ASPECT_RATIO = 4;

// Debounce helper
let resizeTimeout;
function debounce(func, wait) {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(resizeTimeout);
      func(...args);
    };
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(later, wait);
  };
}

// Handle responsive canvas sizing
function resizeCanvas() {
  const isMobile = window.innerWidth < 768;
  const isSmallMobile = window.innerWidth < 400;

  // Account for padding and UI elements
  const horizontalPadding = isMobile ? 20 : 40;
  const verticalSpace = isMobile ? 250 : 300;

  const maxWidth = window.innerWidth - horizontalPadding;
  const maxHeight = window.innerHeight - verticalSpace;

  // Calculate optimal dimensions based on viewport
  let canvasWidth = Math.min(maxWidth, 1400); // Max width 1400px
  let canvasHeight = canvasWidth / ASPECT_RATIO;

  // Ensure height doesn't exceed available space
  if (canvasHeight > maxHeight) {
    canvasHeight = maxHeight;
    canvasWidth = canvasHeight * ASPECT_RATIO;
  }

  // Responsive minimum dimensions
  let minWidth;
  if (isSmallMobile) {
    minWidth = 280; // Very small phones (320px screens)
  } else if (isMobile) {
    minWidth = 350; // Standard mobile
  } else {
    minWidth = 600; // Desktop
  }

  canvasWidth = Math.max(canvasWidth, minWidth);
  canvasHeight = canvasWidth / ASPECT_RATIO;

  // Set internal canvas dimensions (for rendering)
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set display size
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';

  console.log('Canvas resized - Width:', canvasWidth, 'Height:', canvasHeight, 'Mobile:', isMobile);
}

// Wait for DOM to be ready before initial resize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', resizeCanvas);
} else {
  resizeCanvas();
}

// Also resize after a short delay to ensure layout is complete
setTimeout(resizeCanvas, 100);

// Resize on window resize (debounced for performance)
window.addEventListener('resize', debounce(resizeCanvas, 150));

// Determine base path for assets
const basePath = window.ENV_CONFIG ? window.ENV_CONFIG.getBasePath() : '';
const assetBasePath = basePath ? basePath + '/' : '';

console.log('Game initialized with base path:', assetBasePath);

// Initialize asset manager and load assets
const assetManager = new AssetManager(assetBasePath);
const assets = assetManager.loadGameAssets();

// Create and start game
const game = new Game(canvas, assets);

// Configure global leaderboard
game.scoreManager.setLeaderboardApi('https://t-mobble-leaderboard.tannerpace.workers.dev');

game.start();


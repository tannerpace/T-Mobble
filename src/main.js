/**
 * Main entry point for the game
 */
import { Game } from './game/Game.js';
import { AssetManager } from './utils/AssetManager.js';
import { debounce } from './utils/helpers.js';

// Get canvas element
const canvas = document.getElementById('gameCanvas');

// Aspect ratio options based on screen
const WIDE_ASPECT = 3.5;  // Wider for desktop
const MOBILE_ASPECT = 3;  // Slightly taller for mobile

// Handle responsive canvas sizing - fills more screen
function resizeCanvas() {
  const isMobile = window.innerWidth < 768;
  const isLandscape = window.innerWidth > window.innerHeight;
  const isTouchDevice = 'ontouchstart' in window;

  // Use dynamic viewport height for mobile (accounts for browser chrome)
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Calculate available space (accounting for UI elements)
  let topPadding = 90;  // Space for health, XP bar, score
  let bottomPadding = isTouchDevice ? 120 : 60; // More space for mobile button

  if (isLandscape && isMobile) {
    topPadding = 70;
    bottomPadding = 80;
  }

  const availableHeight = viewportHeight - topPadding - bottomPadding;
  const availableWidth = viewportWidth - 20; // 10px padding each side

  // Choose aspect ratio based on device
  const aspectRatio = isMobile ? MOBILE_ASPECT : WIDE_ASPECT;

  // Calculate optimal dimensions to fill available space
  let canvasWidth, canvasHeight;

  // Try fitting by width first
  canvasWidth = availableWidth;
  canvasHeight = canvasWidth / aspectRatio;

  // If too tall, fit by height instead
  if (canvasHeight > availableHeight) {
    canvasHeight = availableHeight;
    canvasWidth = canvasHeight * aspectRatio;
  }

  // Maximum dimensions for very large screens
  const maxWidth = 1600;
  const maxHeight = 500;

  if (canvasWidth > maxWidth) {
    canvasWidth = maxWidth;
    canvasHeight = canvasWidth / aspectRatio;
  }
  if (canvasHeight > maxHeight) {
    canvasHeight = maxHeight;
    canvasWidth = canvasHeight * aspectRatio;
  }

  // Minimum dimensions for playability
  const minWidth = isMobile ? 300 : 500;
  const minHeight = 100;

  canvasWidth = Math.max(canvasWidth, minWidth);
  canvasHeight = Math.max(canvasHeight, minHeight);

  // Round to avoid blurry rendering
  canvasWidth = Math.floor(canvasWidth);
  canvasHeight = Math.floor(canvasHeight);

  // Set internal canvas dimensions (for rendering)
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set display size
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';

  console.log(`Canvas: ${canvasWidth}x${canvasHeight} | Viewport: ${viewportWidth}x${viewportHeight} | Mobile: ${isMobile}`);
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


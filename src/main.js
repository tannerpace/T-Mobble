/**
 * Main entry point for the game
 */
import { Game } from './game/Game.js';
import { AssetManager } from './utils/AssetManager.js';

// Get canvas element
const canvas = document.getElementById('gameCanvas');

// Base aspect ratio (4:1 for runner game)
const ASPECT_RATIO = 4;

// Handle responsive canvas sizing
function resizeCanvas() {
  const container = canvas.parentElement;
  const maxWidth = window.innerWidth - 40; // Account for padding
  const maxHeight = window.innerHeight - 300; // Account for UI elements

  // Calculate optimal dimensions based on viewport
  let canvasWidth = Math.min(maxWidth, 1400); // Max width 1400px
  let canvasHeight = canvasWidth / ASPECT_RATIO;

  // Ensure height doesn't exceed available space
  if (canvasHeight > maxHeight) {
    canvasHeight = maxHeight;
    canvasWidth = canvasHeight * ASPECT_RATIO;
  }

  // Minimum dimensions
  canvasWidth = Math.max(canvasWidth, 600);
  canvasHeight = canvasWidth / ASPECT_RATIO;

  // Set internal canvas dimensions (for rendering)
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set display size
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';

  console.log('Canvas resized - Width:', canvasWidth, 'Height:', canvasHeight);
}

// Wait for DOM to be ready before initial resize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', resizeCanvas);
} else {
  resizeCanvas();
}

// Also resize after a short delay to ensure layout is complete
setTimeout(resizeCanvas, 100);

// Resize on window resize
window.addEventListener('resize', resizeCanvas);

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


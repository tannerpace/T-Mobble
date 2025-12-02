/**
 * Main entry point for the game
 */
import { Game } from './game/Game';
import { AssetManager } from './utils/AssetManager';
import { debounce } from './utils/helpers';

// Get canvas element
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

// Aspect ratio options based on screen
const WIDE_ASPECT = 3.5;  // Wider for desktop
const MOBILE_ASPECT = 3;  // Slightly taller for mobile

// Handle responsive canvas sizing - fills more screen
function resizeCanvas(): void {
  const isMobile = window.innerWidth < 768;
  const isLandscape = window.innerWidth > window.innerHeight;
  const isTouchDevice = 'ontouchstart' in window;
  const isMobileLandscape = isLandscape && (isTouchDevice || window.innerHeight < 500);

  // Use dynamic viewport height for mobile (accounts for browser chrome)
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Calculate available space (accounting for UI elements)
  let topPadding: number;
  let bottomPadding: number;

  if (isMobileLandscape) {
    // Landscape mobile - minimize UI space, button floats over canvas
    topPadding = 50;
    bottomPadding = 10;
  } else if (isTouchDevice) {
    // Portrait mobile - need space for jump button
    topPadding = 75;
    bottomPadding = 100;
  } else {
    // Desktop
    topPadding = 90;
    bottomPadding = 60;
  }

  const availableHeight = viewportHeight - topPadding - bottomPadding;
  const availableWidth = viewportWidth - 10; // Minimal horizontal padding

  // Choose aspect ratio - wider in landscape for more play area
  let aspectRatio: number;
  if (isMobileLandscape) {
    aspectRatio = 4; // Wide for landscape
  } else if (isMobile) {
    aspectRatio = 3; // Taller for portrait
  } else {
    aspectRatio = 3.5; // Desktop
  }

  // Calculate optimal dimensions to fill available space
  let canvasWidth: number;
  let canvasHeight: number;

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
  const maxHeight = isMobileLandscape ? 350 : 500;

  if (canvasWidth > maxWidth) {
    canvasWidth = maxWidth;
    canvasHeight = canvasWidth / aspectRatio;
  }
  if (canvasHeight > maxHeight) {
    canvasHeight = maxHeight;
    canvasWidth = canvasHeight * aspectRatio;
  }

  // Minimum dimensions for playability
  const minWidth = isMobileLandscape ? 400 : (isMobile ? 300 : 500);
  const minHeight = isMobileLandscape ? 100 : 120;

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

  console.log(`Canvas: ${canvasWidth}x${canvasHeight} | Viewport: ${viewportWidth}x${viewportHeight} | Landscape: ${isMobileLandscape}`);
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

/**
 * Main entry point for the game
 */
import { Game } from './game/Game.js';
import { AssetManager } from './utils/AssetManager.js';

// Get canvas element
const canvas = document.getElementById('gameCanvas');

// Set internal canvas dimensions (for rendering)
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Handle responsive canvas sizing
function resizeCanvas() {
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth;

  // Calculate the scale to fit within container while maintaining aspect ratio
  const scale = Math.min(1, containerWidth / GAME_WIDTH);

  // Set display size (CSS pixels) while maintaining internal resolution
  canvas.style.width = (GAME_WIDTH * scale) + 'px';
  canvas.style.height = (GAME_HEIGHT * scale) + 'px';
}

// Initial resize
resizeCanvas();

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
game.start();


/**
 * Main entry point for the game
 */
import { Game } from './game/Game.js';
import { AssetManager } from './utils/AssetManager.js';

// Get canvas element
const canvas = document.getElementById('gameCanvas');

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

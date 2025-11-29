#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SERVICE_WORKER_PATH = path.join(__dirname, 'service-worker.js');

console.log('🔧 Updating cache version...');

// Read service worker file
let content = fs.readFileSync(SERVICE_WORKER_PATH, 'utf8');

// Extract current version
const match = content.match(/const CACHE_NAME = 'dino-game-v(\d+)'/);
if (match) {
  const currentVersion = parseInt(match[1]);
  const newVersion = currentVersion + 1;

  // Update version
  content = content.replace(
    /const CACHE_NAME = 'dino-game-v\d+'/,
    `const CACHE_NAME = 'dino-game-v${newVersion}'`
  );

  fs.writeFileSync(SERVICE_WORKER_PATH, content, 'utf8');
  console.log(`✅ Cache version updated: v${currentVersion} → v${newVersion}`);
} else {
  console.log('⚠️  Could not find cache version, skipping update');
}

console.log('🚀 Starting development server on http://localhost:3000');
console.log('📱 Access game at: http://localhost:3000/public/\n');

// Start server
const server = spawn('npx', ['serve', '--listen', '3000'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.kill();
  process.exit(0);
});

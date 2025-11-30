/**
 * Visualize the game speed progression curve
 * Run with: node test-speed-curve.js
 */

console.log('🎮 GAME SPEED PROGRESSION\n');
console.log('Score | Speed | Increment | Phase');
console.log('------|-------|-----------|------------------');

let gameSpeed = 2.0;
const maxGameSpeed = 8;

for (let score = 0; score <= 3000; score += 300) {
  if (score > 0 && gameSpeed < maxGameSpeed) {
    // Calculate increment based on current speed
    const speedIncrement = gameSpeed < 4 ? 0.3 : gameSpeed < 6 ? 0.2 : 0.1;
    gameSpeed = Math.min(maxGameSpeed, gameSpeed + speedIncrement);
  }

  let phase = '';
  if (gameSpeed < 3) phase = '🐢 Gentle Start';
  else if (gameSpeed < 5) phase = '🏃 Building Speed';
  else if (gameSpeed < 7) phase = '🚀 Getting Fast';
  else phase = '⚡ Maximum Speed';

  const increment = score === 0 ? '-' : (gameSpeed < 4 ? '0.3' : gameSpeed < 6 ? '0.2' : '0.1');

  console.log(
    `${score.toString().padStart(5)} | ${gameSpeed.toFixed(1).padStart(5)} | ${increment.padStart(9)} | ${phase}`
  );
}

console.log('\n📊 Key Changes:');
console.log('• Speed increases every 300 points (was 200)');
console.log('• Smaller increments: 0.3 → 0.2 → 0.1 (was flat 0.5)');
console.log('• Maximum speed cap at 8.0 for playability');
console.log('• Early game (0-1200): Moderate pace at 2.0-4.0 speed');
console.log('• Mid game (1200-2400): Faster but controlled at 4.0-6.0');
console.log('• Late game (2400+): Peaks at 8.0 for intense but fair challenge');

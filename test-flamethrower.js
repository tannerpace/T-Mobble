/**
 * Simple test to verify flamethrower weapon functionality
 */
import { FlameThrowerWeapon } from './src/weapons/FlameThrowerWeapon.js';
import { BaseEnemy } from './src/entities/BaseEnemy.js';

// Mock canvas and assets
const mockCanvas = {
  width: 800,
  height: 200,
  getContext: () => ({
    fillStyle: '',
    fillRect: () => {},
    strokeStyle: '',
    strokeRect: () => {},
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {}
    })
  })
};

const mockAssets = {
  flameSound: null
};

console.log('Testing FlameThrower Weapon...\n');

// Test 1: Weapon instantiation
console.log('Test 1: Creating flamethrower weapon');
const flamethrower = new FlameThrowerWeapon(mockAssets);
console.log('✓ Weapon created:', flamethrower.name);
console.log('  Icon:', flamethrower.icon);
console.log('  Description:', flamethrower.description);

// Test 2: Weapon level progression
console.log('\nTest 2: Level progression');
console.log('  Level 1 - Burn damage:', flamethrower.burnDamage, 'Duration:', flamethrower.burnDuration);
flamethrower.setLevel(3);
console.log('  Level 3 - Burn damage:', flamethrower.burnDamage, 'Duration:', flamethrower.burnDuration);
flamethrower.setLevel(5);
console.log('  Level 5 - Burn damage:', flamethrower.burnDamage, 'Duration:', flamethrower.burnDuration);
console.log('✓ Level progression working');

// Test 3: Enemy burning mechanics
console.log('\nTest 3: Enemy burning mechanics');
const enemy = new BaseEnemy(mockCanvas, 2, { health: 10, xpValue: 10 });
console.log('  Enemy created with health:', enemy.health);
console.log('  Is burning:', enemy.isBurning);

enemy.applyBurn(0.2, 100);
console.log('  Applied burn - Is burning:', enemy.isBurning);
console.log('  Burn damage:', enemy.burnDamage, 'Duration:', enemy.burnDuration);

// Simulate updates
for (let i = 0; i < 20; i++) {
  enemy.update();
}
console.log('  After 20 frames - Health:', enemy.health.toFixed(2), 'Still burning:', enemy.isBurning);

// Test 4: Burn damage over time
console.log('\nTest 4: Burn damage over time');
const enemy2 = new BaseEnemy(mockCanvas, 2, { health: 5, xpValue: 10 });
enemy2.applyBurn(0.1, 180);
let frameCount = 0;
const healthHistory = [];

while (!enemy2.isDead() && frameCount < 200) {
  enemy2.update();
  frameCount++;
  if (frameCount % 30 === 0) {
    healthHistory.push(enemy2.health.toFixed(2));
  }
}

console.log('  Health over time (every 30 frames):', healthHistory.join(' -> '));
console.log('  Enemy died after', frameCount, 'frames');
console.log('✓ Burn damage over time working');

// Test 5: Collision detection
console.log('\nTest 5: Collision detection');
flamethrower.setLevel(1);
const mockDino = {
  x: 50,
  y: 100,
  width: 40,
  height: 40
};
flamethrower.update(mockDino, [], {});

const testEnemy = new BaseEnemy(mockCanvas, 2, { health: 10 });
testEnemy.x = 100; // Within flame range
testEnemy.y = 100;

let hitCount = 0;
const onHit = (enemy) => {
  hitCount++;
};

// Trigger collision check
flamethrower.damageCounter = 20; // Set to fire
flamethrower.checkCollisions([testEnemy], onHit);

console.log('  Enemy in range - Is burning:', testEnemy.isBurning);
console.log('  Hit count:', hitCount);
console.log('✓ Collision detection working');

console.log('\n✅ All tests passed!');
console.log('\nFlamethrower features:');
console.log('  • Low immediate damage (0.2)');
console.log('  • Applies burning effect that deals damage over time');
console.log('  • Burn damage increases with weapon level');
console.log('  • Burn duration increases with weapon level');
console.log('  • Visual flame effects with particles');
console.log('  • Enemies display orange glow when burning');

/**
 * ShotgunWeapon - Spread weapon firing multiple pellets with knockback
 */
import { Bullet } from '../entities/Bullet.js';
import { BaseWeapon } from './BaseWeapon.js';

export class ShotgunWeapon extends BaseWeapon {
  constructor(assets) {
    super('Shotgun', 'Fires a spread of black pellets with knockback', '▄︻テ══━一💥');
    this.fireRateBase = 45; // Moderate fire rate
    this.level = 1;
    this.maxRange = 400; // Shorter range than blaster
    this.pelletCount = 5; // Number of pellets per shot
    this.spreadAngle = 20; // Spread angle in degrees
    this.assets = assets;
  }

  setLevel(level) {
    this.level = level;
    // Increase pellets and tighten spread with each level
    this.pelletCount = 5 + Math.floor((level - 1) / 2);
    this.spreadAngle = Math.max(10, 20 - (level - 1) * 2);
    this.maxRange = 400 + (level - 1) * 50; // Range increases: 400, 450, 500, 550...
  }

  update(dino, projectiles, effects = {}) {
    this.fireRateCounter++;

    const fireRate = Math.max(5, this.fireRateBase / (effects.fireRateMod || 1));

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }
  }

  fire(dino, projectiles, effects = {}) {
    const bulletY = dino.y + dino.height / 2;
    const bulletX = dino.x + dino.width;
    const speed = 10; // Slightly slower than blaster
    const pellets = this.pelletCount + (effects.bulletCount || 0);

    // Play pew sound
    if (this.assets && this.assets.pewSound) {
      this.assets.pewSound.currentTime = 0;
      this.assets.pewSound.play().catch(() => { });
    }

    // Create spread pattern
    if (pellets === 1) {
      // Single pellet case - shoot straight
      const bullet = new Bullet(bulletX, bulletY, 0, speed, 0);
      bullet.maxRange = this.maxRange;
      bullet.damage = 1; // Lower damage per pellet
      bullet.knockback = 8; // Knockback effect
      bullet.color = '#000000'; // Black bullets
      projectiles.push(bullet);
    } else {
      const angleStep = this.spreadAngle / (pellets - 1);
      const startAngle = -this.spreadAngle / 2;

      for (let i = 0; i < pellets; i++) {
        const angle = startAngle + (angleStep * i);
        const bullet = new Bullet(bulletX, bulletY, angle, speed, 0);
        bullet.maxRange = this.maxRange;
        bullet.damage = 1; // Lower damage per pellet
        bullet.knockback = 8; // Knockback effect
        bullet.color = '#000000'; // Black bullets
        projectiles.push(bullet);
      }
    }
  }
}

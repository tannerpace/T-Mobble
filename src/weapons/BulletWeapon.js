/**
 * BulletWeapon - Standard projectile weapon with upgradeable range
 */
import { Bullet } from '../entities/Bullet.js';
import { BaseWeapon } from './BaseWeapon.js';

export class BulletWeapon extends BaseWeapon {
  constructor() {
    super('Blaster', 'Fires bullets that pierce enemies', '🔫');
    this.fireRateBase = 30;
    this.level = 1;
    this.maxRange = 300; // Base range
  }

  setLevel(level) {
    this.level = level;
    // Increase range with each level: 300, 360, 420, 480, then add pierce
    this.maxRange = 300 + (Math.min(level - 1, 3) * 60);
  }

  update(dino, projectiles, effects) {
    this.fireRateCounter++;

    const fireRate = Math.max(5, this.fireRateBase / (effects.fireRateMod || 1));

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }
  }

  fire(dino, projectiles, effects) {
    const bulletY = dino.y + dino.height / 2;
    const bulletX = dino.x + dino.width;
    const count = effects.bulletCount || 1;
    const spreadAngle = effects.spreadAngle || 0;
    const speed = 8 * (effects.bulletSpeedMod || 1);
    // Add pierce at level 5+
    const pierce = this.level >= 5 ? (this.level - 4) : (effects.pierceCount || 0);

    if (count === 1) {
      const bullet = new Bullet(bulletX, bulletY, 0, speed, pierce);
      bullet.maxRange = this.maxRange;
      projectiles.push(bullet);
    } else {
      const angleStep = spreadAngle / (count - 1);
      const startAngle = -spreadAngle / 2;

      for (let i = 0; i < count; i++) {
        const angle = startAngle + (angleStep * i);
        const bullet = new Bullet(bulletX, bulletY, angle, speed, pierce);
        bullet.maxRange = this.maxRange;
        projectiles.push(bullet);
      }
    }
  }
}

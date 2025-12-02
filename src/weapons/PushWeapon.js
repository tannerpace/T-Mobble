/**
 * PushWeapon - Non-damaging weapon that pushes enemies away
 */
import { PushBullet } from '../entities/PushBullet.js';
import { BaseWeapon } from './BaseWeapon.js';

export class PushWeapon extends BaseWeapon {
  constructor(assets) {
    super('Push Gun', 'Fires knockback rounds that push enemies back', '💨');
    this.fireRateBase = 20; // Faster fire rate than regular bullets
    this.level = 1;
    this.maxRange = 400; // Good range
    this.knockbackForce = 30; // Base knockback force
    this.assets = assets;
  }

  setLevel(level) {
    this.level = level;
    // Increase knockback force and range with each level
    this.knockbackForce = 30 + (level - 1) * 10; // 30, 40, 50, 60...
    this.maxRange = 400 + (level - 1) * 50; // 400, 450, 500, 550...
  }

  update(dino, projectiles, effects = {}) {
    this.fireRateCounter++;

    const fireRate = Math.max(10, this.fireRateBase / (effects.fireRateMod || 1));

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }
  }

  fire(dino, projectiles, effects = {}) {
    const bulletY = dino.y + dino.height / 2;
    const bulletX = dino.x + dino.width;
    const count = effects.bulletCount || 1;
    const spreadAngle = effects.spreadAngle || 0;
    const speed = 10 * (effects.bulletSpeedMod || 1);

    // Play push sound (use pew sound for now, or add new sound)
    if (this.assets && this.assets.pewSound) {
      this.assets.pewSound.currentTime = 0;
      this.assets.pewSound.volume = 0.3; // Quieter than damage bullets
      this.assets.pewSound.play().catch(() => { });
    }

    if (count === 1) {
      const bullet = new PushBullet(bulletX, bulletY, 0, speed, this.knockbackForce);
      bullet.maxRange = this.maxRange;
      projectiles.push(bullet);
    } else {
      const angleStep = spreadAngle / (count - 1);
      const startAngle = -spreadAngle / 2;

      for (let i = 0; i < count; i++) {
        const angle = startAngle + (angleStep * i);
        const bullet = new PushBullet(bulletX, bulletY, angle, speed, this.knockbackForce);
        bullet.maxRange = this.maxRange;
        projectiles.push(bullet);
      }
    }
  }
}

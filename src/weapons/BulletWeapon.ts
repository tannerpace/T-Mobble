/**
 * BulletWeapon - Standard projectile weapon with upgradeable range
 */
import { Bullet } from '../entities/Bullet';
import type { GameAssets, IDino } from '../types';
import { BaseWeapon, ProjectileArray, WeaponEffects } from './BaseWeapon';

export class BulletWeapon extends BaseWeapon {
  private maxRange: number;
  private assets: GameAssets | null;

  constructor(assets: GameAssets | null) {
    super('Blaster', 'Fires powerful bullets with knockback', '🔫');
    this.fireRateBase = 60; // Slower fire rate (was 30)
    this.level = 1;
    this.maxRange = 800; // Much longer range (was 500)
    this.assets = assets;
  }

  setLevel(level: number): void {
    this.level = level;
    // Increase range with each level: 800, 950, 1100, 1250, then add pierce
    this.maxRange = 800 + (Math.min(level - 1, 3) * 150);
  }

  update(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects = {}): void {
    this.fireRateCounter++;

    const fireRate = Math.max(5, this.fireRateBase / (effects.fireRateMod || 1));

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }
  }

  fire(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects = {}): void {
    const bulletY = dino.y + dino.height / 2;
    const bulletX = dino.x + dino.width;
    const count = effects.bulletCount || 1;
    const spreadAngle = effects.spreadAngle || 0;
    const speed = 12 * (effects.bulletSpeedMod || 1); // Faster bullets (was 8)
    // Add pierce at level 5+
    const pierce = this.level >= 5 ? (this.level - 4) : (effects.pierceCount || 0);

    // Play pew sound
    if (this.assets && this.assets.pewSound) {
      this.assets.pewSound.currentTime = 0;
      this.assets.pewSound.play().catch(() => { });
    }

    if (count === 1) {
      const bullet = new Bullet(bulletX, bulletY, 0, speed, pierce);
      bullet.maxRange = this.maxRange;
      bullet.damage = 2; // Increased damage (was 1)
      bullet.knockback = 15; // Add knockback effect
      projectiles.push(bullet);
    } else {
      const angleStep = spreadAngle / (count - 1);
      const startAngle = -spreadAngle / 2;

      for (let i = 0; i < count; i++) {
        const angle = startAngle + (angleStep * i);
        const bullet = new Bullet(bulletX, bulletY, angle, speed, pierce);
        bullet.maxRange = this.maxRange;
        bullet.damage = 2; // Increased damage
        bullet.knockback = 15; // Add knockback effect
        projectiles.push(bullet);
      }
    }
  }
}

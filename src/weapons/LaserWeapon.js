/**
 * LaserWeapon - Continuous beam weapon
 */
import { BaseWeapon } from './BaseWeapon.js';

export class LaserWeapon extends BaseWeapon {
  constructor() {
    super('Laser Beam', 'Continuous beam that damages all enemies in path', '⚡');
    this.fireRateBase = 5; // Always firing
    this.beamActive = false;
    this.beamWidth = 8;
    this.beamLength = 300;
  }

  update(dino, projectiles, effects) {
    // Laser is always active
    this.beamActive = true;
    this.beamX = dino.x + dino.width;
    this.beamY = dino.y + dino.height / 2;
    this.beamLength = 300 * (effects.bulletSpeedMod || 1);
    this.beamWidth = 8 + (effects.bulletCount || 1) * 2;
  }

  /**
   * Draw laser beam
   */
  draw(ctx, frameCount) {
    if (!this.beamActive) return;

    ctx.save();

    // Outer glow
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 15;

    // Beam gradient
    const gradient = ctx.createLinearGradient(
      this.beamX, this.beamY,
      this.beamX + this.beamLength, this.beamY
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 150, 255, 0.2)');

    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.beamX,
      this.beamY - this.beamWidth / 2,
      this.beamLength,
      this.beamWidth
    );

    // Core beam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      this.beamX,
      this.beamY - this.beamWidth / 4,
      this.beamLength,
      this.beamWidth / 2
    );

    // Pulsing effect
    const pulse = Math.sin(frameCount / 5) * 2;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(
      this.beamX,
      this.beamY - (this.beamWidth / 4 + pulse),
      this.beamLength,
      this.beamWidth / 2 + pulse * 2
    );

    ctx.restore();
  }

  /**
   * Check laser collision with enemies
   */
  checkCollisions(enemies, onHit) {
    if (!this.beamActive) return;

    enemies.forEach(enemy => {
      // Check if enemy is in beam path
      if (enemy.x < this.beamX + this.beamLength &&
        enemy.x + enemy.width > this.beamX &&
        enemy.y < this.beamY + this.beamWidth / 2 &&
        enemy.y + enemy.height > this.beamY - this.beamWidth / 2) {
        onHit(enemy);
      }
    });
  }

  reset() {
    super.reset();
    this.beamActive = false;
  }
}

/**
 * WhipWeapon - Melee weapon that creates an arc in front of player
 */
import { BaseWeapon } from './BaseWeapon.js';

export class WhipWeapon extends BaseWeapon {
  constructor() {
    super('Whip', 'Close-range arc attack, hits multiple enemies', '🪢');
    this.fireRateBase = 25; // Faster than bullets
    this.whipAnimations = [];
  }

  update(dino, projectiles, effects) {
    this.fireRateCounter++;

    const fireRate = Math.max(5, this.fireRateBase / effects.fireRateMod);

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }

    // Update active whip animations
    for (let i = this.whipAnimations.length - 1; i >= 0; i--) {
      const whip = this.whipAnimations[i];
      whip.frame++;
      if (whip.frame >= whip.duration) {
        this.whipAnimations.splice(i, 1);
      }
    }
  }

  fire(dino, projectiles, effects) {
    // Create whip arc animation
    const whipArc = {
      x: dino.x + dino.width,
      y: dino.y + dino.height / 2,
      radius: 60 * (effects.bulletSpeedMod || 1),
      width: 15,
      damage: 1,
      pierce: effects.pierceCount || 99, // Whip hits all in range
      frame: 0,
      duration: 10,
      hitEnemies: new Set() // Track which enemies were hit
    };
    this.whipAnimations.push(whipArc);
  }

  /**
   * Draw whip animations
   */
  draw(ctx) {
    this.whipAnimations.forEach(whip => {
      const progress = whip.frame / whip.duration;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Draw arc
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = whip.width;
      ctx.lineCap = 'round';
      ctx.beginPath();

      // Arc from top to bottom
      const startAngle = -Math.PI / 3;
      const endAngle = Math.PI / 3;
      const currentAngle = startAngle + (endAngle - startAngle) * progress;

      ctx.arc(whip.x, whip.y, whip.radius, startAngle, currentAngle);
      ctx.stroke();

      // Draw tip effect
      const tipX = whip.x + Math.cos(currentAngle) * whip.radius;
      const tipY = whip.y + Math.sin(currentAngle) * whip.radius;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  /**
   * Check whip collision with enemies
   */
  checkCollisions(enemies, onHit) {
    this.whipAnimations.forEach(whip => {
      enemies.forEach(enemy => {
        // Skip if already hit by this whip
        if (whip.hitEnemies.has(enemy)) return;

        const dx = enemy.x + enemy.width / 2 - whip.x;
        const dy = enemy.y + enemy.height / 2 - whip.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= whip.radius + enemy.width / 2) {
          whip.hitEnemies.add(enemy);
          onHit(enemy);
        }
      });
    });
  }

  reset() {
    super.reset();
    this.whipAnimations = [];
  }
}

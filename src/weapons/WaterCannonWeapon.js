/**
 * WaterCannonWeapon - Air/water blast weapon with knockback and splash
 */
import { BaseWeapon } from './BaseWeapon.js';

export class WaterCannonWeapon extends BaseWeapon {
  constructor(assets) {
    super('Water Cannon', 'Fires pressurized water bursts with knockback', '💦');
    this.fireRateBase = 45; // Medium fire rate
    this.level = 1;
    this.maxRange = 400;
    this.splashRadius = 40;
    this.assets = assets;
    this.blasts = []; // Active water blasts
    this.particleLife = 30; // Frames particles last
  }

  setLevel(level) {
    this.level = level;
    // Increase range and splash with level
    this.maxRange = 400 + (level - 1) * 50; // 400 -> 600
    this.splashRadius = 40 + (level - 1) * 8; // 40 -> 72
    // Faster fire rate at higher levels
    this.fireRateBase = Math.max(25, 45 - (level - 1) * 4); // 45 -> 29
  }

  update(dino, projectiles, effects = {}) {
    this.fireRateCounter++;

    const fireRate = Math.max(5, this.fireRateBase / (effects.fireRateMod || 1));

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }

    // Update active blasts
    this.blasts = this.blasts.filter(blast => {
      blast.x += blast.speed;
      blast.distance += blast.speed;
      blast.life++;

      // Remove if exceeded range or life
      return blast.distance < this.maxRange && blast.life < this.particleLife;
    });
  }

  fire(dino, projectiles, effects = {}) {
    const blastY = dino.y + dino.height / 2;
    const blastX = dino.x + dino.width;
    const speed = 10; // Medium speed
    const damage = 0.8 + (this.level - 1) * 0.15; // 0.8 -> 1.4
    const knockback = 25 + (this.level - 1) * 5; // 25 -> 45

    // Create water blast
    const blast = {
      x: blastX,
      y: blastY,
      speed: speed,
      damage: damage,
      knockback: knockback,
      splashRadius: this.splashRadius,
      distance: 0,
      life: 0,
      hasHit: new Set() // Track which enemies were hit
    };

    this.blasts.push(blast);

    // Play water blast sound (use existing sound or fallback)
    if (this.assets && this.assets.pewSound) {
      const sound = this.assets.pewSound.cloneNode();
      sound.playbackRate = 0.7; // Lower pitch for water effect
      sound.volume = 0.4;
      sound.currentTime = 0;
      sound.play().catch(() => { });
    }
  }

  /**
   * Draw water blasts with particle effects
   */
  draw(ctx, frameCount) {
    this.blasts.forEach(blast => {
      ctx.save();

      // Calculate size based on lifetime (expand then fade)
      const progress = blast.life / this.particleLife;
      const baseSize = 20 + (this.level - 1) * 3;
      const size = baseSize * (1 + progress * 0.5);
      const opacity = 1 - progress;

      // Outer splash effect
      ctx.globalAlpha = opacity * 0.3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(0, 150, 255, 0.5)';

      const outerGradient = ctx.createRadialGradient(
        blast.x, blast.y, 0,
        blast.x, blast.y, size * 1.5
      );
      outerGradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
      outerGradient.addColorStop(0.5, 'rgba(50, 150, 255, 0.3)');
      outerGradient.addColorStop(1, 'rgba(0, 100, 200, 0)');

      ctx.fillStyle = outerGradient;
      ctx.beginPath();
      ctx.arc(blast.x, blast.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Core water droplet
      ctx.globalAlpha = opacity * 0.7;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

      const coreGradient = ctx.createRadialGradient(
        blast.x - size * 0.2, blast.y - size * 0.2, 0,
        blast.x, blast.y, size
      );
      coreGradient.addColorStop(0, 'rgba(200, 240, 255, 0.9)');
      coreGradient.addColorStop(0.6, 'rgba(100, 180, 255, 0.7)');
      coreGradient.addColorStop(1, 'rgba(50, 120, 200, 0.3)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(blast.x, blast.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Add some particle spray effects
      ctx.globalAlpha = opacity * 0.5;
      for (let i = 0; i < 3; i++) {
        const angle = (frameCount * 0.1 + i * Math.PI * 2 / 3);
        const dist = size * 0.8;
        const px = blast.x + Math.cos(angle) * dist;
        const py = blast.y + Math.sin(angle) * dist;

        ctx.fillStyle = 'rgba(150, 210, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  /**
   * Check water blast collisions with splash damage
   */
  checkCollisions(enemies, onHit) {
    this.blasts.forEach(blast => {
      enemies.forEach(enemy => {
        // Skip if already hit by this blast
        if (blast.hasHit.has(enemy)) return;

        // Calculate distance from blast center to enemy center
        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;
        const dx = enemyCenterX - blast.x;
        const dy = enemyCenterY - blast.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if within splash radius
        if (distance < blast.splashRadius + enemy.width / 2) {
          // Mark as hit
          blast.hasHit.add(enemy);

          // Apply damage with falloff based on distance
          const distanceFactor = 1 - (distance / (blast.splashRadius + enemy.width / 2));
          const actualDamage = blast.damage * (0.5 + distanceFactor * 0.5);

          // Create custom hit event with knockback and slow effect
          onHit(enemy, {
            damage: actualDamage,
            knockback: blast.knockback * distanceFactor,
            applySlow: true,
            slowDuration: 60 + (this.level - 1) * 20, // 60 -> 140 frames
            slowAmount: 0.3 // 30% slow
          });
        }
      });
    });
  }

  reset() {
    super.reset();
    this.blasts = [];
  }
}

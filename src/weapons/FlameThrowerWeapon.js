/**
 * FlameThrowerWeapon - Continuous flame stream that applies burning damage over time
 */
import { BaseWeapon } from './BaseWeapon.js';

export class FlameThrowerWeapon extends BaseWeapon {
  constructor(assets) {
    super('Flame Thrower', 'Continuous flame stream, enemies continue to burn', '🔥');
    this.fireRateBase = 5; // Always firing
    this.flameActive = false;
    this.flameWidth = 15;
    this.flameLength = 250;
    this.level = 1;
    this.damageCounter = 0;
    this.damageInterval = 20; // Apply burn every 20 frames
    this.immediateDamage = 0.2; // Low immediate damage on hit
    this.burnDamage = 0.1; // Burn damage per tick
    this.burnDuration = 180; // 3 seconds at 60fps
    this.assets = assets;
    this.soundPlaying = false;
    this.flameParticles = [];
  }

  setLevel(level) {
    this.level = level;
    // Increase width, length and burn damage with level
    this.flameWidth = 15 + (level - 1) * 3;
    this.flameLength = 250 + (level - 1) * 20;
    this.burnDamage = 0.1 + (level - 1) * 0.05; // Increase burn damage
    this.burnDuration = 180 + (level - 1) * 30; // Longer burn duration
    // Faster application at higher levels
    this.damageInterval = Math.max(10, 20 - level);
  }

  update(dino, projectiles, effects = {}) {
    // Flame thrower is always active
    this.flameActive = true;
    this.flameX = dino.x + dino.width;
    this.flameY = dino.y + dino.height / 2;
    this.damageCounter++;

    // Update flame particles
    for (let i = this.flameParticles.length - 1; i >= 0; i--) {
      const particle = this.flameParticles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;

      if (particle.life <= 0) {
        this.flameParticles.splice(i, 1);
      }
    }

    // Generate new flame particles
    for (let i = 0; i < 3; i++) {
      this.flameParticles.push({
        x: this.flameX + Math.random() * 30,
        y: this.flameY + (Math.random() - 0.5) * this.flameWidth,
        vx: 4 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 5,
        life: 20 + Math.random() * 20,
        maxLife: 30,
        alpha: 1,
        color: Math.random() > 0.5 ? '#FF6600' : '#FF9900'
      });
    }

    // Play flame sound (loop it)
    if (this.assets && this.assets.flameSound && !this.soundPlaying) {
      this.assets.flameSound.loop = true;
      this.assets.flameSound.volume = 0.3;
      this.assets.flameSound.play().catch(() => { });
      this.soundPlaying = true;
    }
  }

  /**
   * Draw flame thrower effect
   */
  draw(ctx, frameCount) {
    if (!this.flameActive) return;

    ctx.save();

    // Draw flame cone gradient
    const gradient = ctx.createLinearGradient(
      this.flameX, this.flameY,
      this.flameX + this.flameLength, this.flameY
    );
    gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 200, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

    // Draw expanding flame cone
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(this.flameX, this.flameY);
    ctx.lineTo(
      this.flameX + this.flameLength,
      this.flameY - this.flameWidth * 1.5
    );
    ctx.lineTo(
      this.flameX + this.flameLength,
      this.flameY + this.flameWidth * 1.5
    );
    ctx.closePath();
    ctx.fill();

    // Draw flame particles
    this.flameParticles.forEach(particle => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Core bright flame
    ctx.globalAlpha = 0.9;
    const coreGradient = ctx.createLinearGradient(
      this.flameX, this.flameY,
      this.flameX + this.flameLength * 0.5, this.flameY
    );
    coreGradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
    coreGradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.5)');
    coreGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = coreGradient;
    ctx.fillRect(
      this.flameX,
      this.flameY - this.flameWidth / 3,
      this.flameLength * 0.7,
      this.flameWidth * 0.66
    );

    // Flickering effect
    const flicker = Math.sin(frameCount / 3) * 3;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(
      this.flameX,
      this.flameY - (this.flameWidth / 3 + flicker),
      this.flameLength * 0.7,
      this.flameWidth * 0.66 + flicker * 2
    );

    ctx.restore();
  }

  /**
   * Check flame collision with enemies and apply burning effect
   */
  checkCollisions(enemies, onHit) {
    if (!this.flameActive) return;

    // Only apply burn at intervals
    if (this.damageCounter < this.damageInterval) return;

    this.damageCounter = 0;

    enemies.forEach(enemy => {
      // Check if enemy is in flame cone
      // Simple rectangular collision for the flame area
      if (enemy.x < this.flameX + this.flameLength &&
        enemy.x + enemy.width > this.flameX &&
        enemy.y < this.flameY + this.flameWidth * 1.5 &&
        enemy.y + enemy.height > this.flameY - this.flameWidth * 1.5) {
        
        // Apply low initial damage
        const enemyDied = enemy.takeDamage(this.immediateDamage);
        
        // Apply burning effect
        if (enemy.applyBurn) {
          enemy.applyBurn(this.burnDamage, this.burnDuration);
        }

        // Call onHit callback if enemy died from the initial hit
        if (enemyDied) {
          onHit(enemy);
        }
      }
    });
  }

  reset() {
    super.reset();
    this.flameActive = false;
    this.flameParticles = [];

    // Stop flame sound
    if (this.assets && this.assets.flameSound) {
      this.assets.flameSound.pause();
      this.assets.flameSound.currentTime = 0;
      this.soundPlaying = false;
    }
  }
}

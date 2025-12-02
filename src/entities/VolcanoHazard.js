/**
 * VolcanoHazard - Ground-based hazard that damages enemies on contact
 * Spawned when volcano projectiles hit the ground
 */
import { BaseEntity } from './BaseEntity.js';

export class VolcanoHazard extends BaseEntity {
  constructor(x, groundY) {
    const width = 40;
    const height = 40;
    super(x - width / 2, groundY - height, width, height);

    this.duration = 180; // Lasts 6 seconds at 30fps
    this.frameCount = 0;
    this.damage = 10; // Damage per tick
    this.damageInterval = 15; // Apply damage every 0.5 seconds
    this.damageCounter = 0;
    this.hitEnemies = new Set(); // Track enemies hit this damage cycle
  }

  update() {
    this.frameCount++;
    this.damageCounter++;

    // Reset hit tracking every damage interval
    if (this.damageCounter >= this.damageInterval) {
      this.damageCounter = 0;
      this.hitEnemies.clear();
    }

    // Check if hazard should expire
    if (this.frameCount >= this.duration) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();

    // Pulsing effect based on frame count
    const pulseScale = 1 + Math.sin(this.frameCount * 0.2) * 0.1;
    const alpha = Math.max(0.5, 1 - (this.frameCount / this.duration));

    ctx.globalAlpha = alpha;
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(pulseScale, pulseScale);

    // Draw volcano emoji
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌋', 0, 0);

    // Add lava glow effect
    const glowRadius = 20 * pulseScale;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    gradient.addColorStop(0, 'rgba(255, 100, 0, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Check if this hazard can damage the given enemy
   * @param {Object} enemy - Enemy entity
   * @returns {boolean} True if can damage (collision and not recently hit)
   */
  canDamage(enemy) {
    if (!this.active) return false;
    if (this.hitEnemies.has(enemy)) return false;

    return this.checkCollision(enemy);
  }

  /**
   * Mark an enemy as hit during this damage cycle
   * @param {Object} enemy - Enemy entity
   */
  markHit(enemy) {
    this.hitEnemies.add(enemy);
  }

  /**
   * Get damage amount
   * @returns {number} Damage value
   */
  getDamage() {
    return this.damage;
  }
}

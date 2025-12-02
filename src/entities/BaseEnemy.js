/**
 * BaseEnemy - Base class for all enemy entities
 * Provides common functionality for health, damage, health bars, and XP drops
 */
import { BaseEntity } from './BaseEntity.js';

export class BaseEnemy extends BaseEntity {
  // Constants for burning effect
  static FLAME_PARTICLE_INTERVAL = 5; // Generate flame particles every 5 frames

  /**
   * @param {HTMLCanvasElement} canvas - Game canvas
   * @param {number} gameSpeed - Current game speed
   * @param {Object} config - Enemy configuration
   */
  constructor(canvas, gameSpeed, config = {}) {
    const {
      width = 35,
      height = 30,
      health = 1,
      xpValue = 5,
      speedMultiplier = 1,
      type = 'enemy'
    } = config;

    // Calculate initial position (right side of canvas with random offset)
    const x = canvas.width + Math.random() * 200;
    const y = canvas.height * 0.8 - height; // Ground level by default

    super(x, y, width, height);

    this.canvas = canvas;
    this.speed = gameSpeed * speedMultiplier;
    this.health = health;
    this.maxHealth = health;
    this.xpValue = xpValue;
    this.type = type;

    // Animation
    this.frameCount = 0;
    this.damageFlash = 0;

    // Burning status effect
    this.isBurning = false;
    this.burnDamage = 0;
    this.burnDuration = 0;
    this.burnTickCounter = 0;
    this.burnTickInterval = 15; // Apply burn damage every 15 frames
  }

  /**
   * Take damage and return whether enemy died
   * @param {number} amount - Damage amount
   * @returns {boolean} True if enemy died
   */
  takeDamage(amount = 1) {
    this.health -= amount;
    this.damageFlash = 3; // Flash for 3 frames
    return this.health <= 0;
  }

  /**
   * Apply burning effect to enemy
   * @param {number} damage - Damage per tick
   * @param {number} duration - Duration in frames
   */
  applyBurn(damage = 0.1, duration = 180) {
    this.isBurning = true;
    this.burnDamage = damage;
    this.burnDuration = duration;
    this.burnTickCounter = 0;
  }

  /**
   * Check if enemy is dead
   * @returns {boolean} True if dead
   */
  isDead() {
    return this.health <= 0;
  }

  /**
   * Update enemy position
   */
  update() {
    this.x -= this.speed;
    this.frameCount++;

    if (this.damageFlash > 0) {
      this.damageFlash--;
    }

    // Apply burn damage over time
    if (this.isBurning) {
      this.burnTickCounter++;
      // Apply burn damage at regular intervals
      if (this.burnTickCounter >= this.burnTickInterval) {
        this.health -= this.burnDamage;
        this.burnTickCounter = 0;
      }

      // Decrease burn duration
      this.burnDuration--;
      if (this.burnDuration <= 0) {
        this.isBurning = false;
      }
    }
  }

  /**
   * Draw health bar above enemy
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} options - Health bar options
   */
  drawHealthBar(ctx, options = {}) {
    // Only draw if damaged
    if (this.health >= this.maxHealth) return;

    const {
      barWidth = 30,
      barHeight = 3,
      yOffset = -10,
      showBorder = false,
      borderColor = '#FFD700',
      colors = null
    } = options;

    const healthPercent = this.health / this.maxHealth;
    const barX = this.x + (this.width - barWidth) / 2;
    const barY = this.y + yOffset;

    // Background
    ctx.fillStyle = showBorder ? '#000' : '#FF0000';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill color based on percentage
    let fillColor;
    if (colors) {
      if (healthPercent > 0.6) {
        fillColor = colors.high || '#00FF00';
      } else if (healthPercent > 0.3) {
        fillColor = colors.medium || '#FFAA00';
      } else {
        fillColor = colors.low || '#FF0000';
      }
    } else {
      fillColor = '#00FF00';
    }

    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border if requested
    if (showBorder) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  /**
   * Draw enemy emoji with optional effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} emoji - Emoji to draw
   * @param {number} fontSize - Font size
   */
  drawEmoji(ctx, emoji, fontSize = 30) {
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Damage flash effect
    if (this.damageFlash > 0) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
    }

    // Burning effect - orange glow
    if (this.isBurning) {
      ctx.shadowColor = '#FF6600';
      ctx.shadowBlur = 15;
    }

    const { x: centerX } = this.getCenter();
    // Draw emoji with bottom at ground level (y + height)
    ctx.fillText(emoji, centerX, this.y + this.height);

    ctx.shadowBlur = 0;

    // Draw flame particles for burning enemies
    if (this.isBurning && this.frameCount % BaseEnemy.FLAME_PARTICLE_INTERVAL === 0) {
      this.drawBurnEffect(ctx);
    }
  }

  /**
   * Draw burning effect particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawBurnEffect(ctx) {
    const { x: centerX, y: centerY } = this.getCenter();

    // Draw small flame particles
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * this.width;
      const offsetY = (Math.random() - 0.5) * this.height;
      const flameSize = 3 + Math.random() * 3;

      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = Math.random() > 0.5 ? '#FF6600' : '#FF9900';
      ctx.beginPath();
      ctx.arc(centerX + offsetX, centerY + offsetY, flameSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Draw label above enemy
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} text - Label text
   * @param {Object} options - Label options
   */
  drawLabel(ctx, text, options = {}) {
    const {
      yOffset = -22,
      fontSize = 10,
      fillColor = '#FFD700',
      strokeColor = '#000'
    } = options;

    const { x: centerX } = this.getCenter();

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeText(text, centerX, this.y + yOffset);
    ctx.fillText(text, centerX, this.y + yOffset);
  }
}

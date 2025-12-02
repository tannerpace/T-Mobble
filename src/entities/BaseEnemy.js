/**
 * BaseEnemy - Base class for all enemy entities
 * Provides common functionality for health, damage, health bars, and XP drops
 */
import { BaseEntity } from './BaseEntity.js';

export class BaseEnemy extends BaseEntity {
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
   * Check if enemy is dead
   * @returns {boolean} True if dead
   */
  isDead() {
    return this.health <= 0;
  }

  /**
   * Apply knockback force to push enemy away
   * @param {number} force - Knockback distance
   */
  applyKnockback(force) {
    this.x += force; // Push enemy to the right (away from player)
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
    ctx.textBaseline = 'middle';

    // Damage flash effect
    if (this.damageFlash > 0) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
    }

    const { x: centerX, y: centerY } = this.getCenter();
    ctx.fillText(emoji, centerX, centerY);

    ctx.shadowBlur = 0;
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

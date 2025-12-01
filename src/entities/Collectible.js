/**
 * Collectible - Base class for collectible entities (coins, XP gems, power-ups, health)
 * Provides common functionality for magnet behavior, bounce animation, and collection
 */
import { BaseEntity } from './BaseEntity.js';

export class Collectible extends BaseEntity {
  /**
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Entity width
   * @param {number} height - Entity height
   * @param {number} speed - Movement speed
   */
  constructor(x, y, width, height, speed = 2) {
    super(x, y, width, height);
    this.speed = speed;
    this.magnetized = false;
    this.frameCount = 0;
    this.emoji = '💎';
  }

  /**
   * Calculate bounce animation offset
   * @param {number} divisor - Animation speed divisor (lower = faster)
   * @param {number} amplitude - Bounce height in pixels
   * @returns {number} Y offset for bounce animation
   */
  getBounceOffset(divisor = 10, amplitude = 2) {
    return Math.sin(this.frameCount / divisor) * amplitude;
  }

  /**
   * Apply magnet effect - move towards target if in range
   * @param {Object} target - Target entity with x, y properties
   * @param {number} magnetRange - Range at which magnet activates
   * @param {number} magnetSpeed - Speed of magnet pull
   * @returns {boolean} True if magnetized this frame
   */
  applyMagnet(target, magnetRange, magnetSpeed = 4) {
    if (magnetRange <= 0 || !target) return false;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < magnetRange) {
      this.magnetized = true;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * magnetSpeed;
      this.y += Math.sin(angle) * magnetSpeed;
      return true;
    }

    return false;
  }

  /**
   * Update with optional magnet behavior
   * @param {Object} target - Target entity for magnet effect
   * @param {number} magnetRange - Range at which magnet activates
   */
  update(target = null, magnetRange = 0) {
    if (this.collected) return;

    this.frameCount++;

    // Apply magnet if in range
    if (this.applyMagnet(target, magnetRange)) {
      return;
    }

    // Normal movement (drift left)
    this.x -= this.speed;
  }

  /**
   * Override collision check to also check collected state
   * @param {Object} entity - Entity with x, y, width, height properties
   * @returns {boolean} True if collision detected
   */
  checkCollision(entity) {
    if (this.collected) return false;
    return super.checkCollision(entity);
  }

  /**
   * Collect this item
   * @returns {number} Value of the collected item (to be overridden)
   */
  collect() {
    this.collected = true;
    return 1;
  }

  /**
   * Check if entity is off screen (with buffer for magnet)
   * @returns {boolean} True if off screen
   */
  isOffScreen() {
    return super.isOffScreen(50); // Buffer for magnet effect
  }

  /**
   * Draw emoji at position with bounce animation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} options - Drawing options
   */
  drawEmoji(ctx, options = {}) {
    if (this.collected) return;

    const {
      fontSize = 16,
      bounce = true,
      glow = false,
      glowColor = '#FFD700'
    } = options;

    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const bounceOffset = bounce ? this.getBounceOffset() : 0;
    const { x: centerX, y: centerY } = this.getCenter();

    // Apply glow effect if magnetized or explicitly requested
    if (this.magnetized || glow) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = this.magnetized ? 15 : 8;
    }

    ctx.fillText(this.emoji, centerX, centerY + bounceOffset);

    ctx.shadowBlur = 0;
  }
}

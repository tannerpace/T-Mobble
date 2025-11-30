/**
 * BaseEntity - Base class for all game entities
 * Provides common functionality for position, dimensions, and collision detection
 */
export class BaseEntity {
  /**
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Entity width
   * @param {number} height - Entity height
   */
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collected = false;
    this.active = true;
  }

  /**
   * Check AABB collision with another entity
   * @param {Object} entity - Entity with x, y, width, height properties
   * @returns {boolean} True if collision detected
   */
  checkCollision(entity) {
    if (!this.active) return false;

    return (
      entity.x < this.x + this.width &&
      entity.x + entity.width > this.x &&
      entity.y < this.y + this.height &&
      entity.y + entity.height > this.y
    );
  }

  /**
   * Check if entity is off screen (left side)
   * @param {number} buffer - Additional buffer distance (default 0)
   * @returns {boolean} True if off screen
   */
  isOffScreen(buffer = 0) {
    return this.x + this.width < -buffer;
  }

  /**
   * Get center position of entity
   * @returns {{x: number, y: number}} Center coordinates
   */
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  /**
   * Update entity state (to be overridden by subclasses)
   */
  update() {
    // Override in subclass
  }

  /**
   * Draw entity (to be overridden by subclasses)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Override in subclass
  }
}

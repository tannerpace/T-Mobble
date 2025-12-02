/**
 * BaseEntity - Base class for all game entities
 * Provides common functionality for position, dimensions, and collision detection
 */

import type { BoundingBox, Position } from '../types';

export class BaseEntity implements BoundingBox {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public collected: boolean;
  public active: boolean;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collected = false;
    this.active = true;
  }

  /**
   * Check AABB collision with another entity
   */
  checkCollision(entity: BoundingBox): boolean {
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
   */
  isOffScreen(buffer: number = 0): boolean {
    return this.x + this.width < -buffer;
  }

  /**
   * Get center position of entity
   */
  getCenter(): Position {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  /**
   * Update entity state (to be overridden by subclasses)
   */
  update(): void {
    // Override in subclass
  }

  /**
   * Draw entity (to be overridden by subclasses)
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Override in subclass
  }
}

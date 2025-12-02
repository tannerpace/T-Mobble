/**
 * Collectible - Base class for collectible entities (coins, XP gems, power-ups, health)
 * Provides common functionality for magnet behavior, bounce animation, and collection
 */
import type { BoundingBox } from '../types';
import { BaseEntity } from './BaseEntity';

export interface DrawEmojiOptions {
  fontSize?: number;
  bounce?: boolean;
  glow?: boolean;
  glowColor?: string;
}

export class Collectible extends BaseEntity {
  public speed: number;
  public magnetized: boolean;
  public frameCount: number;
  public emoji: string;

  constructor(x: number, y: number, width: number, height: number, speed: number = 2) {
    super(x, y, width, height);
    this.speed = speed;
    this.magnetized = false;
    this.frameCount = 0;
    this.emoji = '💎';
  }

  /**
   * Calculate bounce animation offset
   */
  getBounceOffset(divisor: number = 10, amplitude: number = 2): number {
    return Math.sin(this.frameCount / divisor) * amplitude;
  }

  /**
   * Apply magnet effect - move towards target if in range
   */
  applyMagnet(target: BoundingBox | null, magnetRange: number, magnetSpeed: number = 4): boolean {
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
   */
  update(target: BoundingBox | null = null, magnetRange: number = 0): void {
    if (this.collected) return;

    this.frameCount++;

    if (this.applyMagnet(target, magnetRange)) {
      return;
    }

    this.x -= this.speed;
  }

  /**
   * Override collision check to also check collected state
   */
  checkCollision(entity: BoundingBox): boolean {
    if (this.collected) return false;
    return super.checkCollision(entity);
  }

  /**
   * Collect this item
   */
  collect(): number {
    this.collected = true;
    return 1;
  }

  /**
   * Check if entity is off screen (with buffer for magnet)
   */
  isOffScreen(): boolean {
    return super.isOffScreen(50);
  }

  /**
   * Draw the collectible (can be overridden)
   */
  draw(ctx: CanvasRenderingContext2D, frameCount?: number): void {
    this.drawEmoji(ctx);
  }

  /**
   * Draw emoji at position with bounce animation
   */
  drawEmoji(ctx: CanvasRenderingContext2D, options: DrawEmojiOptions = {}): void {
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

    if (this.magnetized || glow) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = this.magnetized ? 15 : 8;
    }

    ctx.fillText(this.emoji, centerX, centerY + bounceOffset);

    ctx.shadowBlur = 0;
  }
}

/**
 * Bullet entity - projectile that can destroy obstacles
 */

import type { BoundingBox } from '../types';

export class Bullet {
  public x: number;
  public y: number;
  public startX: number;
  public width: number;
  public height: number;
  public angle: number;
  public speed: number;
  public pierceCount: number;
  public hitCount: number;
  public active: boolean;
  public maxRange: number;
  public damage: number;
  public knockback: number;
  public color: string | null;
  public vx: number;
  public vy: number;
  public isVolcanoProjectile?: boolean;

  constructor(x: number, y: number, angle: number = 0, speed: number = 8, pierceCount: number = 0) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.width = 10;
    this.height = 4;
    this.angle = angle;
    this.speed = speed;
    this.pierceCount = pierceCount;
    this.hitCount = 0;
    this.active = true;
    this.maxRange = 300;
    this.damage = 1;
    this.knockback = 0;
    this.color = null;

    const radians = (angle * Math.PI) / 180;
    this.vx = Math.cos(radians) * this.speed;
    this.vy = Math.sin(radians) * this.speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.angle * Math.PI) / 180);

    const bulletColor = this.color || '#FF4500';
    ctx.fillStyle = bulletColor;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    if (!this.color) {
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 1, 6, 2);
    }

    ctx.restore();
  }

  update(): boolean {
    if (this.active) {
      this.x += this.vx;
      this.y += this.vy;
    }
    return false; // Return false by default, override in subclasses
  }

  checkCollision(obstacle: BoundingBox): boolean {
    if (!this.active) return false;

    const hit = (
      this.x < obstacle.x + obstacle.width &&
      this.x + this.width > obstacle.x &&
      this.y < obstacle.y + obstacle.height &&
      this.y + this.height > obstacle.y
    );

    if (hit) {
      this.hitCount++;
      if (this.hitCount > this.pierceCount) {
        this.active = false;
      }
    }

    return hit;
  }

  isOffScreen(canvasWidth: number): boolean {
    const distanceTraveled = this.x - this.startX;
    if (distanceTraveled > this.maxRange) {
      return true;
    }
    return this.x > canvasWidth;
  }
}

/**
 * VolcanoHazard - Ground-based hazard that damages enemies on contact
 * Spawned when volcano projectiles hit the ground
 */
import type { BoundingBox } from '../types';
import { BaseEntity } from './BaseEntity';

export class VolcanoHazard extends BaseEntity {
  public duration: number;
  public frameCount: number;
  public damage: number;
  public damageInterval: number;
  public damageCounter: number;
  private hitEnemies: Set<BoundingBox>;

  constructor(x: number, groundY: number) {
    const width = 40;
    const height = 40;
    super(x - width / 2, groundY - height, width, height);

    this.duration = 180;
    this.frameCount = 0;
    this.damage = 10;
    this.damageInterval = 15;
    this.damageCounter = 0;
    this.hitEnemies = new Set();
  }

  update(): void {
    this.frameCount++;
    this.damageCounter++;

    if (this.damageCounter >= this.damageInterval) {
      this.damageCounter = 0;
      this.hitEnemies.clear();
    }

    if (this.frameCount >= this.duration) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    const pulseScale = 1 + Math.sin(this.frameCount * 0.2) * 0.1;
    const alpha = Math.max(0.5, 1 - (this.frameCount / this.duration));

    ctx.globalAlpha = alpha;
    ctx.translate(this.x + this.width / 2, this.y + this.height);
    ctx.scale(pulseScale, pulseScale);

    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('🌋', 0, 0);

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
   */
  canDamage(enemy: BoundingBox): boolean {
    if (!this.active) return false;
    if (this.hitEnemies.has(enemy)) return false;

    return this.checkCollision(enemy);
  }

  /**
   * Mark an enemy as hit during this damage cycle
   */
  markHit(enemy: BoundingBox): void {
    this.hitEnemies.add(enemy);
  }

  /**
   * Get damage amount
   */
  getDamage(): number {
    return this.damage;
  }
}

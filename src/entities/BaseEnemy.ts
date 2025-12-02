/**
 * BaseEnemy - Base class for all enemy entities
 * Provides common functionality for health, damage, health bars, and XP drops
 */
import type { EnemyConfig, EnemyType } from '../types';
import { BaseEntity } from './BaseEntity';

export interface HealthBarOptions {
  barWidth?: number;
  barHeight?: number;
  yOffset?: number;
  showBorder?: boolean;
  borderColor?: string;
  colors?: {
    high?: string;
    medium?: string;
    low?: string;
  } | null;
}

export class BaseEnemy extends BaseEntity {
  // Constants for burning effect
  static FLAME_PARTICLE_INTERVAL = 5;

  public canvas: HTMLCanvasElement;
  public speed: number;
  public health: number;
  public maxHealth: number;
  public xpValue: number;
  public type: EnemyType;
  public frameCount: number;
  public damageFlash: number;
  public isBurning: boolean;
  public burnDamage: number;
  public burnDuration: number;
  public burnTickCounter: number;
  public burnTickInterval: number;

  constructor(canvas: HTMLCanvasElement, gameSpeed: number, config: EnemyConfig = {}) {
    const {
      width = 35,
      height = 30,
      health = 1,
      xpValue = 5,
      speedMultiplier = 1,
      type = 'enemy'
    } = config;

    const x = canvas.width + Math.random() * 200;
    const y = canvas.height * 0.8 - height;

    super(x, y, width, height);

    this.canvas = canvas;
    this.speed = gameSpeed * speedMultiplier;
    this.health = health;
    this.maxHealth = health;
    this.xpValue = xpValue;
    this.type = type;

    this.frameCount = 0;
    this.damageFlash = 0;

    this.isBurning = false;
    this.burnDamage = 0;
    this.burnDuration = 0;
    this.burnTickCounter = 0;
    this.burnTickInterval = 15;
  }

  /**
   * Take damage and return whether enemy died
   */
  takeDamage(amount: number = 1): boolean {
    this.health -= amount;
    this.damageFlash = 3;
    return this.health <= 0;
  }

  /**
   * Apply burning effect to enemy
   */
  applyBurn(damage: number = 0.1, duration: number = 180): void {
    this.isBurning = true;
    this.burnDamage = damage;
    this.burnDuration = duration;
    this.burnTickCounter = 0;
  }

  /**
   * Check if enemy is dead
   */
  isDead(): boolean {
    return this.health <= 0;
  }

  /**
   * Update enemy position
   */
  update(): void {
    this.x -= this.speed;
    this.frameCount++;

    if (this.damageFlash > 0) {
      this.damageFlash--;
    }

    if (this.isBurning) {
      this.burnTickCounter++;
      if (this.burnTickCounter >= this.burnTickInterval) {
        this.health -= this.burnDamage;
        this.burnTickCounter = 0;
      }

      this.burnDuration--;
      if (this.burnDuration <= 0) {
        this.isBurning = false;
      }
    }
  }

  /**
   * Draw health bar above enemy
   */
  drawHealthBar(ctx: CanvasRenderingContext2D, options: HealthBarOptions = {}): void {
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

    ctx.fillStyle = showBorder ? '#000' : '#FF0000';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    let fillColor: string;
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

    if (showBorder) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  /**
   * Draw enemy emoji with optional effects
   */
  drawEmoji(ctx: CanvasRenderingContext2D, emoji: string, fontSize: number = 30): void {
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    if (this.damageFlash > 0) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
    }

    if (this.isBurning) {
      ctx.shadowColor = '#FF6600';
      ctx.shadowBlur = 15;
    }

    const { x: centerX } = this.getCenter();
    ctx.fillText(emoji, centerX, this.y + this.height);

    ctx.shadowBlur = 0;

    if (this.isBurning && this.frameCount % BaseEnemy.FLAME_PARTICLE_INTERVAL === 0) {
      this.drawBurnEffect(ctx);
    }
  }

  /**
   * Draw burning effect particles
   */
  drawBurnEffect(ctx: CanvasRenderingContext2D): void {
    const { x: centerX, y: centerY } = this.getCenter();

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
   */
  drawLabel(ctx: CanvasRenderingContext2D, text: string, options: {
    yOffset?: number;
    fontSize?: number;
    fillColor?: string;
    strokeColor?: string;
  } = {}): void {
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

/**
 * GhostEnemy - Teleporting enemy that phases in and out
 */
import { BaseEnemy } from './BaseEnemy';

export class GhostEnemy extends BaseEnemy {
  public isPhased: boolean;
  private phaseTimer: number;
  private phaseDuration: number;
  private solidDuration: number;
  private phaseInterval: number;
  private opacity: number;
  private glowIntensity: number;
  private floatOffset: number;
  private floatSpeed: number;
  private teleportCooldown: number;
  private teleportChance: number;

  constructor(canvas: HTMLCanvasElement, gameSpeed: number) {
    super(canvas, gameSpeed, {
      width: 40,
      height: 40,
      health: 3,
      xpValue: 12,
      speedMultiplier: 0.9,
      type: 'ghost'
    });

    const heightVariant = Math.random();
    if (heightVariant < 0.4) {
      this.y = canvas.height * 0.8 - this.height;
    } else if (heightVariant < 0.7) {
      this.y = canvas.height * 0.6 - this.height;
    } else {
      this.y = canvas.height * 0.4 - this.height;
    }

    this.isPhased = false;
    this.phaseTimer = 0;
    this.phaseDuration = 45;
    this.solidDuration = 90;
    this.phaseInterval = this.solidDuration;

    this.opacity = 1;
    this.glowIntensity = 0;
    this.floatOffset = 0;
    this.floatSpeed = 0.08;

    this.teleportCooldown = 0;
    this.teleportChance = 0.02;
  }

  canBeDamaged(): boolean {
    return !this.isPhased;
  }

  takeDamage(amount: number = 1): boolean {
    if (this.isPhased) {
      return false;
    }
    return super.takeDamage(amount);
  }

  canDamagePlayer(): boolean {
    return !this.isPhased;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    this.floatOffset = Math.sin(this.frameCount * this.floatSpeed) * 5;

    ctx.globalAlpha = this.opacity;

    if (this.glowIntensity > 0) {
      ctx.shadowColor = this.isPhased ? '#9966FF' : '#66FFFF';
      ctx.shadowBlur = 15 + this.glowIntensity * 10;
    }

    const emoji = '👻';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    if (this.damageFlash > 0) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 15;
    }

    if (this.isBurning && !this.isPhased) {
      ctx.shadowColor = '#FF6600';
      ctx.shadowBlur = 15;
    }

    const { x: centerX } = this.getCenter();
    ctx.fillText(emoji, centerX, this.y + this.height + this.floatOffset);

    ctx.shadowBlur = 0;

    if (this.phaseTimer < 10 || this.phaseTimer > this.phaseDuration - 10) {
      this.drawPhaseParticles(ctx);
    }

    ctx.restore();

    if (!this.isPhased) {
      this.drawHealthBar(ctx, {
        barWidth: 35,
        barHeight: 3,
        yOffset: -12 + this.floatOffset,
        colors: {
          high: '#9966FF',
          medium: '#CC66FF',
          low: '#FF66FF'
        }
      });
    }

    if (this.isPhased) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9966FF';
      ctx.fillText('PHASED', centerX, this.y - 5 + this.floatOffset);
      ctx.restore();
    }
  }

  private drawPhaseParticles(ctx: CanvasRenderingContext2D): void {
    const { x: centerX, y: centerY } = this.getCenter();

    for (let i = 0; i < 4; i++) {
      const angle = (this.frameCount * 0.1) + (i * Math.PI / 2);
      const radius = 20 + Math.sin(this.frameCount * 0.2) * 5;
      const particleX = centerX + Math.cos(angle) * radius;
      const particleY = centerY + Math.sin(angle) * radius + this.floatOffset;

      ctx.beginPath();
      ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.isPhased ? '#9966FF' : '#66FFFF';
      ctx.fill();
    }
  }

  update(): void {
    this.x -= this.speed;
    this.frameCount++;

    if (this.damageFlash > 0) {
      this.damageFlash--;
    }

    this.phaseTimer++;

    if (this.isPhased) {
      if (this.phaseTimer >= this.phaseDuration) {
        this.isPhased = false;
        this.phaseTimer = 0;
      }
      this.opacity = 0.3 + Math.sin(this.frameCount * 0.3) * 0.15;
      this.glowIntensity = 1;
    } else {
      if (this.phaseTimer >= this.solidDuration) {
        this.isPhased = true;
        this.phaseTimer = 0;
      }
      this.opacity = 1;
      this.glowIntensity = Math.max(0, this.glowIntensity - 0.05);

      if (this.teleportCooldown <= 0 && Math.random() < this.teleportChance) {
        this.teleport();
      }
    }

    if (this.teleportCooldown > 0) {
      this.teleportCooldown--;
    }

    if (this.isBurning && !this.isPhased) {
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

  private teleport(): void {
    const teleportDistance = 50 + Math.random() * 100;
    const direction = Math.random() < 0.5 ? -1 : 1;

    this.x += teleportDistance * direction;

    this.x = Math.max(50, Math.min(this.canvas.width - 50, this.x));

    this.teleportCooldown = 120;

    this.isPhased = true;
    this.phaseTimer = this.phaseDuration - 15;
  }
}

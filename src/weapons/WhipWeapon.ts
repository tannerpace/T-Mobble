/**
 * WhipWeapon - Melee weapon that creates an arc in front of player
 */
import type { GameAssets, IDino, IEnemy } from '../types';
import { BaseWeapon, ProjectileArray, WeaponEffects } from './BaseWeapon';

interface WhipAnimation {
  x: number;
  y: number;
  radius: number;
  width: number;
  damage: number;
  pierce: number;
  frame: number;
  duration: number;
  hitEnemies: Set<IEnemy>;
}

export class WhipWeapon extends BaseWeapon {
  private whipAnimations: WhipAnimation[];
  private radius: number;
  private assets: GameAssets | null;

  constructor(assets: GameAssets | null) {
    super('Whip', 'Close-range arc attack, hits multiple enemies', '🪢');
    this.fireRateBase = 40; // Slower than bullets for balance
    this.whipAnimations = [];
    this.level = 1;
    this.radius = 70;
    this.assets = assets;
  }

  setLevel(level: number): void {
    this.level = level;
    // Increase radius and speed with level
    this.radius = 70 + (level - 1) * 10;
    this.fireRateBase = Math.max(20, 40 - (level - 1) * 3);
  }

  update(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects = {}): void {
    this.fireRateCounter++;

    const fireRate = Math.max(15, this.fireRateBase / (effects.fireRateMod || 1));

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }

    // Update active whip animations
    for (let i = this.whipAnimations.length - 1; i >= 0; i--) {
      const whip = this.whipAnimations[i];
      whip.frame++;
      if (whip.frame >= whip.duration) {
        this.whipAnimations.splice(i, 1);
      }
    }
  }

  fire(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects = {}): void {
    // Play whip sound
    if (this.assets && this.assets.whipSound) {
      this.assets.whipSound.currentTime = 0;
      this.assets.whipSound.play().catch(() => { });
    }

    // Create whip arc animation
    const whipArc: WhipAnimation = {
      x: dino.x + dino.width,
      y: dino.y + dino.height / 2,
      radius: this.radius,
      width: 12,
      damage: 1,
      pierce: 99, // Whip hits all in range
      frame: 0,
      duration: 12,
      hitEnemies: new Set() // Track which enemies were hit
    };
    this.whipAnimations.push(whipArc);
  }

  /**
   * Draw whip animations
   */
  draw(ctx: CanvasRenderingContext2D): void {
    this.whipAnimations.forEach(whip => {
      const progress = whip.frame / whip.duration;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Draw arc
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = whip.width;
      ctx.lineCap = 'round';
      ctx.beginPath();

      // Arc from top to bottom
      const startAngle = -Math.PI / 3;
      const endAngle = Math.PI / 3;
      const currentAngle = startAngle + (endAngle - startAngle) * progress;

      ctx.arc(whip.x, whip.y, whip.radius, startAngle, currentAngle);
      ctx.stroke();

      // Draw tip effect
      const tipX = whip.x + Math.cos(currentAngle) * whip.radius;
      const tipY = whip.y + Math.sin(currentAngle) * whip.radius;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  /**
   * Check whip collision with enemies
   */
  checkCollisions(enemies: IEnemy[], onHit: (enemy: IEnemy) => void): void {
    this.whipAnimations.forEach(whip => {
      enemies.forEach(enemy => {
        // Skip if already hit by this whip
        if (whip.hitEnemies.has(enemy)) return;

        const dx = enemy.x + enemy.width / 2 - whip.x;
        const dy = enemy.y + enemy.height / 2 - whip.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= whip.radius + enemy.width / 2) {
          whip.hitEnemies.add(enemy);
          onHit(enemy);
        }
      });
    });
  }

  reset(): void {
    super.reset();
    this.whipAnimations = [];
  }
}

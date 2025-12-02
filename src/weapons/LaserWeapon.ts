/**
 * LaserWeapon - Continuous beam weapon
 */
import type { GameAssets, IDino, IEnemy } from '../types';
import { BaseWeapon, ProjectileArray, WeaponEffects } from './BaseWeapon';

export class LaserWeapon extends BaseWeapon {
  private beamActive: boolean;
  private beamWidth: number;
  private beamLength: number;
  private damageCounter: number;
  private damageInterval: number;
  private assets: GameAssets | null;
  private soundPlaying: boolean;
  private beamX: number;
  private beamY: number;

  constructor(assets: GameAssets | null) {
    super('Laser Beam', 'Continuous beam that damages all enemies in path', '⚡');
    this.fireRateBase = 5; // Always firing
    this.beamActive = false;
    this.beamWidth = 10;
    this.beamLength = 350;
    this.level = 1;
    this.damageCounter = 0;
    this.damageInterval = 15; // Damage every 15 frames (slower than blaster)
    this.assets = assets;
    this.soundPlaying = false;
    this.beamX = 0;
    this.beamY = 0;
  }

  setLevel(level: number): void {
    this.level = level;
    // Increase width and length with level
    this.beamWidth = 10 + (level - 1) * 3;
    this.beamLength = 350 + (level - 1) * 30;
    // Faster damage at higher levels
    this.damageInterval = Math.max(8, 15 - level);
  }

  update(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects = {}): void {
    // Laser is always active
    this.beamActive = true;
    this.beamX = dino.x + dino.width;
    this.beamY = dino.y + dino.height / 2;
    this.damageCounter++;

    // Play laser buzz sound (loop it)
    if (this.assets && this.assets.laserbuzSound && !this.soundPlaying) {
      this.assets.laserbuzSound.loop = true;
      this.assets.laserbuzSound.play().catch(() => { });
      this.soundPlaying = true;
    }
  }

  /**
   * Draw laser beam
   */
  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    if (!this.beamActive) return;

    ctx.save();

    // Outer glow
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 15;

    // Beam gradient
    const gradient = ctx.createLinearGradient(
      this.beamX, this.beamY,
      this.beamX + this.beamLength, this.beamY
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 150, 255, 0.2)');

    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.beamX,
      this.beamY - this.beamWidth / 2,
      this.beamLength,
      this.beamWidth
    );

    // Core beam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      this.beamX,
      this.beamY - this.beamWidth / 4,
      this.beamLength,
      this.beamWidth / 2
    );

    // Pulsing effect
    const pulse = Math.sin(frameCount / 5) * 2;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(
      this.beamX,
      this.beamY - (this.beamWidth / 4 + pulse),
      this.beamLength,
      this.beamWidth / 2 + pulse * 2
    );

    ctx.restore();
  }

  /**
   * Check laser collision with enemies
   */
  checkCollisions(enemies: IEnemy[], onHit: (enemy: IEnemy) => void): void {
    if (!this.beamActive) return;

    // Only deal damage at intervals
    if (this.damageCounter < this.damageInterval) return;

    this.damageCounter = 0;

    enemies.forEach(enemy => {
      // Check if enemy is in beam path
      if (enemy.x < this.beamX + this.beamLength &&
        enemy.x + enemy.width > this.beamX &&
        enemy.y < this.beamY + this.beamWidth / 2 &&
        enemy.y + enemy.height > this.beamY - this.beamWidth / 2) {
        onHit(enemy);
      }
    });
  }

  reset(): void {
    super.reset();
    this.beamActive = false;

    // Stop laser sound
    if (this.assets && this.assets.laserbuzSound) {
      this.assets.laserbuzSound.pause();
      this.assets.laserbuzSound.currentTime = 0;
      this.soundPlaying = false;
    }
  }
}

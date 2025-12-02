/**
 * VolcanoWeapon - Launches projectiles in an arc that spawn volcano hazards on impact
 */
import { BaseWeapon } from './BaseWeapon.js';

export class VolcanoProjectile {
  constructor(x, y, velocityX, velocityY) {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.vx = velocityX;
    this.vy = velocityY;
    this.width = 16;
    this.height = 16;
    this.active = true;
    this.gravity = 0.3; // Lower gravity for higher arc
    this.groundY = 480; // Ground level (adjust based on your game)
    this.hitGround = false;
    this.explosionDelay = 20; // Frames before explosion
    this.explosionTimer = 0;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();

    // Draw bomb emoji
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pulsing effect when on ground
    if (this.hitGround) {
      const pulse = 1 + Math.sin(this.explosionTimer * 0.5) * 0.2;
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(pulse, pulse);
      ctx.fillText('💣', 0, 0);
      ctx.restore();
    } else {
      ctx.fillText('💣', this.x + this.width / 2, this.y + this.height / 2);
    }

    ctx.restore();
  }

  update() {
    if (!this.active) return false;

    if (this.hitGround) {
      // Bomb on ground, counting down to explosion
      this.explosionTimer++;
      if (this.explosionTimer >= this.explosionDelay) {
        this.active = false;
        return true; // Signal explosion
      }
      return false;
    }

    // Apply gravity to create arc
    this.vy += this.gravity;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Check if hit ground
    if (this.y >= this.groundY - this.height) {
      this.y = this.groundY - this.height; // Lock to ground
      this.hitGround = true;
      this.vx = 0;
      this.vy = 0;
    }

    return false;
  }

  isOffScreen(canvasWidth) {
    return this.x > canvasWidth || this.y > this.groundY;
  }
}

export class VolcanoWeapon extends BaseWeapon {
  constructor(assets) {
    super('Bomb Launcher', 'Launches explosive bombs that arc far and detonate on impact', '💣');
    this.fireRateBase = 120; // Very slow fire rate (4 seconds at 30fps)
    this.level = 1;
    this.launchAngle = 40; // Higher angle for better arc
    this.launchSpeed = 15; // Faster launch for greater range
    this.assets = assets;
  }

  setLevel(level) {
    this.level = level;
    // Increase fire rate slightly with levels
    this.fireRateBase = Math.max(60, 120 - (level - 1) * 10);
  }

  update(dino, projectiles, effects = {}) {
    this.fireRateCounter++;

    const fireRate = Math.max(30, this.fireRateBase / (effects.fireRateMod || 1));

    if (this.fireRateCounter >= fireRate) {
      this.fire(dino, projectiles, effects);
      this.fireRateCounter = 0;
    }
  }

  fire(dino, projectiles, effects = {}) {
    const launchY = dino.y + dino.height / 2;
    const launchX = dino.x + dino.width;

    // Calculate velocity components for arc
    const angleRad = (this.launchAngle * Math.PI) / 180;
    const vx = Math.cos(angleRad) * this.launchSpeed;
    const vy = -Math.sin(angleRad) * this.launchSpeed; // Negative for upward

    const projectile = new VolcanoProjectile(launchX, launchY, vx, vy);
    projectile.isVolcanoProjectile = true; // Mark for special handling
    projectiles.push(projectile);

    // Play launch sound (reuse pew sound or add custom)
    if (this.assets && this.assets.pewSound) {
      this.assets.pewSound.currentTime = 0;
      this.assets.pewSound.volume = 0.3;
      this.assets.pewSound.play().catch(() => { });
    }
  }
}

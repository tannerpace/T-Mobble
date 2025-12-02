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
    this.width = 12;
    this.height = 12;
    this.active = true;
    this.gravity = 0.4; // Gravity for arc
    this.groundY = 480; // Ground level (adjust based on your game)
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();

    // Draw the projectile as a glowing ember/rock
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  update() {
    if (!this.active) return;

    // Apply gravity to create arc
    this.vy += this.gravity;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Check if hit ground
    if (this.y >= this.groundY - this.height) {
      this.active = false;
      return true; // Signal that it hit the ground
    }

    return false;
  }

  isOffScreen(canvasWidth) {
    return this.x > canvasWidth || this.y > this.groundY;
  }
}

export class VolcanoWeapon extends BaseWeapon {
  constructor(assets) {
    super('Volcano Launcher', 'Launches projectiles that create damaging volcano hazards', '🌋');
    this.fireRateBase = 120; // Very slow fire rate (4 seconds at 30fps)
    this.level = 1;
    this.launchAngle = 30; // Angle in degrees
    this.launchSpeed = 10;
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

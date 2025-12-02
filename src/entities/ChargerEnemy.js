/**
 * ChargerEnemy - Fast, aggressive ground enemy that rushes at the player
 * Low health but high speed creates a "react quickly" challenge.
 * Fills the gap for fast ground-based threats.
 */
import { BaseEnemy } from './BaseEnemy.js';

export class ChargerEnemy extends BaseEnemy {
  constructor(canvas, gameSpeed) {
    super(canvas, gameSpeed, {
      width: 35,
      height: 30,
      health: 1,
      xpValue: 6,
      speedMultiplier: 1.6 + Math.random() * 0.4, // Very fast (1.6-2.0x)
      type: 'charger'
    });

    // Ground position - runs along the ground
    this.y = canvas.height * 0.8 - this.height;

    // Override X position - spawn further away to give reaction time
    this.x = canvas.width + 100 + Math.random() * 150;

    // Animation
    this.runFrame = 0;
    this.dustTimer = 0;

    // Charge behavior - speed boost after warming up
    this.isCharging = false;
    this.chargeDelay = 30 + Math.floor(Math.random() * 20); // Frames before charge
    this.originalSpeed = this.speed;
  }

  draw(ctx) {
    // Fast animal emoji - alternates for running animation
    const emoji = this.runFrame === 0 ? '🐆' : '🐕';
    this.drawEmoji(ctx, emoji, 30);

    // Draw dust particles behind when charging
    if (this.isCharging && this.dustTimer % 8 === 0) {
      this.drawDustTrail(ctx);
    }

    // Health bar (only shows when damaged - but with 1 HP it won't show much)
    this.drawHealthBar(ctx, {
      barWidth: 25,
      barHeight: 2,
      yOffset: -8,
      colors: {
        high: '#FFD700', // Gold for charger
        medium: '#FFA500',
        low: '#FF4500'
      }
    });
  }

  /**
   * Draw dust trail effect behind the charger
   */
  drawDustTrail(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#C4A86B'; // Dusty tan color

    // Draw 2-3 small dust particles
    for (let i = 0; i < 3; i++) {
      const dustX = this.x + this.width + 5 + i * 8;
      const dustY = this.y + this.height - 5 + Math.random() * 10;
      const dustSize = 3 + Math.random() * 4;

      ctx.beginPath();
      ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  update() {
    // Track frames for charge delay
    if (!this.isCharging) {
      this.chargeDelay--;
      if (this.chargeDelay <= 0) {
        this.isCharging = true;
        this.speed = this.originalSpeed * 1.3; // Extra speed burst when charging
      }
    }

    super.update();

    this.dustTimer++;

    // Running animation - faster leg movement than other enemies
    if (this.frameCount % 6 === 0) {
      this.runFrame = (this.runFrame + 1) % 2;
    }
  }
}

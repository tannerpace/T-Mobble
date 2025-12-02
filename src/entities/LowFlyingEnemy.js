/**
 * LowFlyingEnemy - Low-altitude flying enemy that fills the gap between
 * high-flying FlyingEnemy and ground-based enemies.
 * Flies at jump height, creating a timing challenge for players.
 */
import { BaseEnemy } from './BaseEnemy.js';

export class LowFlyingEnemy extends BaseEnemy {
  constructor(canvas, gameSpeed) {
    super(canvas, gameSpeed, {
      width: 30,
      height: 25,
      health: 2,
      xpValue: 8,
      speedMultiplier: 1.0 + Math.random() * 0.3, // Faster than regular flying (1.0-1.3x)
      type: 'lowFlying'
    });

    // Low flying height - positioned at player jump apex height (45-65% from top)
    // This is below the FlyingEnemy (15-45%) but above ground level (80%)
    this.baseY = canvas.height * 0.45 + Math.random() * (canvas.height * 0.2);
    this.y = this.baseY;

    // Smaller, faster wave motion than FlyingEnemy
    this.waveAmplitude = 15 + Math.random() * 10; // Smaller oscillation (15-25 pixels)
    this.waveFrequency = 0.05 + Math.random() * 0.03; // Faster oscillation
    this.waveOffset = Math.random() * Math.PI * 2;

    // Animation
    this.wingFrame = 0;
    this.glidePhase = 0; // For occasional gliding behavior
  }

  draw(ctx) {
    // Bat/flying insect emoji - alternates for wing flapping
    const emoji = this.wingFrame === 0 ? '🦇' : '🪰';
    this.drawEmoji(ctx, emoji, 25);

    // Health bar (only shows when damaged)
    this.drawHealthBar(ctx, {
      barWidth: 25,
      barHeight: 3,
      yOffset: -8,
      colors: {
        high: '#8B00FF', // Purple for low flyer at high health
        medium: '#FF6B00', // Orange for medium health
        low: '#FF0000' // Red for low health
      }
    });
  }

  update() {
    super.update();

    // Apply sine wave motion with occasional glide
    this.glidePhase = (this.glidePhase + 1) % 120;

    // Smooth sine wave motion, with occasional flat glide
    if (this.glidePhase < 90) {
      // Normal wave motion
      this.y = this.baseY + Math.sin(this.frameCount * this.waveFrequency + this.waveOffset) * this.waveAmplitude;
    } else {
      // Brief glide period - smoother approach
      const glideProgress = (this.glidePhase - 90) / 30;
      const targetY = this.baseY;
      this.y = this.y + (targetY - this.y) * 0.1;
    }

    // Wing flap animation - faster than FlyingEnemy
    if (this.frameCount % 10 === 0) {
      this.wingFrame = (this.wingFrame + 1) % 2;
    }
  }
}

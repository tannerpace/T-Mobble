/**
 * FlyingEnemy - Flying obstacle at variable heights
 */
import { BaseEnemy } from './BaseEnemy.js';

export class FlyingEnemy extends BaseEnemy {
  constructor(canvas, gameSpeed) {
    super(canvas, gameSpeed, {
      width: 35,
      height: 30,
      health: 1,
      xpValue: 5,
      speedMultiplier: 0.9 + Math.random() * 0.4,
      type: 'flying'
    });

    // Override Y position for flying height - upper third of canvas (15-45% from top)
    this.baseY = canvas.height * 0.15 + Math.random() * (canvas.height * 0.3);
    this.y = this.baseY;

    // Sine wave motion parameters
    this.waveAmplitude = 30 + Math.random() * 20; // Vertical oscillation range (30-50 pixels)
    this.waveFrequency = 0.03 + Math.random() * 0.02; // Speed of oscillation (randomized)
    this.waveOffset = Math.random() * Math.PI * 2; // Random starting phase

    // Animation
    this.wingFrame = 0;
  }

  draw(ctx) {
    // Flap animation - alternate between emojis
    const emoji = this.wingFrame === 0 ? '🦅' : '🦉';
    this.drawEmoji(ctx, emoji, 30);

    // Draw health bar if damaged
    this.drawHealthBar(ctx);
  }

  update() {
    super.update();

    // Apply sine wave motion for up-and-down flight
    this.y = this.baseY + Math.sin(this.frameCount * this.waveFrequency + this.waveOffset) * this.waveAmplitude;

    // Wing flap animation
    if (this.frameCount % 15 === 0) {
      this.wingFrame = (this.wingFrame + 1) % 2;
    }
  }
}

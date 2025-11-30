/**
 * HealthPickup - Red heart that restores health
 */
import { Collectible } from './Collectible.js';

export class HealthPickup extends Collectible {
  constructor(canvas, gameSpeed) {
    // Spawn further right than coins
    const x = canvas.width + Math.random() * 600;
    const y = 100 + Math.random() * 60;

    super(x, y, 24, 24, gameSpeed * 0.7); // Slightly slower than coins

    this.canvas = canvas;
    this.healAmount = 1; // Restores 1 heart
    this.emoji = '❤️';
  }

  draw(ctx, frameCount) {
    if (this.collected) return;

    const scale = 1 + Math.sin(frameCount / 8) * 0.1;
    const bounce = Math.sin(frameCount / 10) * 2;
    const { x: centerX, y: centerY } = this.getCenter();

    // Add glow effect
    ctx.shadowColor = 'rgba(255, 100, 100, 0.5)';
    ctx.shadowBlur = 15;

    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.save();
    ctx.translate(centerX, centerY + bounce);
    ctx.scale(scale, scale);
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();

    ctx.shadowBlur = 0;
  }

  update() {
    if (!this.collected) {
      this.x -= this.speed;
    }
  }

  collect() {
    this.collected = true;
    return this.healAmount;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

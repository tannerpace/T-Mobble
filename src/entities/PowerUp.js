/**
 * PowerUp entity - collectible that gives ammo for shooting
 */
import { Collectible } from './Collectible.js';

export class PowerUp extends Collectible {
  constructor(canvas, gameSpeed) {
    // Spawn in upper half of game area (20-40% from top)
    const x = canvas.width + Math.random() * 400;
    const y = canvas.height * 0.2 + Math.random() * (canvas.height * 0.2);

    super(x, y, 24, 24, gameSpeed * 0.8);

    this.canvas = canvas;
    this.emoji = '💵'; // money emoji
  }

  draw(ctx, frameCount) {
    if (this.collected) return;

    const bounce = Math.sin(frameCount / 10) * 2;
    const { x: centerX, y: centerY } = this.getCenter();

    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(this.emoji, centerX, centerY + bounce);
  }

  update() {
    if (!this.collected) {
      this.x -= this.speed;
    }
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

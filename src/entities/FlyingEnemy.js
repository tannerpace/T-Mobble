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
    this.y = canvas.height * 0.15 + Math.random() * (canvas.height * 0.3);

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

    // Wing flap animation
    if (this.frameCount % 15 === 0) {
      this.wingFrame = (this.wingFrame + 1) % 2;
    }
  }
}

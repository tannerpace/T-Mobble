/**
 * TankEnemy - Slow, tanky obstacle requiring multiple hits
 */
import { BaseEnemy } from './BaseEnemy.js';

export class TankEnemy extends BaseEnemy {
  constructor(canvas, gameSpeed) {
    super(canvas, gameSpeed, {
      width: 50,
      height: 60,
      health: 5,
      xpValue: 15,
      speedMultiplier: 0.6, // Slower than normal
      type: 'tank'
    });

    // Override X position for more variation
    this.x = canvas.width + Math.random() * 300;
  }

  draw(ctx) {
    // Different emoji based on damage
    const emoji = this.health <= 2 ? '🐘' : '🦏';
    this.drawEmoji(ctx, emoji, 50);

    // Health bar with color coding
    this.drawHealthBar(ctx, {
      barWidth: 40,
      barHeight: 4,
      yOffset: -12,
      colors: {
        high: '#00FF00',
        medium: '#FFAA00',
        low: '#FF0000'
      }
    });
  }
}

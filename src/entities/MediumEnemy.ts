/**
 * MediumEnemy - Moderate difficulty enemy requiring several hits
 */
import { BaseEnemy } from './BaseEnemy';

export class MediumEnemy extends BaseEnemy {
  constructor(canvas: HTMLCanvasElement, gameSpeed: number) {
    super(canvas, gameSpeed, {
      width: 40,
      height: 45,
      health: 3,
      xpValue: 10,
      speedMultiplier: 0.8, // Slightly slower than flying, faster than tank
      type: 'medium'
    });

    // Override X position for variation
    this.x = canvas.width + Math.random() * 250;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Different emoji based on damage
    let emoji = '🐺'; // Wolf for medium enemy
    if (this.health <= 1) {
      emoji = '🦊'; // Fox when heavily damaged
    }

    this.drawEmoji(ctx, emoji, 40);

    // Medium-styled health bar
    this.drawHealthBar(ctx, {
      barWidth: 35,
      barHeight: 4,
      yOffset: -12,
      colors: {
        high: '#00AAFF', // Blue for medium at high health
        medium: '#FFAA00', // Orange for medium health
        low: '#FF0000' // Red for low health
      }
    });
  }
}

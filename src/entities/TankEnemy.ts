/**
 * TankEnemy - Slow, tanky obstacle requiring multiple hits
 */
import { BaseEnemy } from './BaseEnemy';

export class TankEnemy extends BaseEnemy {
  constructor(canvas: HTMLCanvasElement, gameSpeed: number) {
    super(canvas, gameSpeed, {
      width: 50,
      height: 60,
      health: 5,
      xpValue: 15,
      speedMultiplier: 0.6,
      type: 'tank'
    });

    this.x = canvas.width + Math.random() * 300;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const emoji = this.health <= 2 ? '🐘' : '🦏';
    this.drawEmoji(ctx, emoji, 50);

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

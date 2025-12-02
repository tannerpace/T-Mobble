/**
 * SuperEliteEnemy - Ultra-powerful enemy that is stronger than elite with higher rewards
 */
import { BaseEnemy } from './BaseEnemy';

export class SuperEliteEnemy extends BaseEnemy {
  constructor(canvas: HTMLCanvasElement, gameSpeed: number) {
    super(canvas, gameSpeed, {
      width: 65,
      height: 75,
      health: 15,
      xpValue: 50,
      speedMultiplier: 0.7, // Slower than elite
      type: 'superelite'
    });

    // Override X position for variation
    this.x = canvas.width + Math.random() * 300;

    // Super Elite enemies drop significant bonus XP (handled in Game.js collision detection)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Different emoji based on damage
    let emoji = '👾'; // Alien for super elite
    if (this.health <= 5) {
      emoji = '💀'; // Skull when heavily damaged
    } else if (this.health <= 10) {
      emoji = '👿'; // Angry demon when moderately damaged
    }

    this.drawEmoji(ctx, emoji, 65);

    // Super Elite-styled health bar with distinctive border
    this.drawHealthBar(ctx, {
      barWidth: 60,
      barHeight: 6,
      yOffset: -18,
      showBorder: true,
      borderColor: '#FF0000',
      colors: {
        high: '#FF0000', // Red for super elite at high health
        medium: '#FF6600', // Orange for medium health
        low: '#8B0000' // Dark red for low health
      }
    });

    // Super Elite label
    this.drawLabel(ctx, 'SUPER ELITE', {
      yOffset: -30,
      fontSize: 10,
      fillColor: '#FF0000',
      strokeColor: '#000'
    });
  }
}

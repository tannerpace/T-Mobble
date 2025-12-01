/**
 * EliteEnemy - Stronger enemy that drops valuable coins on death
 */
import { BaseEnemy } from './BaseEnemy.js';

export class EliteEnemy extends BaseEnemy {
  constructor(canvas, gameSpeed) {
    super(canvas, gameSpeed, {
      width: 55,
      height: 65,
      health: 8,
      xpValue: 25,
      speedMultiplier: 0.75, // Slightly faster than tank, slower than normal
      type: 'elite'
    });

    // Override X position for variation
    this.x = canvas.width + Math.random() * 250;

    // Elite-specific properties
    this.coinValue = 2; // Drops a 2x value coin
  }

  draw(ctx) {
    // Different emoji based on damage
    let emoji = '🐉'; // Dragon for elite
    if (this.health <= 3) {
      emoji = '👹'; // Demon when heavily damaged
    } else if (this.health <= 5) {
      emoji = '😈'; // Devil when moderately damaged
    }

    this.drawEmoji(ctx, emoji, 55);

    // Elite-styled health bar with border
    this.drawHealthBar(ctx, {
      barWidth: 50,
      barHeight: 5,
      yOffset: -15,
      showBorder: true,
      borderColor: '#FFD700',
      colors: {
        high: '#9D00FF', // Purple for elite at high health
        medium: '#FF6600', // Orange for medium health
        low: '#FF0000' // Red for low health
      }
    });

    // Elite label
    this.drawLabel(ctx, 'ELITE');
  }

  // Return the coin value this enemy drops
  getCoinDrop() {
    return this.coinValue;
  }
}

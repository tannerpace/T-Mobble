/**
 * XPGem - Collectible experience points dropped by enemies
 */
import { Collectible } from './Collectible.js';

export class XPGem extends Collectible {
  constructor(x, y, value = 10) {
    super(x, y, 16, 16, 2);
    this.xpValue = value;

    // Choose gem emoji based on value
    if (value >= 50) {
      this.emoji = '💎'; // Diamond for high value
    } else if (value >= 20) {
      this.emoji = '🔷'; // Blue diamond for medium
    } else {
      this.emoji = '💠'; // Blue gem for low
    }
  }

  draw(ctx) {
    this.drawEmoji(ctx, {
      fontSize: 16,
      bounce: true,
      glow: this.magnetized,
      glowColor: '#FFD700'
    });
  }

  collect() {
    this.collected = true;
    return this.xpValue;
  }
}

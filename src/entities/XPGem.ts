/**
 * XPGem - Collectible experience points dropped by enemies
 */
import { Collectible } from './Collectible';

export class XPGem extends Collectible {
  public xpValue: number;

  constructor(x: number, y: number, value: number = 10) {
    super(x, y, 16, 16, 2);
    this.xpValue = value;

    if (value >= 50) {
      this.emoji = '💎';
    } else if (value >= 20) {
      this.emoji = '🔷';
    } else {
      this.emoji = '💠';
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawEmoji(ctx, {
      fontSize: 16,
      bounce: true,
      glow: this.magnetized,
      glowColor: '#FFD700'
    });
  }

  collect(): number {
    this.collected = true;
    return this.xpValue;
  }
}

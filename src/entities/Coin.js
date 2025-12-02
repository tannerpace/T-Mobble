/**
 * Coin - Collectible currency dropped by enemies
 */
import { Collectible } from './Collectible.js';

export class Coin extends Collectible {
  constructor(x, y, value = 1) {
    super(x, y, 20, 20, 2);
    this.coinValue = value;

    // Visual representation based on value
    if (value >= 2) {
      this.emoji = '💰'; // Money bag for high value (2x+)
      this.glowColor = '#FFD700'; // Gold glow
    } else {
      this.emoji = '💵'; // Regular coin (money emoji)
      this.glowColor = '#FFA500'; // Orange glow
    }
  }
  // todo: make all coins worth the same but increase the number of coins dropped harder enemies drop more coins...

  /**
   * Update coin position with custom magnet speed
   * Coins use faster magnet speed (5) than default collectibles (4)
   * @param {Object} dino - Target entity for magnet effect
   * @param {number} magnetRange - Range at which magnet activates
   */
  update(dino, magnetRange = 0) {
    if (this.collected) return;

    this.frameCount++;

    // Apply magnet if in range (coins use faster magnet speed of 5)
    if (this.applyMagnet(dino, magnetRange, 5)) {
      return;
    }

    // Normal movement (drift left)
    this.x -= this.speed;
  }

  draw(ctx) {
    if (this.collected) return;

    const bounce = this.getBounceOffset();
    const { x: centerX, y: centerY } = this.getCenter();

    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect when magnetized or for high-value coins
    if (this.magnetized || this.coinValue >= 2) {
      ctx.shadowColor = this.glowColor;
      ctx.shadowBlur = this.magnetized ? 15 : 8;
    }

    ctx.fillText(this.emoji, centerX, centerY + bounce);
    ctx.shadowBlur = 0;

    // Show value indicator for special coins
    if (this.coinValue > 1) {
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(`x${this.coinValue}`, centerX, this.y - 8);
      ctx.fillText(`x${this.coinValue}`, centerX, this.y - 8);
    }
  }

  collect() {
    this.collected = true;
    return this.coinValue;
  }
}

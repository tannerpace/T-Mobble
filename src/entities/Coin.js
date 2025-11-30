/**
 * Coin - Collectible currency dropped by enemies
 */
export class Coin {
  constructor(x, y, value = 1) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.coinValue = value; // Coin value (1 = normal, 2 = double, etc.)
    this.speed = 2;
    this.collected = false;
    this.magnetized = false;

    // Animation
    this.frameCount = 0;
    this.floatOffset = 0;

    // Visual representation based on value
    if (value >= 2) {
      this.emoji = '💰'; // Money bag for high value (2x+)
      this.glowColor = '#FFD700'; // Gold glow
    } else {
      this.emoji = '🪙'; // Regular coin
      this.glowColor = '#FFA500'; // Orange glow
    }
  }

  draw(ctx) {
    if (this.collected) return;

    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Floating animation
    const bounce = Math.sin(this.frameCount / 10) * 2;

    // Glow effect when magnetized or for high-value coins
    if (this.magnetized || this.coinValue >= 2) {
      ctx.shadowColor = this.glowColor;
      ctx.shadowBlur = this.magnetized ? 15 : 8;
    }

    ctx.fillText(this.emoji, this.x + this.width / 2, this.y + this.height / 2 + bounce);

    ctx.shadowBlur = 0;

    // Show value indicator for special coins
    if (this.coinValue > 1) {
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(`x${this.coinValue}`, this.x + this.width / 2, this.y - 8);
      ctx.fillText(`x${this.coinValue}`, this.x + this.width / 2, this.y - 8);
    }
  }

  update(dino, magnetRange = 0) {
    if (this.collected) return;

    this.frameCount++;

    // Check if in magnet range
    if (magnetRange > 0 && dino) {
      const dx = dino.x - this.x;
      const dy = dino.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < magnetRange) {
        this.magnetized = true;
        // Move towards player
        const angle = Math.atan2(dy, dx);
        const magnetSpeed = 5;
        this.x += Math.cos(angle) * magnetSpeed;
        this.y += Math.sin(angle) * magnetSpeed;
        return;
      }
    }

    // Normal movement (slight drift left)
    this.x -= this.speed;
  }

  checkCollision(dino) {
    if (this.collected) return false;

    return (
      dino.x < this.x + this.width &&
      dino.x + dino.width > this.x &&
      dino.y < this.y + this.height &&
      dino.y + dino.height > this.y
    );
  }

  collect() {
    this.collected = true;
    return this.coinValue;
  }

  isOffScreen() {
    return this.x + this.width < -50; // Give some buffer for magnet
  }
}

/**
 * XPGem - Collectible experience points dropped by enemies
 */
export class XPGem {
  constructor(x, y, value = 10) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.xpValue = value;
    this.speed = 2;
    this.collected = false;
    this.magnetized = false;
    this.targetX = 0;
    this.targetY = 0;

    // Animation
    this.frameCount = 0;
    this.floatOffset = 0;

    // Choose gem color based on value
    if (value >= 50) {
      this.color = '💎'; // Diamond for high value
    } else if (value >= 20) {
      this.color = '🔷'; // Blue diamond for medium
    } else {
      this.color = '💠'; // Blue gem for low
    }
  }

  draw(ctx) {
    if (this.collected) return;

    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Floating animation
    const bounce = Math.sin(this.frameCount / 10) * 2;

    // Glow effect when magnetized
    if (this.magnetized) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
    }

    ctx.fillText(this.color, this.x + this.width / 2, this.y + this.height / 2 + bounce);

    ctx.shadowBlur = 0;
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
        const magnetSpeed = 4;
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
    return this.xpValue;
  }

  isOffScreen() {
    return this.x + this.width < -50; // Give some buffer for magnet
  }
}

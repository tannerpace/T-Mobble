/**
 * PowerUp entity - collectible that gives ammo for shooting
 */
export class PowerUp {
  constructor(canvas, gameSpeed) {
    this.canvas = canvas;
    this.x = canvas.width + Math.random() * 400;
    this.y = 100 + Math.random() * 40;
    this.width = 24;
    this.height = 24;
    this.speed = gameSpeed * 0.8;
    this.collected = false;

    // Random food emoji
    const foodEmojis = ['🍕', '🍔', '🍟', '🌭', '🍗', '🥓', '🌮', '🌯', '🍖', '🍜'];
    this.emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
  }

  draw(ctx, frameCount) {
    if (this.collected) return;

    // Draw food emoji
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Slight bounce animation
    const bounce = Math.sin(frameCount / 10) * 2;

    ctx.fillText(this.emoji, this.x + this.width / 2, this.y + this.height / 2 + bounce);
  }

  update() {
    if (!this.collected) {
      this.x -= this.speed;
    }
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

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

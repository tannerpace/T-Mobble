/**
 * PowerUp entity - collectible that gives ammo for shooting
 */
export class PowerUp {
  constructor(canvas, gameSpeed) {
    this.canvas = canvas;
    this.x = canvas.width + Math.random() * 400;
    this.y = 100 + Math.random() * 40;
    this.width = 20;
    this.height = 20;
    this.speed = gameSpeed * 0.8;
    this.collected = false;
  }

  draw(ctx, frameCount) {
    if (this.collected) return;

    // Draw a glowing power-up orb
    ctx.fillStyle = '#FFD700'; // Gold color
    ctx.fillRect(this.x + 5, this.y, 10, 20);
    ctx.fillRect(this.x, this.y + 5, 20, 10);

    // Inner glow
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(this.x + 8, this.y + 8, 4, 4);

    // Sparkle effect
    const sparkle = Math.floor(frameCount / 10) % 2 === 0;
    if (sparkle) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(this.x + 2, this.y + 10, 2, 2);
      ctx.fillRect(this.x + 16, this.y + 10, 2, 2);
    }
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

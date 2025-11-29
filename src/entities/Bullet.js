/**
 * Bullet entity - projectile that can destroy obstacles
 */
export class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 4;
    this.speed = 8;
    this.active = true;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.fillStyle = '#FF4500'; // Orange-red bullet
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Bullet glow effect
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(this.x + 2, this.y + 1, 6, 2);
  }

  update() {
    if (this.active) {
      this.x += this.speed;
    }
  }

  checkCollision(obstacle) {
    if (!this.active) return false;

    return (
      this.x < obstacle.x + obstacle.width &&
      this.x + this.width > obstacle.x &&
      this.y < obstacle.y + obstacle.height &&
      this.y + this.height > obstacle.y
    );
  }

  isOffScreen(canvasWidth) {
    return this.x > canvasWidth;
  }
}

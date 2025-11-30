/**
 * HealthPickup - Red heart that restores health
 */
export class HealthPickup {
  constructor(canvas, gameSpeed) {
    this.canvas = canvas;
    this.x = canvas.width + Math.random() * 600; // Spawn further right than coins
    this.y = 100 + Math.random() * 60;
    this.width = 24;
    this.height = 24;
    this.speed = gameSpeed * 0.7; // Slightly slower than coins
    this.collected = false;
    this.healAmount = 1; // Restores 1 heart
  }

  draw(ctx, frameCount) {
    if (this.collected) return;

    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Gentle pulse animation
    const scale = 1 + Math.sin(frameCount / 8) * 0.1;
    const bounce = Math.sin(frameCount / 10) * 2;

    // Add glow effect
    ctx.shadowColor = 'rgba(255, 100, 100, 0.5)';
    ctx.shadowBlur = 15;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + bounce);
    ctx.scale(scale, scale);
    ctx.fillText('❤️', 0, 0);
    ctx.restore();

    ctx.shadowBlur = 0;
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

  collect() {
    this.collected = true;
    return this.healAmount;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

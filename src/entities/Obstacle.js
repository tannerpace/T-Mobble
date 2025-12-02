/**
 * Obstacle entity - cacti that the dino must avoid
 */
export class Obstacle {
  constructor(canvas, gameSpeed) {
    this.canvas = canvas;

    this.x = canvas.width;
    this.width = 30;
    this.height = 40 + Math.random() * 20;
    this.y = canvas.height * 0.8 - this.height;
    this.speed = gameSpeed;
  }

  draw(ctx) {
    // Draw cactus emoji
    const fontSize = this.height;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('🌵', this.x + this.width / 2, this.y + this.height);
  }

  update() {
    this.x -= this.speed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

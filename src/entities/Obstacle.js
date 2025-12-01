/**
 * Obstacle entity - palm trees that the dino must avoid
 */
export class Obstacle {
  constructor(canvas, gameSpeed, palmImg) {
    this.canvas = canvas;
    this.palmImg = palmImg;

    this.x = canvas.width;
    this.width = 20;
    this.height = 40 + Math.random() * 20;
    this.y = canvas.height * 0.8 - this.height;
    this.speed = gameSpeed;
  }

  draw(ctx) {
    // Draw cactus emoji centered on the obstacle
    ctx.font = `${this.height}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌵', this.x + this.width / 2, this.y + this.height / 2);
  }

  update() {
    this.x -= this.speed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

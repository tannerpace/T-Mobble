/**
 * Obstacle entity - palm trees that the dino must avoid
 */
export class Obstacle {
  constructor(canvas, gameSpeed, palmImg) {
    this.canvas = canvas;
    this.palmImg = palmImg;

    this.x = canvas.width;
    this.y = 150;
    this.width = 20;
    this.height = 40 + Math.random() * 20;
    this.speed = gameSpeed;
  }

  draw(ctx) {
    // Draw palm tree image
    if (this.palmImg.complete) {
      ctx.drawImage(this.palmImg, this.x, this.y, this.width, this.height);
    } else {
      // Fallback while image loads
      ctx.fillStyle = '#535353';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    this.x -= this.speed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

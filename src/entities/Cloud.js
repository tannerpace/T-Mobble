/**
 * Cloud entity - decorative background element
 */
export class Cloud {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = canvas.width + Math.random() * 200;
    this.y = 20 + Math.random() * 60;
    this.width = 40 + Math.random() * 20;
    this.height = 20;
    this.speed = 1;
  }

  draw(ctx) {
    ctx.fillStyle = '#d3d3d3';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillRect(this.x + 10, this.y - 8, this.width - 20, this.height);
  }

  update() {
    this.x -= this.speed;
    if (this.x + this.width < 0) {
      this.x = this.canvas.width;
      this.y = 20 + Math.random() * 60;
    }
  }
}

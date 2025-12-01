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
    // Draw cactus emoji from bottom (so it sits on ground)
    ctx.font = `${this.height}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    // Add small offset to account for emoji glyph positioning
    ctx.fillText('\ud83c\udf35', this.x + this.width / 2, this.y + this.height + (this.height * 0.1));
  }

  update() {
    this.x -= this.speed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

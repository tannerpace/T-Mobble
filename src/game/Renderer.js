/**
 * Renderer - handles all game drawing operations
 */
export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }

  /**
   * Apply screen shake effect
   * @param {number} intensity - Shake intensity in pixels
   * @param {number} duration - Duration in frames
   */
  screenShake(intensity = 5, duration = 10) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  /**
   * Clear the entire canvas
   */
  clear() {
    // Apply shake offset
    let offsetX = 0;
    let offsetY = 0;

    if (this.shakeDuration > 0) {
      offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeDuration--;

      // Reduce intensity over time
      if (this.shakeDuration % 2 === 0 && this.shakeIntensity > 0) {
        this.shakeIntensity *= 0.8;
      }
    }

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.clearRect(-offsetX, -offsetY, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Draw the ground line
   */
  drawGround(frameCount, gameSpeed) {
    this.ctx.strokeStyle = '#535353';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 194);
    this.ctx.lineTo(this.canvas.width, 194);
    this.ctx.stroke();

    // Dashed ground pattern
    this.ctx.setLineDash([10, 10]);
    const offset = (frameCount * gameSpeed) % 20;
    this.ctx.beginPath();
    this.ctx.moveTo(-offset, 196);
    this.ctx.lineTo(this.canvas.width, 196);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Draw power-up counter in top-left corner
   */
  drawPowerUpCounter(powerUpCount) {
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 16px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('⚡ x ' + powerUpCount, 20, 30);
  }

  /**
   * Draw game over screen
   */
  drawGameOver() {
    this.ctx.fillStyle = '#535353';
    this.ctx.font = 'bold 30px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

    this.ctx.font = '16px Courier New';
    this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  /**
   * Draw start screen
   */
  drawStartScreen() {
    this.ctx.fillStyle = '#535353';
    this.ctx.font = '20px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Press SPACE to Start', this.canvas.width / 2, this.canvas.height / 2);
  }
}

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
   * Draw the ground with sand and grass
   */
  drawGround(frameCount, gameSpeed) {
    this.ctx.save(); // Save context state to prevent affecting other draws

    // Ground level at 80% of canvas height
    const groundY = this.canvas.height * 0.8;
    const groundHeight = this.canvas.height - groundY;

    // Draw sand base (fills from ground line to bottom of canvas)
    this.ctx.fillStyle = '#E6D5A8'; // Sandy tan color
    this.ctx.fillRect(0, groundY, this.canvas.width, groundHeight);

    // Add darker sand gradient at bottom for depth
    const sandGradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
    sandGradient.addColorStop(0, 'rgba(210, 180, 140, 0)');
    sandGradient.addColorStop(1, 'rgba(180, 150, 100, 0.5)');
    this.ctx.fillStyle = sandGradient;
    this.ctx.fillRect(0, groundY, this.canvas.width, groundHeight);

    // Draw grass tufts on top of sand
    const grassColor1 = '#4A7C23'; // Dark green
    const grassColor2 = '#6B8E23'; // Yellow-green
    const grassColor3 = '#228B22'; // Forest green

    // Animated grass offset for parallax effect (slower movement)
    const grassOffset = (frameCount * gameSpeed * 0.15) % 30;

    // Draw multiple layers of grass for depth
    for (let x = -grassOffset; x < this.canvas.width + 30; x += 8) {
      // Vary grass height and color for natural look
      const variation = Math.sin(x * 0.3) * 2;
      const grassHeight = 12 + variation + Math.sin(x * 0.7) * 3;

      // Alternate grass colors
      const colorChoice = Math.floor(x / 8) % 3;
      this.ctx.fillStyle = colorChoice === 0 ? grassColor1 : (colorChoice === 1 ? grassColor2 : grassColor3);

      // Draw grass blade (triangle shape)
      this.ctx.beginPath();
      this.ctx.moveTo(x, groundY);
      this.ctx.lineTo(x + 3, groundY - grassHeight);
      this.ctx.lineTo(x + 6, groundY);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Draw a few taller grass tufts for variety
    for (let x = -grassOffset * 1.5; x < this.canvas.width + 30; x += 25) {
      const tallGrassHeight = 18 + Math.sin(x * 0.2) * 4;
      this.ctx.fillStyle = grassColor1;

      this.ctx.beginPath();
      this.ctx.moveTo(x, groundY);
      this.ctx.lineTo(x + 2, groundY - tallGrassHeight);
      this.ctx.lineTo(x + 4, groundY);
      this.ctx.closePath();
      this.ctx.fill();

      // Second blade leaning slightly
      this.ctx.beginPath();
      this.ctx.moveTo(x + 5, groundY);
      this.ctx.lineTo(x + 8, groundY - tallGrassHeight * 0.8);
      this.ctx.lineTo(x + 10, groundY);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Add small pebbles/dots in sand for texture
    this.ctx.fillStyle = 'rgba(139, 119, 101, 0.4)';
    for (let x = -grassOffset * 0.3; x < this.canvas.width + 20; x += 40) {
      const pebbleY = groundY + 8 + Math.sin(x * 0.5) * 3;
      this.ctx.beginPath();
      this.ctx.arc(x, pebbleY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore(); // Restore context state
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

/**
 * FlyingEnemy - Flying obstacle at variable heights
 */
export class FlyingEnemy {
  constructor(canvas, gameSpeed) {
    this.canvas = canvas;
    this.x = canvas.width + Math.random() * 200;
    // Flying height - upper third of canvas (15-45% from top)
    this.y = canvas.height * 0.15 + Math.random() * (canvas.height * 0.3);
    this.width = 35;
    this.height = 30;
    this.speed = gameSpeed * (0.9 + Math.random() * 0.4); // Varies speed
    this.health = 1;
    this.maxHealth = 1;
    this.xpValue = 5; // Reduced XP for better balance
    this.type = 'flying';

    // Animation
    this.frameCount = 0;
    this.wingFrame = 0;
  }

  draw(ctx) {
    // Pterodactyl emoji or simple representation
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Flap animation
    const emoji = this.wingFrame === 0 ? '🦅' : '🦉';
    ctx.fillText(emoji, this.x + this.width / 2, this.y + this.height / 2);

    // Health bar if damaged
    if (this.health < this.maxHealth) {
      const barWidth = 30;
      const barHeight = 3;
      const healthPercent = this.health / this.maxHealth;

      ctx.fillStyle = '#FF0000';
      ctx.fillRect(this.x + (this.width - barWidth) / 2, this.y - 10, barWidth, barHeight);
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(this.x + (this.width - barWidth) / 2, this.y - 10, barWidth * healthPercent, barHeight);
    }
  }

  update() {
    this.x -= this.speed;

    // Slight bobbing motion
    this.frameCount++;
    if (this.frameCount % 15 === 0) {
      this.wingFrame = (this.wingFrame + 1) % 2;
    }
  }

  takeDamage(amount = 1) {
    this.health -= amount;
    return this.health <= 0;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  isDead() {
    return this.health <= 0;
  }
}

/**
 * TankEnemy - Slow, tanky obstacle requiring multiple hits
 */
export class TankEnemy {
  constructor(canvas, gameSpeed) {
    this.canvas = canvas;
    this.x = canvas.width + Math.random() * 300;
    this.width = 50;
    this.height = 60;
    this.y = canvas.height * 0.8 - this.height; // Ground level (dynamic)
    this.speed = gameSpeed * 0.6; // Slower than normal
    this.health = 5; // Takes 5 hits
    this.maxHealth = 5;
    this.xpValue = 15; // Reduced XP for better balance
    this.type = 'tank';
  }

  draw(ctx) {
    // Tank-like representation
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Different emoji based on damage
    let emoji = '🦏'; // Rhino for tank
    if (this.health <= 2) {
      emoji = '🐘'; // Elephant when damaged
    }

    ctx.fillText(emoji, this.x + this.width / 2, this.y + this.height / 2);

    // Health bar
    const barWidth = 40;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;

    ctx.fillStyle = '#333';
    ctx.fillRect(this.x + (this.width - barWidth) / 2, this.y - 12, barWidth, barHeight);

    // Color based on health
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00FF00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#FFAA00';
    } else {
      ctx.fillStyle = '#FF0000';
    }
    ctx.fillRect(this.x + (this.width - barWidth) / 2, this.y - 12, barWidth * healthPercent, barHeight);
  }

  update() {
    this.x -= this.speed;
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

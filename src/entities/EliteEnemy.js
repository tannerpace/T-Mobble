/**
 * EliteEnemy - Stronger enemy that drops valuable coins on death
 */
export class EliteEnemy {
  constructor(canvas, gameSpeed) {
    this.canvas = canvas;
    this.x = canvas.width + Math.random() * 250;
    this.width = 55;
    this.height = 65;
    this.y = canvas.height * 0.8 - this.height; // Ground level (dynamic)
    this.speed = gameSpeed * 0.75; // Slightly faster than tank, slower than normal
    this.health = 8; // Takes 8 hits - stronger than tank
    this.maxHealth = 8;
    this.xpValue = 25; // Good XP reward
    this.coinValue = 2; // Drops a 2x value coin
    this.type = 'elite';

    // Animation
    this.frameCount = 0;
    this.damageFlash = 0;
  }

  draw(ctx) {
    // Elite enemy representation - dragon/demon for danger
    ctx.font = '55px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Different emoji based on damage
    let emoji = '🐉'; // Dragon for elite
    if (this.health <= 3) {
      emoji = '👹'; // Demon when heavily damaged
    } else if (this.health <= 5) {
      emoji = '😈'; // Devil when moderately damaged
    }

    // Damage flash effect
    if (this.damageFlash > 0) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
      this.damageFlash--;
    }

    ctx.fillText(emoji, this.x + this.width / 2, this.y + this.height / 2);
    ctx.shadowBlur = 0;

    // Health bar with elite styling
    const barWidth = 50;
    const barHeight = 5;
    const healthPercent = this.health / this.maxHealth;

    // Background (black)
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + (this.width - barWidth) / 2, this.y - 15, barWidth, barHeight);

    // Health color gradient based on percentage
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#9D00FF'; // Purple for elite at high health
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#FF6600'; // Orange for medium health
    } else {
      ctx.fillStyle = '#FF0000'; // Red for low health
    }
    ctx.fillRect(this.x + (this.width - barWidth) / 2, this.y - 15, barWidth * healthPercent, barHeight);

    // Elite border on health bar
    ctx.strokeStyle = '#FFD700'; // Gold border
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + (this.width - barWidth) / 2, this.y - 15, barWidth, barHeight);

    // Elite indicator above health bar
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText('ELITE', this.x + this.width / 2, this.y - 22);
    ctx.fillText('ELITE', this.x + this.width / 2, this.y - 22);
  }

  update() {
    this.x -= this.speed;
    this.frameCount++;
  }

  takeDamage(amount = 1) {
    this.health -= amount;
    this.damageFlash = 3; // Flash for 3 frames
    return this.health <= 0;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  isDead() {
    return this.health <= 0;
  }

  // Return the coin value this enemy drops
  getCoinDrop() {
    return this.coinValue;
  }
}

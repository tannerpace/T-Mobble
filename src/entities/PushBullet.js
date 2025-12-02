/**
 * PushBullet entity - projectile that pushes enemies without dealing damage
 */
export class PushBullet {
  constructor(x, y, angle = 0, speed = 10, knockbackForce = 30) {
    this.x = x;
    this.y = y;
    this.startX = x; // Track starting position for range calculation
    this.startY = y; // Track starting Y position for angled shots
    this.width = 15;
    this.height = 8;
    this.angle = angle; // Angle in degrees
    this.speed = speed;
    this.knockbackForce = knockbackForce; // How far to push enemies
    this.active = true;
    this.maxRange = 400; // Longer range than damage bullets
    // Track hit enemies to avoid hitting the same enemy multiple times
    // This Set's lifecycle is tied to the bullet instance (limited by maxRange/lifespan)
    this.hitEnemies = new Set();

    // Calculate velocity based on angle
    const radians = (angle * Math.PI) / 180;
    this.vx = Math.cos(radians) * this.speed;
    this.vy = Math.sin(radians) * this.speed;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.angle * Math.PI) / 180);

    // Draw blue/cyan push bullet with wave effect
    ctx.fillStyle = '#00BFFF'; // Deep sky blue
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Inner glow effect
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-this.width / 2 + 3, -this.height / 2 + 2, this.width - 6, this.height - 4);

    // Draw wave rings to indicate push effect
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  update() {
    if (this.active) {
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  checkCollision(enemy) {
    if (!this.active) return false;
    
    // Don't hit the same enemy twice
    if (this.hitEnemies.has(enemy)) return false;

    const hit = (
      this.x < enemy.x + enemy.width &&
      this.x + this.width > enemy.x &&
      this.y < enemy.y + enemy.height &&
      this.y + this.height > enemy.y
    );

    if (hit) {
      this.hitEnemies.add(enemy);
      // Push bullet stays active to hit multiple enemies
      // It only deactivates when it reaches max range or goes off screen
    }

    return hit;
  }

  isOffScreen(canvasWidth) {
    // Calculate actual distance traveled using Euclidean distance (works for angled shots)
    const dx = this.x - this.startX;
    const dy = this.y - this.startY;
    const distanceTraveled = Math.sqrt(dx * dx + dy * dy);
    
    if (distanceTraveled > this.maxRange) {
      return true;
    }
    // Check if bullet is outside visible area
    return this.x > canvasWidth || this.x < -this.width || this.y < -this.height || this.y > 600;
  }
}

/**
 * Bullet entity - projectile that can destroy obstacles
 */
export class Bullet {
  constructor(x, y, angle = 0, speed = 8, pierceCount = 0) {
    this.x = x;
    this.y = y;
    this.startX = x; // Track starting position for range
    this.width = 10;
    this.height = 4;
    this.angle = angle; // Angle in degrees
    this.speed = speed;
    this.pierceCount = pierceCount; // How many enemies it can pierce through
    this.hitCount = 0; // How many enemies it has hit
    this.active = true;
    this.maxRange = 300; // Default range, can be overridden
    this.damage = 1; // Damage dealt to enemies
    this.knockback = 0; // Knockback force applied to enemies

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

    ctx.fillStyle = '#FF4500'; // Orange-red bullet
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Bullet glow effect
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 1, 6, 2);

    ctx.restore();
  }

  update() {
    if (this.active) {
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  checkCollision(obstacle) {
    if (!this.active) return false;

    const hit = (
      this.x < obstacle.x + obstacle.width &&
      this.x + this.width > obstacle.x &&
      this.y < obstacle.y + obstacle.height &&
      this.y + this.height > obstacle.y
    );

    if (hit) {
      this.hitCount++;
      // Deactivate if we've hit more than we can pierce
      if (this.hitCount > this.pierceCount) {
        this.active = false;
      }
    }

    return hit;
  }

  isOffScreen(canvasWidth) {
    // Check if bullet exceeded max range
    const distanceTraveled = this.x - this.startX;
    if (distanceTraveled > this.maxRange) {
      return true;
    }
    return this.x > canvasWidth;
  }
}

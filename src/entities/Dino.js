/**
 * Dino entity - the player character
 */
export class Dino {
  constructor(canvas, gravity, assets) {
    this.canvas = canvas;
    this.gravity = gravity;
    this.trexImg = assets.trexImg;
    this.jumpSound = assets.jumpSound;

    // Position and dimensions
    this.x = 50;
    this.y = 150;
    this.width = 40;
    this.height = 44;

    // Physics
    this.dy = 0;
    this.jumpPower = -12;
    this.grounded = false;
    this.jumping = false;
  }

  draw(ctx) {
    // Draw T-Rex image
    if (this.trexImg.complete) {
      ctx.drawImage(this.trexImg, this.x, this.y, this.width, this.height);
    } else {
      // Fallback while image loads
      ctx.fillStyle = '#535353';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    // Apply gravity
    if (this.y < 150) {
      this.dy += this.gravity;
      this.grounded = false;
    } else {
      this.y = 150;
      this.grounded = true;
      this.jumping = false;
      if (this.dy > 0) {
        this.dy = 0;
      }
    }

    this.y += this.dy;
  }

  jump() {
    console.log('Jump called! grounded:', this.grounded, 'jumping:', this.jumping);
    if (this.grounded && !this.jumping) {
      this.dy = this.jumpPower;
      this.jumping = true;
      console.log('JUMP! dy set to:', this.dy);

      // Play jump sound
      this.jumpSound.currentTime = 0;
      this.jumpSound.play().catch(e => console.log('Audio play failed:', e));
    } else {
      console.log('Cannot jump - conditions not met');
    }
  }

  reset() {
    this.y = 150;
    this.dy = 0;
    this.jumping = false;
    this.grounded = false;
  }
}

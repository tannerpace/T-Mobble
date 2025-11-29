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
    this.jumpHoldTime = 0;
    this.maxJumpHoldTime = 15; // frames
    this.isHoldingJump = false;

    // Animation
    this.animationFrame = 0;
    this.animationSpeed = 5; // Change animation every 5 frames
    this.frameCount = 0;
  }

  draw(ctx) {
    // Draw T-Rex image with animation
    if (this.trexImg.complete) {
      // If grounded, apply walking animation by slightly offsetting Y position
      // to create a bobbing effect
      let yOffset = 0;
      if (this.grounded && !this.jumping) {
        // Create a subtle bobbing motion (1 pixel up and down)
        yOffset = this.animationFrame === 0 ? 0 : -1;
      }

      ctx.drawImage(this.trexImg, this.x, this.y + yOffset, this.width, this.height);
    } else {
      // Fallback while image loads
      ctx.fillStyle = '#535353';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    // Apply gravity
    if (this.y < 150) {
      // Variable jump: if not holding jump and moving upward, cut the jump short
      if (this.jumping && !this.isHoldingJump && this.dy < 0) {
        // Immediately reduce upward velocity when releasing jump button
        this.dy += this.gravity * 2; // Much faster falloff
      } else {
        // Normal gravity
        this.dy += this.gravity;
      }

      this.grounded = false;
    } else {
      this.y = 150;
      this.grounded = true;
      this.jumping = false;
      this.jumpHoldTime = 0;
      if (this.dy > 0) {
        this.dy = 0;
      }
    }

    this.y += this.dy;

    // Update walking animation when grounded
    if (this.grounded && !this.jumping) {
      this.frameCount++;
      if (this.frameCount >= this.animationSpeed) {
        this.animationFrame = (this.animationFrame + 1) % 2; // Toggle between 0 and 1
        this.frameCount = 0;
      }
    }
  }

  jump() {
    console.log('Jump called! grounded:', this.grounded, 'jumping:', this.jumping);
    if (this.grounded && !this.jumping) {
      this.dy = this.jumpPower;
      this.jumping = true;
      this.isHoldingJump = true;
      this.jumpHoldTime = 0;
      console.log('JUMP! dy set to:', this.dy);

      // Play jump sound
      this.jumpSound.currentTime = 0;
      this.jumpSound.play().catch(e => console.log('Audio play failed:', e));
    } else {
      console.log('Cannot jump - conditions not met');
    }
  }

  /**
   * Called when jump button is released
   */
  releaseJump() {
    this.isHoldingJump = false;
  }

  reset() {
    this.y = 150;
    this.dy = 0;
    this.jumping = false;
    this.grounded = false;
    this.jumpHoldTime = 0;
    this.isHoldingJump = false;
    this.animationFrame = 0;
    this.frameCount = 0;
  }
}

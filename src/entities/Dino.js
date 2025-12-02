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
    this.width = 40;
    this.height = 44;

    // Ground position (80% of canvas height minus dino height)
    this.groundY = this.canvas.height * 0.8 - this.height;
    this.y = this.groundY;

    // Physics
    this.dy = 0;
    this.jumpPower = -7; // Initial upward velocity - controls jump height
    this.grounded = false;
    this.jumping = false;

    // Health system
    this.maxHealth = 5;
    this.health = this.maxHealth;
    this.invulnerable = false;
    this.invulnerabilityTime = 120; // 2 seconds at 60fps
    this.invulnerabilityCounter = 0;

    // Animation
    this.animationFrame = 0;
    this.animationSpeed = 5; // Change animation every 5 frames
    this.frameCount = 0;
  }

  draw(ctx) {
    // Draw T-Rex image with animation
    // Check both complete and naturalWidth to ensure image loaded successfully
    if (this.trexImg.complete && this.trexImg.naturalWidth > 0) {
      // If grounded, apply walking animation by slightly offsetting Y position
      // to create a bobbing effect
      let yOffset = 0;
      if (this.grounded && !this.jumping) {
        // Create a subtle bobbing motion (1 pixel up and down)
        yOffset = this.animationFrame === 0 ? 0 : -1;
      }

      // Flicker effect when invulnerable
      if (this.invulnerable && Math.floor(this.invulnerabilityCounter / 5) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      ctx.drawImage(this.trexImg, this.x, this.y + yOffset, this.width, this.height);
      ctx.globalAlpha = 1.0;
    } else {
      // Fallback while image loads
      ctx.fillStyle = '#535353';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    // Update ground position in case canvas resized
    this.groundY = this.canvas.height * 0.8 - this.height;

    // Apply gravity
    if (this.y < this.groundY) {
      this.dy += this.gravity;
      this.grounded = false;
    } else {
      this.y = this.groundY;
      this.grounded = true;
      this.jumping = false;
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

    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerabilityCounter--;
      if (this.invulnerabilityCounter <= 0) {
        this.invulnerable = false;
      }
    }
  }

  jump() {
    // Simple jump - only when grounded
    if (this.grounded && !this.jumping) {
      this.dy = this.jumpPower;
      this.jumping = true;

      // Play jump sound
      this.jumpSound.currentTime = 0;
      this.jumpSound.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  /**
   * Take damage
   * @returns {boolean} True if damage was taken, false if invulnerable or dead
   */
  takeDamage() {
    if (this.invulnerable || this.health <= 0) {
      return false;
    }

    this.health--;
    if (this.health > 0) {
      this.invulnerable = true;
      this.invulnerabilityCounter = this.invulnerabilityTime;
    }
    return true;
  }

  /**
   * Heal the player
   * @param {number} amount - Amount to heal
   */
  heal(amount = 1) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  /**
   * Check if player is dead
   */
  isDead() {
    return this.health <= 0;
  }

  /**
   * Apply upgrade effects to dino
   */
  applyUpgradeEffects(effects) {
    this.maxHealth = 5 + effects.maxHealthBonus;
    this.health = Math.min(this.health, this.maxHealth);
    // Jump power can be upgraded via effects.jumpPowerMod
    this.jumpPower = -7 * effects.jumpPowerMod;
  }

  reset() {
    this.groundY = this.canvas.height * 0.8 - this.height;
    this.y = this.groundY;
    this.dy = 0;
    this.jumping = false;
    this.grounded = false;
    this.animationFrame = 0;
    this.frameCount = 0;
    this.health = this.maxHealth;
    this.invulnerable = false;
    this.invulnerabilityCounter = 0;
  }
}

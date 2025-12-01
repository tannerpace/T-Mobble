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
    this.jumpPower = -12;
    this.grounded = false;
    this.jumping = false;
    this.jumpHoldTime = 0;
    this.maxJumpHoldTime = 15; // frames
    this.isHoldingJump = false;

    // Health system
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.invulnerable = false;
    this.invulnerabilityTime = 120; // 2 seconds at 60fps
    this.invulnerabilityCounter = 0;

    // Double jump system
    this.hasDoubleJump = false;
    this.doubleJumpAvailable = false;

    // Animation
    this.animationFrame = 0;
    this.animationSpeed = 5; // Change animation every 5 frames
    this.frameCount = 0;

    // Upgrade visual effects
    this.upgradeEffects = {
      toughSkin: 0,
      evasion: 0,
      speedBoost: 0,
      magnet: 0,
      damageMultiplier: 1.0
    };
  }

  draw(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Draw upgrade effects BEFORE the dino (so they appear behind)

    // Shield aura for Tough Skin (blue glow that pulses and grows)
    if (this.upgradeEffects.toughSkin > 0) {
      const shieldSize = 5 + (this.upgradeEffects.toughSkin * 8);
      const pulse = Math.sin(Date.now() / 300) * 3;
      ctx.save();
      ctx.globalAlpha = 0.3 + (this.upgradeEffects.toughSkin * 0.1);
      ctx.strokeStyle = '#4444FF';
      ctx.lineWidth = 2 + this.upgradeEffects.toughSkin;
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.width / 2 + shieldSize + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glow
      ctx.fillStyle = '#4444FF';
      ctx.globalAlpha = 0.1;
      ctx.fill();
      ctx.restore();
    }

    // Speed trails (yellow/electric)
    if (this.upgradeEffects.speedBoost > 0 && this.grounded) {
      const trailCount = this.upgradeEffects.speedBoost;
      ctx.save();
      for (let i = 0; i < trailCount; i++) {
        ctx.globalAlpha = 0.3 - (i * 0.1);
        ctx.fillStyle = '#FFFF00';
        const offset = (i + 1) * 8;
        ctx.fillRect(this.x - offset, this.y, this.width / 3, this.height);
      }
      ctx.restore();
    }

    // Dodge/Evasion shimmer (green afterimage)
    if (this.upgradeEffects.evasion > 0) {
      const shimmer = Math.sin(Date.now() / 200) * 2;
      ctx.save();
      ctx.globalAlpha = 0.15 * this.upgradeEffects.evasion;
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(this.x + shimmer, this.y, this.width, this.height);
      ctx.fillRect(this.x - shimmer, this.y, this.width, this.height);
      ctx.restore();
    }

    // Magnet field (purple rotating particles)
    if (this.upgradeEffects.magnet > 0) {
      const magnetRange = this.upgradeEffects.magnet * 50;
      const particleCount = this.upgradeEffects.magnet * 3;
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#FF00FF';

      for (let i = 0; i < particleCount; i++) {
        const angle = (Date.now() / 1000 + (i * Math.PI * 2 / particleCount)) % (Math.PI * 2);
        const px = centerX + Math.cos(angle) * (magnetRange / 2);
        const py = centerY + Math.sin(angle) * (magnetRange / 2);
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Damage boost aura (red glow for high damage multiplier)
    if (this.upgradeEffects.damageMultiplier > 1.5) {
      const intensity = Math.min((this.upgradeEffects.damageMultiplier - 1) / 2, 1);
      const pulse = Math.sin(Date.now() / 150) * 5;
      ctx.save();
      ctx.globalAlpha = 0.2 * intensity;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 15 + pulse;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      ctx.restore();
    }

    // Draw T-Rex image with animation
    if (this.trexImg.complete) {
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
      this.y = this.groundY;
      this.grounded = true;
      this.jumping = false;
      this.jumpHoldTime = 0;
      this.doubleJumpAvailable = this.hasDoubleJump; // Reset double jump on landing
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
    console.log('Jump called! grounded:', this.grounded, 'jumping:', this.jumping, 'doubleJump:', this.doubleJumpAvailable);

    // Regular jump
    if (this.grounded && !this.jumping) {
      this.dy = this.jumpPower;
      this.jumping = true;
      this.isHoldingJump = true;
      this.jumpHoldTime = 0;
      console.log('JUMP! dy set to:', this.dy);

      // Play jump sound
      this.jumpSound.currentTime = 0;
      this.jumpSound.play().catch(e => console.log('Audio play failed:', e));
    }
    // Double jump
    else if (!this.grounded && this.doubleJumpAvailable) {
      this.dy = this.jumpPower * 0.9; // Slightly weaker double jump
      this.doubleJumpAvailable = false;
      console.log('DOUBLE JUMP! dy set to:', this.dy);

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
    this.maxHealth = 3 + effects.maxHealthBonus;
    this.health = Math.min(this.health, this.maxHealth);
    this.jumpPower = -12 * effects.jumpPowerMod;
    this.hasDoubleJump = effects.doubleJump;

    // Apply invulnerability time bonus from Tough Skin
    this.invulnerabilityTime = 120 + (effects.invulnTimeBonus || 0); // Base 2s + bonus

    // Store upgrade levels for visual effects
    this.upgradeEffects = {
      toughSkin: effects.toughSkinLevel || 0,
      evasion: effects.evasionLevel || 0,
      speedBoost: effects.speedBoostLevel || 0,
      magnet: effects.magnetLevel || 0,
      damageMultiplier: effects.damageMultiplier || 1.0
    };
  }

  reset() {
    this.groundY = this.canvas.height * 0.8 - this.height;
    this.y = this.groundY;
    this.dy = 0;
    this.jumping = false;
    this.grounded = false;
    this.jumpHoldTime = 0;
    this.isHoldingJump = false;
    this.animationFrame = 0;
    this.frameCount = 0;
    this.health = this.maxHealth;
    this.invulnerable = false;
    this.invulnerabilityCounter = 0;
    this.doubleJumpAvailable = false;
  }
}

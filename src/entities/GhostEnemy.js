/**
 * GhostEnemy - Teleporting enemy that phases in and out
 * Creates unpredictable threat patterns by becoming temporarily invulnerable
 * Medium difficulty enemy that requires timing to defeat
 */
import { BaseEnemy } from './BaseEnemy.js';

export class GhostEnemy extends BaseEnemy {
  constructor(canvas, gameSpeed) {
    super(canvas, gameSpeed, {
      width: 40,
      height: 40,
      health: 3,
      xpValue: 12,
      speedMultiplier: 0.9,
      type: 'ghost'
    });

    // Ghost can appear at various heights
    const heightVariant = Math.random();
    if (heightVariant < 0.4) {
      // Ground level
      this.y = canvas.height * 0.8 - this.height;
    } else if (heightVariant < 0.7) {
      // Mid-air (jump height)
      this.y = canvas.height * 0.6 - this.height;
    } else {
      // High (flying height)
      this.y = canvas.height * 0.4 - this.height;
    }

    // Phase state
    this.isPhased = false; // When phased, enemy is invulnerable and semi-transparent
    this.phaseTimer = 0;
    this.phaseDuration = 45; // Frames to stay phased out
    this.solidDuration = 90; // Frames to stay solid
    this.phaseInterval = this.solidDuration; // Start solid

    // Visual effects
    this.opacity = 1;
    this.glowIntensity = 0;
    this.floatOffset = 0;
    this.floatSpeed = 0.08;

    // Teleport effect
    this.teleportCooldown = 0;
    this.teleportChance = 0.02; // 2% chance per frame when solid
  }

  /**
   * Check if ghost can be damaged (only when solid)
   */
  canBeDamaged() {
    return !this.isPhased;
  }

  /**
   * Override takeDamage to check phase state
   */
  takeDamage(amount = 1) {
    if (this.isPhased) {
      return false; // Invulnerable while phased
    }
    return super.takeDamage(amount);
  }

  /**
   * Check if ghost can damage player (only when solid)
   */
  canDamagePlayer() {
    return !this.isPhased;
  }

  draw(ctx) {
    ctx.save();

    // Calculate float effect
    this.floatOffset = Math.sin(this.frameCount * this.floatSpeed) * 5;

    // Set opacity based on phase state
    ctx.globalAlpha = this.opacity;

    // Ghostly glow effect
    if (this.glowIntensity > 0) {
      ctx.shadowColor = this.isPhased ? '#9966FF' : '#66FFFF';
      ctx.shadowBlur = 15 + this.glowIntensity * 10;
    }

    // Draw ghost emoji
    const emoji = this.isPhased ? '👻' : '👻';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Damage flash effect
    if (this.damageFlash > 0) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 15;
    }

    // Burning effect
    if (this.isBurning && !this.isPhased) {
      ctx.shadowColor = '#FF6600';
      ctx.shadowBlur = 15;
    }

    const { x: centerX } = this.getCenter();
    ctx.fillText(emoji, centerX, this.y + this.height + this.floatOffset);

    ctx.shadowBlur = 0;

    // Draw phase particles when transitioning
    if (this.phaseTimer < 10 || this.phaseTimer > this.phaseDuration - 10) {
      this.drawPhaseParticles(ctx);
    }

    ctx.restore();

    // Draw health bar (only when solid and damaged)
    if (!this.isPhased) {
      this.drawHealthBar(ctx, {
        barWidth: 35,
        barHeight: 3,
        yOffset: -12 + this.floatOffset,
        colors: {
          high: '#9966FF', // Purple for ghost
          medium: '#CC66FF',
          low: '#FF66FF'
        }
      });
    }

    // Draw "PHASED" indicator when invulnerable
    if (this.isPhased) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9966FF';
      ctx.fillText('PHASED', centerX, this.y - 5 + this.floatOffset);
      ctx.restore();
    }
  }

  /**
   * Draw particle effect during phase transitions
   */
  drawPhaseParticles(ctx) {
    const { x: centerX, y: centerY } = this.getCenter();

    for (let i = 0; i < 4; i++) {
      const angle = (this.frameCount * 0.1) + (i * Math.PI / 2);
      const radius = 20 + Math.sin(this.frameCount * 0.2) * 5;
      const particleX = centerX + Math.cos(angle) * radius;
      const particleY = centerY + Math.sin(angle) * radius + this.floatOffset;

      ctx.beginPath();
      ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.isPhased ? '#9966FF' : '#66FFFF';
      ctx.fill();
    }
  }

  update() {
    // Update position
    this.x -= this.speed;
    this.frameCount++;

    if (this.damageFlash > 0) {
      this.damageFlash--;
    }

    // Phase timing logic
    this.phaseTimer++;

    if (this.isPhased) {
      // Currently phased out (invulnerable)
      if (this.phaseTimer >= this.phaseDuration) {
        this.isPhased = false;
        this.phaseTimer = 0;
      }
      // Fade in/out effect
      this.opacity = 0.3 + Math.sin(this.frameCount * 0.3) * 0.15;
      this.glowIntensity = 1;
    } else {
      // Currently solid (vulnerable)
      if (this.phaseTimer >= this.solidDuration) {
        this.isPhased = true;
        this.phaseTimer = 0;
      }
      // Full opacity when solid
      this.opacity = 1;
      this.glowIntensity = Math.max(0, this.glowIntensity - 0.05);

      // Random teleport chance when solid
      if (this.teleportCooldown <= 0 && Math.random() < this.teleportChance) {
        this.teleport();
      }
    }

    // Decrease teleport cooldown
    if (this.teleportCooldown > 0) {
      this.teleportCooldown--;
    }

    // Apply burn damage only when solid
    if (this.isBurning && !this.isPhased) {
      this.burnTickCounter++;
      if (this.burnTickCounter >= this.burnTickInterval) {
        this.health -= this.burnDamage;
        this.burnTickCounter = 0;
      }
      this.burnDuration--;
      if (this.burnDuration <= 0) {
        this.isBurning = false;
      }
    }
  }

  /**
   * Teleport to a nearby position
   */
  teleport() {
    // Quick phase out, teleport, phase in
    const teleportDistance = 50 + Math.random() * 100;
    const direction = Math.random() < 0.5 ? -1 : 1;

    // Teleport forward or backward
    this.x += teleportDistance * direction;

    // Ensure still on screen
    this.x = Math.max(50, Math.min(this.canvas.width - 50, this.x));

    // Cooldown before next teleport
    this.teleportCooldown = 120; // 2 seconds

    // Brief phase for visual effect
    this.isPhased = true;
    this.phaseTimer = this.phaseDuration - 15; // Quick phase
  }
}

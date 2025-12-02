/**
 * OrbitalWeapon - Auto-targeting orbs that orbit around the player
 * Provides passive/defensive damage by automatically targeting nearest enemies
 */
import { BaseWeapon } from './BaseWeapon.js';

export class OrbitalWeapon extends BaseWeapon {
  constructor(assets) {
    super('Orbital', 'Spawns orbs that orbit you and auto-target enemies', '🔮');
    this.fireRateBase = 60; // How often new orbs spawn
    this.level = 1;
    this.assets = assets;

    // Orb configuration
    this.maxOrbs = 2; // Starting orbs
    this.orbs = [];
    this.orbitRadius = 60;
    this.orbitSpeed = 0.05;
    this.orbDamage = 1;
    this.orbSize = 12;

    // Targeting
    this.targetRange = 150; // How far orbs will seek enemies
    this.seekSpeed = 0.15; // How fast orbs move toward targets

    // Visual
    this.baseAngle = 0;
    this.glowPulse = 0;
  }

  setLevel(level) {
    this.level = level;

    // Level scaling
    this.maxOrbs = Math.min(2 + Math.floor((level - 1) / 2), 6); // Max 6 orbs
    this.orbitRadius = 60 + (level - 1) * 5;
    this.targetRange = 150 + (level - 1) * 20;
    this.orbSize = 12 + Math.floor((level - 1) / 2) * 2;
    this.fireRateBase = Math.max(30, 60 - (level - 1) * 5);

    // Ensure we have the right number of orbs
    while (this.orbs.length < this.maxOrbs) {
      this.addOrb();
    }
  }

  /**
   * Add a new orb to the orbit
   */
  addOrb() {
    const angleOffset = (this.orbs.length / this.maxOrbs) * Math.PI * 2;
    this.orbs.push({
      angle: angleOffset,
      x: 0,
      y: 0,
      targetX: null,
      targetY: null,
      isAttacking: false,
      attackCooldown: 0,
      hitEnemies: new Set(),
      returnProgress: 0,
      color: this.getOrbColor(this.orbs.length)
    });
  }

  /**
   * Get orb color based on index
   */
  getOrbColor(index) {
    const colors = [
      '#66FFFF', // Cyan
      '#FF66FF', // Magenta
      '#FFFF66', // Yellow
      '#66FF66', // Green
      '#FF6666', // Red
      '#6666FF'  // Blue
    ];
    return colors[index % colors.length];
  }

  update(dino, projectiles, effects = {}) {
    this.fireRateCounter++;
    this.baseAngle += this.orbitSpeed;
    this.glowPulse = Math.sin(this.fireRateCounter * 0.1) * 0.3 + 0.7;

    // Store dino reference for orb positioning
    this.dinoX = dino.x + dino.width / 2;
    this.dinoY = dino.y + dino.height / 2;

    // Update each orb
    this.orbs.forEach((orb, index) => {
      if (orb.isAttacking) {
        // Move toward target
        if (orb.targetX !== null && orb.targetY !== null) {
          const dx = orb.targetX - orb.x;
          const dy = orb.targetY - orb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 5) {
            orb.x += (dx / dist) * this.seekSpeed * 20;
            orb.y += (dy / dist) * this.seekSpeed * 20;
          } else {
            // Reached target, start returning
            orb.isAttacking = false;
            orb.returnProgress = 0;
          }
        }
      } else if (orb.returnProgress < 1) {
        // Returning to orbit
        orb.returnProgress += 0.05;
        const targetAngle = this.baseAngle + (index / this.maxOrbs) * Math.PI * 2;
        const targetX = this.dinoX + Math.cos(targetAngle) * this.orbitRadius;
        const targetY = this.dinoY + Math.sin(targetAngle) * this.orbitRadius;

        orb.x += (targetX - orb.x) * 0.1;
        orb.y += (targetY - orb.y) * 0.1;
        orb.angle = targetAngle;
      } else {
        // Orbiting normally
        orb.angle = this.baseAngle + (index / this.maxOrbs) * Math.PI * 2;
        orb.x = this.dinoX + Math.cos(orb.angle) * this.orbitRadius;
        orb.y = this.dinoY + Math.sin(orb.angle) * this.orbitRadius;
      }

      // Decrease attack cooldown
      if (orb.attackCooldown > 0) {
        orb.attackCooldown--;
      }
    });

    // Spawn new orbs if needed
    if (this.fireRateCounter >= this.fireRateBase && this.orbs.length < this.maxOrbs) {
      this.addOrb();
      this.fireRateCounter = 0;
    }
  }

  /**
   * Find and attack nearest enemy
   */
  findTarget(enemies) {
    // Find available orb (not attacking and off cooldown)
    const availableOrb = this.orbs.find(orb => !orb.isAttacking && orb.attackCooldown <= 0);
    if (!availableOrb) return null;

    // Find nearest enemy in range
    let nearestEnemy = null;
    let nearestDist = this.targetRange;

    enemies.forEach(enemy => {
      // Skip phased ghosts
      if (enemy.canBeDamaged && !enemy.canBeDamaged()) return;
      // Skip already hit enemies for this orb
      if (availableOrb.hitEnemies.has(enemy)) return;

      const dx = enemy.x + enemy.width / 2 - this.dinoX;
      const dy = enemy.y + enemy.height / 2 - this.dinoY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestEnemy = enemy;
      }
    });

    if (nearestEnemy) {
      availableOrb.isAttacking = true;
      availableOrb.targetX = nearestEnemy.x + nearestEnemy.width / 2;
      availableOrb.targetY = nearestEnemy.y + nearestEnemy.height / 2;
      availableOrb.targetEnemy = nearestEnemy;
      return availableOrb;
    }

    return null;
  }

  /**
   * Draw orbital weapon
   */
  draw(ctx, frameCount) {
    this.orbs.forEach((orb, index) => {
      ctx.save();

      // Glow effect
      ctx.shadowColor = orb.color;
      ctx.shadowBlur = 10 + this.glowPulse * 5;

      // Draw orb
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, this.orbSize, 0, Math.PI * 2);

      // Gradient fill
      const gradient = ctx.createRadialGradient(
        orb.x, orb.y, 0,
        orb.x, orb.y, this.orbSize
      );
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.3, orb.color);
      gradient.addColorStop(1, orb.color + '44');

      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner glow
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, this.orbSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.8;
      ctx.fill();

      // Draw trail when attacking
      if (orb.isAttacking) {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(orb.x, orb.y);
        ctx.lineTo(this.dinoX, this.dinoY);
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw orbit ring (faint)
    if (this.dinoX && this.dinoY) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#66FFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.dinoX, this.dinoY, this.orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Check orb collisions with enemies
   */
  checkCollisions(enemies, onHit) {
    // Auto-target enemies
    this.findTarget(enemies);

    this.orbs.forEach(orb => {
      if (!orb.isAttacking) return;

      enemies.forEach(enemy => {
        // Skip phased ghosts
        if (enemy.canBeDamaged && !enemy.canBeDamaged()) return;

        const dx = enemy.x + enemy.width / 2 - orb.x;
        const dy = enemy.y + enemy.height / 2 - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.orbSize + enemy.width / 2) {
          // Hit enemy
          orb.hitEnemies.add(enemy);
          orb.isAttacking = false;
          orb.returnProgress = 0;
          orb.attackCooldown = 30; // 0.5 second cooldown

          // Play sound
          if (this.assets && this.assets.hitSound) {
            this.assets.hitSound.currentTime = 0;
            this.assets.hitSound.play().catch(() => { });
          }

          onHit(enemy);
        }
      });
    });
  }

  reset() {
    super.reset();
    this.orbs = [];
    this.baseAngle = 0;
    // Reinitialize with starting orbs
    for (let i = 0; i < 2; i++) {
      this.addOrb();
    }
  }
}

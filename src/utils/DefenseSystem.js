/**
 * DefenseSystem - Manages defensive abilities like shields and force fields
 */
export class DefenseSystem {
  constructor(assets) {
    this.assets = assets;

    // Available defense types
    this.defenseTypes = [
      {
        id: 'shield',
        name: 'Energy Shield',
        description: 'Absorbs damage before health is lost',
        icon: '🛡️',
        type: 'shield',
        maxLevel: 5
      },
      {
        id: 'forcefield',
        name: 'Force Field',
        description: 'Reflects projectiles back at enemies',
        icon: '⚡',
        type: 'forcefield',
        maxLevel: 5
      },
      {
        id: 'barrier',
        name: 'Barrier',
        description: 'Temporary invulnerability shield',
        icon: '🔰',
        type: 'barrier',
        maxLevel: 5
      }
    ];

    // Active defenses
    this.activeDefenses = new Set();
    this.defenseLevels = new Map();

    // Shield state
    this.shieldActive = false;
    this.shieldHealth = 0;
    this.maxShieldHealth = 0;
    this.shieldRegenCounter = 0;
    this.shieldRegenRate = 300; // Frames between regen

    // Force field state
    this.forceFieldActive = false;
    this.forceFieldRadius = 0;
    this.forceFieldPulseFrame = 0;

    // Barrier state
    this.barrierActive = false;
    this.barrierDuration = 0;
    this.barrierCooldown = 0;
    this.barrierMaxCooldown = 600; // 10 seconds
  }

  /**
   * Unlock or level up a defense
   */
  upgradeDefense(defenseId) {
    const currentLevel = this.defenseLevels.get(defenseId) || 0;

    if (!this.activeDefenses.has(defenseId)) {
      // Unlock new defense
      this.activeDefenses.add(defenseId);
      this.defenseLevels.set(defenseId, 1);
      this.activateDefense(defenseId, 1);
    } else {
      // Level up existing defense
      const newLevel = currentLevel + 1;
      this.defenseLevels.set(defenseId, newLevel);
      this.activateDefense(defenseId, newLevel);
    }
  }

  /**
   * Activate or upgrade a defense based on its type
   */
  activateDefense(defenseId, level) {
    switch (defenseId) {
      case 'shield':
        this.shieldActive = true;
        this.maxShieldHealth = level * 2; // 2, 4, 6, 8, 10 shield points
        this.shieldHealth = this.maxShieldHealth;
        this.shieldRegenRate = Math.max(180, 300 - (level * 30)); // Faster regen at higher levels
        break;

      case 'forcefield':
        this.forceFieldActive = true;
        this.forceFieldRadius = 50 + (level * 15); // Increases with level
        break;

      case 'barrier':
        this.barrierActive = true;
        this.barrierDuration = 60 + (level * 30); // Longer duration at higher levels
        this.barrierMaxCooldown = Math.max(300, 600 - (level * 60)); // Shorter cooldown
        break;
    }
  }

  /**
   * Update all active defenses
   */
  update(dino) {
    // Update shield regeneration
    if (this.shieldActive && this.shieldHealth < this.maxShieldHealth) {
      this.shieldRegenCounter++;
      if (this.shieldRegenCounter >= this.shieldRegenRate) {
        this.shieldHealth = Math.min(this.maxShieldHealth, this.shieldHealth + 1);
        this.shieldRegenCounter = 0;
      }
    }

    // Update force field pulse animation
    if (this.forceFieldActive) {
      this.forceFieldPulseFrame++;
    }

    // Update barrier
    if (this.barrierActive) {
      if (this.barrierDuration > 0) {
        this.barrierDuration--;
        dino.invulnerable = true;
      } else {
        dino.invulnerable = false;
        if (this.barrierCooldown > 0) {
          this.barrierCooldown--;
        }
      }
    }
  }

  /**
   * Handle incoming damage - returns true if damage was blocked
   */
  absorbDamage() {
    // Barrier blocks all damage
    if (this.barrierActive && this.barrierDuration > 0) {
      return true;
    }

    // Shield absorbs damage
    if (this.shieldActive && this.shieldHealth > 0) {
      this.shieldHealth--;
      this.shieldRegenCounter = 0; // Reset regen timer on hit
      return true;
    }

    return false; // Damage goes through
  }

  /**
   * Check if force field should repel projectiles
   */
  checkForceField(dino, projectile) {
    if (!this.forceFieldActive) return false;

    const dx = projectile.x - (dino.x + dino.width / 2);
    const dy = projectile.y - (dino.y + dino.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.forceFieldRadius) {
      // Reflect projectile
      projectile.vx = -projectile.vx;
      projectile.vy = -projectile.vy;
      return true;
    }

    return false;
  }

  /**
   * Trigger barrier ability
   */
  activateBarrier() {
    if (this.barrierActive && this.barrierCooldown === 0) {
      const level = this.defenseLevels.get('barrier') || 1;
      this.barrierDuration = 60 + (level * 30);
      this.barrierCooldown = this.barrierMaxCooldown;
      return true;
    }
    return false;
  }

  /**
   * Draw defense effects
   */
  draw(ctx, dino, frameCount) {
    const centerX = dino.x + dino.width / 2;
    const centerY = dino.y + dino.height / 2;

    // Draw force field
    if (this.forceFieldActive) {
      const pulse = Math.sin(this.forceFieldPulseFrame / 10) * 5;
      const radius = this.forceFieldRadius + pulse;

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner pulse
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw shield
    if (this.shieldActive && this.shieldHealth > 0) {
      const shieldAlpha = 0.3 + (this.shieldHealth / this.maxShieldHealth) * 0.4;

      ctx.save();
      ctx.fillStyle = `rgba(100, 200, 255, ${shieldAlpha})`;
      ctx.strokeStyle = `rgba(0, 150, 255, ${shieldAlpha + 0.2})`;
      ctx.lineWidth = 2;

      // Hexagonal shield
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + (frameCount / 30);
        const x = centerX + Math.cos(angle) * 35;
        const y = centerY + Math.sin(angle) * 35;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Draw barrier
    if (this.barrierActive && this.barrierDuration > 0) {
      const barrierPulse = Math.sin(frameCount / 5) * 0.2;

      ctx.save();
      ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + barrierPulse})`;
      ctx.strokeStyle = `rgba(255, 200, 0, ${0.8 + barrierPulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Get defense state for UI
   */
  getState() {
    return {
      shield: {
        active: this.shieldActive,
        health: this.shieldHealth,
        maxHealth: this.maxShieldHealth
      },
      forcefield: {
        active: this.forceFieldActive,
        radius: this.forceFieldRadius
      },
      barrier: {
        active: this.barrierActive,
        duration: this.barrierDuration,
        cooldown: this.barrierCooldown,
        maxCooldown: this.barrierMaxCooldown
      }
    };
  }

  /**
   * Get available defense upgrades
   */
  getUpgradeChoices(count = 3) {
    const available = [];

    this.defenseTypes.forEach(defense => {
      const currentLevel = this.defenseLevels.get(defense.id) || 0;
      const isUnlocked = this.activeDefenses.has(defense.id);

      if (!isUnlocked) {
        available.push({
          id: defense.id,
          name: defense.name,
          description: `Unlock ${defense.name} - ${defense.description}`,
          icon: defense.icon,
          currentLevel: 0,
          isNew: true
        });
      } else if (currentLevel < defense.maxLevel) {
        available.push({
          id: defense.id,
          name: defense.name,
          description: `${defense.name} Level ${currentLevel + 1}`,
          icon: defense.icon,
          currentLevel: currentLevel,
          nextLevel: currentLevel + 1,
          isNew: false
        });
      }
    });

    const shuffled = available.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, available.length));
  }

  /**
   * Reset all defenses
   */
  reset() {
    this.activeDefenses.clear();
    this.defenseLevels.clear();
    this.shieldActive = false;
    this.shieldHealth = 0;
    this.maxShieldHealth = 0;
    this.forceFieldActive = false;
    this.barrierActive = false;
    this.barrierDuration = 0;
    this.barrierCooldown = 0;
  }
}

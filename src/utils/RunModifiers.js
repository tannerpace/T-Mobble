/**
 * RunModifiers - Manages pre-run modifier selection and effects
 */
export class RunModifiers {
  constructor() {
    this.activeModifier = null;
    this.modifierDefinitions = this.initializeModifiers();
  }

  /**
   * Initialize all run modifier definitions
   */
  initializeModifiers() {
    return {
      normal: {
        id: 'normal',
        name: 'Standard Run',
        icon: '🎮',
        description: 'Normal difficulty, no modifiers',
        effects: {
          scoreBonus: 1.0
        }
      },
      speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        icon: '⚡',
        description: 'Game speed +50%, enemies +25% HP',
        effects: {
          gameSpeedMult: 1.5,
          enemyHealthMult: 1.25,
          scoreBonus: 1.5
        }
      },
      tank_mode: {
        id: 'tank_mode',
        name: 'Tank Mode',
        icon: '🛡️',
        description: 'Start with 5 HP, but no evasion upgrades',
        effects: {
          startingHP: 5,
          disableUpgrades: ['evasion'],
          scoreBonus: 1.2
        },
        requiresUnlock: false
      },
      glass_cannon: {
        id: 'glass_cannon',
        name: 'Glass Cannon',
        icon: '💥',
        description: 'Start with only 1 HP, all damage +100%',
        effects: {
          startingHP: 1,
          damageMult: 2.0,
          scoreBonus: 2.0
        },
        requiresUnlock: true,
        unlockRequirement: 'Complete 5 runs'
      },
      lucky_day: {
        id: 'lucky_day',
        name: 'Lucky Day',
        icon: '🍀',
        description: '2x coins, but elites have 2x HP',
        effects: {
          coinMult: 2.0,
          eliteHealthMult: 2.0,
          scoreBonus: 1.0
        },
        requiresUnlock: false
      },
      minimalist: {
        id: 'minimalist',
        name: 'Minimalist',
        icon: '🎯',
        description: 'Can only have 1 weapon, but it levels 2x faster',
        effects: {
          maxWeapons: 1,
          xpMult: 2.0,
          scoreBonus: 1.8
        },
        requiresUnlock: true,
        unlockRequirement: 'Reach level 15'
      },
      arsenal: {
        id: 'arsenal',
        name: 'Arsenal',
        icon: '🔫',
        description: 'Start with all 3 weapons at level 1',
        effects: {
          startingWeapons: ['blaster', 'whip', 'laser'],
          xpMult: 0.75,
          scoreBonus: 0.8
        },
        requiresUnlock: true,
        unlockRequirement: 'Unlock all 3 weapons'
      }
    };
  }

  /**
   * Get available modifiers based on unlock status
   */
  getAvailableModifiers(metaProgress) {
    const available = [];

    for (const [modifierId, modifier] of Object.entries(this.modifierDefinitions)) {
      if (!modifier.requiresUnlock || this.checkUnlockRequirement(modifier.unlockRequirement, metaProgress)) {
        available.push(modifier);
      }
    }

    return available;
  }

  /**
   * Check if modifier unlock requirement is met
   */
  checkUnlockRequirement(requirement, metaProgress) {
    if (!requirement) return true;
    if (!metaProgress) return false;

    if (requirement.includes('Complete')) {
      const runs = parseInt(requirement.match(/\d+/)[0]);
      return metaProgress.totalRuns >= runs;
    }
    if (requirement.includes('Reach level')) {
      const level = parseInt(requirement.match(/\d+/)[0]);
      return metaProgress.highestLevel >= level;
    }
    if (requirement.includes('Unlock all')) {
      return metaProgress.allWeaponsUnlocked || false;
    }

    return false;
  }

  /**
   * Set active modifier for current run
   */
  selectModifier(modifierId) {
    this.activeModifier = this.modifierDefinitions[modifierId] || this.modifierDefinitions.normal;
    return this.activeModifier;
  }

  /**
   * Get current modifier effects
   */
  getEffects() {
    return this.activeModifier ? this.activeModifier.effects : this.modifierDefinitions.normal.effects;
  }

  /**
   * Apply modifier effects to game state
   */
  applyToGame(game) {
    const effects = this.getEffects();

    // Apply game speed multiplier
    if (effects.gameSpeedMult) {
      game.gameSpeed *= effects.gameSpeedMult;
      game.maxGameSpeed *= effects.gameSpeedMult;
    }

    // Apply starting HP
    if (effects.startingHP) {
      game.dino.maxHealth = effects.startingHP;
      game.dino.health = effects.startingHP;
    }

    // Apply starting weapons
    if (effects.startingWeapons) {
      effects.startingWeapons.forEach(weaponId => {
        if (weaponId !== 'blaster') { // Already have blaster
          game.upgradeSystem.applyUpgrade(weaponId);
          game.weaponSystem.addWeapon(weaponId);
        }
      });
    }

    // Apply weapon slot limit
    if (effects.maxWeapons) {
      game.upgradeSystem.maxWeaponSlots = effects.maxWeapons;
    }

    return effects;
  }

  /**
   * Reset modifier for new run
   */
  reset() {
    this.activeModifier = null;
  }
}

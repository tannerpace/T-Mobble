/**
 * UpgradeSystem - Manages weapon unlocks, upgrades, and slot limitations
 */
export class UpgradeSystem {
  constructor() {
    this.unlockedWeapons = new Set(['blaster']); // Start with blaster
    this.weaponLevels = new Map([['blaster', 1]]); // Track weapon levels
    this.passiveUpgrades = new Map(); // Track passive upgrade levels
    this.unlockedSynergies = new Set(); // Track unlocked synergies
    this.evolutionCount = 0;

    // Slot limitations
    this.maxWeaponSlots = 3;
    this.maxPassiveSlots = 5;
    this.maxEvolutions = 2;
    this.ultimateSlot = null;

    // Track which upgrades player has seen
    this.seenUpgrades = new Set();
  }

  /**
   * Get all available upgrades organized by tier
   */
  getAllUpgradesByTier() {
    return {
      // TIER 1: Early Game Survival (Levels 1-5)
      tier1: [
        {
          id: 'extra_heart',
          name: 'Extra Heart',
          description: '+1 max HP',
          icon: '❤️',
          tier: 1,
          maxLevel: 2,
          category: 'survival'
        },
        {
          id: 'tough_skin',
          name: 'Tough Skin',
          description: '+1 invulnerability seconds',
          icon: '🛡️',
          tier: 1,
          maxLevel: 3,
          category: 'survival'
        },
        {
          id: 'evasion',
          name: 'Evasion',
          description: '+15% dodge chance',
          icon: '💨',
          tier: 1,
          maxLevel: 2,
          category: 'survival'
        },
        {
          id: 'jump_height',
          name: 'Jump Boost',
          description: '+10% jump height',
          icon: '🦘',
          tier: 1,
          maxLevel: 3,
          category: 'survival'
        },
        {
          id: 'magnet',
          name: 'Magnet',
          description: '+50px pickup range',
          icon: '🧲',
          tier: 1,
          maxLevel: 3,
          category: 'utility'
        }
      ],

      // TIER 2: Midgame Build Shaping - Weapons
      tier2_weapons: [
        {
          id: 'blaster',
          name: 'Blaster',
          description: 'Standard projectile weapon',
          icon: '🔫',
          tier: 2,
          maxLevel: 5,
          category: 'weapon'
        },
        {
          id: 'whip',
          name: 'Whip',
          description: 'Melee arc attack',
          icon: '🪢',
          tier: 2,
          maxLevel: 5,
          category: 'weapon'
        },
        {
          id: 'laser',
          name: 'Laser Beam',
          description: 'Continuous damage beam',
          icon: '⚡',
          tier: 2,
          maxLevel: 5,
          category: 'weapon'
        },
        {
          id: 'axe',
          name: 'Axe',
          description: 'Destroys obstacles',
          icon: '🪓',
          tier: 2,
          maxLevel: 5,
          category: 'weapon'
        }
      ],

      // TIER 3: Late Game Optimization (Levels 13+)
      tier3: [
        {
          id: 'glass_cannon',
          name: 'Glass Cannon',
          description: '+200% all damage',
          icon: '💥',
          tier: 3,
          maxLevel: 1,
          category: 'ultimate',
          requirement: 'Level 15, 3 weapons Lv5',
          tradeoff: 'Max HP = 1'
        },
        {
          id: 'tank_mode_ultimate',
          name: 'Tank Mode',
          description: '+3 max HP, regen 1hp/5s',
          icon: '🛡️',
          tier: 3,
          maxLevel: 1,
          category: 'ultimate',
          requirement: 'Level 15, all survival Lv3',
          tradeoff: '-50% damage'
        },
        {
          id: 'berserker',
          name: 'Berserker',
          description: 'Damage scales with missing HP',
          icon: '⚔️',
          tier: 3,
          maxLevel: 1,
          category: 'ultimate',
          requirement: 'Level 15, Extra Heart Lv2',
          tradeoff: 'No regen/pickups'
        }
      ]
    };
  }

  /**
   * Get upgrade descriptions based on weapon and level
   */
  getUpgradeDescription(weaponId, currentLevel) {
    const descriptions = {
      blaster: [
        'Unlock Blaster - Basic projectile weapon',
        'Range +20% - Bullets travel further',
        'Range +40% - Even longer range',
        'Range +60% - Maximum range',
        'Pierce +1 - Bullets pierce one enemy',
        'Pierce +2 - Bullets pierce multiple enemies'
      ],
      whip: [
        'Unlock Whip - Melee arc attack',
        'Range +25% - Wider arc radius',
        'Speed +30% - Attack faster',
        'Range +50% - Maximum arc size',
        'Multi-hit - Hit multiple enemies',
        'Lightning Whip - Chain damage'
      ],
      laser: [
        'Unlock Laser - Continuous beam',
        'Width +50% - Thicker beam',
        'Damage +30% - More damage per tick',
        'Length +40% - Longer range',
        'Dual Laser - Fire two beams',
        'Piercing Laser - Unlimited pierce'
      ]
    };

    const weaponDescs = descriptions[weaponId] || ['Unlock ' + weaponId, 'Level up', 'Level up', 'Level up', 'Level up', 'Max level'];
    return weaponDescs[currentLevel] || 'Max level reached';
  }

  /**
   * Get a weighted random selection of upgrades
   * @param {number} count - Number of upgrades to offer
   * @param {number} playerLevel - Current player level
   * @param {Object} playerState - Current player state (health, weapons, etc.)
   * @returns {Array} Array of upgrade options
   */
  getUpgradeChoices(count = 3, playerLevel = 1, playerState = {}) {
    const allUpgrades = this.getAllUpgradesByTier();
    const available = [];

    // Collect tier 1 upgrades (survival passives)
    if (this.passiveUpgrades.size < this.maxPassiveSlots) {
      allUpgrades.tier1.forEach(upgrade => {
        const currentLevel = this.passiveUpgrades.get(upgrade.id) || 0;
        if (currentLevel < upgrade.maxLevel) {
          available.push({
            ...upgrade,
            currentLevel,
            nextLevel: currentLevel + 1,
            isNew: currentLevel === 0,
            weight: this.calculateUpgradeWeight(upgrade, playerLevel, playerState, currentLevel)
          });
        }
      });
    }

    // Collect tier 2 upgrades (weapons)
    if (this.unlockedWeapons.size < this.maxWeaponSlots) {
      allUpgrades.tier2_weapons.forEach(weapon => {
        const isUnlocked = this.unlockedWeapons.has(weapon.id);
        if (!isUnlocked) {
          available.push({
            ...weapon,
            currentLevel: 0,
            nextLevel: 1,
            isNew: true,
            weight: this.calculateUpgradeWeight(weapon, playerLevel, playerState, 0)
          });
        }
      });
    }

    // Level up existing weapons
    allUpgrades.tier2_weapons.forEach(weapon => {
      const currentLevel = this.weaponLevels.get(weapon.id) || 0;
      if (this.unlockedWeapons.has(weapon.id) && currentLevel < weapon.maxLevel) {
        available.push({
          ...weapon,
          currentLevel,
          nextLevel: currentLevel + 1,
          isNew: false,
          weight: this.calculateUpgradeWeight(weapon, playerLevel, playerState, currentLevel)
        });
      }
    });

    // Collect tier 3 upgrades (ultimates) - only at level 13+
    if (playerLevel >= 13 && !this.ultimateSlot) {
      allUpgrades.tier3.forEach(upgrade => {
        if (this.checkUltimateRequirement(upgrade, playerState)) {
          available.push({
            ...upgrade,
            currentLevel: 0,
            nextLevel: 1,
            isNew: true,
            weight: 2.0 // High weight for ultimates
          });
        }
      });
    }

    // If no upgrades available, return empty
    if (available.length === 0) {
      return [];
    }

    // Weighted random selection
    return this.weightedRandomPick(available, Math.min(count, available.length));
  }

  /**
   * Calculate weight for an upgrade based on game state
   */
  calculateUpgradeWeight(upgrade, playerLevel, playerState, currentLevel) {
    let weight = 1.0;

    // Increase weight for new upgrades
    if (!this.seenUpgrades.has(upgrade.id)) {
      weight *= 1.5;
    }

    // Increase weight for synergy-enabling upgrades
    if (playerState.synergySystem) {
      const hints = playerState.synergySystem.getSynergyHints(this.getAllUpgrades());
      const enablesSynergy = hints.some(hint =>
        hint.remaining.upgrade === upgrade.id && hint.remaining.level === currentLevel + 1
      );
      if (enablesSynergy) {
        weight *= 2.5;
      }
    }

    // Smart balancing: offer survival if low HP
    if (playerState.health <= 1 && upgrade.category === 'survival') {
      weight *= 3.0;
    }

    // STRONGLY prioritize weapon diversity - offer new weapons more often
    if (upgrade.category === 'weapon' && currentLevel === 0) {
      // New weapon unlock
      if (playerState.weaponCount < 2) {
        weight *= 5.0; // Very high priority for first 2 weapons
      } else if (playerState.weaponCount < 3) {
        weight *= 3.0; // Still prioritize 3rd weapon
      }
    }

    // Reduce weight for leveling up weapons when player doesn't have all weapons yet
    if (upgrade.category === 'weapon' && currentLevel > 0 && playerState.weaponCount < 3) {
      weight *= 0.3; // Strongly discourage leveling weapons before unlocking variety
    }

    // Tier gating - much less restrictive for weapons
    if (playerLevel < 3 && upgrade.tier === 2) {
      weight *= 0.5; // Only slight reduction for very early game
    }
    if (playerLevel < 13 && upgrade.tier === 3) {
      weight = 0;
    }

    return weight;
  }

  /**
   * Weighted random selection
   */
  weightedRandomPick(items, count) {
    const picked = [];
    const remaining = [...items];

    for (let i = 0; i < count && remaining.length > 0; i++) {
      const totalWeight = remaining.reduce((sum, item) => sum + (item.weight || 1), 0);
      let random = Math.random() * totalWeight;

      let selectedIndex = 0;
      for (let j = 0; j < remaining.length; j++) {
        random -= (remaining[j].weight || 1);
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }

      const selected = remaining.splice(selectedIndex, 1)[0];
      picked.push(selected);
      this.seenUpgrades.add(selected.id);
    }

    return picked;
  }

  /**
   * Check if ultimate requirements are met
   */
  checkUltimateRequirement(ultimate, playerState) {
    if (ultimate.id === 'glass_cannon') {
      // Requires level 15 and 3 weapons at level 5
      const maxLevelWeapons = Array.from(this.weaponLevels.values()).filter(lvl => lvl >= 5).length;
      return playerState.level >= 15 && maxLevelWeapons >= 3;
    }
    if (ultimate.id === 'tank_mode_ultimate') {
      // Requires all survival upgrades at level 3
      const maxSurvivalUpgrades = Array.from(this.passiveUpgrades.entries())
        .filter(([id, lvl]) => ['extra_heart', 'tough_skin', 'evasion'].includes(id) && lvl >= 3)
        .length;
      return playerState.level >= 15 && maxSurvivalUpgrades >= 3;
    }
    if (ultimate.id === 'berserker') {
      return playerState.level >= 15 && (this.passiveUpgrades.get('extra_heart') || 0) >= 2;
    }
    return false;
  }

  /**
   * Get all current upgrades for synergy checking
   */
  getAllUpgrades() {
    const combined = new Map();

    // Add weapons
    for (const [id, level] of this.weaponLevels) {
      combined.set(id, level);
    }

    // Add passives
    for (const [id, level] of this.passiveUpgrades) {
      combined.set(id, level);
    }

    return combined;
  }

  /**
   * Apply a weapon or passive upgrade
   * @param {string} upgradeId - ID of upgrade to apply
   */
  applyUpgrade(upgradeId) {
    const allTiers = this.getAllUpgradesByTier();

    // Check if it's a weapon
    const isWeapon = allTiers.tier2_weapons.some(w => w.id === upgradeId);

    if (isWeapon) {
      const currentLevel = this.weaponLevels.get(upgradeId) || 0;

      if (!this.unlockedWeapons.has(upgradeId)) {
        // Unlock new weapon
        if (this.unlockedWeapons.size >= this.maxWeaponSlots) {
          return false; // Cannot exceed weapon slots
        }
        this.unlockedWeapons.add(upgradeId);
        this.weaponLevels.set(upgradeId, 1);
      } else {
        // Level up existing weapon
        this.weaponLevels.set(upgradeId, currentLevel + 1);
      }
    } else {
      // It's a passive or ultimate upgrade
      const isUltimate = allTiers.tier3.some(u => u.id === upgradeId);

      if (isUltimate) {
        this.ultimateSlot = upgradeId;
      } else {
        // Passive upgrade
        if (this.passiveUpgrades.size >= this.maxPassiveSlots && !this.passiveUpgrades.has(upgradeId)) {
          return false; // Cannot exceed passive slots
        }
        const currentLevel = this.passiveUpgrades.get(upgradeId) || 0;
        this.passiveUpgrades.set(upgradeId, currentLevel + 1);
      }
    }

    return true;
  }

  /**
   * Get weapon level
   */
  getWeaponLevel(weaponId) {
    return this.weaponLevels.get(weaponId) || 0;
  }

  /**
   * Get upgrade level (compatibility method)
   */
  getUpgradeLevel(upgradeId) {
    return this.weaponLevels.get(upgradeId) || 0;
  }

  /**
   * Calculate total effects from all upgrades
   */
  calculateEffects() {
    const effects = {
      maxHealthBonus: 0,
      invulnTimeBonus: 0,
      dodgeChance: 0,
      jumpBonus: 0,
      magnetRange: 0,
      regeneration: false,
      damageMultiplier: 1.0,
      xpMultiplier: 1.0,
      jumpPowerMod: 1.0,
      doubleJump: false
    };

    // Apply passive upgrades
    const extraHeart = this.passiveUpgrades.get('extra_heart') || 0;
    effects.maxHealthBonus = extraHeart;

    const toughSkin = this.passiveUpgrades.get('tough_skin') || 0;
    effects.invulnTimeBonus = toughSkin * 60; // +60 frames per level
    effects.toughSkinLevel = toughSkin; // For visual effects

    const evasion = this.passiveUpgrades.get('evasion') || 0;
    effects.dodgeChance = evasion * 0.15; // 15% per level
    effects.evasionLevel = evasion; // For visual effects

    const jumpHeight = this.passiveUpgrades.get('jump_height') || 0;
    effects.jumpBonus = jumpHeight * 0.10; // 10% per level
    effects.jumpHeightLevel = jumpHeight; // For visual effects

    const magnet = this.passiveUpgrades.get('magnet') || 0;
    effects.magnetRange = magnet * 50; // +50px per level
    effects.magnetLevel = magnet; // For visual effects

    // Apply ultimate upgrades
    if (this.ultimateSlot === 'glass_cannon') {
      effects.damageMultiplier = 3.0;
      effects.maxHealthBonus = -999; // Force HP to 1
    } else if (this.ultimateSlot === 'tank_mode_ultimate') {
      effects.maxHealthBonus += 3;
      effects.regeneration = true;
      effects.damageMultiplier = 0.5;
    } else if (this.ultimateSlot === 'berserker') {
      // Berserker damage is calculated dynamically based on missing HP
      effects.berserkerMode = true;
    }

    return effects;
  }

  /**
   * Check if weapon is unlocked
   */
  isWeaponUnlocked(weaponId) {
    return this.unlockedWeapons.has(weaponId);
  }

  /**
   * Get all unlocked weapons with their levels
   */
  getUnlockedWeapons() {
    return Array.from(this.unlockedWeapons).map(id => ({
      id,
      level: this.weaponLevels.get(id) || 0
    }));
  }

  /**
   * Reset all upgrades
   */
  reset() {
    this.unlockedWeapons.clear();
    this.unlockedWeapons.add('blaster');
    this.weaponLevels.clear();
    this.weaponLevels.set('blaster', 1);
    this.passiveUpgrades.clear();
    this.unlockedSynergies.clear();
    this.evolutionCount = 0;
    this.ultimateSlot = null;
    this.seenUpgrades.clear();
  }
}

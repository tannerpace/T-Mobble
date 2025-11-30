/**
 * UpgradeSystem - Manages weapon unlocks and weapon level-ups
 */
export class UpgradeSystem {
  constructor() {
    this.unlockedWeapons = new Set(['blaster']); // Start with blaster
    this.weaponLevels = new Map([['blaster', 1]]); // Track weapon levels
  }

  /**
   * Get all available upgrades (new weapons + existing weapon level-ups)
   */
  getAvailableWeaponUpgrades() {
    return [
      {
        id: 'blaster',
        name: 'Blaster',
        description: 'Standard projectile weapon',
        icon: '🔫',
        weaponType: 'bullet',
        maxLevel: 5
      },
      {
        id: 'whip',
        name: 'Whip',
        description: 'Melee arc attack with close range',
        icon: '🪢',
        weaponType: 'whip',
        maxLevel: 5
      },
      {
        id: 'laser',
        name: 'Laser Beam',
        description: 'Continuous damage beam',
        icon: '⚡',
        weaponType: 'laser',
        maxLevel: 5
      },
      {
        id: 'cannon',
        name: 'Cannon',
        description: 'Powerful explosive shots',
        icon: '💣',
        weaponType: 'cannon',
        maxLevel: 5
      },
      {
        id: 'boomerang',
        name: 'Boomerang',
        description: 'Returns after hitting enemies',
        icon: '🪃',
        weaponType: 'boomerang',
        maxLevel: 5
      },
      {
        id: 'lightning',
        name: 'Lightning',
        description: 'Chain lightning between enemies',
        icon: '⚡',
        weaponType: 'lightning',
        maxLevel: 5
      },
      {
        id: 'missiles',
        name: 'Homing Missiles',
        description: 'Tracks nearest enemies',
        icon: '🚀',
        weaponType: 'missiles',
        maxLevel: 5
      },
      {
        id: 'flamethrower',
        name: 'Flamethrower',
        description: 'Continuous cone of fire',
        icon: '🔥',
        weaponType: 'flamethrower',
        maxLevel: 5
      },
      {
        id: 'sword',
        name: 'Spinning Sword',
        description: 'Orbits around you',
        icon: '⚔️',
        weaponType: 'sword',
        maxLevel: 5
      },
      {
        id: 'freeze_ray',
        name: 'Freeze Ray',
        description: 'Slows and damages enemies',
        icon: '❄️',
        weaponType: 'freeze',
        maxLevel: 5
      }
    ];
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
   * Get a random selection of upgrades (new weapons + level-ups)
   * @param {number} count - Number of upgrades to offer
   * @returns {Array} Array of weapon upgrade options
   */
  getUpgradeChoices(count = 3) {
    const weapons = this.getAvailableWeaponUpgrades();
    const available = [];

    weapons.forEach(weapon => {
      const currentLevel = this.weaponLevels.get(weapon.id) || 0;
      const isUnlocked = this.unlockedWeapons.has(weapon.id);

      // Offer new weapons
      if (!isUnlocked) {
        available.push({
          id: weapon.id,
          name: weapon.name,
          description: this.getUpgradeDescription(weapon.id, 0),
          icon: weapon.icon,
          currentLevel: 0,
          isNewWeapon: true
        });
      }
      // Offer level-ups for unlocked weapons
      else if (currentLevel < weapon.maxLevel) {
        available.push({
          id: weapon.id,
          name: weapon.name,
          description: this.getUpgradeDescription(weapon.id, currentLevel),
          icon: weapon.icon,
          currentLevel: currentLevel,
          nextLevel: currentLevel + 1,
          isNewWeapon: false
        });
      }
    });

    // Shuffle and return requested count
    const shuffled = available.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Apply a weapon upgrade (unlock or level up)
   * @param {string} weaponId - ID of weapon to upgrade
   */
  applyUpgrade(weaponId) {
    const currentLevel = this.weaponLevels.get(weaponId) || 0;

    if (!this.unlockedWeapons.has(weaponId)) {
      // Unlock new weapon
      this.unlockedWeapons.add(weaponId);
      this.weaponLevels.set(weaponId, 1);
    } else {
      // Level up existing weapon
      this.weaponLevels.set(weaponId, currentLevel + 1);
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
   * Calculate total effects from all upgrades (compatibility method)
   */
  calculateEffects() {
    // Return empty effects object for compatibility
    return {};
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
  }
}

/**
 * WeaponSystem - Manages multiple auto-firing weapons with various patterns
 */
import { BulletWeapon } from '../weapons/BulletWeapon.js';
import { FlameThrowerWeapon } from '../weapons/FlameThrowerWeapon.js';
import { LaserWeapon } from '../weapons/LaserWeapon.js';
import { VolcanoWeapon } from '../weapons/VolcanoWeapon.js';
import { WhipWeapon } from '../weapons/WhipWeapon.js';

export class WeaponSystem {
  constructor(assets) {
    this.enabled = true;
    this.assets = assets;

    // All weapon types (for selection)
    this.allWeaponTypes = [
      new BulletWeapon(assets),
      new WhipWeapon(assets),
      new LaserWeapon(assets),
      new FlameThrowerWeapon(assets),
      new VolcanoWeapon(assets)
    ];

    // Active weapons (starts with blaster)
    this.activeWeapons = [this.allWeaponTypes[0]];

    // Starting weapon index for selection
    this.startingWeaponIndex = 0;
  }

  /**
   * Get all available weapons for initial selection
   */
  getAvailableWeapons() {
    return this.allWeaponTypes.map((weapon, index) => ({
      index,
      name: weapon.name,
      description: weapon.description,
      icon: weapon.icon
    }));
  }

  /**
   * Select a starting weapon by index
   */
  selectWeapon(index) {
    if (index >= 0 && index < this.allWeaponTypes.length) {
      this.startingWeaponIndex = index;
      this.activeWeapons = [this.allWeaponTypes[index]];
      return true;
    }
    return false;
  }

  /**
   * Add a weapon to active arsenal
   */
  addWeapon(weaponId) {
    // Map weapon IDs to weapon instances
    const weaponMap = {
      'blaster': new BulletWeapon(this.assets),
      'whip': new WhipWeapon(this.assets),
      'laser': new LaserWeapon(this.assets),
      'flamethrower': new FlameThrowerWeapon(this.assets),
      'volcano': new VolcanoWeapon(this.assets)
      // More weapons can be added here as they're implemented
    };

    const weapon = weaponMap[weaponId];
    if (weapon) {
      // Check if weapon type already active
      const alreadyHas = this.activeWeapons.some(w => w.name === weapon.name);
      if (!alreadyHas) {
        this.activeWeapons.push(weapon);
        return true;
      }
    }
    return false;
  }

  /**
   * Level up an existing weapon
   */
  levelUpWeapon(weaponId, newLevel) {
    const weaponMap = {
      'blaster': 'Blaster',
      'whip': 'Whip',
      'laser': 'Laser Beam',
      'flamethrower': 'Flame Thrower',
      'volcano': 'Volcano Launcher'
    };

    const weaponName = weaponMap[weaponId];
    const weapon = this.activeWeapons.find(w => w.name === weaponName);

    if (weapon && weapon.setLevel) {
      weapon.setLevel(newLevel);
      return true;
    }
    return false;
  }

  /**
   * Get current active weapons
   */
  getActiveWeapons() {
    return this.activeWeapons;
  }

  /**
   * Update all active weapons and auto-fire if ready
   */
  update(dino, projectiles, effects) {
    if (!this.enabled) return;

    // Update all active weapons
    this.activeWeapons.forEach(weapon => {
      weapon.update(dino, projectiles, effects);
    });
  }

  /**
   * Draw all weapon effects (for whip and laser)
   */
  draw(ctx, frameCount) {
    this.activeWeapons.forEach(weapon => {
      if (weapon.draw) {
        weapon.draw(ctx, frameCount);
      }
    });
  }

  /**
   * Check collisions for all melee weapons
   */
  checkCollisions(enemies, onHit) {
    this.activeWeapons.forEach(weapon => {
      if (weapon.checkCollisions) {
        weapon.checkCollisions(enemies, onHit);
      }
    });
  }

  /**
   * Reset weapon system
   */
  reset() {
    this.activeWeapons.forEach(weapon => weapon.reset());
    // Keep only the starting weapon
    this.activeWeapons = [this.allWeaponTypes[this.startingWeaponIndex]];
  }

  /**
   * Toggle auto-fire on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}


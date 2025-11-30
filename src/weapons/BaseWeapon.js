/**
 * BaseWeapon - Abstract base class for all weapons
 */
export class BaseWeapon {
  constructor(name, description, icon) {
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.fireRateBase = 30; // frames between shots
    this.fireRateCounter = 0;
  }

  /**
   * Update weapon (to be overridden)
   */
  update(dino, projectiles, effects) {
    this.fireRateCounter++;
  }

  /**
   * Fire weapon (to be overridden)
   */
  fire(dino, projectiles, effects) {
    // Override in subclass
  }

  /**
   * Reset weapon state
   */
  reset() {
    this.fireRateCounter = 0;
  }
}

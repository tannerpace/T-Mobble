/**
 * ExperienceManager - Handles XP, leveling, and upgrade selection
 */
export class ExperienceManager {
  constructor() {
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 500; // Much higher starting requirement
    this.xpGrowthRate = 1.5; // Each level requires 50% more XP (steeper curve)
    this.pendingLevelUps = 0;
    this.listeners = {
      onLevelUp: null,
      onXPGain: null
    };
  }

  /**
   * Add XP and check for level ups
   * @param {number} amount - XP to add
   */
  addXP(amount) {
    this.xp += amount;

    if (this.listeners.onXPGain) {
      this.listeners.onXPGain(amount, this.xp, this.xpToNextLevel);
    }

    // Check for level up (can level up multiple times)
    while (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }

  /**
   * Level up the player
   */
  levelUp() {
    this.xp -= this.xpToNextLevel;
    this.level++;
    this.pendingLevelUps++;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * this.xpGrowthRate);

    if (this.listeners.onLevelUp) {
      this.listeners.onLevelUp(this.level, this.pendingLevelUps);
    }
  }

  /**
   * Consume a pending level up (when upgrade is selected)
   */
  consumeLevelUp() {
    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps--;
      return true;
    }
    return false;
  }

  /**
   * Get current XP progress as percentage
   */
  getXPProgress() {
    return (this.xp / this.xpToNextLevel) * 100;
  }

  /**
   * Reset XP system
   */
  reset() {
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 500;
    this.pendingLevelUps = 0;
  }

  /**
   * Get current state for UI
   */
  getState() {
    return {
      xp: this.xp,
      level: this.level,
      xpToNextLevel: this.xpToNextLevel,
      progress: this.getXPProgress(),
      pendingLevelUps: this.pendingLevelUps
    };
  }
}

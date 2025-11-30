/**
 * ExperienceManager - Handles XP, leveling, and upgrade selection
 */
export class ExperienceManager {
  constructor() {
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100; // Easy first level
    this.baseXP = 100; // Starting requirement
    this.pendingLevelUps = 0;
    this.listeners = {
      onLevelUp: null,
      onXPGain: null
    };
  }

  /**
   * Calculate XP required for a specific level using exponential curve
   * Formula creates fast early progression, then exponentially harder
   * @param {number} level - Target level
   * @returns {number} XP required
   */
  calculateXPForLevel(level) {
    // Early game (levels 1-5): Linear growth for quick satisfaction
    if (level <= 5) {
      return Math.floor(this.baseXP * level);
    }
    // Mid game (levels 6-12): Moderate exponential curve
    else if (level <= 12) {
      return Math.floor(this.baseXP * Math.pow(level, 1.5));
    }
    // Late game (13+): Strong exponential curve for long-term engagement
    else {
      return Math.floor(this.baseXP * Math.pow(level, 1.8));
    }
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

    // Calculate next level requirement using exponential formula
    this.xpToNextLevel = this.calculateXPForLevel(this.level);

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
    this.xpToNextLevel = 100;
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

  /**
   * Debug: Get XP requirements for multiple levels
   * Useful for balancing and testing
   */
  getProgressionCurve(maxLevel = 20) {
    const curve = [];
    for (let i = 1; i <= maxLevel; i++) {
      curve.push({
        level: i,
        xpRequired: this.calculateXPForLevel(i),
        totalXP: this.getTotalXPForLevel(i)
      });
    }
    return curve;
  }

  /**
   * Calculate total XP needed to reach a specific level
   */
  getTotalXPForLevel(targetLevel) {
    let total = 0;
    for (let i = 1; i < targetLevel; i++) {
      total += this.calculateXPForLevel(i);
    }
    return total;
  }
}

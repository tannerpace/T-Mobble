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
   * Calculate XP required for a specific level using Fibonacci-inspired curve
   * Creates organic progression that approaches the Golden Ratio (φ ≈ 1.618)
   * 
   * Level Thresholds:
   * Level 1: 0 XP (start)
   * Level 2: 100 XP
   * Level 3: 160 XP (+60, ratio 1.6)
   * Level 4: 260 XP (+100, ratio 1.625)
   * Level 5: 420 XP (+160, ratio 1.615)
   * Level 6: 680 XP (+260, ratio 1.619)
   * Level 7: 1100 XP (+420, ratio 1.617)
   * Level 8: 1780 XP (+680, ratio 1.618)
   * ...continues approaching φ (1.618)
   * 
   * @param {number} level - Target level
   * @returns {number} XP required for that level
   */
  calculateXPForLevel(level) {
    if (level <= 1) return 0;
    if (level === 2) return 100;
    if (level === 3) return 160;

    // Fibonacci-style: XP(n) = XP(n-1) + XP(n-2)
    // This creates natural growth approaching the Golden Ratio
    let prev2 = 100; // Level 2 requirement
    let prev1 = 160; // Level 3 requirement

    for (let i = 4; i <= level; i++) {
      const next = prev1 + prev2;
      prev2 = prev1;
      prev1 = next;
    }

    return prev1;
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

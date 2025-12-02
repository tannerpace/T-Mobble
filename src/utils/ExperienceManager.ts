/**
 * ExperienceManager - Handles XP, leveling, and upgrade selection
 */

export interface XPState {
  xp: number;
  level: number;
  xpToNextLevel: number;
  progress: number;
  pendingLevelUps: number;
}

export interface XPListeners {
  onLevelUp: ((level: number, pending: number) => void) | null;
  onXPGain: ((amount: number, current: number, max: number) => void) | null;
}

export interface LevelProgressionEntry {
  level: number;
  xpRequired: number;
  totalXP: number;
}

export class ExperienceManager {
  public xp: number;
  public level: number;
  public xpToNextLevel: number;
  public pendingLevelUps: number;
  public listeners: XPListeners;

  private baseXP: number;

  constructor() {
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100;
    this.baseXP = 100;
    this.pendingLevelUps = 0;
    this.listeners = {
      onLevelUp: null,
      onXPGain: null
    };
  }

  /**
   * Calculate XP required for a specific level using Fibonacci-inspired curve
   * Creates organic progression that approaches the Golden Ratio (φ ≈ 1.618)
   */
  calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;
    if (level === 2) return 100;
    if (level === 3) return 160;

    let prev2 = 100;
    let prev1 = 160;

    for (let i = 4; i <= level; i++) {
      const next = prev1 + prev2;
      prev2 = prev1;
      prev1 = next;
    }

    return prev1;
  }

  /**
   * Add XP and check for level ups
   */
  addXP(amount: number): void {
    this.xp += amount;

    if (this.listeners.onXPGain) {
      this.listeners.onXPGain(amount, this.xp, this.xpToNextLevel);
    }

    while (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }

  /**
   * Level up the player
   */
  private levelUp(): void {
    this.xp -= this.xpToNextLevel;
    this.level++;
    this.pendingLevelUps++;

    this.xpToNextLevel = this.calculateXPForLevel(this.level);

    if (this.listeners.onLevelUp) {
      this.listeners.onLevelUp(this.level, this.pendingLevelUps);
    }
  }

  /**
   * Consume a pending level up (when upgrade is selected)
   */
  consumeLevelUp(): boolean {
    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps--;
      return true;
    }
    return false;
  }

  /**
   * Get current XP progress as percentage
   */
  getXPProgress(): number {
    return (this.xp / this.xpToNextLevel) * 100;
  }

  /**
   * Reset XP system
   */
  reset(): void {
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100;
    this.pendingLevelUps = 0;
  }

  /**
   * Get current state for UI
   */
  getState(): XPState {
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
   */
  getProgressionCurve(maxLevel: number = 20): LevelProgressionEntry[] {
    const curve: LevelProgressionEntry[] = [];
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
  getTotalXPForLevel(targetLevel: number): number {
    let total = 0;
    for (let i = 1; i < targetLevel; i++) {
      total += this.calculateXPForLevel(i);
    }
    return total;
  }
}

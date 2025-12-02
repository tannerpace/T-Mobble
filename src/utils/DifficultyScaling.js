/**
 * DifficultyScaling - Manages enemy scaling, spawn rates, and difficulty progression
 */
export class DifficultyScaling {
  constructor() {
    this.config = {
      baseSpawnInterval: 200,
      minSpawnInterval: 30,
      baseSpawnChance: 0.3,
      baseEliteChance: 0.10,
      maxEliteChance: 0.30
    };
  }

  /**
   * Calculate spawn interval based on level
   * Formula: max(minInterval, baseInterval * 0.85^floor(level/2))
   */
  calculateSpawnInterval(level) {
    return Math.max(
      this.config.minSpawnInterval,
      Math.floor(this.config.baseSpawnInterval * Math.pow(0.85, Math.floor(level / 2)))
    );
  }

  /**
   * Calculate spawn chance based on level
   * Formula: min(1.0, baseChance + (level * 0.07))
   */
  calculateSpawnChance(level) {
    return Math.min(1.0, this.config.baseSpawnChance + (level * 0.07));
  }

  /**
   * Calculate enemy health multiplier based on level
   * Health increases every 5 levels by 50%
   */
  calculateHealthMultiplier(level) {
    return 1 + Math.floor(level / 5) * 0.5;
  }

  /**
   * Calculate enemy speed multiplier based on level
   */
  calculateSpeedMultiplier(level) {
    return 1 + (level / 20);
  }

  /**
   * Calculate elite spawn chance based on level
   */
  calculateEliteChance(level) {
    const levelBonus = level * 0.01;
    return Math.min(this.config.maxEliteChance, this.config.baseEliteChance + levelBonus);
  }

  /**
   * Get scaled enemy stats for a specific enemy type
   */
  getScaledEnemyStats(baseStats, level) {
    const healthMult = this.calculateHealthMultiplier(level);
    const speedMult = this.calculateSpeedMultiplier(level);

    return {
      health: Math.floor(baseStats.health * healthMult),
      speed: baseStats.speed * speedMult,
      xpValue: Math.floor(baseStats.xpValue * (1 + level * 0.1)),
      damage: baseStats.damage || 1
    };
  }

  /**
   * Get difficulty progression table for debugging
   */
  getProgressionTable(maxLevel = 20) {
    const table = [];
    for (let level = 1; level <= maxLevel; level++) {
      table.push({
        level,
        spawnInterval: this.calculateSpawnInterval(level),
        spawnChance: Math.round(this.calculateSpawnChance(level) * 100),
        healthMult: this.calculateHealthMultiplier(level).toFixed(1),
        speedMult: this.calculateSpeedMultiplier(level).toFixed(2),
        eliteChance: Math.round(this.calculateEliteChance(level) * 100)
      });
    }
    return table;
  }
}

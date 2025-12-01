/**
 * CoinUpgradeManager - Handles coin collection and upgrade triggering
 * Extracts the duplicate coin upgrade logic from Game.js
 */
export class CoinUpgradeManager {
  /**
   * @param {Object} callbacks - Callback functions
   * @param {Function} callbacks.onUpgradeAvailable - Called when upgrade becomes available
   * @param {Function} callbacks.onCoinCollected - Called when coin is collected with value
   */
  constructor(callbacks = {}) {
    this.powerUpCount = 0;
    this.coinUpgrades = 0;
    this.powerUpUpgradeThreshold = 1; // Start at 1 coin (will double each time)

    this.onUpgradeAvailable = callbacks.onUpgradeAvailable || (() => {});
    this.onCoinCollected = callbacks.onCoinCollected || (() => {});
  }

  /**
   * Add coins and check for upgrade availability
   * @param {number} value - Number of coins to add
   * @returns {boolean} True if upgrade became available
   */
  addCoins(value = 1) {
    this.powerUpCount += value;
    this.onCoinCollected(value, this.powerUpCount);

    if (this.powerUpCount >= this.powerUpUpgradeThreshold) {
      return this.purchaseUpgrade();
    }

    return false;
  }

  /**
   * Purchase an upgrade with accumulated coins
   * @returns {boolean} True if upgrade was purchased
   */
  purchaseUpgrade() {
    if (this.powerUpCount < this.powerUpUpgradeThreshold) {
      return false;
    }

    this.powerUpCount -= this.powerUpUpgradeThreshold;
    this.coinUpgrades++;

    // Double the threshold for next upgrade (power of 2: 1, 2, 4, 8, 16, 32...)
    this.powerUpUpgradeThreshold = Math.pow(2, this.coinUpgrades);

    console.log(
      `Upgrade #${this.coinUpgrades} available! Next upgrade at ${this.powerUpUpgradeThreshold} coins. Remaining: ${this.powerUpCount}`
    );

    this.onUpgradeAvailable(this.coinUpgrades, this.powerUpUpgradeThreshold);
    return true;
  }

  /**
   * Get current state
   * @returns {Object} Current coin state
   */
  getState() {
    return {
      powerUpCount: this.powerUpCount,
      coinUpgrades: this.coinUpgrades,
      threshold: this.powerUpUpgradeThreshold
    };
  }

  /**
   * Reset coin state
   */
  reset() {
    this.powerUpCount = 0;
    this.coinUpgrades = 0;
    this.powerUpUpgradeThreshold = 1;
  }
}

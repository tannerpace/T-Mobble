/**
 * GameState - manages game state and configuration
 */
export class GameState {
  constructor() {
    this.reset();
  }

  /**
   * Reset all game state to initial values
   */
  reset() {
    this.gameRunning = false;
    this.gameOver = false;
    this.gameSpeed = 2;
    this.maxGameSpeed = 8;
    this.frameCount = 0;
    this.powerUpCount = 0;
    this.coinUpgrades = 0;
    this.powerUpUpgradeThreshold = 1;
    this.isSubmitting = false;
    this.isPaused = false;
    this.regenerationCounter = 0;
  }

  /**
   * Check if game is active (running and not paused)
   */
  isActive() {
    return this.gameRunning && !this.gameOver && !this.isPaused;
  }

  /**
   * Increment frame counter
   */
  incrementFrame() {
    this.frameCount++;
  }

  /**
   * Increase game speed with diminishing returns
   * @param {number} scoreModulo - Score interval for speed increase
   * @param {number} speedModifier - Speed multiplier from upgrades
   */
  increaseSpeed(scoreModulo, speedModifier = 1) {
    if (this.gameSpeed >= this.maxGameSpeed) return;

    // Calculate increment based on current speed (smaller increments as speed increases)
    const speedIncrement = this.gameSpeed < 4 ? 0.3 : this.gameSpeed < 6 ? 0.2 : 0.1;
    this.gameSpeed = Math.min(this.maxGameSpeed, this.gameSpeed + (speedIncrement * speedModifier));
  }

  /**
   * Pause the game
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Unpause the game
   */
  unpause() {
    this.isPaused = false;
  }

  /**
   * Start the game
   */
  start() {
    this.gameRunning = true;
    this.gameOver = false;
  }

  /**
   * End the game
   */
  end() {
    this.gameOver = true;
    this.gameRunning = false;
  }

  /**
   * Check if player has enough coins for upgrade
   */
  canAffordUpgrade() {
    return this.powerUpCount >= this.powerUpUpgradeThreshold;
  }

  /**
   * Purchase an upgrade with coins
   */
  purchaseUpgrade() {
    if (!this.canAffordUpgrade()) return false;

    this.powerUpCount -= this.powerUpUpgradeThreshold;
    this.coinUpgrades++;

    // Double the threshold for next upgrade (power of 2: 1, 2, 4, 8, 16, 32...)
    this.powerUpUpgradeThreshold = Math.pow(2, this.coinUpgrades);

    console.log(`Upgrade #${this.coinUpgrades} purchased! Next at ${this.powerUpUpgradeThreshold} coins. Remaining: ${this.powerUpCount}`);
    return true;
  }

  /**
   * Add coins to the player's total
   * @param {number} amount - Number of coins to add
   */
  addCoins(amount) {
    this.powerUpCount += amount;
  }
}

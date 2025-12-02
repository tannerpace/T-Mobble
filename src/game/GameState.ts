/**
 * GameState - manages game state and configuration
 */
export class GameState {
  public gameRunning: boolean;
  public gameOver: boolean;
  public gameSpeed: number;
  public maxGameSpeed: number;
  public frameCount: number;
  public powerUpCount: number;
  public coinUpgrades: number;
  public powerUpUpgradeThreshold: number;
  public isSubmitting: boolean;
  public isPaused: boolean;
  public regenerationCounter: number;

  constructor() {
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
    this.reset();
  }

  /**
   * Reset all game state to initial values
   */
  reset(): void {
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
  isActive(): boolean {
    return this.gameRunning && !this.gameOver && !this.isPaused;
  }

  /**
   * Increment frame counter
   */
  incrementFrame(): void {
    this.frameCount++;
  }

  /**
   * Increase game speed with diminishing returns
   * @param scoreModulo - Score interval for speed increase
   * @param speedModifier - Speed multiplier from upgrades
   */
  increaseSpeed(scoreModulo: number, speedModifier: number = 1): void {
    if (this.gameSpeed >= this.maxGameSpeed) return;

    // Calculate increment based on current speed (smaller increments as speed increases)
    const speedIncrement = this.gameSpeed < 4 ? 0.3 : this.gameSpeed < 6 ? 0.2 : 0.1;
    this.gameSpeed = Math.min(this.maxGameSpeed, this.gameSpeed + (speedIncrement * speedModifier));
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Unpause the game
   */
  unpause(): void {
    this.isPaused = false;
  }

  /**
   * Start the game
   */
  start(): void {
    this.gameRunning = true;
    this.gameOver = false;
  }

  /**
   * End the game
   */
  end(): void {
    this.gameOver = true;
    this.gameRunning = false;
  }

  /**
   * Check if player has enough coins for upgrade
   */
  canAffordUpgrade(): boolean {
    return this.powerUpCount >= this.powerUpUpgradeThreshold;
  }

  /**
   * Purchase an upgrade with coins
   */
  purchaseUpgrade(): boolean {
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
   * @param amount - Number of coins to add
   */
  addCoins(amount: number): void {
    this.powerUpCount += amount;
  }
}

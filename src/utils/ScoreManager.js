/**
 * Score manager - handles score tracking and high score persistence
 */
export class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
  }

  /**
   * Load high score from localStorage
   */
  loadHighScore() {
    return parseInt(localStorage.getItem('dinoHighScore') || '0', 10);
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore() {
    localStorage.setItem('dinoHighScore', this.highScore.toString());
  }

  /**
   * Get current score (divided by 10 for display)
   */
  getCurrentScore() {
    return Math.floor(this.score / 10);
  }

  /**
   * Increment score
   */
  increment() {
    this.score++;
  }

  /**
   * Update high score if current score is higher
   */
  updateHighScore() {
    const currentScore = this.getCurrentScore();
    if (currentScore > this.highScore) {
      this.highScore = currentScore;
      this.saveHighScore();
      return true;
    }
    return false;
  }

  /**
   * Reset current score
   */
  reset() {
    this.score = 0;
  }

  /**
   * Format score for display (5 digits with leading zeros)
   */
  formatScore(score) {
    return String(score).padStart(5, '0');
  }
}

/**
 * Score manager - handles score tracking and high score persistence
 * Supports both local high scores and global leaderboard via Cloudflare Workers
 */
export class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.leaderboardApi = null; // Set this to your Cloudflare Worker URL
    this.playerName = this.loadPlayerName();
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
   * Load player name from localStorage
   */
  loadPlayerName() {
    return localStorage.getItem('dinoPlayerName') || '';
  }

  /**
   * Save player name to localStorage
   */
  savePlayerName(name) {
    this.playerName = name;
    localStorage.setItem('dinoPlayerName', name);
  }

  /**
   * Set the Cloudflare Worker API endpoint
   */
  setLeaderboardApi(url) {
    this.leaderboardApi = url;
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

  /**
   * Submit score to global leaderboard
   * @param {string} name - Player name
   * @returns {Promise<Object>} Response with rank and leaderboard info
   */
  async submitToLeaderboard(name) {
    if (!this.leaderboardApi) {
      console.warn('Leaderboard API not configured');
      return { success: false, error: 'API not configured' };
    }

    const currentScore = this.getCurrentScore();

    try {
      const response = await fetch(`${this.leaderboardApi}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          score: currentScore
        })
      });

      const data = await response.json();

      if (data.success) {
        this.savePlayerName(name);
      }

      return data;
    } catch (error) {
      console.error('Failed to submit score to leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch global leaderboard
   * @returns {Promise<Array>} Top scores
   */
  async fetchLeaderboard() {
    if (!this.leaderboardApi) {
      console.warn('Leaderboard API not configured');
      return { success: false, scores: [] };
    }

    try {
      const response = await fetch(`${this.leaderboardApi}/scores`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return { success: false, scores: [], error: error.message };
    }
  }
}

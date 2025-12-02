/**
 * Score manager - handles score tracking and high score persistence
 * Supports both local high scores and global leaderboard via Cloudflare Workers
 */

export interface LeaderboardResponse {
  success: boolean;
  scores?: LeaderboardEntry[];
  error?: string;
  rank?: number;
  total?: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}

export class ScoreManager {
  public score: number;
  public highScore: number;
  public playerName: string;
  private leaderboardApi: string | null;
  private cacheKey: string;
  private cacheTimeKey: string;
  private cacheExpiryMs: number;

  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.leaderboardApi = null;
    this.playerName = this.loadPlayerName();
    this.cacheKey = 'dinoLeaderboardCache';
    this.cacheTimeKey = 'dinoLeaderboardCacheTime';
    this.cacheExpiryMs = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load high score from localStorage
   */
  private loadHighScore(): number {
    return parseInt(localStorage.getItem('dinoHighScore') || '0', 10);
  }

  /**
   * Save high score to localStorage
   */
  private saveHighScore(): void {
    localStorage.setItem('dinoHighScore', this.highScore.toString());
  }

  /**
   * Load player name from localStorage
   */
  private loadPlayerName(): string {
    return localStorage.getItem('dinoPlayerName') || '';
  }

  /**
   * Save player name to localStorage
   */
  savePlayerName(name: string): void {
    this.playerName = name;
    localStorage.setItem('dinoPlayerName', name);
  }

  /**
   * Set the Cloudflare Worker API endpoint
   */
  setLeaderboardApi(url: string): void {
    this.leaderboardApi = url;
  }

  /**
   * Get current score (divided by 10 for display)
   */
  getCurrentScore(): number {
    return Math.floor(this.score / 10);
  }

  /**
   * Increment score
   */
  increment(): void {
    this.score++;
  }

  /**
   * Update high score if current score is higher
   */
  updateHighScore(): boolean {
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
  reset(): void {
    this.score = 0;
  }

  /**
   * Format score for display (5 digits with leading zeros)
   */
  formatScore(score: number): string {
    return String(score).padStart(5, '0');
  }

  /**
   * Get cached leaderboard if still valid
   */
  private getCachedLeaderboard(): LeaderboardResponse | null {
    try {
      const cached = sessionStorage.getItem(this.cacheKey);
      const cacheTime = sessionStorage.getItem(this.cacheTimeKey);

      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime, 10);
        if (age < this.cacheExpiryMs) {
          return JSON.parse(cached) as LeaderboardResponse;
        }
      }
    } catch (error) {
      console.error('Error reading leaderboard cache:', error);
    }
    return null;
  }

  /**
   * Save leaderboard to cache
   */
  private cacheLeaderboard(data: LeaderboardResponse): void {
    try {
      sessionStorage.setItem(this.cacheKey, JSON.stringify(data));
      sessionStorage.setItem(this.cacheTimeKey, Date.now().toString());
    } catch (error) {
      console.error('Error caching leaderboard:', error);
    }
  }

  /**
   * Clear leaderboard cache (useful after submitting a score)
   */
  private clearLeaderboardCache(): void {
    try {
      sessionStorage.removeItem(this.cacheKey);
      sessionStorage.removeItem(this.cacheTimeKey);
    } catch (error) {
      console.error('Error clearing leaderboard cache:', error);
    }
  }

  /**
   * Submit score to global leaderboard
   */
  async submitToLeaderboard(name: string): Promise<LeaderboardResponse> {
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

      const data = await response.json() as LeaderboardResponse;

      if (data.success) {
        this.savePlayerName(name);
        this.clearLeaderboardCache();
      }

      return data;
    } catch (error) {
      console.error('Failed to submit score to leaderboard:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Fetch global leaderboard (with caching)
   */
  async fetchLeaderboard(forceRefresh: boolean = false): Promise<LeaderboardResponse> {
    if (!this.leaderboardApi) {
      console.warn('Leaderboard API not configured');
      return { success: false, scores: [] };
    }

    if (!forceRefresh) {
      const cached = this.getCachedLeaderboard();
      if (cached) {
        console.log('Using cached leaderboard data');
        return cached;
      }
    }

    try {
      const response = await fetch(`${this.leaderboardApi}/scores`);
      const data = await response.json() as LeaderboardResponse;

      if (data.success) {
        this.cacheLeaderboard(data);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return { success: false, scores: [], error: (error as Error).message };
    }
  }
}

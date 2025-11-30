/**
 * Main Game class - orchestrates all game logic
 */
import { Bullet } from '../entities/Bullet.js';
import { Cloud } from '../entities/Cloud.js';
import { Dino } from '../entities/Dino.js';
import { Obstacle } from '../entities/Obstacle.js';
import { PowerUp } from '../entities/PowerUp.js';
import { ScoreManager } from '../utils/ScoreManager.js';
import { checkCollision } from '../utils/collision.js';
import { InputHandler } from './InputHandler.js';
import { Renderer } from './Renderer.js';

export class Game {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;

    // Game state
    this.gameRunning = false;
    this.gameOver = false;
    this.gameSpeed = 2;
    this.gravity = 0.5;
    this.frameCount = 0;
    this.animationId = null;
    this.powerUpCount = 0;

    // Game systems
    this.renderer = new Renderer(canvas, this.ctx);
    this.scoreManager = new ScoreManager();

    // Entities
    this.dino = new Dino(canvas, this.gravity, assets);
    this.obstacles = [];
    this.clouds = [new Cloud(canvas), new Cloud(canvas), new Cloud(canvas)];
    this.powerUps = [];
    this.bullets = [];

    // Input handling
    const jumpBtn = document.getElementById('jumpBtn');
    const shootBtn = document.getElementById('shootBtn');
    this.inputHandler = new InputHandler(canvas, jumpBtn, shootBtn);
    this.setupInputCallbacks();

    // Leaderboard UI
    this.setupLeaderboardUI();

    // Update UI
    this.updateScoreDisplay();
  }

  /**
   * Setup input handler callbacks
   */
  setupInputCallbacks() {
    this.inputHandler.onJump = () => this.handleJumpAction();
    this.inputHandler.onJumpRelease = () => this.handleJumpRelease();
    this.inputHandler.onShoot = () => this.handleShootAction();
  }

  /**
   * Handle jump action based on game state
   */
  handleJumpAction() {
    if (!this.gameRunning && !this.gameOver) {
      this.startGame();
    } else if (this.gameOver) {
      this.restartGame();
    } else if (this.gameRunning) {
      this.dino.jump();
    }
  }

  /**
   * Handle jump button release
   */
  handleJumpRelease() {
    if (this.gameRunning && !this.gameOver) {
      this.dino.releaseJump();
    }
  }

  /**
   * Handle shoot action
   */
  handleShootAction() {
    if (this.gameRunning && !this.gameOver) {
      this.shootBullet();
    }
  }

  /**
   * Start the game
   */
  startGame() {
    console.log('Starting game...');
    this.gameRunning = true;
  }

  /**
   * Restart the game after game over
   */
  restartGame() {
    console.log('Restarting game...');
    this.resetGame();
    this.gameRunning = true;
  }

  /**
   * Reset game state
   */
  resetGame() {
    this.obstacles = [];
    this.powerUps = [];
    this.bullets = [];
    this.scoreManager.reset();
    this.gameSpeed = 2;
    this.frameCount = 0;
    this.powerUpCount = 0;
    this.gameOver = false;
    this.dino.reset();
    this.updateScoreDisplay();
  }

  /**
   * Shoot a bullet
   */
  shootBullet() {
    if (this.powerUpCount > 0) {
      const bulletY = this.dino.y + this.dino.height / 2;
      this.bullets.push(new Bullet(this.dino.x + this.dino.width, bulletY));
      this.powerUpCount--;
      console.log('Bullet fired! Remaining power-ups:', this.powerUpCount);
    } else {
      console.log('No power-ups! Collect power-ups to shoot.');
    }
  }

  /**
   * Spawn an obstacle
   */
  spawnObstacle() {
    const minDistance = 250; // Increased from 200 for more spacing
    const maxDistance = 400; // Add variety
    const lastObstacle = this.obstacles[this.obstacles.length - 1];

    if (!lastObstacle || this.canvas.width - lastObstacle.x > minDistance) {
      this.obstacles.push(new Obstacle(this.canvas, this.gameSpeed, this.assets.palmImg));
    }
  }

  /**
   * Spawn a power-up
   */
  spawnPowerUp() {
    if (Math.random() < 0.3) {
      this.powerUps.push(new PowerUp(this.canvas, this.gameSpeed));
    }
  }

  /**
   * Update score display in UI
   */
  updateScoreDisplay() {
    const currentScoreEl = document.getElementById('currentScore');
    const highScoreEl = document.getElementById('highScore');

    if (currentScoreEl) {
      currentScoreEl.textContent = this.scoreManager.formatScore(this.scoreManager.getCurrentScore());
    }
    if (highScoreEl) {
      highScoreEl.textContent = this.scoreManager.formatScore(this.scoreManager.highScore);
    }
  }

  /**
   * Update game state
   */
  update() {
    if (!this.gameRunning || this.gameOver) return;

    this.frameCount++;

    // Update dino
    this.dino.update();

    // Spawn obstacles with randomized timing
    // Random interval between 80-140 frames (was fixed at 100)
    const spawnInterval = 80 + Math.floor(Math.random() * 60);
    if (this.frameCount % spawnInterval === 0) {
      this.spawnObstacle();
    }

    // Spawn power-ups
    if (this.frameCount % 250 === 0) {
      this.spawnPowerUp();
    }

    // Update and manage power-ups
    this.updatePowerUps();

    // Update and manage bullets
    this.updateBullets();

    // Update and manage obstacles
    this.updateObstacles();

    // Update score
    this.scoreManager.increment();
    this.updateScoreDisplay();

    // Increase difficulty
    if (this.scoreManager.score % 200 === 0) {
      this.gameSpeed += 0.5;
    }
  }

  /**
   * Update power-ups
   */
  updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update();

      // Check collision with dino
      if (powerUp.checkCollision(this.dino)) {
        powerUp.collected = true;
        this.powerUpCount += 3;
        console.log('Power-up collected! Total:', this.powerUpCount);

        // Play sound
        this.assets.powerUpSound.currentTime = 0;
        this.assets.powerUpSound.play().catch(e => console.log('Audio play failed:', e));
      }

      // Remove if off-screen or collected
      if (powerUp.isOffScreen() || powerUp.collected) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * Update bullets
   */
  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update();

      // Check collision with obstacles
      for (let j = this.obstacles.length - 1; j >= 0; j--) {
        const obstacle = this.obstacles[j];
        if (bullet.checkCollision(obstacle)) {
          bullet.active = false;
          this.obstacles.splice(j, 1);
          this.bullets.splice(i, 1);
          console.log('Hit! Obstacle destroyed.');

          // Play hit sound
          this.assets.hitSound.currentTime = 0;
          this.assets.hitSound.play().catch(e => console.log('Audio play failed:', e));
          break;
        }
      }

      // Remove if off-screen
      if (bullet.isOffScreen(this.canvas.width)) {
        this.bullets.splice(i, 1);
      }
    }
  }

  /**
   * Update obstacles
   */
  updateObstacles() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update();

      // Check collision with dino
      if (checkCollision(this.dino, obstacle)) {
        this.gameOver = true;
        this.gameRunning = false;

        // Play end sound
        this.assets.endSound.currentTime = 0;
        this.assets.endSound.play().catch(e => console.log('Audio play failed:', e));

        // Update high score and prompt for leaderboard submission
        if (this.scoreManager.updateHighScore()) {
          this.updateScoreDisplay();
          // Prompt user to submit score to global leaderboard
          setTimeout(() => this.promptScoreSubmission(), 500);
        }
      }

      // Remove if off-screen
      if (obstacle.isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * Render all game elements
   */
  render() {
    this.renderer.clear();

    // Draw clouds
    this.clouds.forEach(cloud => {
      cloud.update();
      cloud.draw(this.ctx);
    });

    // Draw ground
    this.renderer.drawGround(this.frameCount, this.gameSpeed);

    // Draw game state screens
    if (!this.gameRunning) {
      this.dino.draw(this.ctx);
      this.renderer.drawStartScreen();
      return;
    }

    if (this.gameOver) {
      this.dino.draw(this.ctx);
      this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
      this.renderer.drawGameOver();
      return;
    }

    // Draw game entities
    this.dino.draw(this.ctx);
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    this.powerUps.forEach(powerUp => powerUp.draw(this.ctx, this.frameCount));
    this.bullets.forEach(bullet => bullet.draw(this.ctx));

    // Draw UI
    this.renderer.drawPowerUpCounter(this.powerUpCount);
  }

  /**
   * Main game loop
   */
  gameLoop() {
    this.update();
    this.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Start the game loop
   */
  start() {
    console.log('Starting game loop...');
    this.gameLoop();
  }

  /**
   * Setup leaderboard UI event handlers
   */
  setupLeaderboardUI() {
    const toggleBtn = document.getElementById('toggleLeaderboard');
    const closeBtn = document.getElementById('closeLeaderboard');
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    const nameModal = document.getElementById('nameModal');
    const submitBtn = document.getElementById('submitScore');
    const skipBtn = document.getElementById('skipSubmit');
    const playerNameInput = document.getElementById('playerNameInput');

    // Toggle leaderboard display
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (leaderboardContainer.style.display === 'none') {
          this.showLeaderboard();
        } else {
          leaderboardContainer.style.display = 'none';
        }
      });
    }

    // Close leaderboard
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        leaderboardContainer.style.display = 'none';
      });
    }

    // Submit score
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const name = playerNameInput.value.trim();
        if (name) {
          await this.submitPlayerScore(name);
        }
      });
    }

    // Skip submission
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        nameModal.style.display = 'none';
      });
    }

    // Submit on Enter key
    if (playerNameInput) {
      playerNameInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
          const name = playerNameInput.value.trim();
          if (name) {
            await this.submitPlayerScore(name);
          }
        }
      });
    }
  }

  /**
   * Show leaderboard and fetch scores
   */
  async showLeaderboard() {
    const container = document.getElementById('leaderboardContainer');
    const content = document.getElementById('leaderboardContent');

    container.style.display = 'block';
    content.innerHTML = '<p class="loading">Loading...</p>';

    try {
      const data = await this.scoreManager.fetchLeaderboard();

      if (data.success && data.scores && data.scores.length > 0) {
        const top50 = data.scores.slice(0, 50);
        let html = '<ul class="leaderboard-list">';

        top50.forEach((entry, index) => {
          const rank = index + 1;
          const topClass = rank <= 3 ? ' top-3' : '';
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

          html += `
            <li class="leaderboard-item${topClass}">
              <span class="leaderboard-rank">${medal} #${rank}</span>
              <span class="leaderboard-name">${this.escapeHtml(entry.name)}</span>
              <span class="leaderboard-score">${entry.score}</span>
            </li>
          `;
        });

        html += '</ul>';
        content.innerHTML = html;
      } else {
        content.innerHTML = '<p class="empty">No scores yet. Be the first!</p>';
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      content.innerHTML = '<p class="error">Failed to load leaderboard</p>';
    }
  }

  /**
   * Prompt user to submit score after new high score
   */
  promptScoreSubmission() {
    const modal = document.getElementById('nameModal');
    const input = document.getElementById('playerNameInput');
    const result = document.getElementById('submitResult');

    if (modal && input) {
      // Pre-fill with saved name
      input.value = this.scoreManager.playerName || '';
      result.textContent = '';
      result.className = 'submit-result';
      modal.style.display = 'flex';
      input.focus();
    }
  }

  /**
   * Submit player score to leaderboard
   */
  async submitPlayerScore(name) {
    const result = document.getElementById('submitResult');
    const modal = document.getElementById('nameModal');

    result.textContent = 'Submitting...';
    result.className = 'submit-result';

    try {
      const response = await this.scoreManager.submitToLeaderboard(name);

      if (response.success) {
        result.textContent = `🎉 Rank #${response.rank} of ${response.total}!`;
        result.className = 'submit-result success';

        // Close modal after 2 seconds
        setTimeout(() => {
          modal.style.display = 'none';
          // Automatically show leaderboard
          this.showLeaderboard();
        }, 2000);
      } else {
        result.textContent = 'Failed to submit: ' + (response.error || 'Unknown error');
        result.className = 'submit-result error';
      }
    } catch (error) {
      result.textContent = 'Error: ' + error.message;
      result.className = 'submit-result error';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

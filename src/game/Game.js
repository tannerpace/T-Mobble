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
    this.gameSpeed = 3;
    this.gravity = 0.6;
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

    // Update UI
    this.updateScoreDisplay();
  }

  /**
   * Setup input handler callbacks
   */
  setupInputCallbacks() {
    this.inputHandler.onJump = () => this.handleJumpAction();
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
    this.gameSpeed = 3;
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
    const minDistance = 200;
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

    // Spawn obstacles
    if (this.frameCount % 100 === 0) {
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

        // Update high score
        if (this.scoreManager.updateHighScore()) {
          this.updateScoreDisplay();
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
}

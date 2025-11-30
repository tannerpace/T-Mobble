/**
 * Main Game class - orchestrates all game logic
 */
import { Bullet } from '../entities/Bullet.js';
import { Cloud } from '../entities/Cloud.js';
import { Dino } from '../entities/Dino.js';
import { FlyingEnemy } from '../entities/FlyingEnemy.js';
import { Obstacle } from '../entities/Obstacle.js';
import { PowerUp } from '../entities/PowerUp.js';
import { TankEnemy } from '../entities/TankEnemy.js';
import { XPGem } from '../entities/XPGem.js';
import { ExperienceManager } from '../utils/ExperienceManager.js';
import { ParticleSystem, ScreenShake } from '../utils/ParticleSystem.js';
import { ScoreManager } from '../utils/ScoreManager.js';
import { UpgradeSystem } from '../utils/UpgradeSystem.js';
import { WeaponSystem } from '../utils/WeaponSystem.js';
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
    this.powerUpUpgradeThreshold = 10; // Coins needed for an upgrade
    this.isSubmitting = false;
    this.isPaused = false;
    this.regenerationCounter = 0;

    // Game systems
    this.renderer = new Renderer(canvas, this.ctx);
    this.scoreManager = new ScoreManager();
    this.xpManager = new ExperienceManager();
    this.upgradeSystem = new UpgradeSystem();
    this.weaponSystem = new WeaponSystem();
    this.particleSystem = new ParticleSystem();
    this.screenShake = new ScreenShake();

    // Entities
    this.dino = new Dino(canvas, this.gravity, assets);
    this.obstacles = [];
    this.enemies = []; // Flying and tank enemies
    this.xpGems = [];
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

    // Setup XP and upgrade systems
    this.setupXPSystem();
    this.setupUpgradeUI();

    // Set default starting weapon (Blaster)
    this.weaponSystem.selectWeapon(0);
    const weaponIcon = document.getElementById('weaponIcon');
    const weaponName = document.getElementById('weaponName');
    if (weaponIcon) weaponIcon.textContent = '🔫';
    if (weaponName) weaponName.textContent = 'Blaster';

    // Update UI
    this.updateScoreDisplay();
    this.updateHealthDisplay();
    this.updateXPDisplay();
  }

  /**
   * Setup XP system listeners
   */
  setupXPSystem() {
    this.xpManager.listeners.onLevelUp = (level, pending) => {
      console.log(`Level up! Now level ${level}`);

      // Show level up notification
      this.showLevelUpNotification(level);

      if (this.gameRunning && !this.gameOver) {
        this.pauseGame();
        // Delay upgrade modal slightly to show level up animation
        setTimeout(() => this.showUpgradeSelection(), 600);
      }
    };

    this.xpManager.listeners.onXPGain = (amount, current, max) => {
      this.updateXPDisplay();
    };
  }

  /**
   * Show level up notification
   */
  showLevelUpNotification(level) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `🎉 LEVEL ${level}! 🎉`;
    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
      notification.remove();
    }, 1000);
  }

  /**
   * Setup upgrade UI handlers
   */
  setupUpgradeUI() {
    // Will be set up when modal is shown
  }

  /**
   * Pause the game
   */
  pauseGame() {
    this.isPaused = true;
  }

  /**
   * Unpause the game
   */
  unpauseGame() {
    this.isPaused = false;
  }

  /**
   * Show upgrade selection modal
   */
  showUpgradeSelection() {
    const modal = document.getElementById('upgradeModal');
    const choicesContainer = document.getElementById('upgradeChoices');

    if (!modal || !choicesContainer) return;

    const choices = this.upgradeSystem.getUpgradeChoices(3);
    choicesContainer.innerHTML = '';

    // Update modal title
    const modalContent = modal.querySelector('.upgrade-content h2');
    if (modalContent) {
      modalContent.textContent = '⬆️ Level Up! Choose an Upgrade';
    }

    choices.forEach(weapon => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';

      let levelInfo = '';
      if (weapon.isNewWeapon) {
        levelInfo = '<div class="upgrade-level">NEW!</div>';
      } else {
        levelInfo = `<div class="upgrade-level">Level ${weapon.currentLevel} → ${weapon.nextLevel}</div>`;
      }

      card.innerHTML = `
        <div class="upgrade-icon">${weapon.icon}</div>
        <div class="upgrade-name">${weapon.name}</div>
        ${levelInfo}
        <div class="upgrade-description">${weapon.description}</div>
      `;

      card.addEventListener('click', () => {
        this.selectUpgrade(weapon.id);
      });

      choicesContainer.appendChild(card);
    });

    modal.style.display = 'flex';
  }

  /**
   * Select an upgrade (add or level up weapon)
   */
  selectUpgrade(weaponId) {
    const wasUnlocked = this.upgradeSystem.isWeaponUnlocked(weaponId);

    this.upgradeSystem.applyUpgrade(weaponId);

    // Add new weapon or update existing weapon level
    if (!wasUnlocked) {
      this.weaponSystem.addWeapon(weaponId);
    } else {
      this.weaponSystem.levelUpWeapon(weaponId, this.upgradeSystem.getWeaponLevel(weaponId));
    }

    this.xpManager.consumeLevelUp();

    // Play sound
    this.assets.beepSound.currentTime = 0;
    this.assets.beepSound.play().catch(e => console.log('Audio play failed:', e));

    // Close modal
    const modal = document.getElementById('upgradeModal');
    if (modal) {
      modal.style.display = 'none';
    }

    // Check if more level ups pending
    if (this.xpManager.pendingLevelUps > 0) {
      setTimeout(() => this.showUpgradeSelection(), 300);
    } else {
      this.unpauseGame();
    }
  }

  /**
   * Update health display
   */
  updateHealthDisplay() {
    const healthDisplay = document.getElementById('healthDisplay');
    if (!healthDisplay) return;

    const hearts = [];
    for (let i = 0; i < this.dino.maxHealth; i++) {
      if (i < this.dino.health) {
        hearts.push('❤️');
      } else {
        hearts.push('🖤');
      }
    }
    healthDisplay.innerHTML = hearts.join(' ');
  }

  /**
   * Update XP display
   */
  updateXPDisplay() {
    const levelDisplay = document.getElementById('levelDisplay');
    const xpBar = document.getElementById('xpBar');
    const xpText = document.getElementById('xpText');
    const xpBarContainer = document.querySelector('.xp-bar-container');

    const state = this.xpManager.getState();

    if (levelDisplay) {
      levelDisplay.textContent = state.level;
    }
    if (xpBar) {
      xpBar.style.width = `${state.progress}%`;

      // Add visual feedback when close to leveling up
      if (state.progress >= 80) {
        xpBar.style.background = 'linear-gradient(90deg, #FFD700, #FFA500, #FF8C00)';
        xpBar.style.animation = 'pulse 0.8s infinite';
      } else if (state.progress >= 60) {
        xpBar.style.background = 'linear-gradient(90deg, #66BB6A, #81C784, #A5D6A7)';
        xpBar.style.animation = 'none';
      } else {
        xpBar.style.background = 'linear-gradient(90deg, #4CAF50, #66BB6A, #81C784)';
        xpBar.style.animation = 'none';
      }
    }
    if (xpText) {
      xpText.textContent = `${state.xp} / ${state.xpToNextLevel} (${Math.floor(state.progress)}%)`;
    }

    // Add glow to container when close to level up
    if (xpBarContainer) {
      if (state.progress >= 80) {
        xpBarContainer.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 15px rgba(255,215,0,0.6)';
      } else {
        xpBarContainer.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
      }
    }
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
    this.enemies = [];
    this.xpGems = [];
    this.powerUps = [];
    this.bullets = [];
    this.scoreManager.reset();
    this.xpManager.reset();
    this.upgradeSystem.reset();
    this.weaponSystem.reset();
    this.gameSpeed = 2;
    this.frameCount = 0;
    this.powerUpCount = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.regenerationCounter = 0;
    this.dino.reset();
    this.updateScoreDisplay();
    this.updateHealthDisplay();
    this.updateXPDisplay();
  }

  /**
   * Shoot a bullet (unlimited)
   */
  shootBullet() {
    const bulletY = this.dino.y + this.dino.height / 2;
    this.bullets.push(new Bullet(this.dino.x + this.dino.width, bulletY));
  }

  /**
   * Spawn an obstacle
   */
  spawnObstacle() {
    const minDistance = 250;
    const lastObstacle = this.obstacles[this.obstacles.length - 1];

    if (!lastObstacle || this.canvas.width - lastObstacle.x > minDistance) {
      this.obstacles.push(new Obstacle(this.canvas, this.gameSpeed, this.assets.palmImg));
    }
  }

  /**
   * Spawn an enemy (flying or tank)
   */
  spawnEnemy() {
    const rand = Math.random();
    if (rand < 0.7) {
      // 70% chance for flying enemy
      this.enemies.push(new FlyingEnemy(this.canvas, this.gameSpeed));
    } else {
      // 30% chance for tank enemy
      this.enemies.push(new TankEnemy(this.canvas, this.gameSpeed));
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
   * Spawn XP gem at position
   */
  spawnXPGem(x, y, value) {
    this.xpGems.push(new XPGem(x, y, value));
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
    if (!this.gameRunning || this.gameOver || this.isPaused) return;

    this.frameCount++;
    const effects = this.upgradeSystem.calculateEffects();

    // Update dino
    this.dino.update();

    // Auto-fire weapon system
    this.weaponSystem.update(this.dino, this.bullets, effects);

    // Spawn obstacles (trees to jump over) - less frequent, player must jump
    const spawnInterval = 120 + Math.floor(Math.random() * 80); // Slower: 120-200 frames
    if (this.frameCount % spawnInterval === 0) {
      this.spawnObstacle();
    }

    // Spawn enemies (flying and tanks) - progressively more as player levels up
    const playerLevel = this.xpManager.level;
    let enemySpawnChance = 0;
    let enemySpawnInterval = 200;

    // Progressive difficulty based on level
    if (playerLevel === 1) {
      enemySpawnChance = 0.3; // 30% chance, very few enemies
      enemySpawnInterval = 200; // Every 200 frames
    } else if (playerLevel === 2) {
      enemySpawnChance = 0.5; // 50% chance
      enemySpawnInterval = 150;
    } else if (playerLevel >= 3 && playerLevel <= 5) {
      enemySpawnChance = 0.7; // 70% chance
      enemySpawnInterval = 120;
    } else if (playerLevel >= 6 && playerLevel <= 8) {
      enemySpawnChance = 0.85; // 85% chance
      enemySpawnInterval = 100;
    } else {
      enemySpawnChance = 1.0; // 100% chance, maximum difficulty
      enemySpawnInterval = 80;
    }

    if (this.frameCount % enemySpawnInterval === 0 && Math.random() < enemySpawnChance) {
      this.spawnEnemy();
    }

    // Spawn power-ups (coins for weapon upgrades)
    if (this.frameCount % 250 === 0 && Math.random() < 0.6) {
      this.spawnPowerUp();
    }

    // Regeneration
    if (effects.regeneration) {
      this.regenerationCounter++;
      if (this.regenerationCounter >= 600) { // Every 10 seconds
        this.dino.heal(1);
        this.updateHealthDisplay();
        this.regenerationCounter = 0;
      }
    }

    // Update all entities
    this.updatePowerUps(effects);
    this.updateBullets();
    this.updateObstacles();
    this.updateEnemies();
    this.updateXPGems(effects);

    // Update particle system
    this.particleSystem.update();
    this.screenShake.update();

    // Update score with speed modifier
    const speedModifier = effects.speedMod || 1;
    this.scoreManager.increment();
    this.updateScoreDisplay();

    // Increase difficulty (slower with speed boost upgrade)
    if (this.scoreManager.score % 200 === 0) {
      this.gameSpeed += (0.5 * speedModifier);
    }
  }

  /**
   * Update power-ups
   */
  updatePowerUps(effects) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update();

      // Check collision with dino
      if (powerUp.checkCollision(this.dino)) {
        powerUp.collected = true;
        this.powerUpCount += 1;
        console.log('Coin collected! Total:', this.powerUpCount);

        // Gold coin particles
        this.particleSystem.spawnParticles(
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          ParticleSystem.COLORS.COIN_COLLECT,
          10
        );

        // Play bling sound for coins
        this.assets.blingSound.currentTime = 0;
        this.assets.blingSound.play().catch(e => console.log('Audio play failed:', e));

        // Check if player has enough for an upgrade
        if (this.powerUpCount >= this.powerUpUpgradeThreshold) {
          this.powerUpCount -= this.powerUpUpgradeThreshold;
          console.log('Upgrade available! Remaining coins:', this.powerUpCount);

          if (this.gameRunning && !this.gameOver) {
            this.pauseGame();
            setTimeout(() => this.showUpgradeSelection(), 100);
          }
        }
      }

      // Remove if off-screen or collected
      if (powerUp.isOffScreen() || powerUp.collected) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * Update XP gems
   */
  updateXPGems(effects) {
    const magnetRange = effects.magnetRange || 0;

    for (let i = this.xpGems.length - 1; i >= 0; i--) {
      const gem = this.xpGems[i];
      gem.update(this.dino, magnetRange);

      // Check collision with dino
      if (gem.checkCollision(this.dino)) {
        const xpValue = gem.collect();
        const xpMultiplier = effects.xpMultiplier || 1;
        this.xpManager.addXP(Math.floor(xpValue * xpMultiplier));

        // Cyan/blue XP particles
        this.particleSystem.spawnParticles(
          gem.x,
          gem.y,
          ParticleSystem.COLORS.XP_COLLECT,
          8
        );

        this.xpGems.splice(i, 1);
        continue;
      }

      // Remove if off-screen
      if (gem.isOffScreen()) {
        this.xpGems.splice(i, 1);
      }
    }
  }

  /**
   * Update bullets
   */
  updateBullets() {
    const effects = this.upgradeSystem.calculateEffects();

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (!bullet.active) {
        this.bullets.splice(i, 1);
        continue;
      }

      bullet.update();
      let bulletRemoved = false;

      // Bullets ONLY hit enemies, NOT obstacles (trees are obstacles to jump over)
      // Check collision with enemies only
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (bullet.checkCollision(enemy)) {
          const enemyDied = enemy.takeDamage(1);

          if (enemyDied) {
            // Enemy death - big explosion
            this.particleSystem.spawnParticles(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              ParticleSystem.COLORS.ENEMY_DEATH,
              15 // More particles for death
            );
            this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
            this.enemies.splice(j, 1);
            this.screenShake.shake(8, 150); // Bigger shake on kill
          } else {
            // Enemy hit - small explosion
            this.particleSystem.spawnParticles(
              bullet.x,
              bullet.y,
              ParticleSystem.COLORS.ENEMY_HIT,
              8
            );
            this.screenShake.shake(3, 75); // Small shake on hit
          }

          // Play hit sound
          this.assets.hitSound.currentTime = 0;
          this.assets.hitSound.play().catch(e => console.log('Audio play failed:', e));

          if (!bullet.active) {
            this.bullets.splice(i, 1);
            bulletRemoved = true;
            break;
          }
        }
      }

      // Remove if off-screen
      if (!bulletRemoved && bullet.isOffScreen(this.canvas.width)) {
        this.bullets.splice(i, 1);
      }
    }
  }  /**
   * Update enemies
   */
  updateEnemies() {
    // Check weapon collisions with enemies (for whip/laser melee weapons)
    this.weaponSystem.checkCollisions(this.enemies, (enemy) => {
      const enemyDied = enemy.takeDamage(1);

      if (enemyDied) {
        // Enemy death - big explosion
        this.particleSystem.spawnParticles(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          ParticleSystem.COLORS.ENEMY_DEATH,
          15
        );
        this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
        this.screenShake.shake(8, 150); // Bigger shake on kill
      } else {
        // Enemy hit - small explosion
        this.particleSystem.spawnParticles(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          ParticleSystem.COLORS.ENEMY_HIT,
          8
        );
        this.screenShake.shake(3, 75); // Small shake on hit
      }

      // Play hit sound
      this.assets.hitSound.currentTime = 0;
      this.assets.hitSound.play().catch(e => console.log('Audio play failed:', e));

      return enemyDied;
    });

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update();

      // Check collision with dino
      if (checkCollision(this.dino, enemy)) {
        const damageTaken = this.dino.takeDamage();
        if (damageTaken) {
          // Player damage - bright red/white explosion
          this.particleSystem.spawnParticles(
            this.dino.x + this.dino.width / 2,
            this.dino.y + this.dino.height / 2,
            ParticleSystem.COLORS.PLAYER_DAMAGE,
            12
          );
          this.updateHealthDisplay();
          this.screenShake.shake(12, 200); // Big shake on player damage

          // Check if dino died
          if (this.dino.isDead()) {
            this.handleGameOver();
          }
        }

        // Remove enemy after hit
        this.enemies.splice(i, 1);
        continue;
      }

      // Remove if off-screen
      if (enemy.isOffScreen()) {
        this.enemies.splice(i, 1);
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
        const damageTaken = this.dino.takeDamage();
        if (damageTaken) {
          this.updateHealthDisplay();
          this.renderer.screenShake(8, 15); // Shake on damage

          // Check if dino died
          if (this.dino.isDead()) {
            this.handleGameOver();
          }
        }        // Remove obstacle after hit
        this.obstacles.splice(i, 1);
        continue;
      }

      // Remove if off-screen
      if (obstacle.isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * Handle game over
   */
  handleGameOver() {
    this.gameOver = true;
    this.gameRunning = false;

    // Play end sound
    this.assets.endSound.currentTime = 0;
    this.assets.endSound.play().catch(e => console.log('Audio play failed:', e));

    // Update high score (for local display)
    this.scoreManager.updateHighScore();
    this.updateScoreDisplay();

    // Check if score qualifies for global leaderboard before prompting
    const currentScore = this.scoreManager.getCurrentScore();
    if (currentScore > 0) {
      setTimeout(() => this.checkAndPromptLeaderboard(), 500);
    }
  }

  /**
   * Render all game elements
   */
  render() {
    // Apply screen shake
    const shakeOffset = this.screenShake.getOffset();
    this.ctx.save();
    this.ctx.translate(shakeOffset.x, shakeOffset.y);

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
      this.particleSystem.draw(this.ctx); // Draw particles even on start screen
      this.ctx.restore();
      this.renderer.drawStartScreen();
      return;
    }

    if (this.gameOver) {
      this.dino.draw(this.ctx);
      this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
      this.particleSystem.draw(this.ctx); // Draw particles on game over
      this.ctx.restore();
      this.renderer.drawGameOver();
      return;
    }

    // Draw game entities
    this.dino.draw(this.ctx);
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    this.enemies.forEach(enemy => enemy.draw(this.ctx));
    this.xpGems.forEach(gem => gem.draw(this.ctx));
    this.powerUps.forEach(powerUp => powerUp.draw(this.ctx, this.frameCount));
    this.bullets.forEach(bullet => bullet.draw(this.ctx));

    // Draw weapon effects (whip arc, laser beam, etc.)
    this.weaponSystem.draw(this.ctx, this.frameCount);

    // Draw particles (on top of everything)
    this.particleSystem.draw(this.ctx);

    this.ctx.restore(); // Restore after shake

    // Draw UI elements (not affected by shake)
    // Draw coin counter
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 16px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('🪙 ' + this.powerUpCount + '/' + this.powerUpUpgradeThreshold, 20, 30);
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
   * @param {boolean} forceRefresh - Force refresh from API instead of using cache
   */
  async showLeaderboard(forceRefresh = false) {
    const container = document.getElementById('leaderboardContainer');
    const content = document.getElementById('leaderboardContent');

    container.style.display = 'block';
    content.innerHTML = '<p class="loading">Loading...</p>';

    try {
      const data = await this.scoreManager.fetchLeaderboard(forceRefresh);

      if (data.success && data.scores && data.scores.length > 0) {
        const top50 = data.scores.slice(0, 50);
        let html = '<ul class="leaderboard-list">';

        top50.forEach((entry, index) => {
          const rank = index + 1;
          const topClass = rank <= 10 ? ' top-10' : '';
          const top3Class = rank <= 3 ? ' top-3' : '';
          let icon = '';
          if (rank === 1) icon = '🥇';
          else if (rank === 2) icon = '🥈';
          else if (rank === 3) icon = '🥉';
          else if (rank <= 10) icon = '⭐';

          html += `
            <li class="leaderboard-item${topClass}${top3Class}">
              <span class="leaderboard-rank">${icon} #${rank}</span>
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
   * Check if score qualifies for leaderboard and prompt if it does
   */
  async checkAndPromptLeaderboard() {
    const currentScore = this.scoreManager.getCurrentScore();

    try {
      const data = await this.scoreManager.fetchLeaderboard();

      // Check if score qualifies (top 100 or empty leaderboard)
      if (data.success && data.scores) {
        const leaderboard = data.scores;
        const qualifies = leaderboard.length < 100 || currentScore > leaderboard[leaderboard.length - 1].score;

        if (qualifies) {
          this.promptScoreSubmission();
        }
      } else {
        // If can't fetch leaderboard, prompt anyway (benefit of the doubt)
        this.promptScoreSubmission();
      }
    } catch (error) {
      console.error('Error checking leaderboard eligibility:', error);
      // On error, prompt anyway (benefit of the doubt)
      this.promptScoreSubmission();
    }
  }

  /**
   * Prompt user to submit score after new high score
   */
  promptScoreSubmission() {
    const modal = document.getElementById('nameModal');
    const input = document.getElementById('playerNameInput');
    const result = document.getElementById('submitResult');
    const submitBtn = document.getElementById('submitScore');

    if (modal && input) {
      // Reset submission state for new prompt
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
      }
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
    // Prevent double submissions
    if (this.isSubmitting) {
      return;
    }

    const result = document.getElementById('submitResult');
    const modal = document.getElementById('nameModal');
    const submitBtn = document.getElementById('submitScore');

    // Disable submit button and set submitting state
    this.isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
    }

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
          // Automatically show leaderboard with fresh data
          this.showLeaderboard(true);
        }, 2000);
      } else {
        result.textContent = 'Failed to submit: ' + (response.error || 'Unknown error');
        result.className = 'submit-result error';
        // Re-enable on failure so user can retry
        this.isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    } catch (error) {
      result.textContent = 'Error: ' + error.message;
      result.className = 'submit-result error';
      // Re-enable on error so user can retry
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
      }
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

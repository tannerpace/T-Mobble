/**
 * Main Game class - orchestrates all game logic
 */
import { Bullet } from '../entities/Bullet.js';
import { ChargerEnemy } from '../entities/ChargerEnemy.js';
import { Cloud } from '../entities/Cloud.js';
import { Dino } from '../entities/Dino.js';
import { EliteEnemy } from '../entities/EliteEnemy.js';
import { FlyingEnemy } from '../entities/FlyingEnemy.js';
import { FrogEnemy } from '../entities/FrogEnemy.js';
import { HealthPickup } from '../entities/HealthPickup.js';
import { LowFlyingEnemy } from '../entities/LowFlyingEnemy.js';
import { MediumEnemy } from '../entities/MediumEnemy.js';
import { Obstacle } from '../entities/Obstacle.js';
import { PowerUp } from '../entities/PowerUp.js';
import { SuperEliteEnemy } from '../entities/SuperEliteEnemy.js';
import { TankEnemy } from '../entities/TankEnemy.js';
import { VolcanoHazard } from '../entities/VolcanoHazard.js';
import { XPGem } from '../entities/XPGem.js';
// Unified progression system - single XP currency (Fibonacci-based)
import { ExperienceManager } from '../utils/ExperienceManager.js';
import { ParticleSystem, ScreenShake } from '../utils/ParticleSystem.js';
import { ScoreManager } from '../utils/ScoreManager.js';
import { UpgradeSystem } from '../utils/UpgradeSystem.js';
import { WeaponSystem } from '../utils/WeaponSystem.js';
import { checkCollision } from '../utils/collision.js';
import { escapeHtml } from '../utils/helpers.js';
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
    this.gameSpeed = 1.3;
    this.maxGameSpeed = 9; // Cap maximum speed for playability
    this.gravity = 0.2; // Controls speed of vertical movement (lower = slower)
    this.frameCount = 0;
    this.animationId = null;
    this.isSubmitting = false;
    this.isPaused = false;
    this.regenerationCounter = 0;

    // Game systems
    this.renderer = new Renderer(canvas, this.ctx);
    this.scoreManager = new ScoreManager();
    this.xpManager = new ExperienceManager();
    this.upgradeSystem = new UpgradeSystem();
    this.weaponSystem = new WeaponSystem(assets);
    this.particleSystem = new ParticleSystem();
    this.screenShake = new ScreenShake();

    // Entities
    this.dino = new Dino(canvas, this.gravity, assets);
    this.obstacles = [];
    this.enemies = []; // Flying, tank, and elite enemies
    this.xpGems = []; // XP gems dropped by enemies (unified progression)
    this.healthPickups = []; // Health restoration items
    this.clouds = [new Cloud(canvas), new Cloud(canvas), new Cloud(canvas)];
    this.powerUps = [];
    this.bullets = [];
    this.volcanoHazards = []; // Ground hazards spawned by volcano weapon

    // Input handling
    const jumpBtn = document.getElementById('jumpBtn');
    this.inputHandler = new InputHandler(canvas, jumpBtn);
    this.setupInputCallbacks();

    // Leaderboard UI
    this.setupLeaderboardUI();

    // Setup XP and upgrade systems
    this.setupXPSystem();
    this.setupUpgradeUI();

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
    // Determine if this is a milestone level
    const isMilestone = level % 5 === 0;
    const isMajorMilestone = level % 10 === 0;

    // Create spectacular particle burst for level up
    const particleCount = isMajorMilestone ? 30 : isMilestone ? 20 : 15;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 3;

    // Spawn celebration particles
    this.particleSystem.spawnParticles(
      centerX,
      centerY,
      ParticleSystem.COLORS.LEVEL_UP,
      particleCount
    );

    // Add screen shake for major milestones
    if (isMajorMilestone) {
      this.screenShake.shake(8, 300);
    } else if (isMilestone) {
      this.screenShake.shake(5, 200);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';

    // Special messages for milestone levels
    let message = `🎉 LEVEL ${level}! 🎉`;
    if (isMajorMilestone) {
      message = `✨ LEVEL ${level}! ✨<br><span style="font-size: 0.6em;">MAJOR MILESTONE!</span>`;
      notification.style.fontSize = '2.5em';
      notification.style.textShadow = '0 0 20px gold, 0 0 40px orange';
    } else if (isMilestone) {
      message = `🌟 LEVEL ${level}! 🌟<br><span style="font-size: 0.7em;">Milestone Reached!</span>`;
      notification.style.fontSize = '2em';
    }

    notification.innerHTML = message;
    document.body.appendChild(notification);

    // Play yeehaw celebration sound for level up!
    try {
      const yeehawSound = this.assets.yeehawSound;
      if (yeehawSound) {
        yeehawSound.currentTime = 0;
        yeehawSound.volume = isMajorMilestone ? 0.7 : 0.6;
        yeehawSound.play().catch(() => { });
      }
    } catch (e) {
      // Sound failed, continue without it
    }

    // Remove after animation
    setTimeout(() => {
      notification.remove();
    }, isMajorMilestone ? 1500 : 1000);
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

    // Use configured upgrade choice count (can be overridden via URL)
    const choiceCount = window.GAME_CONFIG?.upgradeChoiceCount || 3;
    const choices = this.upgradeSystem.getUpgradeChoices(choiceCount);
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
      if (weapon.isHealthRefill) {
        levelInfo = '<div class="upgrade-level">INSTANT</div>';
      } else if (weapon.isNewWeapon) {
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
    // Handle health refill
    if (weaponId === 'healthRefill') {
      this.dino.maxHealth++; // Add 1 max health slot
      this.dino.heal(this.dino.maxHealth); // Fully heal
      this.updateHealthDisplay();
    } else {
      // Check if weapon was unlocked BEFORE applying upgrade
      const wasUnlocked = this.upgradeSystem.isWeaponUnlocked(weaponId);

      // Apply the upgrade
      this.upgradeSystem.applyUpgrade(weaponId);

      // Add new weapon or update existing weapon level
      if (!wasUnlocked) {
        this.weaponSystem.addWeapon(weaponId);
      } else {
        this.weaponSystem.levelUpWeapon(weaponId, this.upgradeSystem.getWeaponLevel(weaponId));
      }
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
      // Add phase indicator emoji based on level
      let phaseEmoji = '';
      if (state.level <= 5) {
        phaseEmoji = '⚡'; // Fast progression
      } else if (state.level <= 12) {
        phaseEmoji = '📈'; // Medium progression
      } else {
        phaseEmoji = '🚀'; // Hard progression
      }
      levelDisplay.textContent = `${phaseEmoji} ${state.level}`;
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
    this.coins = [];
    this.healthPickups = [];
    this.powerUps = [];
    this.bullets = [];
    this.volcanoHazards = [];
    this.scoreManager.reset();
    this.xpManager.reset();
    this.upgradeSystem.reset();
    this.weaponSystem.reset();
    this.coinManager.reset();
    this.gameSpeed = 2;
    this.frameCount = 0;
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
      this.obstacles.push(new Obstacle(this.canvas, this.gameSpeed));
    }
  }

  /**
   * Spawn an enemy (flying, low-flying, frog, charger, medium, tank, elite, or super elite)
   */
  spawnEnemy() {
    const rand = Math.random();
    if (rand < 0.22) {
      // 22% chance for high flying enemy
      this.enemies.push(new FlyingEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.35) {
      // 13% chance for low flying enemy (jump-height threat)
      this.enemies.push(new LowFlyingEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.48) {
      // 13% chance for frog enemy (weak hopper)
      this.enemies.push(new FrogEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.58) {
      // 10% chance for charger enemy (fast ground threat)
      this.enemies.push(new ChargerEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.72) {
      // 14% chance for medium enemy
      this.enemies.push(new MediumEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.84) {
      // 12% chance for tank enemy
      this.enemies.push(new TankEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.95) {
      // 11% chance for elite enemy
      this.enemies.push(new EliteEnemy(this.canvas, this.gameSpeed));
    } else {
      // 5% chance for super elite enemy (highest rewards!)
      this.enemies.push(new SuperEliteEnemy(this.canvas, this.gameSpeed));
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
   * Spawn a health pickup (rare, only when player is damaged)
   */
  spawnHealthPickup() {
    // Only spawn if player is damaged and random chance
    if (this.dino.health < this.dino.maxHealth && Math.random() < 0.15) {
      this.healthPickups.push(new HealthPickup(this.canvas, this.gameSpeed));
    }
  }

  /**
   * Spawn XP gem at position
   */
  spawnXPGem(x, y, value) {
    this.xpGems.push(new XPGem(x, y, value));
  }

  /**
   * Spawn bonus XP based on enemy type
   */
  spawnBonusXPForEnemy(enemy) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;

    // Elite enemies drop bonus XP (unified progression)
    if (enemy.type === 'elite') {
      this.spawnXPGem(centerX, centerY, 25);
    }

    // Super Elite enemies drop even more bonus XP
    if (enemy.type === 'superelite') {
      this.spawnXPGem(centerX, centerY, 50);
      this.spawnXPGem(centerX + 10, centerY, 50);
    }
  }

  /**
   * Spawn coin at position
   */
  /**
   * Spawn bonus XP gem (replaces old coin system)
   * Elite enemies drop higher value XP gems (25-30 XP)
   */
  spawnBonusXP(x, y, value = 25) {
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

    // Auto-fire weapon system (with bullet cap to prevent performance issues)
    const MAX_BULLETS = 100;
    if (this.bullets.length < MAX_BULLETS) {
      this.weaponSystem.update(this.dino, this.bullets, effects);
    }

    // Spawn obstacles (trees to jump over) - FIXED RATE throughout entire game
    const obstacleSpawnInterval = 300; // Fixed interval, no randomness
    if (this.frameCount % obstacleSpawnInterval === 0) {
      this.spawnObstacle();
    }

    // Spawn enemies (flying and tanks) - progressively more as player levels up
    const playerLevel = this.xpManager.level;
    let enemySpawnChance = 0;
    let enemySpawnInterval = 200;

    // Progressive difficulty based on level - enemies increase, obstacles stay constant
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

    // Spawn health pickups (rare, only when damaged)
    if (this.frameCount % 400 === 0) {
      this.spawnHealthPickup();
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
    this.updateHealthPickups(effects);
    this.updateBullets();
    this.updateVolcanoHazards();
    this.updateObstacles();
    this.updateEnemies();
    this.updateXPGems(effects);
    // Coins removed - unified XP progression

    // Update particle system
    this.particleSystem.update();
    this.screenShake.update();

    // Update score with speed modifier
    const speedModifier = effects.speedMod || 1;
    this.scoreManager.increment();
    this.updateScoreDisplay();

    // Increase difficulty gradually with diminishing returns
    // Slower increase at higher speeds to prevent it getting too fast
    if (this.scoreManager.score % 500 === 0 && this.gameSpeed < this.maxGameSpeed) {
      // Calculate increment based on current speed (smaller increments as speed increases)
      const speedIncrement = this.gameSpeed < 4 ? 0.15 : this.gameSpeed < 6 ? 0.1 : 0.05;
      this.gameSpeed = Math.min(this.maxGameSpeed, this.gameSpeed + (speedIncrement * speedModifier));
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

        // Gold coin particles
        const { x: centerX, y: centerY } = powerUp.getCenter();
        this.particleSystem.spawnParticles(
          centerX,
          centerY,
          ParticleSystem.COLORS.COIN_COLLECT,
          10
        );

        // Play bling sound for coins
        this.assets.blingSound.currentTime = 0;
        this.assets.blingSound.play().catch(e => console.log('Audio play failed:', e));

        // Add bonus XP from powerup (replaces old coin system)
        this.xpManager.addXP(25); // Bonus XP value
      }

      // Remove if off-screen or collected
      if (powerUp.isOffScreen() || powerUp.collected) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * Update health pickups
   */
  updateHealthPickups(effects) {
    for (let i = this.healthPickups.length - 1; i >= 0; i--) {
      const healthPickup = this.healthPickups[i];
      healthPickup.update();

      // Check collision with dino
      if (healthPickup.checkCollision(this.dino)) {
        // Only collect if not at max health
        if (this.dino.health < this.dino.maxHealth) {
          const healAmount = healthPickup.collect();
          this.dino.heal(healAmount);
          this.updateHealthDisplay();

          // Pink healing particles
          this.particleSystem.spawnParticles(
            healthPickup.x + healthPickup.width / 2,
            healthPickup.y + healthPickup.height / 2,
            [[255, 182, 193], [255, 105, 180], [255, 192, 203]], // Pink colors
            12
          );

          // Play healing sound
          try {
            this.assets.powerUpSound.currentTime = 0;
            this.assets.powerUpSound.play().catch(e => console.log('Audio play failed:', e));
          } catch (e) { }

          this.healthPickups.splice(i, 1);
          continue;
        }
      }

      // Remove if off-screen or collected
      if (healthPickup.isOffScreen() || healthPickup.collected) {
        this.healthPickups.splice(i, 1);
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
   * Update coins - REMOVED (unified XP system)
   * Coins have been converted to bonus XP gems
   */

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

      const hitGround = bullet.update();
      let bulletRemoved = false;

      // Check if bomb projectile exploded
      if (bullet.isVolcanoProjectile && hitGround) {
        // Spawn volcano hazard at impact location
        const hazard = new VolcanoHazard(bullet.x, bullet.y + bullet.height);
        this.volcanoHazards.push(hazard);
        this.bullets.splice(i, 1);
        bulletRemoved = true;

        // Big explosion particles when bomb detonates
        this.particleSystem.spawnParticles(
          bullet.x + bullet.width / 2,
          bullet.y + bullet.height / 2,
          ParticleSystem.COLORS.ENEMY_DEATH,
          25 // Large explosion
        );
        continue;
      }

      // Volcano projectiles don't damage enemies, only spawn hazards
      if (bullet.isVolcanoProjectile) {
        // Remove if off-screen
        if (bullet.isOffScreen(this.canvas.width)) {
          this.bullets.splice(i, 1);
        }
        continue;
      }

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
            this.spawnBonusXPForEnemy(enemy);

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
  }

  /**
   * Update volcano hazards
   */
  updateVolcanoHazards() {
    for (let i = this.volcanoHazards.length - 1; i >= 0; i--) {
      const hazard = this.volcanoHazards[i];

      if (!hazard.active) {
        this.volcanoHazards.splice(i, 1);
        continue;
      }

      hazard.update();

      // Check collisions with enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        if (hazard.canDamage(enemy)) {
          hazard.markHit(enemy);
          const enemyDied = enemy.takeDamage(hazard.getDamage());

          if (enemyDied) {
            // Enemy death - big explosion
            this.particleSystem.spawnParticles(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              ParticleSystem.COLORS.ENEMY_DEATH,
              15
            );
            this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
            this.spawnBonusXPForEnemy(enemy);

            this.enemies.splice(j, 1);
            this.screenShake.shake(8, 150);
          } else {
            // Enemy hit - small explosion
            this.particleSystem.spawnParticles(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              ParticleSystem.COLORS.ENEMY_HIT,
              8
            );
            this.screenShake.shake(3, 75);
          }

          // Play hit sound
          this.assets.hitSound.currentTime = 0;
          this.assets.hitSound.play().catch(e => console.log('Audio play failed:', e));
        }
      }
    }
  }

  /**
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

      // Check if enemy died from burn damage
      if (enemy.isDead()) {
        // Enemy death from burn - explosion
        this.particleSystem.spawnParticles(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          ParticleSystem.COLORS.ENEMY_DEATH,
          15
        );
        this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
        this.spawnBonusXPForEnemy(enemy);

        this.enemies.splice(i, 1);
        this.screenShake.shake(6, 100);
        continue;
      }

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

          // Play hit sound
          this.assets.endSound.currentTime = 0;
          this.assets.endSound.play().catch(e => console.log('Audio play failed:', e));

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

          // Play hit sound
          this.assets.endSound.currentTime = 0;
          this.assets.endSound.play().catch(e => console.log('Audio play failed:', e));

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

    // Play death sound
    this.assets.deadSound.currentTime = 0;
    this.assets.deadSound.play().catch(e => console.log('Audio play failed:', e));

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
    this.healthPickups.forEach(pickup => pickup.draw(this.ctx, this.frameCount));
    this.powerUps.forEach(powerUp => powerUp.draw(this.ctx, this.frameCount));
    this.volcanoHazards.forEach(hazard => hazard.draw(this.ctx));
    this.bullets.forEach(bullet => bullet.draw(this.ctx));

    // Draw weapon effects (whip arc, laser beam, etc.)
    this.weaponSystem.draw(this.ctx, this.frameCount);

    // Draw particles (on top of everything)
    this.particleSystem.draw(this.ctx);

    this.ctx.restore(); // Restore after shake

    // UI elements drawn separately (not affected by shake)
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
              <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
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
}

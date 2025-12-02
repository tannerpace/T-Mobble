/**
 * Main Game class - orchestrates all game logic
 */
import { Bullet } from '../entities/Bullet';
import { ChargerEnemy } from '../entities/ChargerEnemy';
import { Cloud } from '../entities/Cloud';
import { Dino } from '../entities/Dino';
import { EliteEnemy } from '../entities/EliteEnemy';
import { FlyingEnemy } from '../entities/FlyingEnemy';
import { FrogEnemy } from '../entities/FrogEnemy';
import { GhostEnemy } from '../entities/GhostEnemy';
import { HealthPickup } from '../entities/HealthPickup';
import { LowFlyingEnemy } from '../entities/LowFlyingEnemy';
import { MediumEnemy } from '../entities/MediumEnemy';
import { Obstacle } from '../entities/Obstacle';
import { PowerUp } from '../entities/PowerUp';
import { SuperEliteEnemy } from '../entities/SuperEliteEnemy';
import { TankEnemy } from '../entities/TankEnemy';
import { VolcanoHazard } from '../entities/VolcanoHazard';
import { XPGem } from '../entities/XPGem';
import type { IEnemy, WeaponId } from '../types';
import type { LoadedGameAssets } from '../utils/AssetManager';
import { ExperienceManager } from '../utils/ExperienceManager';
import { ParticleSystem, ScreenShake } from '../utils/ParticleSystem';
import { ScoreManager } from '../utils/ScoreManager';
import { UpgradeSystem } from '../utils/UpgradeSystem';
import { WeaponSystem } from '../utils/WeaponSystem';
import { checkCollision } from '../utils/collision';
import { escapeHtml } from '../utils/helpers';
import { InputHandler } from './InputHandler';
import { Renderer } from './Renderer';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: LoadedGameAssets;

  // Game state
  private gameRunning: boolean;
  private gameOver: boolean;
  private gameSpeed: number;
  private maxGameSpeed: number;
  private gravity: number;
  private frameCount: number;
  private animationId: number | null;
  private isSubmitting: boolean;
  private isPaused: boolean;
  private regenerationCounter: number;

  // Game systems
  private renderer: Renderer;
  public scoreManager: ScoreManager;
  private xpManager: ExperienceManager;
  private upgradeSystem: UpgradeSystem;
  private weaponSystem: WeaponSystem;
  private particleSystem: ParticleSystem;
  private screenShake: ScreenShake;

  // Entities
  private dino: Dino;
  private obstacles: Obstacle[];
  private enemies: IEnemy[];
  private xpGems: XPGem[];
  private healthPickups: HealthPickup[];
  private clouds: Cloud[];
  private powerUps: PowerUp[];
  private bullets: Bullet[];
  private volcanoHazards: VolcanoHazard[];

  // Input handling
  private inputHandler: InputHandler;

  constructor(canvas: HTMLCanvasElement, assets: LoadedGameAssets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.assets = assets;

    // Game state
    this.gameRunning = false;
    this.gameOver = false;
    this.gameSpeed = 1.3;
    this.maxGameSpeed = 9;
    this.gravity = 0.2;
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
    this.enemies = [];
    this.xpGems = [];
    this.healthPickups = [];
    this.clouds = [new Cloud(canvas), new Cloud(canvas), new Cloud(canvas)];
    this.powerUps = [];
    this.bullets = [];
    this.volcanoHazards = [];

    // Input handling
    const jumpBtn = document.getElementById('jumpBtn') as HTMLElement;
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
  private setupXPSystem(): void {
    this.xpManager.listeners.onLevelUp = (level: number, pending: number) => {
      console.log(`Level up! Now level ${level}`);

      // Show level up notification
      this.showLevelUpNotification(level);

      if (this.gameRunning && !this.gameOver) {
        this.pauseGame();
        // Delay upgrade modal slightly to show level up animation
        setTimeout(() => this.showUpgradeSelection(), 600);
      }
    };

    this.xpManager.listeners.onXPGain = (amount: number, current: number, max: number) => {
      this.updateXPDisplay();
    };
  }

  /**
   * Show level up notification
   */
  private showLevelUpNotification(level: number): void {
    const isMilestone = level % 5 === 0;
    const isMajorMilestone = level % 10 === 0;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 3;

    const confettiCount = isMajorMilestone ? 50 : isMilestone ? 35 : 25;
    this.particleSystem.spawnConfetti(centerX, centerY, confettiCount);

    if (isMajorMilestone) {
      this.particleSystem.spawnConfetti(50, centerY + 50, 20);
      this.particleSystem.spawnConfetti(this.canvas.width - 50, centerY + 50, 20);
    }

    if (isMajorMilestone) {
      this.screenShake.shake(10, 400);
    } else if (isMilestone) {
      this.screenShake.shake(6, 250);
    } else {
      this.screenShake.shake(4, 150);
    }

    const notification = document.createElement('div');
    notification.className = 'level-up-notification';

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

    setTimeout(() => {
      notification.remove();
    }, isMajorMilestone ? 1500 : 1000);
  }

  /**
   * Setup upgrade UI handlers
   */
  private setupUpgradeUI(): void {
    // Will be set up when modal is shown
  }

  /**
   * Pause the game
   */
  private pauseGame(): void {
    this.isPaused = true;
  }

  /**
   * Unpause the game
   */
  private unpauseGame(): void {
    this.isPaused = false;
  }

  /**
   * Show upgrade selection modal
   */
  private showUpgradeSelection(): void {
    const modal = document.getElementById('upgradeModal');
    const choicesContainer = document.getElementById('upgradeChoices');

    if (!modal || !choicesContainer) return;

    const choiceCount = window.GAME_CONFIG?.upgradeChoiceCount || 3;
    const choices = this.upgradeSystem.getUpgradeChoices(choiceCount);
    choicesContainer.innerHTML = '';

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
        this.selectUpgrade(weapon.id as WeaponId | 'healthRefill');
      });

      choicesContainer.appendChild(card);
    });

    modal.style.display = 'flex';
  }

  /**
   * Select an upgrade (add or level up weapon)
   */
  private selectUpgrade(weaponId: WeaponId | 'healthRefill'): void {
    if (weaponId === 'healthRefill') {
      this.dino.maxHealth++;
      this.dino.heal(this.dino.maxHealth);
      this.updateHealthDisplay();
    } else {
      const wasUnlocked = this.upgradeSystem.isWeaponUnlocked(weaponId);
      this.upgradeSystem.applyUpgrade(weaponId);

      if (!wasUnlocked) {
        this.weaponSystem.addWeapon(weaponId);
      } else {
        this.weaponSystem.levelUpWeapon(weaponId, this.upgradeSystem.getWeaponLevel(weaponId));
      }
    }

    this.xpManager.consumeLevelUp();

    this.assets.beepSound.currentTime = 0;
    this.assets.beepSound.play().catch(e => console.log('Audio play failed:', e));

    const modal = document.getElementById('upgradeModal');
    if (modal) {
      modal.style.display = 'none';
    }

    if (this.xpManager.pendingLevelUps > 0) {
      setTimeout(() => this.showUpgradeSelection(), 300);
    } else {
      this.unpauseGame();
    }
  }

  /**
   * Update health display
   */
  private updateHealthDisplay(): void {
    const healthDisplay = document.getElementById('healthDisplay');
    if (!healthDisplay) return;

    const hearts: string[] = [];
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
  private updateXPDisplay(): void {
    const levelDisplay = document.getElementById('levelDisplay');
    const xpBar = document.getElementById('xpBar') as HTMLElement | null;
    const xpText = document.getElementById('xpText');
    const xpBarContainer = document.querySelector('.xp-bar-container') as HTMLElement | null;

    const state = this.xpManager.getState();

    if (levelDisplay) {
      let phaseEmoji = '';
      if (state.level <= 5) {
        phaseEmoji = '⚡';
      } else if (state.level <= 12) {
        phaseEmoji = '📈';
      } else {
        phaseEmoji = '🚀';
      }
      levelDisplay.textContent = `${phaseEmoji} ${state.level}`;
    }
    if (xpBar) {
      xpBar.style.width = `${state.progress}%`;

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
  private setupInputCallbacks(): void {
    this.inputHandler.onJump = () => this.handleJumpAction();
    this.inputHandler.onJumpRelease = () => this.handleJumpRelease();
  }

  /**
   * Handle jump action based on game state
   */
  private handleJumpAction(): void {
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
  private handleJumpRelease(): void {
    if (this.gameRunning && !this.gameOver) {
      this.dino.releaseJump();
    }
  }

  /**
   * Start the game
   */
  private startGame(): void {
    console.log('Starting game...');
    this.gameRunning = true;
  }

  /**
   * Restart the game after game over
   */
  private restartGame(): void {
    console.log('Restarting game...');
    this.resetGame();
    this.gameRunning = true;
  }

  /**
   * Reset game state
   */
  private resetGame(): void {
    this.obstacles = [];
    this.enemies = [];
    this.xpGems = [];
    this.healthPickups = [];
    this.powerUps = [];
    this.bullets = [];
    this.volcanoHazards = [];
    this.scoreManager.reset();
    this.xpManager.reset();
    this.upgradeSystem.reset();
    this.weaponSystem.reset();
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
  private shootBullet(): void {
    const bulletY = this.dino.y + this.dino.height / 2;
    this.bullets.push(new Bullet(this.dino.x + this.dino.width, bulletY));
  }

  /**
   * Spawn an obstacle
   */
  private spawnObstacle(): void {
    const minDistance = 250;
    const lastObstacle = this.obstacles[this.obstacles.length - 1];

    if (!lastObstacle || this.canvas.width - lastObstacle.x > minDistance) {
      this.obstacles.push(new Obstacle(this.canvas, this.gameSpeed));
    }
  }

  /**
   * Spawn an enemy
   */
  private spawnEnemy(): void {
    const rand = Math.random();
    if (rand < 0.22) {
      this.enemies.push(new FlyingEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.35) {
      this.enemies.push(new LowFlyingEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.48) {
      this.enemies.push(new FrogEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.58) {
      this.enemies.push(new ChargerEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.66) {
      this.enemies.push(new GhostEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.78) {
      this.enemies.push(new MediumEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.88) {
      this.enemies.push(new TankEnemy(this.canvas, this.gameSpeed));
    } else if (rand < 0.96) {
      this.enemies.push(new EliteEnemy(this.canvas, this.gameSpeed));
    } else {
      this.enemies.push(new SuperEliteEnemy(this.canvas, this.gameSpeed));
    }
  }

  /**
   * Spawn a power-up
   */
  private spawnPowerUp(): void {
    if (Math.random() < 0.3) {
      this.powerUps.push(new PowerUp(this.canvas, this.gameSpeed));
    }
  }

  /**
   * Spawn a health pickup
   */
  private spawnHealthPickup(): void {
    if (this.dino.health < this.dino.maxHealth && Math.random() < 0.15) {
      this.healthPickups.push(new HealthPickup(this.canvas, this.gameSpeed));
    }
  }

  /**
   * Spawn XP gem at position
   */
  private spawnXPGem(x: number, y: number, value: number): void {
    this.xpGems.push(new XPGem(x, y, value));
  }

  /**
   * Spawn bonus XP based on enemy type
   */
  private spawnBonusXPForEnemy(enemy: IEnemy): void {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;

    if (enemy.type === 'elite') {
      this.spawnXPGem(centerX, centerY, 25);
    }

    if (enemy.type === 'superelite') {
      this.spawnXPGem(centerX, centerY, 50);
      this.spawnXPGem(centerX + 10, centerY, 50);
    }
  }

  /**
   * Spawn bonus XP gem
   */
  private spawnBonusXP(x: number, y: number, value: number = 25): void {
    this.xpGems.push(new XPGem(x, y, value));
  }

  /**
   * Update score display in UI
   */
  private updateScoreDisplay(): void {
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
  private update(): void {
    if (!this.gameRunning || this.gameOver || this.isPaused) return;

    this.frameCount++;
    const effects = this.upgradeSystem.calculateEffects();

    this.dino.update();

    const MAX_BULLETS = 100;
    if (this.bullets.length < MAX_BULLETS) {
      this.weaponSystem.update(this.dino, this.bullets, effects);
    }

    const obstacleSpawnInterval = 300;
    if (this.frameCount % obstacleSpawnInterval === 0) {
      this.spawnObstacle();
    }

    const playerLevel = this.xpManager.level;
    let enemySpawnChance = 0;
    let enemySpawnInterval = 200;

    if (playerLevel === 1) {
      enemySpawnChance = 0.3;
      enemySpawnInterval = 200;
    } else if (playerLevel === 2) {
      enemySpawnChance = 0.5;
      enemySpawnInterval = 150;
    } else if (playerLevel >= 3 && playerLevel <= 5) {
      enemySpawnChance = 0.7;
      enemySpawnInterval = 120;
    } else if (playerLevel >= 6 && playerLevel <= 8) {
      enemySpawnChance = 0.85;
      enemySpawnInterval = 100;
    } else {
      enemySpawnChance = 1.0;
      enemySpawnInterval = 80;
    }

    if (this.frameCount % enemySpawnInterval === 0 && Math.random() < enemySpawnChance) {
      this.spawnEnemy();
    }

    if (this.frameCount % 250 === 0 && Math.random() < 0.6) {
      this.spawnPowerUp();
    }

    if (this.frameCount % 400 === 0) {
      this.spawnHealthPickup();
    }

    if (effects.regeneration) {
      this.regenerationCounter++;
      if (this.regenerationCounter >= 600) {
        this.dino.heal(1);
        this.updateHealthDisplay();
        this.regenerationCounter = 0;
      }
    }

    this.updatePowerUps(effects);
    this.updateHealthPickups(effects);
    this.updateBullets();
    this.updateVolcanoHazards();
    this.updateObstacles();
    this.updateEnemies();
    this.updateXPGems(effects);

    this.particleSystem.update();
    this.screenShake.update();

    const speedModifier = effects.speedMod || 1;
    this.scoreManager.increment();
    this.updateScoreDisplay();

    if (this.scoreManager.score % 500 === 0 && this.gameSpeed < this.maxGameSpeed) {
      const speedIncrement = this.gameSpeed < 4 ? 0.15 : this.gameSpeed < 6 ? 0.1 : 0.05;
      this.gameSpeed = Math.min(this.maxGameSpeed, this.gameSpeed + (speedIncrement * speedModifier));
    }
  }

  /**
   * Update power-ups
   */
  private updatePowerUps(effects: ReturnType<UpgradeSystem['calculateEffects']>): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update();

      if (powerUp.checkCollision(this.dino)) {
        powerUp.collected = true;

        const { x: centerX, y: centerY } = powerUp.getCenter();
        this.particleSystem.spawnExplosion(
          centerX,
          centerY,
          ParticleSystem.COLORS.COIN_COLLECT,
          0.8
        );

        this.particleSystem.spawnTextPopup(
          centerX,
          centerY - 15,
          '+25 XP',
          [255, 215, 0],
          16
        );

        this.assets.blingSound.currentTime = 0;
        this.assets.blingSound.play().catch(e => console.log('Audio play failed:', e));

        this.xpManager.addXP(25);
      }

      if (powerUp.isOffScreen() || powerUp.collected) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * Update health pickups
   */
  private updateHealthPickups(effects: ReturnType<UpgradeSystem['calculateEffects']>): void {
    for (let i = this.healthPickups.length - 1; i >= 0; i--) {
      const healthPickup = this.healthPickups[i];
      healthPickup.update();

      if (healthPickup.checkCollision(this.dino)) {
        if (this.dino.health < this.dino.maxHealth) {
          const healAmount = healthPickup.collect();
          this.dino.heal(healAmount);
          this.updateHealthDisplay();

          this.particleSystem.spawnParticles(
            healthPickup.x + healthPickup.width / 2,
            healthPickup.y + healthPickup.height / 2,
            [[255, 182, 193], [255, 105, 180], [255, 192, 203]],
            12
          );

          try {
            this.assets.powerUpSound.currentTime = 0;
            this.assets.powerUpSound.play().catch(e => console.log('Audio play failed:', e));
          } catch (e) { }

          this.healthPickups.splice(i, 1);
          continue;
        }
      }

      if (healthPickup.isOffScreen() || healthPickup.collected) {
        this.healthPickups.splice(i, 1);
      }
    }
  }

  /**
   * Update XP gems
   */
  private updateXPGems(effects: ReturnType<UpgradeSystem['calculateEffects']>): void {
    const magnetRange = effects.magnetRange || 0;

    for (let i = this.xpGems.length - 1; i >= 0; i--) {
      const gem = this.xpGems[i];
      gem.update(this.dino, magnetRange);

      if (gem.checkCollision(this.dino)) {
        const xpValue = gem.collect();
        const xpMultiplier = effects.xpMultiplier || 1;
        const totalXP = Math.floor(xpValue * xpMultiplier);
        this.xpManager.addXP(totalXP);

        this.particleSystem.spawnParticles(
          gem.x,
          gem.y,
          ParticleSystem.COLORS.XP_COLLECT,
          12
        );

        if (xpValue >= 10) {
          this.particleSystem.spawnTextPopup(
            gem.x,
            gem.y - 10,
            `+${totalXP}`,
            [0, 255, 255],
            xpValue >= 25 ? 18 : 14
          );
        }

        this.xpGems.splice(i, 1);
        continue;
      }

      if (gem.isOffScreen()) {
        this.xpGems.splice(i, 1);
      }
    }
  }

  /**
   * Update bullets
   */
  private updateBullets(): void {
    const effects = this.upgradeSystem.calculateEffects();

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (!bullet.active) {
        this.bullets.splice(i, 1);
        continue;
      }

      const hitGround = bullet.update();
      let bulletRemoved = false;

      if (bullet.isVolcanoProjectile && hitGround) {
        const hazard = new VolcanoHazard(bullet.x, bullet.y + bullet.height);
        this.volcanoHazards.push(hazard);
        this.bullets.splice(i, 1);
        bulletRemoved = true;

        this.particleSystem.spawnParticles(
          bullet.x + bullet.width / 2,
          bullet.y + bullet.height / 2,
          ParticleSystem.COLORS.ENEMY_DEATH,
          25
        );
        continue;
      }

      if (bullet.isVolcanoProjectile) {
        if (bullet.isOffScreen(this.canvas.width)) {
          this.bullets.splice(i, 1);
        }
        continue;
      }

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (bullet.checkCollision(enemy)) {
          const enemyDied = enemy.takeDamage(1);

          if (enemyDied) {
            const combo = this.particleSystem.registerKill();
            const intensity = this.particleSystem.getComboMultiplier();

            const colors = enemy.type === 'ghost'
              ? ParticleSystem.COLORS.GHOST_DEATH
              : ParticleSystem.COLORS.ENEMY_DEATH;
            this.particleSystem.spawnExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              colors,
              intensity
            );

            this.particleSystem.spawnTextPopup(
              enemy.x + enemy.width / 2,
              enemy.y,
              `+${enemy.xpValue} XP`,
              [100, 255, 255],
              14
            );

            this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
            this.spawnBonusXPForEnemy(enemy);

            this.enemies.splice(j, 1);
            this.screenShake.shake(8 * intensity, 150);
          } else {
            this.particleSystem.spawnParticles(
              bullet.x,
              bullet.y,
              ParticleSystem.COLORS.ENEMY_HIT,
              8
            );
            this.screenShake.shake(3, 75);
          }

          this.assets.hitSound.currentTime = 0;
          this.assets.hitSound.play().catch(e => console.log('Audio play failed:', e));

          if (!bullet.active) {
            this.bullets.splice(i, 1);
            bulletRemoved = true;
            break;
          }
        }
      }

      if (!bulletRemoved && bullet.isOffScreen(this.canvas.width)) {
        this.bullets.splice(i, 1);
      }
    }
  }

  /**
   * Update volcano hazards
   */
  private updateVolcanoHazards(): void {
    for (let i = this.volcanoHazards.length - 1; i >= 0; i--) {
      const hazard = this.volcanoHazards[i];

      if (!hazard.active) {
        this.volcanoHazards.splice(i, 1);
        continue;
      }

      hazard.update();

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        if (hazard.canDamage(enemy)) {
          hazard.markHit(enemy);
          const enemyDied = enemy.takeDamage(hazard.getDamage());

          if (enemyDied) {
            const combo = this.particleSystem.registerKill();
            const intensity = this.particleSystem.getComboMultiplier();

            this.particleSystem.spawnExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              ParticleSystem.COLORS.ENEMY_DEATH,
              intensity
            );

            this.particleSystem.spawnTextPopup(
              enemy.x + enemy.width / 2,
              enemy.y,
              `+${enemy.xpValue} XP`,
              [100, 255, 255],
              14
            );

            this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
            this.spawnBonusXPForEnemy(enemy);

            this.enemies.splice(j, 1);
            this.screenShake.shake(8, 150);
          } else {
            this.particleSystem.spawnParticles(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              ParticleSystem.COLORS.ENEMY_HIT,
              8
            );
            this.screenShake.shake(3, 75);
          }

          this.assets.hitSound.currentTime = 0;
          this.assets.hitSound.play().catch(e => console.log('Audio play failed:', e));
        }
      }
    }
  }

  /**
   * Update enemies
   */
  private updateEnemies(): void {
    this.weaponSystem.checkCollisions(this.enemies, (enemy: IEnemy) => {
      const enemyDied = enemy.takeDamage(1);

      if (enemyDied) {
        const combo = this.particleSystem.registerKill();
        const intensity = this.particleSystem.getComboMultiplier();

        const colors = enemy.type === 'ghost'
          ? ParticleSystem.COLORS.GHOST_DEATH
          : ParticleSystem.COLORS.ENEMY_DEATH;
        this.particleSystem.spawnExplosion(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          colors,
          intensity
        );

        this.particleSystem.spawnTextPopup(
          enemy.x + enemy.width / 2,
          enemy.y,
          `+${enemy.xpValue} XP`,
          [100, 255, 255],
          14
        );

        this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
        this.screenShake.shake(8 * intensity, 150);
      } else {
        this.particleSystem.spawnParticles(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          ParticleSystem.COLORS.ENEMY_HIT,
          8
        );
        this.screenShake.shake(3, 75);
      }

      this.assets.hitSound.currentTime = 0;
      this.assets.hitSound.play().catch(e => console.log('Audio play failed:', e));

      return enemyDied;
    });

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update();

      if (enemy.isDead()) {
        const combo = this.particleSystem.registerKill();
        const intensity = this.particleSystem.getComboMultiplier();

        const colors = enemy.type === 'ghost'
          ? ParticleSystem.COLORS.GHOST_DEATH
          : ParticleSystem.COLORS.ENEMY_DEATH;
        this.particleSystem.spawnExplosion(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          colors,
          intensity
        );

        this.particleSystem.spawnTextPopup(
          enemy.x + enemy.width / 2,
          enemy.y,
          `+${enemy.xpValue} XP`,
          [100, 255, 255],
          14
        );

        this.spawnXPGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.xpValue);
        this.spawnBonusXPForEnemy(enemy);

        this.enemies.splice(i, 1);
        this.screenShake.shake(6, 100);
        continue;
      }

      const canDamage = enemy.canDamagePlayer ? enemy.canDamagePlayer() : true;
      if (canDamage && checkCollision(this.dino, enemy)) {
        const damageTaken = this.dino.takeDamage();
        if (damageTaken) {
          this.particleSystem.spawnParticles(
            this.dino.x + this.dino.width / 2,
            this.dino.y + this.dino.height / 2,
            ParticleSystem.COLORS.PLAYER_DAMAGE,
            12
          );
          this.updateHealthDisplay();
          this.screenShake.shake(12, 200);

          this.assets.endSound.currentTime = 0;
          this.assets.endSound.play().catch(e => console.log('Audio play failed:', e));

          if (this.dino.isDead()) {
            this.handleGameOver();
          }
        }

        this.enemies.splice(i, 1);
        continue;
      }

      if (enemy.isOffScreen()) {
        this.enemies.splice(i, 1);
      }
    }
  }

  /**
   * Update obstacles
   */
  private updateObstacles(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update();

      if (checkCollision(this.dino, obstacle)) {
        const damageTaken = this.dino.takeDamage();
        if (damageTaken) {
          this.updateHealthDisplay();
          this.renderer.screenShake(8, 15);

          this.assets.endSound.currentTime = 0;
          this.assets.endSound.play().catch(e => console.log('Audio play failed:', e));

          if (this.dino.isDead()) {
            this.handleGameOver();
          }
        }
        this.obstacles.splice(i, 1);
        continue;
      }

      if (obstacle.isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * Handle game over
   */
  private handleGameOver(): void {
    this.gameOver = true;
    this.gameRunning = false;

    this.assets.deadSound.currentTime = 0;
    this.assets.deadSound.play().catch(e => console.log('Audio play failed:', e));

    this.scoreManager.updateHighScore();
    this.updateScoreDisplay();

    const currentScore = this.scoreManager.getCurrentScore();
    if (currentScore > 0) {
      setTimeout(() => this.checkAndPromptLeaderboard(), 500);
    }
  }

  /**
   * Render all game elements
   */
  private render(): void {
    const shakeOffset = this.screenShake.getOffset();
    this.ctx.save();
    this.ctx.translate(shakeOffset.x, shakeOffset.y);

    this.renderer.clear();

    this.clouds.forEach(cloud => {
      cloud.update();
      cloud.draw(this.ctx);
    });

    this.renderer.drawGround(this.frameCount, this.gameSpeed);

    if (!this.gameRunning) {
      this.dino.draw(this.ctx);
      this.particleSystem.draw(this.ctx);
      this.ctx.restore();
      this.renderer.drawStartScreen();
      return;
    }

    if (this.gameOver) {
      this.dino.draw(this.ctx);
      this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
      this.particleSystem.draw(this.ctx);
      this.ctx.restore();
      this.renderer.drawGameOver();
      return;
    }

    this.dino.draw(this.ctx);
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    this.enemies.forEach(enemy => enemy.draw(this.ctx));
    this.xpGems.forEach(gem => gem.draw(this.ctx));
    this.healthPickups.forEach(pickup => pickup.draw(this.ctx, this.frameCount));
    this.powerUps.forEach(powerUp => powerUp.draw(this.ctx, this.frameCount));
    this.volcanoHazards.forEach(hazard => hazard.draw(this.ctx));
    this.bullets.forEach(bullet => bullet.draw(this.ctx));

    this.weaponSystem.draw(this.ctx, this.frameCount);

    this.particleSystem.draw(this.ctx);

    this.ctx.restore();
  }

  /**
   * Main game loop
   */
  private gameLoop(): void {
    this.update();
    this.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Start the game loop
   */
  start(): void {
    console.log('Starting game loop...');
    this.gameLoop();
  }

  /**
   * Setup leaderboard UI event handlers
   */
  private setupLeaderboardUI(): void {
    const toggleBtn = document.getElementById('toggleLeaderboard');
    const closeBtn = document.getElementById('closeLeaderboard');
    const leaderboardContainer = document.getElementById('leaderboardContainer') as HTMLElement | null;
    const nameModal = document.getElementById('nameModal') as HTMLElement | null;
    const submitBtn = document.getElementById('submitScore');
    const skipBtn = document.getElementById('skipSubmit');
    const playerNameInput = document.getElementById('playerNameInput') as HTMLInputElement | null;

    if (toggleBtn && leaderboardContainer) {
      toggleBtn.addEventListener('click', () => {
        if (leaderboardContainer.style.display === 'none') {
          this.showLeaderboard();
        } else {
          leaderboardContainer.style.display = 'none';
        }
      });
    }

    if (closeBtn && leaderboardContainer) {
      closeBtn.addEventListener('click', () => {
        leaderboardContainer.style.display = 'none';
      });
    }

    if (submitBtn && playerNameInput) {
      submitBtn.addEventListener('click', async () => {
        const name = playerNameInput.value.trim();
        if (name) {
          await this.submitPlayerScore(name);
        }
      });
    }

    if (skipBtn && nameModal) {
      skipBtn.addEventListener('click', () => {
        nameModal.style.display = 'none';
      });
    }

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
  async showLeaderboard(forceRefresh: boolean = false): Promise<void> {
    const container = document.getElementById('leaderboardContainer') as HTMLElement | null;
    const content = document.getElementById('leaderboardContent') as HTMLElement | null;

    if (!container || !content) return;

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
   * Check if score qualifies for leaderboard
   */
  async checkAndPromptLeaderboard(): Promise<void> {
    const currentScore = this.scoreManager.getCurrentScore();

    try {
      const data = await this.scoreManager.fetchLeaderboard();

      if (data.success && data.scores) {
        const leaderboard = data.scores;
        const qualifies = leaderboard.length < 100 || currentScore > leaderboard[leaderboard.length - 1].score;

        if (qualifies) {
          this.promptScoreSubmission();
        }
      } else {
        this.promptScoreSubmission();
      }
    } catch (error) {
      console.error('Error checking leaderboard eligibility:', error);
      this.promptScoreSubmission();
    }
  }

  /**
   * Prompt user to submit score
   */
  private promptScoreSubmission(): void {
    const modal = document.getElementById('nameModal') as HTMLElement | null;
    const input = document.getElementById('playerNameInput') as HTMLInputElement | null;
    const result = document.getElementById('submitResult') as HTMLElement | null;
    const submitBtn = document.getElementById('submitScore') as HTMLButtonElement | null;

    if (modal && input && result) {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
      }
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
  async submitPlayerScore(name: string): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    const result = document.getElementById('submitResult') as HTMLElement | null;
    const modal = document.getElementById('nameModal') as HTMLElement | null;
    const submitBtn = document.getElementById('submitScore') as HTMLButtonElement | null;

    if (!result || !modal) return;

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

        setTimeout(() => {
          modal.style.display = 'none';
          this.showLeaderboard(true);
        }, 2000);
      } else {
        result.textContent = 'Failed to submit: ' + (response.error || 'Unknown error');
        result.className = 'submit-result error';
        this.isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    } catch (error) {
      result.textContent = 'Error: ' + (error as Error).message;
      result.className = 'submit-result error';
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  }
}

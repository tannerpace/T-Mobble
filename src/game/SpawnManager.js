/**
 * SpawnManager - handles spawning of game entities
 */
export class SpawnManager {
  constructor(canvas, entities, gameState) {
    this.canvas = canvas;
    this.entities = entities;
    this.gameState = gameState;
  }

  /**
   * Check if should spawn obstacle
   */
  shouldSpawnObstacle() {
    const spawnInterval = 120 + Math.floor(Math.random() * 80); // 120-200 frames
    return this.gameState.frameCount % spawnInterval === 0;
  }

  /**
   * Spawn an obstacle
   */
  spawnObstacle(Obstacle, palmImg) {
    const minDistance = 250;
    const lastObstacle = this.entities.obstacles[this.entities.obstacles.length - 1];

    if (!lastObstacle || this.canvas.width - lastObstacle.x > minDistance) {
      this.entities.addObstacle(new Obstacle(this.canvas, this.gameState.gameSpeed, palmImg));
    }
  }

  /**
   * Check if should spawn enemy based on player level
   */
  shouldSpawnEnemy(playerLevel) {
    let enemySpawnChance = 0;
    let enemySpawnInterval = 200;

    // Progressive difficulty based on level
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

    return this.gameState.frameCount % enemySpawnInterval === 0 && Math.random() < enemySpawnChance;
  }

  /**
   * Spawn an enemy (flying, medium, tank, or elite)
   */
  spawnEnemy(FlyingEnemy, MediumEnemy, TankEnemy, EliteEnemy) {
    const rand = Math.random();
    if (rand < 0.45) {
      this.entities.addEnemy(new FlyingEnemy(this.canvas, this.gameState.gameSpeed));
    } else if (rand < 0.70) {
      this.entities.addEnemy(new MediumEnemy(this.canvas, this.gameState.gameSpeed));
    } else if (rand < 0.90) {
      this.entities.addEnemy(new TankEnemy(this.canvas, this.gameState.gameSpeed));
    } else {
      this.entities.addEnemy(new EliteEnemy(this.canvas, this.gameState.gameSpeed));
    }
  }

  /**
   * Check if should spawn power-up
   */
  shouldSpawnPowerUp() {
    return this.gameState.frameCount % 250 === 0 && Math.random() < 0.6;
  }

  /**
   * Spawn a power-up
   */
  spawnPowerUp(PowerUp) {
    if (Math.random() < 0.3) {
      this.entities.addPowerUp(new PowerUp(this.canvas, this.gameState.gameSpeed));
    }
  }

  /**
   * Check if should spawn health pickup
   */
  shouldSpawnHealthPickup(dinoHealth, dinoMaxHealth) {
    return this.gameState.frameCount % 400 === 0 &&
      dinoHealth < dinoMaxHealth &&
      Math.random() < 0.15;
  }

  /**
   * Spawn a health pickup
   */
  spawnHealthPickup(HealthPickup, dinoHealth, dinoMaxHealth) {
    if (dinoHealth < dinoMaxHealth && Math.random() < 0.15) {
      this.entities.addHealthPickup(new HealthPickup(this.canvas, this.gameState.gameSpeed));
    }
  }

  /**
   * Spawn XP gem at position
   */
  spawnXPGem(XPGem, x, y, value) {
    this.entities.addXPGem(new XPGem(x, y, value));
  }

  /**
   * Spawn coin at position
   */
  spawnCoin(Coin, x, y, value = 1) {
    this.entities.addCoin(new Coin(x, y, value));
  }
}

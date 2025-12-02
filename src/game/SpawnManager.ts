import type { ICollectible, IEnemy } from '../types';
import type { EntityManager } from './EntityManager';
import type { GameState } from './GameState';

/** Constructor type for obstacle entities */
interface ObstacleConstructor {
  new(canvas: HTMLCanvasElement, gameSpeed: number): unknown;
}

/** Constructor type for enemy entities */
interface EnemyConstructor {
  new(canvas: HTMLCanvasElement, gameSpeed: number): IEnemy;
}

/** Constructor type for power-up entities */
interface PowerUpConstructor {
  new(canvas: HTMLCanvasElement, gameSpeed: number): unknown;
}

/** Constructor type for health pickup entities */
interface HealthPickupConstructor {
  new(canvas: HTMLCanvasElement, gameSpeed: number): ICollectible;
}

/** Constructor type for XP gem entities */
interface XPGemConstructor {
  new(x: number, y: number, value: number): ICollectible;
}

/** Constructor type for coin entities */
interface CoinConstructor {
  new(x: number, y: number, value: number): ICollectible;
}

/**
 * SpawnManager - handles spawning of game entities
 */
export class SpawnManager {
  private canvas: HTMLCanvasElement;
  private entities: EntityManager;
  private gameState: GameState;

  constructor(canvas: HTMLCanvasElement, entities: EntityManager, gameState: GameState) {
    this.canvas = canvas;
    this.entities = entities;
    this.gameState = gameState;
  }

  /**
   * Check if should spawn obstacle
   */
  shouldSpawnObstacle(): boolean {
    const spawnInterval = 200 + Math.floor(Math.random() * 150); // 200-350 frames (much less frequent)
    return this.gameState.frameCount % spawnInterval === 0;
  }

  /**
   * Spawn an obstacle
   */
  spawnObstacle(Obstacle: ObstacleConstructor): void {
    const minDistance = 400; // Increased spacing between obstacles
    const lastObstacle = this.entities.obstacles[this.entities.obstacles.length - 1];

    if (!lastObstacle || this.canvas.width - lastObstacle.x > minDistance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.entities.addObstacle(new Obstacle(this.canvas, this.gameState.gameSpeed) as any);
    }
  }

  /**
   * Check if should spawn enemy based on player level
   */
  shouldSpawnEnemy(playerLevel: number): boolean {
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
   * Spawn an enemy (flying, low-flying, medium, tank, elite, or super elite)
   */
  spawnEnemy(
    FlyingEnemy: EnemyConstructor,
    LowFlyingEnemy: EnemyConstructor,
    MediumEnemy: EnemyConstructor,
    TankEnemy: EnemyConstructor,
    EliteEnemy: EnemyConstructor,
    SuperEliteEnemy: EnemyConstructor
  ): void {
    const rand = Math.random();
    if (rand < 0.30) {
      this.entities.addEnemy(new FlyingEnemy(this.canvas, this.gameState.gameSpeed));
    } else if (rand < 0.45) {
      this.entities.addEnemy(new LowFlyingEnemy(this.canvas, this.gameState.gameSpeed));
    } else if (rand < 0.65) {
      this.entities.addEnemy(new MediumEnemy(this.canvas, this.gameState.gameSpeed));
    } else if (rand < 0.82) {
      this.entities.addEnemy(new TankEnemy(this.canvas, this.gameState.gameSpeed));
    } else if (rand < 0.95) {
      this.entities.addEnemy(new EliteEnemy(this.canvas, this.gameState.gameSpeed));
    } else {
      this.entities.addEnemy(new SuperEliteEnemy(this.canvas, this.gameState.gameSpeed));
    }
  }

  /**
   * Check if should spawn power-up
   */
  shouldSpawnPowerUp(): boolean {
    return this.gameState.frameCount % 250 === 0 && Math.random() < 0.6;
  }

  /**
   * Spawn a power-up
   */
  spawnPowerUp(PowerUp: PowerUpConstructor): void {
    if (Math.random() < 0.3) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.entities.addPowerUp(new PowerUp(this.canvas, this.gameState.gameSpeed) as any);
    }
  }

  /**
   * Check if should spawn health pickup
   */
  shouldSpawnHealthPickup(dinoHealth: number, dinoMaxHealth: number): boolean {
    return this.gameState.frameCount % 400 === 0 &&
      dinoHealth < dinoMaxHealth &&
      Math.random() < 0.15;
  }

  /**
   * Spawn a health pickup
   */
  spawnHealthPickup(HealthPickup: HealthPickupConstructor, dinoHealth: number, dinoMaxHealth: number): void {
    if (dinoHealth < dinoMaxHealth && Math.random() < 0.15) {
      this.entities.addHealthPickup(new HealthPickup(this.canvas, this.gameState.gameSpeed));
    }
  }

  /**
   * Spawn XP gem at position
   */
  spawnXPGem(XPGem: XPGemConstructor, x: number, y: number, value: number): void {
    this.entities.addXPGem(new XPGem(x, y, value));
  }

  /**
   * Spawn coin at position
   */
  spawnCoin(Coin: CoinConstructor, x: number, y: number, value: number = 1): void {
    this.entities.addCoin(new Coin(x, y, value));
  }
}

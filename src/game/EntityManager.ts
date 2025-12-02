import type { IBullet, ICollectible, IEnemy, IEntity } from '../types';

/** Interface for obstacle entities */
interface IObstacle extends IEntity {
  update(): void;
}

/** Interface for power-up entities */
interface IPowerUp extends IEntity {
  update(): void;
}

/** Drawable entities collection */
export interface DrawableEntities {
  obstacles: IObstacle[];
  enemies: IEnemy[];
  xpGems: ICollectible[];
  coins: ICollectible[];
  healthPickups: ICollectible[];
  powerUps: IPowerUp[];
  bullets: IBullet[];
}

/**
 * EntityManager - manages game entities (obstacles, enemies, pickups, etc.)
 */
export class EntityManager {
  public obstacles: IObstacle[];
  public enemies: IEnemy[];
  public xpGems: ICollectible[];
  public coins: ICollectible[];
  public healthPickups: ICollectible[];
  public powerUps: IPowerUp[];
  public bullets: IBullet[];

  constructor() {
    this.obstacles = [];
    this.enemies = [];
    this.xpGems = [];
    this.coins = [];
    this.healthPickups = [];
    this.powerUps = [];
    this.bullets = [];
  }

  /**
   * Reset all entities
   */
  reset(): void {
    this.obstacles = [];
    this.enemies = [];
    this.xpGems = [];
    this.coins = [];
    this.healthPickups = [];
    this.powerUps = [];
    this.bullets = [];
  }

  /**
   * Add an obstacle
   */
  addObstacle(obstacle: IObstacle): void {
    this.obstacles.push(obstacle);
  }

  /**
   * Add an enemy
   */
  addEnemy(enemy: IEnemy): void {
    this.enemies.push(enemy);
  }

  /**
   * Add an XP gem
   */
  addXPGem(gem: ICollectible): void {
    this.xpGems.push(gem);
  }

  /**
   * Add a coin
   */
  addCoin(coin: ICollectible): void {
    this.coins.push(coin);
  }

  /**
   * Add a health pickup
   */
  addHealthPickup(pickup: ICollectible): void {
    this.healthPickups.push(pickup);
  }

  /**
   * Add a power-up
   */
  addPowerUp(powerUp: IPowerUp): void {
    this.powerUps.push(powerUp);
  }

  /**
   * Add a bullet
   */
  addBullet(bullet: IBullet): void {
    this.bullets.push(bullet);
  }

  /**
   * Remove entity from array at index
   */
  removeAt<T>(array: T[], index: number): void {
    array.splice(index, 1);
  }

  /**
   * Remove obstacles that are off-screen
   */
  cleanupOffscreen(): void {
    this.obstacles = this.obstacles.filter((o: IObstacle) => !o.isOffScreen());
    this.enemies = this.enemies.filter((e: IEnemy) => !e.isOffScreen());
    this.xpGems = this.xpGems.filter((g: ICollectible) => !g.isOffScreen());
    this.coins = this.coins.filter((c: ICollectible) => !c.isOffScreen());
    this.healthPickups = this.healthPickups.filter((h: ICollectible) => !h.isOffScreen());
    this.powerUps = this.powerUps.filter((p: IPowerUp) => !p.isOffScreen());
    this.bullets = this.bullets.filter((b: IBullet) => b.active && !b.isOffScreen(9999));
  }

  /**
   * Get all drawable entities in render order
   */
  getDrawables(): DrawableEntities {
    return {
      obstacles: this.obstacles,
      enemies: this.enemies,
      xpGems: this.xpGems,
      coins: this.coins,
      healthPickups: this.healthPickups,
      powerUps: this.powerUps,
      bullets: this.bullets
    };
  }

  /**
   * Update all entities
   */
  updateAll(): void {
    this.obstacles.forEach((o: IObstacle) => o.update());
    this.enemies.forEach((e: IEnemy) => e.update());
    this.bullets.forEach((b: IBullet) => b.update());
  }
}

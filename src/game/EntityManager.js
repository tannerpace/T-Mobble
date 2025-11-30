/**
 * EntityManager - manages game entities (obstacles, enemies, pickups, etc.)
 */
export class EntityManager {
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
  reset() {
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
  addObstacle(obstacle) {
    this.obstacles.push(obstacle);
  }

  /**
   * Add an enemy
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  /**
   * Add an XP gem
   */
  addXPGem(gem) {
    this.xpGems.push(gem);
  }

  /**
   * Add a coin
   */
  addCoin(coin) {
    this.coins.push(coin);
  }

  /**
   * Add a health pickup
   */
  addHealthPickup(pickup) {
    this.healthPickups.push(pickup);
  }

  /**
   * Add a power-up
   */
  addPowerUp(powerUp) {
    this.powerUps.push(powerUp);
  }

  /**
   * Add a bullet
   */
  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  /**
   * Remove entity from array at index
   */
  removeAt(array, index) {
    array.splice(index, 1);
  }

  /**
   * Remove obstacles that are off-screen
   */
  cleanupOffscreen() {
    this.obstacles = this.obstacles.filter(o => !o.isOffScreen());
    this.enemies = this.enemies.filter(e => !e.isOffScreen());
    this.xpGems = this.xpGems.filter(g => !g.isOffScreen());
    this.coins = this.coins.filter(c => !c.isOffScreen());
    this.healthPickups = this.healthPickups.filter(h => !h.isOffScreen());
    this.powerUps = this.powerUps.filter(p => !p.isOffScreen());
    this.bullets = this.bullets.filter(b => b.active && !b.isOffScreen(9999));
  }

  /**
   * Get all drawable entities in render order
   */
  getDrawables() {
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
  updateAll() {
    this.obstacles.forEach(o => o.update());
    this.enemies.forEach(e => e.update());
    this.bullets.forEach(b => b.update());
  }
}

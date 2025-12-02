/**
 * BaseWeapon - Abstract base class for all weapons
 */
import type { Bullet } from '../entities/Bullet';
import type { IDino } from '../types';

export interface WeaponEffects {
  fireRateMod?: number;
  bulletCount?: number;
  spreadAngle?: number;
  bulletSpeedMod?: number;
  pierceCount?: number;
}

export type ProjectileArray = Bullet[];

export abstract class BaseWeapon {
  name: string;
  description: string;
  icon: string;
  fireRateBase: number;
  fireRateCounter: number;
  level: number;

  constructor(name: string, description: string, icon: string) {
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.fireRateBase = 30; // frames between shots
    this.fireRateCounter = 0;
    this.level = 1;
  }

  /**
   * Update weapon (to be overridden)
   */
  update(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects = {}): void {
    this.fireRateCounter++;
  }

  /**
   * Fire weapon (to be overridden)
   */
  fire(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects = {}): void {
    // Override in subclass
  }

  /**
   * Set weapon level
   */
  setLevel(level: number): void {
    this.level = level;
  }

  /**
   * Reset weapon state
   */
  reset(): void {
    this.fireRateCounter = 0;
  }
}

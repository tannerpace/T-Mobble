/**
 * WeaponSystem - Manages multiple auto-firing weapons with various patterns
 */
import type { IDino, IEnemy } from '../types';
import { BaseWeapon, ProjectileArray, WeaponEffects } from '../weapons/BaseWeapon';
import { BulletWeapon } from '../weapons/BulletWeapon';
import { FlameThrowerWeapon } from '../weapons/FlameThrowerWeapon';
import { LaserWeapon } from '../weapons/LaserWeapon';
import { OrbitalWeapon } from '../weapons/OrbitalWeapon';
import { ShotgunWeapon } from '../weapons/ShotgunWeapon';
import { VolcanoWeapon } from '../weapons/VolcanoWeapon';
import { WaterCannonWeapon } from '../weapons/WaterCannonWeapon';
import { WhipWeapon } from '../weapons/WhipWeapon';
import type { LoadedGameAssets } from './AssetManager';

type WeaponId = 'blaster' | 'whip' | 'laser' | 'flamethrower' | 'volcano' | 'watercannon' | 'shotgun' | 'orbital';

interface WeaponInfo {
  index: number;
  name: string;
  description: string;
  icon: string;
}

export class WeaponSystem {
  private enabled: boolean;
  private assets: LoadedGameAssets;
  private allWeaponTypes: BaseWeapon[];
  private activeWeapons: BaseWeapon[];

  constructor(assets: LoadedGameAssets) {
    this.enabled = true;
    this.assets = assets;

    // All weapon types (for upgrades)
    this.allWeaponTypes = [
      new BulletWeapon(assets),
      new WhipWeapon(assets),
      new LaserWeapon(assets),
      new FlameThrowerWeapon(assets),
      new VolcanoWeapon(assets),
      new WaterCannonWeapon(assets),
      new ShotgunWeapon(assets),
      new OrbitalWeapon(assets)
    ];

    // Active weapons (always starts with blaster)
    this.activeWeapons = [new BulletWeapon(assets)];
  }

  /**
   * Get all available weapons for upgrades
   */
  getAvailableWeapons(): WeaponInfo[] {
    return this.allWeaponTypes.map((weapon, index) => ({
      index,
      name: weapon.name,
      description: weapon.description,
      icon: weapon.icon
    }));
  }

  /**
   * Add a weapon to active arsenal
   */
  addWeapon(weaponId: string): boolean {
    // Map weapon IDs to weapon instances
    const weaponMap: Record<WeaponId, BaseWeapon> = {
      'blaster': new BulletWeapon(this.assets),
      'whip': new WhipWeapon(this.assets),
      'laser': new LaserWeapon(this.assets),
      'flamethrower': new FlameThrowerWeapon(this.assets),
      'volcano': new VolcanoWeapon(this.assets),
      'watercannon': new WaterCannonWeapon(this.assets),
      'shotgun': new ShotgunWeapon(this.assets),
      'orbital': new OrbitalWeapon(this.assets)
    };

    const weapon = weaponMap[weaponId as WeaponId];
    if (weapon) {
      // Check if weapon type already active
      const alreadyHas = this.activeWeapons.some(w => w.name === weapon.name);
      if (!alreadyHas) {
        this.activeWeapons.push(weapon);
        return true;
      }
    }
    return false;
  }

  /**
   * Level up an existing weapon
   */
  levelUpWeapon(weaponId: string, newLevel: number): boolean {
    const weaponMap: Record<WeaponId, string> = {
      'blaster': 'Blaster',
      'whip': 'Whip',
      'laser': 'Laser Beam',
      'flamethrower': 'Flame Thrower',
      'volcano': 'Bomb Launcher',
      'watercannon': 'Water Cannon',
      'shotgun': 'Shotgun',
      'orbital': 'Orbital'
    };

    const weaponName = weaponMap[weaponId as WeaponId];
    const weapon = this.activeWeapons.find(w => w.name === weaponName);

    if (weapon && weapon.setLevel) {
      weapon.setLevel(newLevel);
      return true;
    }
    return false;
  }

  /**
   * Get current active weapons
   */
  getActiveWeapons(): BaseWeapon[] {
    return this.activeWeapons;
  }

  /**
   * Update all active weapons and auto-fire if ready
   */
  update(dino: IDino, projectiles: ProjectileArray, effects: WeaponEffects): void {
    if (!this.enabled) return;

    // Update all active weapons
    this.activeWeapons.forEach(weapon => {
      weapon.update(dino, projectiles, effects);
    });
  }

  /**
   * Draw all weapon effects (for whip and laser)
   */
  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    this.activeWeapons.forEach(weapon => {
      if ('draw' in weapon && typeof weapon.draw === 'function') {
        (weapon as WhipWeapon | LaserWeapon | FlameThrowerWeapon | WaterCannonWeapon | OrbitalWeapon).draw(ctx, frameCount);
      }
    });
  }

  /**
   * Check collisions for all melee weapons
   */
  checkCollisions(enemies: IEnemy[], onHit: (enemy: IEnemy) => boolean): void {
    this.activeWeapons.forEach(weapon => {
      if ('checkCollisions' in weapon && typeof weapon.checkCollisions === 'function') {
        (weapon as WhipWeapon | LaserWeapon | FlameThrowerWeapon | WaterCannonWeapon | OrbitalWeapon).checkCollisions(enemies, onHit);
      }
    });
  }

  /**
   * Reset weapon system
   */
  reset(): void {
    this.activeWeapons.forEach(weapon => weapon.reset());
    // Always start with blaster
    this.activeWeapons = [new BulletWeapon(this.assets)];
  }

  /**
   * Toggle auto-fire on/off
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

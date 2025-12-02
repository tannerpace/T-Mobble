/**
 * Type definitions for T-Mobble game
 */

// =============================================================================
// Core Game Types
// =============================================================================

/** 2D position coordinates */
export interface Position {
  x: number;
  y: number;
}

/** Entity dimensions */
export interface Dimensions {
  width: number;
  height: number;
}

/** Bounding box for collision detection */
export interface BoundingBox extends Position, Dimensions { }

/** RGB color tuple */
export type RGBColor = [number, number, number];

/** Color palette for particles */
export type ColorPalette = RGBColor[];

// =============================================================================
// Entity Types
// =============================================================================

/** Base interface for all game entities */
export interface IEntity extends BoundingBox {
  active: boolean;
  collected: boolean;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  checkCollision(entity: BoundingBox): boolean;
  isOffScreen(buffer?: number): boolean;
  getCenter(): Position;
}

/** Enemy types in the game */
export type EnemyType =
  | 'enemy'
  | 'flying'
  | 'lowflying'
  | 'frog'
  | 'charger'
  | 'ghost'
  | 'medium'
  | 'tank'
  | 'elite'
  | 'superelite';

/** Configuration for enemy entities */
export interface EnemyConfig {
  width?: number;
  height?: number;
  health?: number;
  xpValue?: number;
  speedMultiplier?: number;
  type?: EnemyType;
}

/** Interface for enemy entities */
export interface IEnemy extends IEntity {
  health: number;
  maxHealth: number;
  xpValue: number;
  type: EnemyType;
  speed: number;
  isBurning: boolean;
  burnDamage: number;
  burnDuration: number;

  takeDamage(amount?: number): boolean;
  applyBurn(damage?: number, duration?: number): void;
  isDead(): boolean;
  canDamagePlayer?(): boolean;
}

/** Interface for the player (Dino) */
export interface IDino extends BoundingBox {
  health: number;
  maxHealth: number;
  grounded: boolean;
  jumping: boolean;
  invulnerable: boolean;

  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  jump(): void;
  releaseJump(): void;
  takeDamage(): boolean;
  heal(amount?: number): void;
  isDead(): boolean;
  reset(): void;
  applyUpgradeEffects(effects: UpgradeEffects): void;
}

/** Interface for collectible items */
export interface ICollectible extends IEntity {
  value: number;
  collect(): number;
}

/** Interface for bullets/projectiles */
export interface IBullet extends IEntity {
  speed: number;
  damage: number;
  piercing: boolean;
  isVolcanoProjectile?: boolean;

  update(): boolean; // Returns true if hit ground
  isOffScreen(canvasWidth: number): boolean;
}

// =============================================================================
// Weapon Types
// =============================================================================

/** Weapon IDs */
export type WeaponId =
  | 'bullet'
  | 'shotgun'
  | 'laser'
  | 'whip'
  | 'flamethrower'
  | 'orbital'
  | 'volcano'
  | 'waterCannon';

/** Base interface for weapons */
export interface IWeapon {
  name: string;
  description: string;
  icon: string;
  fireRateBase: number;
  fireRateCounter: number;
  level: number;

  update(dino: IDino, projectiles: IBullet[], effects: UpgradeEffects): void;
  fire(dino: IDino, projectiles: IBullet[], effects: UpgradeEffects): void;
  reset(): void;
  levelUp?(newLevel: number): void;
  draw?(ctx: CanvasRenderingContext2D, frameCount: number): void;
  checkCollisions?(enemies: IEnemy[], onHit: (enemy: IEnemy) => boolean): void;
}

/** Weapon definition for upgrade system */
export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  levelDescriptions: string[];
}

// =============================================================================
// Game Systems Types
// =============================================================================

/** Upgrade effects calculated from current upgrades */
export interface UpgradeEffects {
  speedMod: number;
  magnetRange: number;
  xpMultiplier: number;
  maxHealthBonus: number;
  jumpPowerMod: number;
  regeneration: boolean;
  fireRateMod: number;
  damageMod: number;
}

/** XP/Level state */
export interface XPState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  progress: number;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  name: string;
  score: number;
  rank?: number;
}

/** API response for leaderboard */
export interface LeaderboardResponse {
  success: boolean;
  scores?: LeaderboardEntry[];
  error?: string;
  rank?: number;
  total?: number;
}

/** Upgrade choice presented to player */
export interface UpgradeChoice {
  id: WeaponId | 'healthRefill';
  name: string;
  description: string;
  icon: string;
  isNewWeapon?: boolean;
  isHealthRefill?: boolean;
  currentLevel?: number;
  nextLevel?: number;
}

// =============================================================================
// Asset Types
// =============================================================================

/** Game assets loaded at startup */
export interface GameAssets {
  // Images
  trexImg: HTMLImageElement;
  palmImg: HTMLImageElement;

  // Sounds
  jumpSound: HTMLAudioElement;
  hitSound: HTMLAudioElement;
  endSound: HTMLAudioElement;
  deadSound: HTMLAudioElement;
  beepSound: HTMLAudioElement;
  blingSound: HTMLAudioElement;
  powerUpSound: HTMLAudioElement;
  yeehawSound: HTMLAudioElement;
  pewSound: HTMLAudioElement;
  whipSound: HTMLAudioElement;
  laserbuzSound: HTMLAudioElement;
  flameSound: HTMLAudioElement;
}

// =============================================================================
// Particle System Types
// =============================================================================

/** Single particle properties */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: RGBColor;
  size: number;
  gravity?: number;
  friction?: number;
}

/** Text popup particle */
export interface TextPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: RGBColor;
  fontSize: number;
  life: number;
  maxLife: number;
}

// =============================================================================
// Input Types
// =============================================================================

/** Input handler callbacks */
export interface InputCallbacks {
  onJump: (() => void) | null;
  onJumpRelease: (() => void) | null;
  onStartGame: (() => void) | null;
  onRestartGame: (() => void) | null;
}

// =============================================================================
// Game Config Types
// =============================================================================

/** Global game configuration */
export interface GameConfig {
  upgradeChoiceCount?: number;
  debugMode?: boolean;
}

/** Environment configuration */
export interface EnvConfig {
  getBasePath(): string;
}

// =============================================================================
// Global Window Extensions
// =============================================================================

declare global {
  interface Window {
    GAME_CONFIG?: GameConfig;
    ENV_CONFIG?: EnvConfig;
  }
}

export { };


/**
 * Dino entity - the player character
 */

import type { UpgradeEffects } from '../types';
import type { LoadedGameAssets } from '../utils/AssetManager';

export class Dino {
  private canvas: HTMLCanvasElement;
  private gravity: number;
  private trexImg: HTMLImageElement;
  private jumpSound: HTMLAudioElement;

  public x: number;
  public width: number;
  public height: number;
  public groundY: number;
  public y: number;
  public dy: number;
  public jumpPower: number;
  public grounded: boolean;
  public jumping: boolean;
  public maxHealth: number;
  public health: number;
  public invulnerable: boolean;
  public invulnerabilityTime: number;
  public invulnerabilityCounter: number;
  public animationFrame: number;
  public animationSpeed: number;
  public frameCount: number;

  constructor(canvas: HTMLCanvasElement, gravity: number, assets: LoadedGameAssets) {
    this.canvas = canvas;
    this.gravity = gravity;
    this.trexImg = assets.trexImg;
    this.jumpSound = assets.jumpSound;

    this.x = 50;
    this.width = 40;
    this.height = 44;

    this.groundY = this.canvas.height * 0.8 - this.height;
    this.y = this.groundY;

    this.dy = 0;
    this.jumpPower = -9;
    this.grounded = false;
    this.jumping = false;

    this.maxHealth = 7;
    this.health = this.maxHealth;
    this.invulnerable = false;
    this.invulnerabilityTime = 120;
    this.invulnerabilityCounter = 0;

    this.animationFrame = 0;
    this.animationSpeed = 5;
    this.frameCount = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.trexImg.complete && this.trexImg.naturalWidth > 0) {
      let yOffset = 0;
      if (this.grounded && !this.jumping) {
        yOffset = this.animationFrame === 0 ? 0 : -1;
      }

      if (this.invulnerable && Math.floor(this.invulnerabilityCounter / 5) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      ctx.drawImage(this.trexImg, this.x, this.y + yOffset, this.width, this.height);
      ctx.globalAlpha = 1.0;
    } else {
      ctx.fillStyle = '#535353';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update(): void {
    this.groundY = this.canvas.height * 0.8 - this.height;

    if (this.y < this.groundY) {
      this.dy += this.gravity;
      this.grounded = false;
    } else {
      this.y = this.groundY;
      this.grounded = true;
      this.jumping = false;
      if (this.dy > 0) {
        this.dy = 0;
      }
    }

    this.y += this.dy;

    if (this.grounded && !this.jumping) {
      this.frameCount++;
      if (this.frameCount >= this.animationSpeed) {
        this.animationFrame = (this.animationFrame + 1) % 2;
        this.frameCount = 0;
      }
    }

    if (this.invulnerable) {
      this.invulnerabilityCounter--;
      if (this.invulnerabilityCounter <= 0) {
        this.invulnerable = false;
      }
    }
  }

  jump(): void {
    if (this.grounded && !this.jumping) {
      this.dy = this.jumpPower;
      this.jumping = true;

      this.jumpSound.currentTime = 0;
      this.jumpSound.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  /**
   * Release jump for variable jump height
   */
  releaseJump(): void {
    if (this.jumping && this.dy < 0) {
      this.dy *= 0.5;
    }
  }

  /**
   * Take damage
   */
  takeDamage(): boolean {
    if (this.invulnerable || this.health <= 0) {
      return false;
    }

    this.health--;
    if (this.health > 0) {
      this.invulnerable = true;
      this.invulnerabilityCounter = this.invulnerabilityTime;
    }
    return true;
  }

  /**
   * Heal the player
   */
  heal(amount: number = 1): void {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  /**
   * Check if player is dead
   */
  isDead(): boolean {
    return this.health <= 0;
  }

  /**
   * Apply upgrade effects to dino
   */
  applyUpgradeEffects(effects: UpgradeEffects): void {
    this.maxHealth = 5 + effects.maxHealthBonus;
    this.health = Math.min(this.health, this.maxHealth);
    this.jumpPower = -7 * effects.jumpPowerMod;
  }

  reset(): void {
    this.groundY = this.canvas.height * 0.8 - this.height;
    this.y = this.groundY;
    this.dy = 0;
    this.jumping = false;
    this.grounded = false;
    this.animationFrame = 0;
    this.frameCount = 0;
    this.health = this.maxHealth;
    this.invulnerable = false;
    this.invulnerabilityCounter = 0;
  }
}

/**
 * FrogEnemy - Weak hopping enemy that fills gap between Flying and Medium enemies
 * Features a hopping movement pattern and ground-based positioning
 */
import { BaseEnemy } from './BaseEnemy';

export class FrogEnemy extends BaseEnemy {
  private hopHeight: number;
  private hopDuration: number;
  private hopProgress: number;
  private isHopping: boolean;
  private groundY: number;

  constructor(canvas: HTMLCanvasElement, gameSpeed: number) {
    super(canvas, gameSpeed, {
      width: 35,
      height: 35,
      health: 2,
      xpValue: 7,
      speedMultiplier: 0.85, // Between medium (0.8x) and flying (0.9x-1.3x range)
      type: 'frog'
    });

    // Override X position for variation
    this.x = canvas.width + Math.random() * 200;

    // Hopping animation parameters
    this.hopHeight = 40; // Maximum hop height
    this.hopDuration = 30; // Frames per hop (half cycle)
    this.hopProgress = Math.random() * this.hopDuration * 2; // Random starting position in hop cycle
    this.isHopping = true;

    // Ground level position
    this.groundY = canvas.height * 0.8 - this.height;
    this.y = this.groundY;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Different emoji based on damage
    const emoji = this.health <= 1 ? '🦎' : '🐸'; // Frog when healthy, lizard when damaged

    this.drawEmoji(ctx, emoji, 35);

    // Frog-styled health bar
    this.drawHealthBar(ctx, {
      barWidth: 30,
      barHeight: 3,
      yOffset: -10,
      colors: {
        high: '#00FF88', // Green for frog at high health
        medium: '#FFAA00', // Orange for medium health
        low: '#FF0000' // Red for low health
      }
    });
  }

  update(): void {
    super.update();

    // Hopping motion - parabolic arc
    this.hopProgress = (this.hopProgress + 1) % (this.hopDuration * 2);

    // Calculate hop offset using sine wave for smooth hopping
    // hopCycle 0-1: frog hops in parabolic arc
    // hopCycle 1-2: frog rests on ground
    const hopCycle = this.hopProgress / this.hopDuration;

    if (hopCycle < 1) {
      // Airborne - parabolic motion using sine wave
      const hopOffset = Math.sin(hopCycle * Math.PI) * this.hopHeight;
      this.y = this.groundY - hopOffset;
    } else {
      // Resting on ground between hops
      this.y = this.groundY;
    }
  }
}

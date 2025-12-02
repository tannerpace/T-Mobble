/**
 * PowerUp entity - collectible that gives ammo for shooting
 */
import { Collectible } from './Collectible';

export class PowerUp extends Collectible {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, gameSpeed: number) {
    const x = canvas.width + Math.random() * 400;
    const y = canvas.height * 0.2 + Math.random() * (canvas.height * 0.2);

    super(x, y, 24, 24, gameSpeed * 0.8);

    this.canvas = canvas;
    this.emoji = '💵';
  }

  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    if (this.collected) return;

    const bounce = Math.sin(frameCount / 10) * 2;
    const { x: centerX, y: centerY } = this.getCenter();

    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(this.emoji, centerX, centerY + bounce);
  }

  update(): void {
    if (!this.collected) {
      this.x -= this.speed;
    }
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}

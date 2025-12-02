/**
 * FlyingEnemy - Flying obstacle at variable heights
 */
import { BaseEnemy } from './BaseEnemy';

export class FlyingEnemy extends BaseEnemy {
  private baseY: number;
  private waveAmplitude: number;
  private waveFrequency: number;
  private waveOffset: number;
  private wingFrame: number;

  constructor(canvas: HTMLCanvasElement, gameSpeed: number) {
    super(canvas, gameSpeed, {
      width: 35,
      height: 30,
      health: 1,
      xpValue: 5,
      speedMultiplier: 0.9 + Math.random() * 0.4,
      type: 'flying'
    });

    this.baseY = canvas.height * 0.15 + Math.random() * (canvas.height * 0.3);
    this.y = this.baseY;

    this.waveAmplitude = 30 + Math.random() * 20;
    this.waveFrequency = 0.03 + Math.random() * 0.02;
    this.waveOffset = Math.random() * Math.PI * 2;

    this.wingFrame = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const emoji = this.wingFrame === 0 ? '🦅' : '🦉';
    this.drawEmoji(ctx, emoji, 30);

    this.drawHealthBar(ctx);
  }

  update(): void {
    super.update();

    this.y = this.baseY + Math.sin(this.frameCount * this.waveFrequency + this.waveOffset) * this.waveAmplitude;

    if (this.frameCount % 15 === 0) {
      this.wingFrame = (this.wingFrame + 1) % 2;
    }
  }
}

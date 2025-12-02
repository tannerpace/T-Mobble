import type { InputCallbacks } from '../types';

/**
 * Input handler - manages keyboard and touch controls
 */
export class InputHandler implements InputCallbacks {
  private canvas: HTMLCanvasElement;
  private jumpBtn: HTMLElement;

  public onJump: (() => void) | null;
  public onJumpRelease: (() => void) | null;
  public onStartGame: (() => void) | null;
  public onRestartGame: (() => void) | null;

  private jumpKeyPressed: boolean;

  constructor(canvas: HTMLCanvasElement, jumpBtn: HTMLElement) {
    this.canvas = canvas;
    this.jumpBtn = jumpBtn;

    this.onJump = null;
    this.onJumpRelease = null;
    this.onStartGame = null;
    this.onRestartGame = null;

    this.jumpKeyPressed = false;

    this.setupKeyboardControls();
    this.setupTouchControls();
    this.setupButtonControls();
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboardControls(): void {
    document.addEventListener('keydown', (e: KeyboardEvent): void => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!this.jumpKeyPressed) {
          this.jumpKeyPressed = true;
          if (this.onJump) this.onJump();
        }
      }
    });

    document.addEventListener('keyup', (e: KeyboardEvent): void => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.jumpKeyPressed = false;
        if (this.onJumpRelease) this.onJumpRelease();
      }
    });
  }

  /**
   * Setup touch/click controls for canvas
   */
  private setupTouchControls(): void {
    this.canvas.addEventListener('click', (): void => {
      if (this.onJump) this.onJump();
    });
  }

  /**
   * Setup mobile button controls
   */
  private setupButtonControls(): void {
    const handleJump = (e: Event): void => {
      e.preventDefault();
      if (this.onJump) this.onJump();
    };

    const handleJumpRelease = (e: Event): void => {
      e.preventDefault();
      if (this.onJumpRelease) this.onJumpRelease();
    };

    // Jump button
    this.jumpBtn.addEventListener('touchstart', handleJump, { passive: false });
    this.jumpBtn.addEventListener('mousedown', handleJump);
    this.jumpBtn.addEventListener('touchend', handleJumpRelease, { passive: false });
    this.jumpBtn.addEventListener('mouseup', handleJumpRelease);
  }
}

/**
 * Input handler - manages keyboard and touch controls
 */
export class InputHandler {
  constructor(canvas, jumpBtn) {
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
  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!this.jumpKeyPressed) {
          this.jumpKeyPressed = true;
          if (this.onJump) this.onJump();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
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
  setupTouchControls() {
    this.canvas.addEventListener('click', () => {
      if (this.onJump) this.onJump();
    });
  }

  /**
   * Setup mobile button controls
   */
  setupButtonControls() {
    const handleJump = (e) => {
      e.preventDefault();
      if (this.onJump) this.onJump();
    };

    const handleJumpRelease = (e) => {
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

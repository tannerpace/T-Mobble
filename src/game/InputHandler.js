/**
 * Input handler - manages keyboard and touch controls
 */
export class InputHandler {
  constructor(canvas, jumpBtn, shootBtn) {
    this.canvas = canvas;
    this.jumpBtn = jumpBtn;
    this.shootBtn = shootBtn;

    this.onJump = null;
    this.onShoot = null;
    this.onStartGame = null;
    this.onRestartGame = null;

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
        if (this.onJump) this.onJump();
      }

      if (e.code === 'KeyZ') {
        e.preventDefault();
        if (this.onShoot) this.onShoot();
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

    const handleShoot = (e) => {
      e.preventDefault();
      if (this.onShoot) this.onShoot();
    };

    this.jumpBtn.addEventListener('touchstart', handleJump);
    this.jumpBtn.addEventListener('click', handleJump);

    this.shootBtn.addEventListener('touchstart', handleShoot);
    this.shootBtn.addEventListener('click', handleShoot);
  }
}

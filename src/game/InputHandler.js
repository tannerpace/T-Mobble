/**
 * Input handler - manages keyboard, touch, and gamepad controls
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

    // Gamepad state tracking
    this.gamepadConnected = false;
    this.gamepadJumpPressed = false;

    this.setupKeyboardControls();
    this.setupTouchControls();
    this.setupButtonControls();
    this.setupGamepadControls();
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

  /**
   * Setup gamepad event listeners for controller support
   */
  setupGamepadControls() {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadConnected = true;
      console.log('Gamepad connected:', e.gamepad.id);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      this.gamepadConnected = false;
      this.gamepadJumpPressed = false;
      console.log('Gamepad disconnected:', e.gamepad.id);
    });
  }

  /**
   * Poll gamepad state - should be called each frame in the game loop
   * Standard mapping: A button (index 0) for jump
   */
  pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    for (const gamepad of gamepads) {
      if (!gamepad) continue;

      // A button (index 0) or X button (index 2) for jump - standard controller mapping
      const jumpButtonPressed = gamepad.buttons[0]?.pressed || gamepad.buttons[2]?.pressed;

      if (jumpButtonPressed && !this.gamepadJumpPressed) {
        this.gamepadJumpPressed = true;
        if (this.onJump) this.onJump();
      } else if (!jumpButtonPressed && this.gamepadJumpPressed) {
        this.gamepadJumpPressed = false;
        if (this.onJumpRelease) this.onJumpRelease();
      }

      // Only process first connected gamepad
      break;
    }
  }
}

/**
 * Renderer - handles all game drawing operations
 */
export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }

  /**
   * Apply screen shake effect
   * @param {number} intensity - Shake intensity in pixels
   * @param {number} duration - Duration in frames
   */
  screenShake(intensity = 5, duration = 10) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  /**
   * Clear the entire canvas
   */
  clear() {
    // Apply shake offset
    let offsetX = 0;
    let offsetY = 0;

    if (this.shakeDuration > 0) {
      offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeDuration--;

      // Reduce intensity over time
      if (this.shakeDuration % 2 === 0 && this.shakeIntensity > 0) {
        this.shakeIntensity *= 0.8;
      }
    }

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.clearRect(-offsetX, -offsetY, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Draw the ground line
   */
  drawGround(frameCount, gameSpeed) {
    // Ground line at 80% of canvas height (dynamic)
    const groundY = this.canvas.height * 0.8;

    this.ctx.strokeStyle = '#535353';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundY);
    this.ctx.lineTo(this.canvas.width, groundY);
    this.ctx.stroke();

    // Dashed ground pattern
    this.ctx.setLineDash([10, 10]);
    const offset = (frameCount * gameSpeed) % 20;
    this.ctx.beginPath();
    this.ctx.moveTo(-offset, groundY + 2);
    this.ctx.lineTo(this.canvas.width, groundY + 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Draw power-up counter in top-left corner
   */
  drawPowerUpCounter(powerUpCount) {
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 16px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('⚡ x ' + powerUpCount, 20, 30);
  }

  /**
   * Draw game over screen
   */
  drawGameOver() {
    this.ctx.fillStyle = '#535353';
    this.ctx.font = 'bold 30px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

    this.ctx.font = '16px Courier New';
    this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  /**
   * Draw start screen
   */
  drawStartScreen() {
    this.ctx.fillStyle = '#535353';
    this.ctx.font = '20px Courier New';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Press SPACE to Start', this.canvas.width / 2, this.canvas.height / 2);
  }

  /**
   * Draw active upgrade status indicators (retro pixel style)
   * @param {Object} upgradeSystem - Upgrade system to get active upgrades
   */
  drawUpgradeStatus(upgradeSystem) {
    const passives = upgradeSystem.passiveUpgrades;
    const weapons = upgradeSystem.unlockedWeapons;
    const weaponLevels = upgradeSystem.weaponLevels;
    const ultimate = upgradeSystem.ultimateSlot;

    let yPos = 60; // Start below coin counter
    const xPos = 20;
    const lineHeight = 24;

    this.ctx.font = 'bold 14px Courier New';
    this.ctx.textAlign = 'left';

    // Helper function to draw upgrade with level
    const drawUpgrade = (icon, name, level, color = '#FFD700') => {
      // Icon
      this.ctx.fillStyle = color;
      this.ctx.fillText(icon, xPos, yPos);

      // Name and level with retro box style
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(xPos + 20, yPos - 12, 80, 16);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(xPos + 20, yPos - 12, 80, 16);

      this.ctx.fillStyle = color;
      this.ctx.fillText(`${name} Lv${level}`, xPos + 24, yPos);

      yPos += lineHeight;
    };

    // Draw passive upgrades
    if (passives.size > 0) {
      passives.forEach((level, id) => {
        switch (id) {
          case 'extra_heart':
            drawUpgrade('❤️', 'HP', level, '#FF4444');
            break;
          case 'tough_skin':
            drawUpgrade('🛡️', 'Shield', level, '#4444FF');
            break;
          case 'evasion':
            drawUpgrade('💨', 'Dodge', level, '#AAFFAA');
            break;
          case 'speed_boost':
            drawUpgrade('⚡', 'Speed', level, '#FFFF44');
            break;
          case 'magnet':
            drawUpgrade('🧲', 'Magnet', level, '#FF44FF');
            break;
        }
      });
    }

    // Draw weapons with levels
    if (weapons.size > 0) {
      weapons.forEach(weaponId => {
        const level = weaponLevels.get(weaponId) || 1;
        switch (weaponId) {
          case 'blaster':
            drawUpgrade('🔫', 'Blaster', level, '#00FFFF');
            break;
          case 'whip':
            drawUpgrade('🪢', 'Whip', level, '#FF8800');
            break;
          case 'laser':
            drawUpgrade('⚡', 'Laser', level, '#FF00FF');
            break;
        }
      });
    }

    // Draw ultimate if unlocked
    if (ultimate) {
      let icon, name;
      switch (ultimate) {
        case 'glass_cannon':
          icon = '💥'; name = 'Glass'; break;
        case 'tank_mode_ultimate':
          icon = '🛡️'; name = 'Tank'; break;
        case 'berserker':
          icon = '⚔️'; name = 'Berserk'; break;
      }
      if (icon) {
        drawUpgrade(icon, name, 'MAX', '#FFD700');
      }
    }
  }
}

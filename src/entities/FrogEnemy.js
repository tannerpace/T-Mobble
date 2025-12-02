/**
 * FrogEnemy - Weak hopping enemy that fills gap between Flying and Medium enemies
 * Features a hopping movement pattern and ground-based positioning
 */
import { BaseEnemy } from './BaseEnemy.js';

export class FrogEnemy extends BaseEnemy {
  constructor(canvas, gameSpeed) {
    super(canvas, gameSpeed, {
      width: 35,
      height: 35,
      health: 2,
      xpValue: 7,
      speedMultiplier: 0.85, // Between flying (0.9-1.3) and medium (0.8)
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

  draw(ctx) {
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

  update() {
    super.update();

    // Hopping motion - parabolic arc
    this.hopProgress = (this.hopProgress + 1) % (this.hopDuration * 2);
    
    // Calculate hop offset using sine wave for smooth hopping
    // When hopProgress is 0 to hopDuration, frog is in the air
    // When hopProgress is hopDuration to hopDuration*2, frog is on ground
    const hopCycle = this.hopProgress / this.hopDuration;
    
    if (hopCycle < 1) {
      // Hopping up and down (parabolic motion)
      const hopOffset = Math.sin(hopCycle * Math.PI) * this.hopHeight;
      this.y = this.groundY - hopOffset;
    } else {
      // On the ground between hops
      this.y = this.groundY;
    }
  }
}

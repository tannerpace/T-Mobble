// Particle system for pixel-style explosion effects
// Inspired by hyper-wow terminal plugin

// Constants for particle simulation
const MAX_PARTICLES = 500;
const PARTICLE_NUM_RANGE = () => 5 + Math.round(Math.random() * 5);
const PARTICLE_GRAVITY = 0.075;
const PARTICLE_ALPHA_FADEOUT = 0.96;
const PARTICLE_VELOCITY_RANGE = {
  x: [-2, 2],
  y: [-4, -1.5]
};
const PARTICLE_ALPHA_MIN_THRESHOLD = 0.1;

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Spawn particles at a location with specified colors
  spawnParticles(x, y, colors, count = null) {
    const numParticles = count || PARTICLE_NUM_RANGE();

    for (let i = 0; i < numParticles; i++) {
      const color = colors[i % colors.length];
      this.particles.push(this.createParticle(x, y, color));
    }
  }

  // Create a single particle
  createParticle(x, y, color) {
    return {
      x,
      y,
      alpha: 1,
      color, // [r, g, b]
      velocity: {
        x: PARTICLE_VELOCITY_RANGE.x[0] + Math.random() *
          (PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]),
        y: PARTICLE_VELOCITY_RANGE.y[0] + Math.random() *
          (PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0])
      }
    };
  }

  // Update all particles
  update() {
    this.particles.forEach((particle) => {
      particle.velocity.y += PARTICLE_GRAVITY;
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.alpha *= PARTICLE_ALPHA_FADEOUT;
    });

    // Remove dead particles and limit total count
    this.particles = this.particles
      .slice(Math.max(this.particles.length - MAX_PARTICLES, 0))
      .filter((particle) => particle.alpha > PARTICLE_ALPHA_MIN_THRESHOLD);
  }

  // Draw all particles
  draw(ctx) {
    this.particles.forEach((particle) => {
      if (particle.alpha > PARTICLE_ALPHA_MIN_THRESHOLD) {
        ctx.fillStyle = `rgba(${particle.color.join(',')}, ${particle.alpha})`;
        // Draw as 3x3 pixel square for retro look
        ctx.fillRect(Math.round(particle.x - 1.5), Math.round(particle.y - 1.5), 3, 3);
      }
    });
  }

  // Preset color schemes
  static COLORS = {
    // Enemy hit - red/orange
    ENEMY_HIT: [
      [255, 100, 100], // red
      [255, 150, 50],  // orange
      [255, 200, 100]  // yellow-orange
    ],
    // Enemy death - dark red/black
    ENEMY_DEATH: [
      [200, 50, 50],   // dark red
      [150, 30, 30],   // darker red
      [100, 20, 20],   // almost black-red
      [80, 80, 80]     // gray
    ],
    // Player damage - bright red/white
    PLAYER_DAMAGE: [
      [255, 50, 50],   // bright red
      [255, 100, 100], // lighter red
      [255, 255, 255], // white
      [255, 200, 200]  // pink
    ],
    // Coin collect - gold
    COIN_COLLECT: [
      [255, 215, 0],   // gold
      [255, 255, 100], // yellow
      [255, 200, 50]   // orange-gold
    ],
    // XP gem - cyan/blue
    XP_COLLECT: [
      [0, 255, 255],   // cyan
      [100, 200, 255], // light blue
      [50, 150, 255]   // blue
    ]
  };
}

// Screen shake utility
export class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
  }

  // Trigger a screen shake
  shake(intensity = 5, duration = 200) {
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
  }

  // Get current shake offset
  getOffset() {
    if (this.duration <= 0) {
      return { x: 0, y: 0 };
    }

    const x = this.intensity * (Math.random() > 0.5 ? -1 : 1);
    const y = this.intensity * (Math.random() > 0.5 ? -1 : 1);

    return { x, y };
  }

  // Update shake (call each frame)
  update(deltaTime = 16) {
    if (this.duration > 0) {
      this.duration -= deltaTime;
      // Fade out intensity
      this.intensity *= 0.9;
    } else {
      this.intensity = 0;
    }
  }
}

/**
 * Particle system for satisfying explosion effects
 * Enhanced with varied sizes, trails, bursts, and sparkles
 */

import type { Position, RGBColor } from '../types';

// Constants for particle simulation
const MAX_PARTICLES = 800;
const PARTICLE_GRAVITY = 0.08;
const PARTICLE_ALPHA_FADEOUT = 0.94;
const PARTICLE_ALPHA_MIN_THRESHOLD = 0.05;

// Particle types for varied effects
const PARTICLE_TYPES = {
  NORMAL: 'normal',
  SPARKLE: 'sparkle',
  TRAIL: 'trail',
  RING: 'ring',
  STAR: 'star'
} as const;

type ParticleType = typeof PARTICLE_TYPES[keyof typeof PARTICLE_TYPES];

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  alpha: number;
  color: RGBColor;
  size: number;
  type: ParticleType;
  velocity: { x: number; y: number };
  rotation?: number;
  rotationSpeed?: number;
  twinklePhase?: number;
  drag?: number;
  expandRate?: number;
  trail?: TrailPoint[];
  isConfetti?: boolean;
}

interface FlashEffect {
  alpha: number;
  color: RGBColor;
}

interface TextPopup {
  x: number;
  y: number;
  text: string;
  color: RGBColor;
  size: number;
  alpha: number;
  velocity: number;
  scale: number;
}

export class ParticleSystem {
  private particles: Particle[];
  private flashEffects: FlashEffect[];
  private textPopups: TextPopup[];
  private comboCount: number;
  private comboTimer: number;
  private lastKillTime: number;

  constructor() {
    this.particles = [];
    this.flashEffects = [];
    this.textPopups = [];
    this.comboCount = 0;
    this.comboTimer = 0;
    this.lastKillTime = 0;
  }

  /**
   * Spawn a satisfying burst of particles
   */
  spawnParticles(x: number, y: number, colors: RGBColor[], count: number = 12): void {
    // Base particles - varied sizes
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;

      this.particles.push({
        x,
        y,
        alpha: 1,
        color,
        size: 2 + Math.random() * 4,
        type: PARTICLE_TYPES.NORMAL,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed - 2
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3
      });
    }

    // Add sparkles on top
    for (let i = 0; i < Math.floor(count / 3); i++) {
      const color: RGBColor = [255, 255, 255];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        alpha: 1,
        color,
        size: 1 + Math.random() * 2,
        type: PARTICLE_TYPES.SPARKLE,
        velocity: {
          x: (Math.random() - 0.5) * 3,
          y: -2 - Math.random() * 3
        },
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Spawn an explosive radial burst (for kills)
   */
  spawnExplosion(x: number, y: number, colors: RGBColor[], intensity: number = 1): void {
    const baseCount = Math.floor(20 * intensity);

    // Ring of particles expanding outward
    for (let i = 0; i < baseCount; i++) {
      const angle = (Math.PI * 2 * i) / baseCount;
      const speed = 4 + Math.random() * 6 * intensity;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        alpha: 1,
        color,
        size: 3 + Math.random() * 5 * intensity,
        type: PARTICLE_TYPES.NORMAL,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        drag: 0.96
      });
    }

    // Central bright flash particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        alpha: 1,
        color: [255, 255, 255],
        size: 8 + Math.random() * 8 * intensity,
        type: PARTICLE_TYPES.RING,
        velocity: { x: 0, y: 0 },
        expandRate: 3 + Math.random() * 2
      });
    }

    // Shooting stars flying out
    for (let i = 0; i < 6 * intensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 8;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        alpha: 1,
        color,
        size: 2 + Math.random() * 3,
        type: PARTICLE_TYPES.STAR,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        trail: []
      });
    }

    // Add screen flash
    this.flashEffects.push({
      alpha: 0.3 * intensity,
      color: colors[0]
    });
  }

  /**
   * Spawn confetti burst (for level ups, achievements)
   */
  spawnConfetti(x: number, y: number, count: number = 30): void {
    const confettiColors: RGBColor[] = [
      [255, 215, 0],
      [255, 105, 180],
      [0, 255, 255],
      [255, 100, 100],
      [100, 255, 100],
      [255, 255, 100],
      [200, 100, 255]
    ];

    for (let i = 0; i < count; i++) {
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 5 + Math.random() * 8;

      this.particles.push({
        x,
        y,
        alpha: 1,
        color,
        size: 4 + Math.random() * 6,
        type: PARTICLE_TYPES.NORMAL,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        isConfetti: true
      });
    }

    // Big central flash
    this.flashEffects.push({
      alpha: 0.4,
      color: [255, 255, 200]
    });
  }

  /**
   * Spawn floating text popup
   */
  spawnTextPopup(x: number, y: number, text: string, color: RGBColor = [255, 255, 255], size: number = 16): void {
    this.textPopups.push({
      x,
      y,
      text,
      color,
      size,
      alpha: 1,
      velocity: -3,
      scale: 1.5
    });
  }

  /**
   * Track combo kills for multiplied effects
   */
  registerKill(): number {
    const now = Date.now();
    if (now - this.lastKillTime < 1000) {
      this.comboCount++;
      this.comboTimer = 60;
    } else {
      this.comboCount = 1;
    }
    this.lastKillTime = now;
    return this.comboCount;
  }

  /**
   * Get combo multiplier for effects
   */
  getComboMultiplier(): number {
    return Math.min(1 + (this.comboCount - 1) * 0.3, 3);
  }

  /**
   * Update all particles
   */
  update(): void {
    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Update particles
    this.particles.forEach((particle) => {
      if (particle.drag) {
        particle.velocity.x *= particle.drag;
        particle.velocity.y *= particle.drag;
      }

      const gravity = particle.isConfetti ? PARTICLE_GRAVITY * 0.5 : PARTICLE_GRAVITY;
      particle.velocity.y += gravity;

      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.alpha *= PARTICLE_ALPHA_FADEOUT;

      if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
        particle.rotation += particle.rotationSpeed;
      }

      if (particle.twinklePhase !== undefined) {
        particle.twinklePhase += 0.3;
      }

      if (particle.type === PARTICLE_TYPES.RING && particle.expandRate) {
        particle.size += particle.expandRate;
        particle.alpha *= 0.85;
      }

      if (particle.type === PARTICLE_TYPES.STAR && particle.trail) {
        particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha });
        if (particle.trail.length > 8) {
          particle.trail.shift();
        }
      }
    });

    // Update flash effects
    this.flashEffects = this.flashEffects.filter(flash => {
      flash.alpha *= 0.8;
      return flash.alpha > 0.01;
    });

    // Update text popups
    this.textPopups.forEach(popup => {
      popup.y += popup.velocity;
      popup.velocity += 0.1;
      popup.alpha *= 0.96;
      popup.scale = Math.max(1, popup.scale * 0.95);
    });
    this.textPopups = this.textPopups.filter(popup => popup.alpha > 0.05);

    // Remove dead particles and limit total count
    this.particles = this.particles
      .slice(Math.max(this.particles.length - MAX_PARTICLES, 0))
      .filter((particle) => particle.alpha > PARTICLE_ALPHA_MIN_THRESHOLD);
  }

  /**
   * Draw all particles
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw screen flashes first (background)
    this.flashEffects.forEach(flash => {
      ctx.save();
      ctx.globalAlpha = flash.alpha;
      ctx.fillStyle = `rgb(${flash.color.join(',')})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    });

    // Draw particles
    this.particles.forEach((particle) => {
      if (particle.alpha <= PARTICLE_ALPHA_MIN_THRESHOLD) return;

      ctx.save();
      ctx.globalAlpha = particle.alpha;

      // Draw star trails
      if (particle.type === PARTICLE_TYPES.STAR && particle.trail) {
        particle.trail.forEach((point, i) => {
          const trailAlpha = (i / particle.trail!.length) * particle.alpha * 0.5;
          const trailSize = particle.size * (i / particle.trail!.length);
          ctx.globalAlpha = trailAlpha;
          ctx.fillStyle = `rgb(${particle.color.join(',')})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = particle.alpha;
      }

      if (particle.type === PARTICLE_TYPES.SPARKLE) {
        const twinkle = Math.sin(particle.twinklePhase!) * 0.5 + 0.5;
        ctx.globalAlpha = particle.alpha * twinkle;
        ctx.fillStyle = `rgb(${particle.color.join(',')})`;

        const s = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y - s * 2);
        ctx.lineTo(particle.x + s * 0.5, particle.y);
        ctx.lineTo(particle.x, particle.y + s * 2);
        ctx.lineTo(particle.x - s * 0.5, particle.y);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(particle.x - s * 2, particle.y);
        ctx.lineTo(particle.x, particle.y + s * 0.5);
        ctx.lineTo(particle.x + s * 2, particle.y);
        ctx.lineTo(particle.x, particle.y - s * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (particle.type === PARTICLE_TYPES.RING) {
        ctx.strokeStyle = `rgba(${particle.color.join(',')}, ${particle.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgb(${particle.color.join(',')})`;

        if (particle.rotation !== undefined) {
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);

          if (particle.isConfetti) {
            ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
          } else {
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          }
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });

    // Draw text popups
    this.textPopups.forEach(popup => {
      ctx.save();
      ctx.globalAlpha = popup.alpha;
      ctx.font = `bold ${Math.floor(popup.size * popup.scale)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(popup.text, popup.x, popup.y);

      ctx.fillStyle = `rgb(${popup.color.join(',')})`;
      ctx.fillText(popup.text, popup.x, popup.y);

      ctx.restore();
    });

    // Draw combo indicator
    if (this.comboCount > 1 && this.comboTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.comboTimer / 30);
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'right';
      ctx.fillStyle = this.comboCount >= 5 ? '#FFD700' : this.comboCount >= 3 ? '#FF6600' : '#FFFFFF';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      const comboText = `${this.comboCount}x COMBO!`;
      ctx.strokeText(comboText, ctx.canvas.width - 20, 100);
      ctx.fillText(comboText, ctx.canvas.width - 20, 100);
      ctx.restore();
    }
  }

  // Preset color schemes
  static COLORS: Record<string, RGBColor[]> = {
    ENEMY_HIT: [
      [255, 120, 50],
      [255, 180, 80],
      [255, 255, 150],
      [255, 80, 80]
    ],
    ENEMY_DEATH: [
      [255, 80, 30],
      [255, 150, 50],
      [255, 200, 100],
      [255, 50, 50],
      [255, 255, 200]
    ],
    PLAYER_DAMAGE: [
      [255, 30, 30],
      [255, 80, 80],
      [255, 255, 255],
      [255, 150, 150]
    ],
    COIN_COLLECT: [
      [255, 215, 0],
      [255, 240, 100],
      [255, 180, 50],
      [255, 255, 200]
    ],
    XP_COLLECT: [
      [0, 255, 255],
      [100, 200, 255],
      [150, 100, 255],
      [200, 255, 255]
    ],
    LEVEL_UP: [
      [255, 215, 0],
      [255, 105, 180],
      [147, 112, 219],
      [0, 255, 200],
      [255, 255, 100],
      [255, 100, 100],
      [100, 255, 100]
    ],
    GHOST_DEATH: [
      [180, 100, 255],
      [220, 150, 255],
      [255, 200, 255],
      [100, 50, 150]
    ],
    CRITICAL: [
      [255, 255, 255],
      [255, 255, 100],
      [255, 200, 50],
      [255, 150, 150]
    ]
  };
}

/**
 * Screen shake utility
 */
export class ScreenShake {
  private intensity: number;
  private duration: number;

  constructor() {
    this.intensity = 0;
    this.duration = 0;
  }

  /**
   * Trigger a screen shake
   */
  shake(intensity: number = 5, duration: number = 200): void {
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
  }

  /**
   * Get current shake offset
   */
  getOffset(): Position {
    if (this.duration <= 0) {
      return { x: 0, y: 0 };
    }

    const x = this.intensity * (Math.random() > 0.5 ? -1 : 1);
    const y = this.intensity * (Math.random() > 0.5 ? -1 : 1);

    return { x, y };
  }

  /**
   * Update shake (call each frame)
   */
  update(deltaTime: number = 16): void {
    if (this.duration > 0) {
      this.duration -= deltaTime;
      this.intensity *= 0.9;
    } else {
      this.intensity = 0;
    }
  }
}

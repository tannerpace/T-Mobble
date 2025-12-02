/**
 * SynergySystem - Manages upgrade synergies and weapon evolutions
 */
export class SynergySystem {
  constructor() {
    this.unlockedSynergies = new Set();
    this.synergyDefinitions = this.initializeSynergies();
  }

  /**
   * Initialize all synergy definitions
   */
  initializeSynergies() {
    return {
      // DAMAGE SYNERGIES
      ricochet_rounds: {
        id: 'ricochet_rounds',
        name: 'Ricochet Rounds',
        icon: '🎯',
        description: 'Bullets bounce between enemies',
        requirements: [
          { upgrade: 'blaster', level: 4 },
          { upgrade: 'magnet', level: 2 }
        ],
        effect: {
          bulletBounce: true,
          maxBounces: 3,
          bounceRange: 150
        }
      },
      explosive_rounds: {
        id: 'explosive_rounds',
        name: 'Explosive Rounds',
        icon: '💥',
        description: 'Bullets explode in whip-sized AoE',
        requirements: [
          { upgrade: 'blaster', level: 5 },
          { upgrade: 'whip', level: 3 }
        ],
        effect: {
          bulletExplosion: true,
          explosionRadius: 70,
          explosionDamage: 2
        }
      },
      laser_storm: {
        id: 'laser_storm',
        name: 'Laser Storm',
        icon: '⚡',
        description: 'Fire 3 mini-lasers in spread pattern',
        requirements: [
          { upgrade: 'laser', level: 4 },
          { upgrade: 'blaster', level: 4 }
        ],
        effect: {
          multiLaser: true,
          laserCount: 3,
          spreadAngle: 30
        }
      },
      chain_reaction: {
        id: 'chain_reaction',
        name: 'Chain Reaction',
        icon: '⚡',
        description: 'Enemies hit by whip emit laser beams',
        requirements: [
          { upgrade: 'whip', level: 5 },
          { upgrade: 'laser', level: 3 }
        ],
        effect: {
          whipLaserChain: true,
          chainDamage: 1,
          chainLength: 200
        }
      },

      // DEFENSE SYNERGIES
      last_stand: {
        id: 'last_stand',
        name: 'Last Stand',
        icon: '🛡️',
        description: 'Become invuln for 3s when reaching 1 HP (once per run)',
        requirements: [
          { upgrade: 'extra_heart', level: 2 },
          { upgrade: 'tough_skin', level: 3 }
        ],
        effect: {
          lastStand: true,
          duration: 180,
          usesPerRun: 1
        }
      },
      adrenaline: {
        id: 'adrenaline',
        name: 'Adrenaline Rush',
        icon: '💨',
        description: '+50% speed for 5s after taking damage',
        requirements: [
          { upgrade: 'evasion', level: 2 },
          { upgrade: 'speed_boost', level: 2 }
        ],
        effect: {
          adrenalineBoost: true,
          speedBonus: 0.5,
          duration: 300
        }
      },

      // UTILITY SYNERGIES
      lucky_charm: {
        id: 'lucky_charm',
        name: 'Lucky Charm',
        icon: '🍀',
        description: 'Coins auto-collect from entire screen',
        requirements: [
          { upgrade: 'magnet', level: 3 },
          { upgrade: 'speed_boost', level: 2 }
        ],
        effect: {
          coinAutoCollect: true,
          collectRadius: 9999
        }
      },
      xp_burst: {
        id: 'xp_burst',
        name: 'XP Burst',
        icon: '💎',
        description: 'Elite enemies drop XP explosion (5x normal)',
        requirements: [
          { upgrade: 'magnet', level: 2 },
          { upgrade: 'any_weapon', level: 4 }
        ],
        effect: {
          eliteXPBonus: 5.0
        }
      }
    };
  }

  /**
   * Check if player meets requirements for a synergy
   */
  checkSynergyRequirements(synergyId, playerUpgrades) {
    const synergy = this.synergyDefinitions[synergyId];
    if (!synergy) return false;

    return synergy.requirements.every(req => {
      if (req.upgrade === 'any_weapon') {
        // Check if any weapon is at required level
        return Array.from(playerUpgrades.keys()).some(key => {
          if (['blaster', 'whip', 'laser'].includes(key)) {
            return (playerUpgrades.get(key) || 0) >= req.level;
          }
          return false;
        });
      }
      return (playerUpgrades.get(req.upgrade) || 0) >= req.level;
    });
  }

  /**
   * Get partial synergy hints (when player has 1/2 requirements)
   */
  getSynergyHints(playerUpgrades) {
    const hints = [];

    for (const [synergyId, synergy] of Object.entries(this.synergyDefinitions)) {
      if (this.unlockedSynergies.has(synergyId)) continue;

      const metRequirements = synergy.requirements.filter(req =>
        (playerUpgrades.get(req.upgrade) || 0) >= req.level
      );

      if (metRequirements.length > 0 && metRequirements.length < synergy.requirements.length) {
        const remaining = synergy.requirements.filter(req =>
          (playerUpgrades.get(req.upgrade) || 0) < req.level
        );

        hints.push({
          synergyId,
          name: synergy.name,
          icon: synergy.icon,
          remaining: remaining[0],
          progress: `${metRequirements.length}/${synergy.requirements.length}`
        });
      }
    }

    return hints;
  }

  /**
   * Unlock a synergy and return its effects
   */
  unlockSynergy(synergyId) {
    if (!this.synergyDefinitions[synergyId]) return null;
    this.unlockedSynergies.add(synergyId);
    return this.synergyDefinitions[synergyId];
  }

  /**
   * Get all active synergy effects
   */
  getActiveEffects() {
    const effects = {};

    for (const synergyId of this.unlockedSynergies) {
      const synergy = this.synergyDefinitions[synergyId];
      if (synergy) {
        Object.assign(effects, synergy.effect);
      }
    }

    return effects;
  }

  /**
   * Check for newly unlocked synergies
   */
  checkForNewSynergies(playerUpgrades) {
    const newlyUnlocked = [];

    for (const synergyId of Object.keys(this.synergyDefinitions)) {
      if (this.unlockedSynergies.has(synergyId)) continue;

      if (this.checkSynergyRequirements(synergyId, playerUpgrades)) {
        const synergy = this.unlockSynergy(synergyId);
        newlyUnlocked.push(synergy);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Reset synergies (for new run)
   */
  reset() {
    this.unlockedSynergies.clear();
  }
}

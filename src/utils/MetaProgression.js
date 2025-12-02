/**
 * MetaProgression - Manages between-run progression and permanent upgrades
 */
export class MetaProgression {
  constructor() {
    this.totalCoinsEarned = 0;
    this.totalRuns = 0;
    this.totalWins = 0;
    this.highestLevel = 0;
    this.totalDeaths = 0;
    this.synergiesDiscovered = new Set();
    this.upgrades = new Map();
    this.bankedXP = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;

    this.upgradeDefinitions = this.initializeMetaUpgrades();
    this.deathMilestones = this.initializeDeathMilestones();

    this.load();
  }

  /**
   * Initialize meta upgrade definitions
   */
  initializeMetaUpgrades() {
    return {
      // TIER 1: Early unlock helpers
      starting_boost: {
        id: 'starting_boost',
        name: 'Head Start',
        cost: 50,
        effect: 'Start each run at level 2',
        maxPurchases: 1,
        tier: 1
      },
      coin_magnet: {
        id: 'coin_magnet',
        name: 'Coin Attraction',
        cost: 75,
        effect: '+50% coin pickup radius',
        maxPurchases: 3,
        tier: 1,
        diminishing: true
      },
      health_boost: {
        id: 'health_boost',
        name: 'Vitality',
        cost: 100,
        effect: 'Start with +1 max HP',
        maxPurchases: 2,
        tier: 1
      },

      // TIER 2: XP and progression
      xp_boost: {
        id: 'xp_boost',
        name: 'Fast Learner',
        cost: 200,
        effect: '+10% XP from all sources',
        maxPurchases: 5,
        tier: 2,
        diminishing: true
      },
      reroll_tokens: {
        id: 'reroll_tokens',
        name: 'Reroll Reserve',
        cost: 150,
        effect: 'Start with 1 free reroll token',
        maxPurchases: 3,
        tier: 2
      },
      weapon_mastery: {
        id: 'weapon_mastery',
        name: 'Weapon Expertise',
        cost: 300,
        effect: 'All weapons start at level 2',
        maxPurchases: 1,
        tier: 2,
        requires: 'Complete 5 runs'
      },

      // TIER 3: Advanced
      synergy_finder: {
        id: 'synergy_finder',
        name: 'Synergy Seeker',
        cost: 500,
        effect: 'Synergy components appear 50% more often',
        maxPurchases: 1,
        tier: 3,
        requires: 'Unlock 3 synergies'
      },
      evolution_unlock: {
        id: 'evolution_unlock',
        name: 'Master Evolutionist',
        cost: 800,
        effect: 'Can have 3 evolutions per run (up from 2)',
        maxPurchases: 1,
        tier: 3,
        requires: 'Reach level 20'
      },
      final_stand: {
        id: 'final_stand',
        name: 'Phoenix Heart',
        cost: 1000,
        effect: 'Revive once per run with full HP',
        maxPurchases: 1,
        tier: 3,
        requires: 'Die 20 times'
      }
    };
  }

  /**
   * Initialize death milestone rewards
   */
  initializeDeathMilestones() {
    return [
      { deaths: 1, reward: 'Achievement: First Blood', coins: 10 },
      { deaths: 5, reward: 'Unlock: Tank Mode modifier', coins: 25 },
      { deaths: 10, reward: 'Unlock: Health Boost meta upgrade', coins: 50 },
      { deaths: 25, reward: '+5% permanent coin drop rate', coins: 100 },
      { deaths: 50, reward: 'Unlock: Glass Cannon modifier', coins: 200 },
      { deaths: 100, reward: 'Unlock: Phoenix Heart meta upgrade', coins: 500 }
    ];
  }

  /**
   * Check if player can purchase an upgrade
   */
  canPurchase(upgradeId) {
    const upgrade = this.upgradeDefinitions[upgradeId];
    if (!upgrade) return { allowed: false, reason: 'Upgrade not found' };

    const current = this.upgrades.get(upgradeId) || 0;

    // Check max purchases
    if (current >= upgrade.maxPurchases) {
      return { allowed: false, reason: 'Max purchases reached' };
    }

    // Check requirements
    if (upgrade.requires && !this.checkRequirement(upgrade.requires)) {
      return { allowed: false, reason: upgrade.requires };
    }

    // Check cost
    if (this.totalCoinsEarned < upgrade.cost) {
      return { allowed: false, reason: `Need ${upgrade.cost} coins` };
    }

    return { allowed: true };
  }

  /**
   * Purchase a meta upgrade
   */
  purchase(upgradeId) {
    const check = this.canPurchase(upgradeId);
    if (!check.allowed) return false;

    const upgrade = this.upgradeDefinitions[upgradeId];
    const current = this.upgrades.get(upgradeId) || 0;

    this.totalCoinsEarned -= upgrade.cost;
    this.upgrades.set(upgradeId, current + 1);

    this.save();
    return true;
  }

  /**
   * Check if requirement is met
   */
  checkRequirement(reqString) {
    if (reqString.includes('Complete')) {
      const runs = parseInt(reqString.match(/\d+/)[0]);
      return this.totalRuns >= runs;
    }
    if (reqString.includes('Unlock')) {
      const count = parseInt(reqString.match(/\d+/)[0]);
      return this.synergiesDiscovered.size >= count;
    }
    if (reqString.includes('Reach level')) {
      const level = parseInt(reqString.match(/\d+/)[0]);
      return this.highestLevel >= level;
    }
    if (reqString.includes('Die')) {
      const deaths = parseInt(reqString.match(/\d+/)[0]);
      return this.totalDeaths >= deaths;
    }
    return false;
  }

  /**
   * Calculate diminishing returns for an upgrade
   */
  calculateDiminishingBonus(upgradeId, baseValue = 10) {
    const purchaseCount = this.upgrades.get(upgradeId) || 0;
    const diminishingFactor = 0.8;

    let totalBonus = 0;
    for (let i = 0; i < purchaseCount; i++) {
      totalBonus += baseValue * Math.pow(diminishingFactor, i);
    }

    return totalBonus;
  }

  /**
   * Get active meta upgrade effects for a run
   */
  getActiveEffects() {
    const effects = {
      startingLevel: 1,
      startingHP: 0,
      coinRadiusBonus: 0,
      xpMultiplier: 1.0,
      rerollTokens: 0,
      weaponStartLevel: 1,
      synergyBonus: 1.0,
      maxEvolutions: 2,
      hasRevive: false
    };

    // Starting boost
    if (this.upgrades.get('starting_boost')) {
      effects.startingLevel = 2;
    }

    // Coin magnet
    const coinMagnetLevel = this.upgrades.get('coin_magnet') || 0;
    if (coinMagnetLevel > 0) {
      effects.coinRadiusBonus = this.calculateDiminishingBonus('coin_magnet', 50);
    }

    // Health boost
    effects.startingHP = this.upgrades.get('health_boost') || 0;

    // XP boost
    const xpBoostLevel = this.upgrades.get('xp_boost') || 0;
    if (xpBoostLevel > 0) {
      effects.xpMultiplier = 1.0 + (this.calculateDiminishingBonus('xp_boost', 10) / 100);
    }

    // Reroll tokens
    effects.rerollTokens = this.upgrades.get('reroll_tokens') || 0;

    // Weapon mastery
    if (this.upgrades.get('weapon_mastery')) {
      effects.weaponStartLevel = 2;
    }

    // Synergy finder
    if (this.upgrades.get('synergy_finder')) {
      effects.synergyBonus = 1.5;
    }

    // Evolution unlock
    if (this.upgrades.get('evolution_unlock')) {
      effects.maxEvolutions = 3;
    }

    // Phoenix heart
    if (this.upgrades.get('final_stand')) {
      effects.hasRevive = true;
    }

    return effects;
  }

  /**
   * Handle run completion
   */
  onRunComplete(stats) {
    this.totalRuns++;

    // Track highest level
    if (stats.finalLevel > this.highestLevel) {
      this.highestLevel = stats.finalLevel;
    }

    // Award coins based on performance
    const coinsEarned = Math.floor(stats.score / 100) + (stats.finalLevel * 2);
    this.totalCoinsEarned += coinsEarned;

    // Check if run was a win (reached level 15+)
    const isWin = stats.finalLevel >= 15;

    if (isWin) {
      this.totalWins++;
      this.currentStreak++;
      this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
    } else {
      // Death handling
      this.totalDeaths++;

      // Check death milestones
      const milestone = this.deathMilestones.find(m => m.deaths === this.totalDeaths);
      if (milestone) {
        this.totalCoinsEarned += milestone.coins;
      }

      // Break streak but award consolation
      if (this.currentStreak >= 3) {
        const consolation = this.currentStreak * 5;
        this.totalCoinsEarned += consolation;
      }
      this.currentStreak = 0;
    }

    // XP banking: 10% of run XP converts to banked XP
    const bankedAmount = Math.floor(stats.totalXP * 0.10);
    this.bankedXP += bankedAmount;

    // Convert banked XP to coins (1000 XP = 1 coin)
    if (this.bankedXP >= 1000) {
      const bonusCoins = Math.floor(this.bankedXP / 1000);
      this.totalCoinsEarned += bonusCoins;
      this.bankedXP %= 1000;
    }

    // Track synergies discovered
    if (stats.synergiesUnlocked) {
      stats.synergiesUnlocked.forEach(id => this.synergiesDiscovered.add(id));
    }

    this.save();

    return {
      coinsEarned,
      milestone: milestone || null,
      streak: this.currentStreak,
      bankedXPConverted: Math.floor(this.bankedXP / 1000)
    };
  }

  /**
   * Save meta progression to localStorage
   */
  save() {
    const data = {
      totalCoinsEarned: this.totalCoinsEarned,
      totalRuns: this.totalRuns,
      totalWins: this.totalWins,
      highestLevel: this.highestLevel,
      totalDeaths: this.totalDeaths,
      synergiesDiscovered: Array.from(this.synergiesDiscovered),
      upgrades: Array.from(this.upgrades.entries()),
      bankedXP: this.bankedXP,
      currentStreak: this.currentStreak,
      bestStreak: this.bestStreak
    };

    localStorage.setItem('dinoMetaProgress', JSON.stringify(data));
  }

  /**
   * Load meta progression from localStorage
   */
  load() {
    try {
      const saved = localStorage.getItem('dinoMetaProgress');
      if (!saved) return;

      const data = JSON.parse(saved);
      this.totalCoinsEarned = data.totalCoinsEarned || 0;
      this.totalRuns = data.totalRuns || 0;
      this.totalWins = data.totalWins || 0;
      this.highestLevel = data.highestLevel || 0;
      this.totalDeaths = data.totalDeaths || 0;
      this.synergiesDiscovered = new Set(data.synergiesDiscovered || []);
      this.upgrades = new Map(data.upgrades || []);
      this.bankedXP = data.bankedXP || 0;
      this.currentStreak = data.currentStreak || 0;
      this.bestStreak = data.bestStreak || 0;
    } catch (error) {
      console.error('Failed to load meta progression:', error);
    }
  }

  /**
   * Reset all meta progression (for testing)
   */
  resetAll() {
    this.totalCoinsEarned = 0;
    this.totalRuns = 0;
    this.totalWins = 0;
    this.highestLevel = 0;
    this.totalDeaths = 0;
    this.synergiesDiscovered.clear();
    this.upgrades.clear();
    this.bankedXP = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.save();
  }
}

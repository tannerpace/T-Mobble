# T-Mobble: Fibonacci-Inspired Game Design & Balancing Plan

## Executive Summary

This document outlines a comprehensive redesign of T-Mobble's progression, difficulty, and combat systems using natural, non-linear growth patterns inspired by the Fibonacci sequence and Golden Ratio (φ ≈ 1.618). The goal is to create organic "breathing" difficulty that feels rewarding without being punishing, replacing the current dual-currency system (coins + XP) with a unified experience-based progression model.

---

## 1. Core Design Philosophy

### 1.1 The Golden Ratio in Game Design

The Golden Ratio appears throughout nature as an aesthetically pleasing proportion. In game design, it creates:

- **Organic pacing**: Difficulty pulses in waves rather than straight lines
- **Natural checkpoints**: Each Fibonacci milestone feels significant
- **Balanced challenge**: Player power and enemy strength dance around equilibrium
- **Rewarding progression**: Each advance feels earned but achievable

### 1.2 Design Pillars

1. **Early Generosity**: Fast initial progression builds confidence and teaches mechanics
2. **Mid-Game Strategy**: Difficulty spikes require thoughtful upgrade choices
3. **Late-Game Intensity**: Exponential challenges for veteran players
4. **Dynamic Balance**: Enemy power scales alongside player power in complementary waves
5. **Unified Progression**: Single currency (XP) drives all advancement

---

## 2. Unified Progression System

### 2.1 Current State Analysis

**Current Issues:**
- **Dual currencies**: XP (levels/upgrades) + Coins (separate weapon upgrades)
- **Conflicting systems**: Two parallel progression paths confuse the reward loop
- **Exponential coin costs**: 1→2→4→8→16→32 feels punishing
- **Linear XP curve**: Level 1-5 linear, then switches abruptly to exponential

**Why This Fails:**
- Players chase two different collectibles with different mental models
- Coin system has exponential costs but linear drops (2x coins from elites only)
- No visual feedback showing progress toward coin upgrades during gameplay
- XP feels good but coins feel grindy

### 2.2 Proposed Unified System: "Experience Points"

**Core Concept:** Merge coins and XP into a single "Experience" currency.

**Collection Sources:**
- **XP Gems**: Base experience drops from all enemies
  - Flying Enemy: 5 XP
  - Medium Enemy: 10 XP
  - Tank Enemy: 15 XP
  - Elite Enemy: 25 XP
- **Bonus XP**: Random drops replaced coins (same visual as old powerups/coins)
  - Spawns periodically (current powerup spawn logic)
  - Worth 20-30 XP (significant but not overwhelming)
  - Golden sparkly particle effect for excitement

**Visual Clarity:**
- Single XP bar at top of screen
- Shows current XP / XP to next level
- Pulsing/glowing as it approaches level threshold
- Level number displayed prominently with phase indicator emoji

---

## 3. Fibonacci Progression Curve

### 3.1 Level Requirement Formula

Instead of arbitrary exponential curves, use Fibonacci-inspired growth:

```
Level Thresholds (XP to reach):
Level 1: 0 XP (start)
Level 2: 100 XP
Level 3: 160 XP (+60, ratio 1.6)
Level 4: 260 XP (+100, ratio 1.625)
Level 5: 420 XP (+160, ratio 1.615)
Level 6: 680 XP (+260, ratio 1.619)
Level 7: 1100 XP (+420, ratio 1.617)
Level 8: 1780 XP (+680, ratio 1.618)
Level 9: 2880 XP (+1100, ratio 1.617)
Level 10: 4660 XP (+1780, ratio 1.618)
...continues approaching φ (1.618)
```

**Implementation:**
```javascript
calculateXPForLevel(level) {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  
  // Fibonacci-style: XP(n) = XP(n-1) + XP(n-2)
  let prev2 = 100; // Level 2
  let prev1 = 160; // Level 3
  
  if (level === 3) return 160;
  
  for (let i = 4; i <= level; i++) {
    const next = prev1 + prev2;
    prev2 = prev1;
    prev1 = next;
  }
  
  return prev1;
}

getTotalXPForLevel(level) {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += this.calculateXPForLevel(i);
  }
  return total;
}
```

### 3.2 Progression Phases

**Phase 1: Awakening (Levels 1-3)**
- **Feel**: Fast, exciting, tutorial-like
- **Time**: 2-3 minutes
- **Purpose**: Hook players, teach core mechanics
- **XP Required**: 100 → 160 → 260
- **Rewards**: Basic weapons unlock quickly

**Phase 2: Rising Challenge (Levels 4-8)**
- **Feel**: Strategic, meaningful choices emerge
- **Time**: 5-8 minutes total
- **Purpose**: Introduce build diversity
- **XP Required**: Fibonacci growth (420 → 680 → 1100 → 1780)
- **Rewards**: Weapon variations, first synergies

**Phase 3: Mastery (Levels 9-15)**
- **Feel**: Intense, build-defining moments
- **Time**: 15-25 minutes total
- **Purpose**: Experienced players shine
- **XP Required**: Strong exponential (2880 → 4660 → 7540...)
- **Rewards**: Power upgrades, game-changers

**Phase 4: Infinity (Level 16+)**
- **Feel**: Endless escalation
- **Time**: 25+ minutes
- **Purpose**: Long-term engagement
- **XP Required**: Approaching φ ratio perfectly
- **Rewards**: Max-level upgrades, mastery bonuses

---

## 4. Enemy Difficulty Waves

### 4.1 Current Issues

- Linear spawn rate increases (30% → 50% → 70% → 85% → 100%)
- Spawn intervals decrease linearly (200 → 150 → 120 → 100 → 80 frames)
- GameSpeed increases every 300 score points
- Difficulty plateaus at level 9+

### 4.2 Fibonacci Wave System

**Core Concept:** Difficulty rises and falls in waves that sync with Fibonacci levels.

**Wave Intensity Formula:**
```
intensity(level) = base + (wave_amplitude * sin(level * wave_frequency))

where:
- base increases with Fibonacci-style steps
- wave_amplitude creates "breathing" (easier/harder cycles)
- wave_frequency = φ / 10 (creates natural rhythm)
```

**Practical Implementation:**

```javascript
getEnemySpawnConfig(playerLevel) {
  // Base difficulty increases in Fibonacci steps
  const fibIndex = Math.min(playerLevel, 13);
  const baseDifficulty = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233][fibIndex] / 233;
  
  // Wave function creates pulses (easier after hard levels)
  const PHI = 1.618;
  const wave = Math.sin(playerLevel * PHI / 5) * 0.15;
  
  // Combine for final intensity (0.0 to 1.0)
  const intensity = Math.max(0.2, Math.min(1.0, baseDifficulty + wave));
  
  return {
    spawnInterval: Math.floor(200 - (intensity * 120)), // 200 → 80 frames
    spawnChance: 0.3 + (intensity * 0.7),              // 30% → 100%
    enemySpeed: 1.0 + (intensity * 0.8),                // 1x → 1.8x
    enemyHealth: 1 + Math.floor(intensity * 5),         // 1 → 6 HP
    eliteChance: intensity * 0.15                       // 0% → 15%
  };
}
```

**Wave Explanation:**
- **Level 1-3**: Low base, positive wave = gentle introduction
- **Level 4-5**: Rising base, wave dips = small breather before mid-game
- **Level 6-8**: Medium base, wave peaks = first major challenge spike
- **Level 9-10**: High base, wave dips = earned relief moment
- **Level 11-13**: Very high base, wave peaks = veteran challenge
- **Level 14+**: Max base, wave creates micro-cycles within chaos

### 4.3 Enemy Type Distribution

**Fibonacci-Based Spawn Weights:**

```javascript
getEnemyTypeWeights(playerLevel, intensity) {
  const weights = {
    flying: 55,    // Fibonacci number: easy to kill, fast
    medium: 34,    // Fibonacci number: moderate
    tank: 13,      // Fibonacci number: tough, slow
    elite: 8       // Fibonacci number: boss-like
  };
  
  // Early game: mostly flying enemies
  if (playerLevel <= 3) {
    return { flying: 89, medium: 8, tank: 3, elite: 0 };
  }
  
  // Mid game: introduce variety
  if (playerLevel <= 8) {
    return { flying: 55, medium: 34, tank: 8, elite: 3 };
  }
  
  // Late game: balanced chaos
  if (playerLevel <= 13) {
    return { flying: 34, medium: 34, tank: 21, elite: 11 };
  }
  
  // End game: elite-heavy
  return { flying: 21, medium: 21, tank: 34, elite: 24 };
}
```

---

## 5. Player Power Growth

### 5.1 Weapon Progression

**Current Issue:** Weapons level 1-5 linearly, feels underwhelming.

**Fibonacci Weapon Power:**

Each weapon starts weak but grows in Fibonacci-influenced steps:

```javascript
// Weapon damage/effectiveness multipliers by level
const WEAPON_POWER_CURVE = {
  1: 1.0,     // Base
  2: 1.6,     // φ^0
  3: 2.6,     // φ^1 (1.618)
  4: 4.2,     // φ^2 (2.618)
  5: 6.8,     // φ^3 (4.236)
  6: 11.0,    // φ^4 (6.854)
  7: 17.8,    // φ^5 (11.090)
  8: 28.8     // φ^6 (17.944) - max level
};
```

**Applied Weapon Bonuses:**

| Weapon | Level 1 | Level 2 | Level 3 | Level 4 | Level 5+ |
|--------|---------|---------|---------|---------|----------|
| Blaster | Base fire rate | +60% range | +160% range | +260% range + pierce 1 | +420% range + pierce 2 |
| Whip | Base arc | +60% arc width | +160% speed | +260% multi-hit | Chain lightning |
| Laser | Base beam | +60% width | +160% damage | +260% dual beam | Infinite pierce |
| Flame | Base burn | +60% burn damage | +160% range | +260% duration | Inferno spread |
| Volcano | Base hazard | +60% fire rate | +160% hazard duration | +260% hazard damage | Triple hazards |

**Balance Principle:** Each level should feel like a meaningful power jump, not just "+10% damage."

### 5.2 Upgrade Selection Strategy

**Current Issue:** Random 3-choice selection, no guaranteed progress.

**Fibonacci Guarantee System:**

```javascript
getUpgradeChoices(playerLevel, unlockedWeapons) {
  const choices = [];
  
  // Fibonacci guarantee: Every 1, 1, 2, 3, 5, 8, 13... levels, guarantee new weapon
  const fibSequence = [1, 2, 3, 5, 8, 13, 21, 34];
  const isGuaranteedNew = fibSequence.includes(playerLevel);
  
  if (isGuaranteedNew && hasLockedWeapons()) {
    // Guarantee at least 1 new weapon
    choices.push(getRandomLockedWeapon());
    
    // Fill remaining slots with level-ups or another new weapon
    while (choices.length < 3) {
      choices.push(Math.random() < 0.5 ? getRandomUnlockedWeapon() : getRandomLockedWeapon());
    }
  } else {
    // Standard: mix of level-ups and maybe new weapons
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.3 && hasLockedWeapons()) {
        choices.push(getRandomLockedWeapon());
      } else {
        choices.push(getRandomUnlockedWeapon());
      }
    }
  }
  
  return choices;
}
```

**Player Experience:**
- Levels 1, 2, 3: Expect new weapons frequently (fast unlocks)
- Levels 5, 8, 13: Guaranteed new weapon (milestone rewards)
- Between: Mix of leveling existing weapons and occasional new ones
- Never stuck with only "level 8 → level 9" choices that feel meaningless

---

## 6. Dynamic Balance Model

### 6.1 The Challenge-Power Dance

**Concept:** Player power and enemy power should oscillate around each other, not grow in parallel.

**Visual Representation:**
```
Power Level
    ^
    |        /\         /\
    |   P  /    \    /     \
    |    /        \/         \  
    |  /     E                 \
    | /                          
    +--------------------------------> Time
    
    P = Player Power (smooth growth with upgrade spikes)
    E = Enemy Power (wave-based with Fibonacci pulses)
```

**Implementation:**

```javascript
// Player power score (calculated from weapons + levels)
calculatePlayerPower(weapons, playerLevel) {
  let power = 100; // Base
  
  weapons.forEach(weapon => {
    power += weapon.level * WEAPON_POWER_CURVE[weapon.level] * 10;
  });
  
  power += playerLevel * 15; // Level contribution
  
  return power;
}

// Enemy power score (calculated from spawn config)
calculateEnemyPower(spawnConfig, playerLevel) {
  const { enemySpeed, enemyHealth, spawnChance, eliteChance } = spawnConfig;
  
  let power = 100; // Base
  power += enemySpeed * 50;
  power += enemyHealth * 30;
  power += spawnChance * 100;
  power += eliteChance * 200;
  
  return power;
}

// Balance ratio (should oscillate around 1.0)
getBalanceRatio(playerPower, enemyPower) {
  return playerPower / enemyPower;
}

// Feedback loop: if enemies too weak, spawn boss wave
// If enemies too strong, spawn extra XP gems
adjustDifficulty(balanceRatio) {
  if (balanceRatio > 1.3) {
    // Player too strong - spawn elite wave
    triggerEliteWave();
  } else if (balanceRatio < 0.7) {
    // Enemies too strong - boost XP drops
    setXPMultiplier(1.5);
  } else {
    // Balanced - normal gameplay
    setXPMultiplier(1.0);
  }
}
```

### 6.2 Pacing Across Game Phases

**Early Game (Levels 1-3): Learning Phase**
- Player Power: Starts low, spikes quickly with first weapon unlocks
- Enemy Power: Very low, gentle waves
- Balance Ratio: 1.2-1.5 (player slightly favored)
- **Feel:** "I'm getting stronger fast! This is fun!"

**Mid Game (Levels 4-8): Strategic Phase**
- Player Power: Growing steadily with weapon diversity
- Enemy Power: Medium base, wave peaks create challenge spikes
- Balance Ratio: 0.9-1.1 (oscillates around even)
- **Feel:** "I need to think about my choices. This is engaging!"

**Late Game (Levels 9-15): Mastery Phase**
- Player Power: High, but upgrade frequency slows
- Enemy Power: High base, intense waves
- Balance Ratio: 0.7-1.3 (wider swings, dramatic moments)
- **Feel:** "I'm dancing on the edge! This is intense!"

**End Game (Level 16+): Survival Phase**
- Player Power: Maxed weapons, small incremental gains
- Enemy Power: Extreme, constant pressure
- Balance Ratio: 0.8-1.0 (slight enemy favor, survival challenge)
- **Feel:** "How long can I survive? This is my limit!"

---

## 7. Game Speed & Scroll Speed

### 7.1 Current Issues

- Speed increases every 300 score points (linear)
- Caps at gameSpeed = 8
- Speed increment uses diminishing returns (0.3 → 0.2 → 0.1)
- Disconnected from player progression (score-based, not level-based)

### 7.2 Fibonacci-Synced Speed Curve

**Concept:** Game speed should pulse with player level in Fibonacci rhythm.

```javascript
calculateGameSpeed(playerLevel, baseSpeed = 2.0) {
  const PHI = 1.618;
  
  // Base speed increases in Fibonacci-influenced steps
  const fibLevel = Math.min(playerLevel, 13);
  const fibMultiplier = [1, 1, 1.1, 1.2, 1.3, 1.5, 1.8, 2.1, 2.6, 3.2, 4.0, 5.0, 6.2, 7.8][fibLevel];
  
  // Wave creates micro-variations (prevents monotony)
  const wave = Math.sin(playerLevel * PHI / 3) * 0.2;
  
  // Final speed (with cap)
  const speed = baseSpeed * (fibMultiplier + wave);
  return Math.min(speed, 12.0); // Higher cap for late game
}
```

**Speed Breakpoints:**
- **Level 1-2**: Speed 2.0-2.2 (gentle, tutorial pace)
- **Level 3-4**: Speed 2.4-2.8 (picking up)
- **Level 5-6**: Speed 3.0-3.6 (mid-game flow)
- **Level 7-8**: Speed 4.2-5.2 (getting intense)
- **Level 9-10**: Speed 6.4-8.0 (expert territory)
- **Level 11-13**: Speed 9.6-12.0 (maximum chaos)
- **Level 14+**: Speed 12.0 (capped, enemies compensate)

**Why This Works:**
- Speed increases feel natural (tied to level-ups, not arbitrary score)
- Wave function creates "breather moments" after hard levels
- Higher cap (12 vs 8) allows late-game intensity
- Syncs with enemy spawn waves for cohesive difficulty curve

---

## 8. Enemy Health & Damage Scaling

### 8.1 Current State

- Flying: 1 HP, 5 XP
- Medium: Unknown (estimate 2-3 HP), 10 XP
- Tank: 5 HP, 15 XP
- Elite: 8 HP, 25 XP

**Issues:**
- Static health values regardless of player level
- Tank and Elite become trivial with upgraded weapons
- No sense of progression in enemy toughness

### 8.2 Fibonacci Health Scaling

**Dynamic Enemy Health:**

```javascript
getEnemyHealth(baseHealth, playerLevel, intensity) {
  const fibScaling = [1, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55][Math.min(playerLevel, 10)];
  const healthMultiplier = 1 + (fibScaling / 55); // Normalized to 1.0-2.0
  
  return Math.ceil(baseHealth * healthMultiplier * (0.8 + intensity * 0.4));
}

// Examples:
// Level 1 Tank: 5 * 1.0 * 1.0 = 5 HP
// Level 5 Tank: 5 * 1.27 * 1.2 = 8 HP
// Level 10 Tank: 5 * 2.0 * 1.5 = 15 HP
// Level 15 Elite: 8 * 2.0 * 2.0 = 32 HP (mini-boss)
```

**XP Rewards Scale Proportionally:**

```javascript
getEnemyXP(baseXP, actualHealth, baseHealth) {
  return Math.floor(baseXP * (actualHealth / baseHealth));
}

// Tank at level 10 with 15 HP:
// XP = 15 * (15 / 5) = 45 XP (was 15)
```

**Balance Rationale:**
- Enemies stay threatening as player gets stronger
- Higher health = higher reward (fair trade)
- Fibonacci growth ensures it doesn't become absurd
- Wave system prevents constant escalation

---

## 9. Weapon Variety & Synergies

### 9.1 Current Weapon Roster

1. **Blaster**: Projectile, pierce at high levels
2. **Whip**: Melee arc
3. **Laser**: Continuous beam
4. **Flamethrower**: Burn DOT
5. **Volcano**: Arc projectile → ground hazard

**Issue:** Weapons feel isolated, no synergies or combos.

### 9.2 Fibonacci Weapon Synergy System

**Concept:** Weapons gain bonus effects when combined in groups of Fibonacci numbers (1, 2, 3, 5).

**Synergy Tiers:**

**Tier 1: Solo Mastery (1 weapon at level 5+)**
- Unlock: Max level weapon mastery bonus
- Effect: +30% effectiveness for that weapon
- Example: Blaster level 5 → bullets explode on impact

**Tier 2: Dual Harmony (2 weapons at level 3+)**
- Unlock: Two weapons both level 3+
- Effect: Alternating fire pattern (faster overall DPS)
- Example: Blaster + Laser = Shots between beam ticks

**Tier 3: Trinity Power (3 weapons at level 3+)**
- Unlock: Three weapons all level 3+
- Effect: +20% damage to all weapons
- Example: Blaster + Laser + Whip = Offensive trinity

**Tier 5: Pentagon Arsenal (5 weapons unlocked)**
- Unlock: All 5 weapons unlocked (any level)
- Effect: +50% XP gain, weapon cycle mode
- Example: All weapons = God mode feeling

**Visual Feedback:**
- UI shows synergy tier with Fibonacci symbols (●, ●●, ●●●, ●●●●●)
- Particle effects change color based on active synergies
- Sound effects layer as synergies stack

### 9.3 Weapon Evolution Paths

**Blaster Evolution:**
1. Basic → 2. Rapid Fire → 3. Spread Shot → 4. Pierce → 5. Explosive → 6. Homing → 7. Plasma Cannon → 8. Star Destroyer

**Whip Evolution:**
1. Basic → 2. Long Reach → 3. Speed Demon → 4. Multi-Hit → 5. Chain Lightning → 6. Void Lash → 7. Reality Tear → 8. Time Fracture

**Each evolution at Fibonacci intervals (1, 2, 3, 5, 8):**
- Levels 1-2: Basic functionality
- Level 3: First major upgrade
- Level 5: Game-changing effect
- Level 8: Ultimate form

---

## 10. Visual & Audio Feedback

### 10.1 Fibonacci Visual Language

**XP Bar Segments:**
- Divide XP bar into Fibonacci segments (1, 1, 2, 3, 5, 8, 13...)
- Each segment glows when filled
- Creates visual rhythm of progress

**Particle Systems:**
- Small XP: 1 particle
- Medium XP: 2 particles
- Big XP: 3 particles
- Bonus XP: 5 particles
- Level Up: 8 particles
- Milestone: 13 particles
- Max Level: 21 particles (explosion)

**UI Animations:**
- Button pulses at φ rate (1.618 seconds)
- Health hearts beat in Fibonacci timing
- Weapon icons rotate in golden spiral pattern

### 10.2 Audio Cues

**Level-Up Sounds:**
- Level 1-3: Single chime
- Level 4-5: Double chime
- Level 6-8: Triple chime (trinity)
- Level 9-13: Five-note arpeggio (pentagon)
- Level 14+: Eight-note fanfare (octave)

**Enemy Defeat:**
- Flying: Light ping (5 XP)
- Medium: Medium thud (10 XP)
- Tank: Heavy crash (15 XP)
- Elite: Epic explosion (25 XP)

**Wave Transitions:**
- Low-intensity wave: Calm ambient sounds
- High-intensity wave: Dramatic music escalation
- Peak: Bass drop / cymbal crash

---

## 11. Implementation Roadmap

### 11.1 Phase 1: Core Unification (Essential)

**Tasks:**
1. Merge coin drops into XP gems
   - Change `Coin` class to spawn `XPGem` instead
   - Adjust XP values (2x coin = 20-30 XP gem)
   - Update particle effects (gold → cyan/blue)

2. Remove `CoinUpgradeManager`
   - Delete coin counter UI
   - Remove coin upgrade threshold logic
   - All upgrades trigger on level-up only

3. Implement Fibonacci XP curve
   - Replace `ExperienceManager.calculateXPForLevel()` with Fibonacci formula
   - Test progression feel at levels 1-15

4. Update UI
   - Single XP bar only
   - Remove coin counter
   - Add level progress percentage

**Testing Criteria:**
- Can reach level 5 in 3-4 minutes?
- Does level 10 feel achievable in 15 minutes?
- Are upgrades offered at satisfying intervals?

### 11.2 Phase 2: Enemy Wave System (Core Gameplay)

**Tasks:**
1. Implement `getEnemySpawnConfig()` with wave function
2. Dynamic enemy health scaling by level
3. XP rewards scale with enemy health
4. Test wave peaks and troughs feel good

**Testing Criteria:**
- Do waves create "breathing room" moments?
- Is level 5 spike noticeable but fair?
- Are level 10+ enemies still threatening?

### 11.3 Phase 3: Weapon Power Curve (Balance)

**Tasks:**
1. Implement `WEAPON_POWER_CURVE` multipliers
2. Redesign weapon level bonuses (see section 5.1)
3. Weapon synergy system (basic tier 1-2)
4. Upgrade guarantee system (Fibonacci milestones)

**Testing Criteria:**
- Does each weapon level feel impactful?
- Are synergies noticeable and rewarding?
- Do guaranteed new weapons feel special?

### 11.4 Phase 4: Speed & Balance (Polish)

**Tasks:**
1. Fibonacci-synced game speed
2. Dynamic difficulty adjustment (balance ratio)
3. Visual/audio feedback (particle counts, sound layers)
4. Elite wave triggers on overpowered player

**Testing Criteria:**
- Does speed feel natural, not jarring?
- Do difficulty spikes feel fair?
- Is feedback satisfying at all levels?

### 11.5 Phase 5: Advanced Systems (Optional)

**Tasks:**
1. Weapon evolution system (8 tiers)
2. Synergy tier 3-5 effects
3. Fibonacci visual language (UI segments)
4. Sound design (Fibonacci note progressions)

**Testing Criteria:**
- Do evolutions create long-term goals?
- Are tier 5 synergies achievable and epic?
- Does the game "feel" Fibonacci?

---

## 12. Balancing Tuning Knobs

### 12.1 Critical Variables

```javascript
// XP System
const XP_BASE = 100;               // First level requirement
const XP_SCALING = 'fibonacci';    // 'linear' | 'exponential' | 'fibonacci'

// Enemy Spawns
const SPAWN_WAVE_FREQUENCY = PHI / 5;  // Wave speed (higher = faster cycles)
const SPAWN_WAVE_AMPLITUDE = 0.15;     // Wave intensity (0.1-0.3 range)
const BASE_SPAWN_INTERVAL = 200;       // Frames between spawns (max)
const MIN_SPAWN_INTERVAL = 60;         // Frames between spawns (min)

// Enemy Scaling
const HEALTH_SCALING_CAP = 2.0;        // Max health multiplier
const XP_SCALING_MATCH = true;         // XP scales with health?

// Weapon Power
const WEAPON_POWER_BASE = 1.0;         // Level 1 effectiveness
const WEAPON_POWER_SCALING = PHI;      // Exponential base (1.618)
const SYNERGY_BONUS_TIER2 = 1.2;       // +20% for 2 weapons
const SYNERGY_BONUS_TIER3 = 1.5;       // +50% for 3 weapons

// Game Speed
const SPEED_BASE = 2.0;                // Starting speed
const SPEED_CAP = 12.0;                // Maximum speed
const SPEED_WAVE_AMPLITUDE = 0.2;      // Speed variation

// Balance
const BALANCE_PLAYER_FAVOR = 1.1;      // Target ratio (player slightly ahead)
const BALANCE_ADJUSTMENT_THRESHOLD = 0.3; // When to trigger help/challenge
```

### 12.2 Common Tuning Scenarios

**"Game feels too hard at level 5"**
→ Reduce `SPAWN_WAVE_AMPLITUDE` (0.15 → 0.10)
→ Increase `XP_BASE` (100 → 120)

**"Levels come too fast early on"**
→ Increase `XP_BASE` (100 → 150)
→ Adjust Fibonacci starting values

**"Weapons feel weak even when upgraded"**
→ Increase `WEAPON_POWER_SCALING` (1.618 → 1.8)
→ Boost individual weapon bonuses

**"Game gets boring after level 10"**
→ Increase `SPAWN_WAVE_FREQUENCY` (creates faster waves)
→ Reduce `HEALTH_SCALING_CAP` (enemies die faster, more spawns)

**"Speed feels too fast too soon"**
→ Reduce `SPEED_CAP` (12 → 10)
→ Adjust speed curve multipliers

---

## 13. Risks & Mitigation

### 13.1 Risk: Fibonacci Too Complex

**Concern:** Players won't consciously notice Fibonacci patterns.

**Mitigation:**
- Fibonacci is backend math, not player-facing
- Players experience "feels good" without knowing why
- Focus on pacing feel, not mathematical accuracy
- A/B test against linear/exponential curves

**Success Metric:** Players report "natural" or "organic" difficulty in playtests.

### 13.2 Risk: Unified Progression Too Linear

**Concern:** Removing coins removes strategic choice (when to upgrade vs. stockpile).

**Mitigation:**
- Upgrade choices at level-up provide strategy
- Synergy system adds build planning
- Guarantee system ensures progress without luck

**Success Metric:** Players discuss build strategies, not "grinding for coins."

### 13.3 Risk: Wave System Too Subtle

**Concern:** Players won't notice difficulty waves, just feel random spikes.

**Mitigation:**
- Visual indicators (warning before wave peaks)
- Audio cues (music intensity matches wave)
- Reward relief moments (extra XP during wave troughs)

**Success Metric:** Players say "I survived that rush!" not "That was unfair."

### 13.4 Risk: Performance Issues

**Concern:** Dynamic calculations (health scaling, wave functions) hurt FPS.

**Mitigation:**
- Pre-calculate values at level-up (not every frame)
- Cache spawn configs for current level
- Use lookup tables for Fibonacci values

**Success Metric:** Maintains 60 FPS on low-end devices.

### 13.5 Risk: Balance Breaks at Extremes

**Concern:** Level 20+ becomes unplayable (too easy or too hard).

**Mitigation:**
- Cap scaling at level 13 (Fibonacci number)
- Beyond 13, use different formula (survival mode)
- Add optional "prestige" reset at level 21

**Success Metric:** Players reach level 13+ in 5% of games (rare but achievable).

---

## 14. Future Extensibility

### 14.1 Prestige System (Level 21+)

When player reaches level 21 (Fibonacci: 1+1+2+3+5+8), offer prestige:
- Reset to level 1, keep weapon unlocks
- Gain "Prestige Stars" (cosmetic)
- Unlock harder difficulties with better rewards
- Each prestige increases starting power by φ^prestige

### 14.2 Daily Challenges

- "Reach level 8 with only Blaster" (Fibonacci milestone)
- "Survive 13 minutes" (Fibonacci number)
- "Defeat 55 enemies" (Fibonacci number)
- Rewards: Bonus XP multipliers, cosmetic unlocks

### 14.3 Endless Mode

- Start at level 13 with all weapons
- Infinite scaling with φ exponent
- Leaderboard by survival time
- Unlock special weapons/skins

### 14.4 Boss Encounters

- Every 13 levels (Fibonacci), spawn boss
- Boss health: Fibonacci sequence (13, 21, 34, 55, 89 HP)
- Boss drops: Mega XP gems (Fibonacci values)
- Boss patterns: Fibonacci attack timing

---

## 15. Success Metrics

### 15.1 Progression Metrics

- **Level 3 Reach Rate**: 80%+ of players (early hook)
- **Level 5 Reach Rate**: 60%+ of players (mid-game engage)
- **Level 8 Reach Rate**: 30%+ of players (veteran)
- **Level 13 Reach Rate**: 5%+ of players (mastery)
- **Average Session Duration**: 8-12 minutes (sweet spot)

### 15.2 Engagement Metrics

- **Retry Rate**: 70%+ play again after game over
- **Upgrade Diversity**: Players use 80%+ of weapons over 10 runs
- **Difficulty Satisfaction**: 4.0+ / 5.0 rating on "challenge feel"
- **Progression Satisfaction**: 4.5+ / 5.0 rating on "rewarding feel"

### 15.3 Balance Metrics

- **Balance Ratio Average**: 0.9 - 1.1 (player vs enemy power)
- **Death Causes**: 40% obstacles, 60% enemies (both matter)
- **Weapon Usage**: No single weapon >40% pick rate (diversity)
- **Level Distribution**: Bell curve peaks at level 6-8 (most players)

---

## 16. Conclusion

This Fibonacci-inspired design transforms T-Mobble from a dual-currency grind into a unified, organic progression experience. By leveraging natural growth patterns, wave-based difficulty, and synergistic weapon systems, players will feel:

1. **Early excitement** from fast initial progression
2. **Mid-game engagement** from strategic upgrade choices
3. **Late-game intensity** from exponential challenges
4. **Long-term depth** from weapon synergies and mastery

The Fibonacci sequence isn't just mathematical elegance—it's a player-tested pattern that feels right because nature uses it everywhere. When applied to game design, it creates the "breathing" rhythm that keeps players in flow state: challenged but not crushed, powerful but not bored.

**Next Step:** Implement Phase 1 (Core Unification) and playtest. The rest builds naturally from a solid foundation.

---

## Appendix A: Fibonacci Quick Reference

```
Fibonacci Sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233...
Golden Ratio (φ): 1.618033988749...

φ^0 = 1.000
φ^1 = 1.618
φ^2 = 2.618
φ^3 = 4.236
φ^4 = 6.854
φ^5 = 11.090
φ^6 = 17.944
φ^7 = 29.034
φ^8 = 46.979

Applications in Game:
- Level thresholds (XP requirements)
- Enemy spawn waves (frequency)
- Weapon power scaling (multipliers)
- Synergy tiers (weapon counts)
- Visual/audio timing (feedback loops)
```

## Appendix B: Code Examples

See implementation details in sections:
- Section 3.1: XP formula
- Section 4.2: Wave system
- Section 5.1: Weapon power
- Section 7.2: Speed curve
- Section 8.2: Health scaling
- Section 12.1: Tuning variables

## Appendix C: Playtest Questions

Use these to validate the design:

1. "Did the difficulty feel natural or forced?"
2. "When did you feel most powerful? Most threatened?"
3. "Were upgrade choices meaningful or arbitrary?"
4. "How long did you play before quitting?"
5. "Would you play again? Why/why not?"
6. "Did progression feel too fast, too slow, or just right?"
7. "Which weapon combinations did you enjoy most?"
8. "Were there any frustrating moments? When?"
9. "Did you feel rewarded for skillful play?"
10. "On a scale of 1-10, how satisfying was the game flow?"

---

**Document Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** December 1, 2025  
**Status:** Design Proposal - Pending Implementation

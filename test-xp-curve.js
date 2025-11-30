/**
 * Quick test to visualize the XP progression curve
 * Run with: node test-xp-curve.js
 */

class ExperienceManager {
  constructor() {
    this.baseXP = 100;
  }

  calculateXPForLevel(level) {
    if (level <= 5) {
      return Math.floor(this.baseXP * level);
    } else if (level <= 12) {
      return Math.floor(this.baseXP * Math.pow(level, 1.5));
    } else {
      return Math.floor(this.baseXP * Math.pow(level, 1.8));
    }
  }

  getTotalXPForLevel(targetLevel) {
    let total = 0;
    for (let i = 1; i < targetLevel; i++) {
      total += this.calculateXPForLevel(i);
    }
    return total;
  }
}

const xpManager = new ExperienceManager();

console.log('🎮 XP PROGRESSION CURVE\n');
console.log('Level | XP Required | Total XP | Phase');
console.log('------|-------------|----------|----------------');

for (let level = 1; level <= 20; level++) {
  const xpRequired = xpManager.calculateXPForLevel(level);
  const totalXP = xpManager.getTotalXPForLevel(level);

  let phase = '';
  if (level <= 5) phase = '⚡ Fast (Linear)';
  else if (level <= 12) phase = '📈 Medium (1.5x)';
  else phase = '🚀 Hard (1.8x)';
  console.log(
    `${level.toString().padStart(5)} | ${xpRequired.toString().padStart(11)} | ${totalXP.toString().padStart(8)} | ${phase}`
  );
}

console.log('\n📊 Key Insights:');
console.log('• Levels 1-3: Quick wins to hook players (100-300 XP each)');
console.log('• Levels 4-5: Still fast but building momentum (400-500 XP)');
console.log('• Levels 6-12: Moderate challenge with smooth curve (1469-4382 XP)');
console.log('• Levels 13+: Exponential challenge for mastery (5000+ XP)');
console.log('• Level 20 requires 21971 XP - a true achievement!');

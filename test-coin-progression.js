/**
 * Visualize the coin upgrade progression (power of 2)
 * Run with: node test-coin-progression.js
 */

console.log('💵 COIN UPGRADE PROGRESSION (Power of 2)\n');
console.log('Upgrade # | Coins Required | Total Coins Spent | Phase');
console.log('----------|----------------|-------------------|------------------');

let totalSpent = 0;

for (let upgrade = 1; upgrade <= 15; upgrade++) {
  const coinsRequired = Math.pow(2, upgrade - 1); // Start at 2^0 = 1
  totalSpent += coinsRequired;

  let phase = '';
  if (upgrade <= 3) phase = '⚡ Quick Start';
  else if (upgrade <= 6) phase = '🏃 Early Game';
  else if (upgrade <= 10) phase = '💪 Mid Game';
  else phase = '🚀 Late Game';

  console.log(
    `${upgrade.toString().padStart(9)} | ${coinsRequired.toString().padStart(14)} | ${totalSpent.toString().padStart(17)} | ${phase}`
  );
}

console.log('\n📊 Key Insights:');
console.log('• Upgrade 1: Just 1 coin - instant gratification!');
console.log('• Upgrades 2-3: Only 2-4 coins - quick early progression');
console.log('• Upgrades 4-6: 8-32 coins - meaningful mid-game goals');
console.log('• Upgrades 7-10: 64-512 coins - long-term challenges');
console.log('• Upgrade 15: 16,384 coins - ultimate achievement!');
console.log('\n💡 Benefits:');
console.log('• Early upgrades feel rewarding and achievable');
console.log('• Creates compelling "just one more upgrade" loop');
console.log('• Exponential growth matches player skill progression');
console.log('• Never feels like a grind at any stage');

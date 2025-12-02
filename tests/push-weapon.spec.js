import { expect, test } from '@playwright/test';

test.describe('Push Weapon Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/public/index.html');
    // Wait for game to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Water Cannon is available in weapon upgrades', async ({ page }) => {
    // Access the game object to check available weapons
    const availableWeapons = await page.evaluate(() => {
      if (window.game && window.game.upgradeSystem) {
        return window.game.upgradeSystem.getAvailableWeaponUpgrades();
      }
      return [];
    });

    // Check if Water Cannon is in the available weapons
    const pushGun = availableWeapons.find(weapon => weapon.id === 'push');
    expect(pushGun).toBeDefined();
    expect(pushGun.name).toBe('Water Cannon');
    expect(pushGun.icon).toBe('💦');
    expect(pushGun.description).toBe('Knockback weapon that pushes enemies');
  });

  test('PushBullet entity exists and can be instantiated', async ({ page }) => {
    const pushBulletExists = await page.evaluate(() => {
      // Import and test PushBullet
      return import('/src/entities/PushBullet.js').then(module => {
        const PushBullet = module.PushBullet;
        const bullet = new PushBullet(100, 100, 0, 10, 30);
        return {
          exists: true,
          width: bullet.width,
          height: bullet.height,
          knockbackForce: bullet.knockbackForce,
          maxRange: bullet.maxRange
        };
      }).catch(() => ({ exists: false }));
    });

    expect(pushBulletExists.exists).toBe(true);
    expect(pushBulletExists.width).toBe(15);
    expect(pushBulletExists.height).toBe(8);
    expect(pushBulletExists.knockbackForce).toBe(30);
    expect(pushBulletExists.maxRange).toBe(400);
  });

  test('PushWeapon can be added to weapon system', async ({ page }) => {
    const weaponAdded = await page.evaluate(() => {
      if (window.game && window.game.weaponSystem) {
        const beforeCount = window.game.weaponSystem.getActiveWeapons().length;
        const added = window.game.weaponSystem.addWeapon('push');
        const afterCount = window.game.weaponSystem.getActiveWeapons().length;
        return {
          added,
          beforeCount,
          afterCount
        };
      }
      return { added: false, beforeCount: 0, afterCount: 0 };
    });

    expect(weaponAdded.added).toBe(true);
    expect(weaponAdded.afterCount).toBe(weaponAdded.beforeCount + 1);
  });

  test('BaseEnemy has applyKnockback method', async ({ page }) => {
    const hasKnockback = await page.evaluate(() => {
      return import('/src/entities/TankEnemy.js').then(module => {
        const TankEnemy = module.TankEnemy;
        // Create a canvas element for the test
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 200;
        
        const enemy = new TankEnemy(canvas, 2);
        const initialX = enemy.x;
        
        // Apply knockback
        if (typeof enemy.applyKnockback === 'function') {
          enemy.applyKnockback(50);
          return {
            hasMethod: true,
            initialX,
            newX: enemy.x,
            pushed: enemy.x > initialX
          };
        }
        return { hasMethod: false };
      }).catch(err => ({ hasMethod: false, error: err.message }));
    });

    expect(hasKnockback.hasMethod).toBe(true);
    expect(hasKnockback.pushed).toBe(true);
  });

  test('Water Cannon upgrade descriptions are available', async ({ page }) => {
    const descriptions = await page.evaluate(() => {
      if (window.game && window.game.upgradeSystem) {
        const levels = [];
        for (let i = 0; i <= 5; i++) {
          levels.push(window.game.upgradeSystem.getUpgradeDescription('push', i));
        }
        return levels;
      }
      return [];
    });

    expect(descriptions.length).toBe(6);
    expect(descriptions[0]).toContain('Unlock Water Cannon');
    expect(descriptions[1]).toContain('Knockback');
    expect(descriptions[5]).toContain('Ultimate Blast');
  });
});

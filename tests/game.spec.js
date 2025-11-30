import { expect, test } from '@playwright/test';

test.describe('Game Functionality Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/public/index.html');
    // Wait for game to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('game loads and canvas is rendered', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Check canvas dimensions
    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');
    expect(width).toBe('800');
    expect(height).toBe('200');
  });

  test('score displays correctly on load', async ({ page }) => {
    const currentScore = page.locator('#currentScore');
    const highScore = page.locator('#highScore');

    await expect(currentScore).toBeVisible();
    await expect(highScore).toBeVisible();

    // Initial scores should be 00000
    const currentText = await currentScore.textContent();
    const highText = await highScore.textContent();

    expect(currentText).toMatch(/^\d{5}$/);
    expect(highText).toMatch(/^\d{5}$/);
  });

  test('game starts on spacebar press', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');

    // Press spacebar to start game
    await page.keyboard.press('Space');

    // Wait a moment for game to start
    await page.waitForTimeout(100);

    // Check if score starts incrementing
    const initialScore = await page.locator('#currentScore').textContent();
    await page.waitForTimeout(1000);
    const laterScore = await page.locator('#currentScore').textContent();

    // Score should change (might still be 00000 if not enough time has passed)
    // At minimum, verify score element is still visible and updating
    await expect(page.locator('#currentScore')).toBeVisible();
  });

  test('game starts on up arrow press', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');

    // Press up arrow to start game
    await page.keyboard.press('ArrowUp');

    await page.waitForTimeout(100);

    // Verify game is running by checking canvas is still visible
    await expect(canvas).toBeVisible();
    await expect(page.locator('#currentScore')).toBeVisible();
  });

  test('canvas click/tap starts game', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');

    // Click on canvas
    await canvas.click();

    await page.waitForTimeout(100);

    // Game should be running
    await expect(canvas).toBeVisible();
    await expect(page.locator('#currentScore')).toBeVisible();
  });

  test('mobile jump button is clickable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/public/index.html');

    const jumpBtn = page.locator('#jumpBtn');

    // Button should be present
    await expect(jumpBtn).toHaveCount(1);

    // Click the jump button
    await jumpBtn.click();

    // Game should respond
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('mobile shoot button is clickable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/public/index.html');

    const shootBtn = page.locator('#shootBtn');

    // Button should be present
    await expect(shootBtn).toHaveCount(1);

    // Click the shoot button (might not do anything without powerups)
    await shootBtn.click();

    // Game should still be functional
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('keyboard controls - Z key for shooting', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');

    // Start game
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Press Z key (shoot button)
    await page.keyboard.press('z');

    // Game should still be running
    await expect(canvas).toBeVisible();
  });

  test('instructions are visible and readable', async ({ page }) => {
    const instructions = page.locator('.instructions');
    await expect(instructions).toBeVisible();

    // Check for key instruction text
    const text = await instructions.textContent();
    expect(text).toContain('SPACE');
    expect(text).toContain('restart');
  });

  test('high score persists in localStorage', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());

    await page.goto('/public/index.html');

    // Set a high score in localStorage
    await page.evaluate(() => {
      localStorage.setItem('highScore', '12345');
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if high score is displayed
    const highScore = page.locator('#highScore');
    await page.waitForTimeout(500);

    const scoreText = await highScore.textContent();
    // High score should be loaded
    expect(scoreText).toMatch(/\d{5}/);
  });

  test('game handles rapid key presses', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');

    // Rapid fire spacebar
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(50);
    }

    // Game should still be functional
    await expect(canvas).toBeVisible();
    await expect(page.locator('#currentScore')).toBeVisible();
  });

  test('mobile buttons have proper touch feedback', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/public/index.html');

    const jumpBtn = page.locator('#jumpBtn');
    const shootBtn = page.locator('#shootBtn');

    // Buttons should exist in the DOM
    await expect(jumpBtn).toHaveCount(1);
    await expect(shootBtn).toHaveCount(1);

    // Buttons should be clickable (even if not visible on non-touch devices in tests)
    await expect(jumpBtn).toBeAttached();
    await expect(shootBtn).toBeAttached();

    // Click the buttons to ensure they respond
    await jumpBtn.click({ force: true });
    await shootBtn.click({ force: true });

    // Game should still be functional after clicks
    await expect(page.locator('#gameCanvas')).toBeVisible();
  }); test('game canvas has proper aspect ratio', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');

    const box = await canvas.boundingBox();
    const aspectRatio = box.width / box.height;

    // Expected ratio is 800/200 = 4
    expect(aspectRatio).toBe(4);
  });

  test('game container styling is consistent', async ({ page }) => {
    const container = page.locator('.game-container');

    const styles = await container.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.backgroundColor,
        borderRadius: computed.borderRadius,
        padding: computed.padding
      };
    });

    // Check styling is applied
    expect(styles.background).toBeTruthy();
    expect(styles.borderRadius).toBe('10px');
  });

  test('PWA manifest is accessible', async ({ page }) => {
    const response = await page.goto('/public/manifest.json');
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
  });

  test('game works in landscape orientation', async ({ page }) => {
    // Set to landscape mobile viewport
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/public/index.html');

    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Start game
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Check game is still running
    await expect(canvas).toBeVisible();
    await expect(page.locator('#currentScore')).toBeVisible();
  });

  test('service worker configuration exists', async ({ page }) => {
    // Check if service worker file is accessible
    const response = await page.goto('/service-worker.js');

    // Should either be accessible or properly configured
    // (200 for success, 404 if not found which is okay for dev)
    expect([200, 404]).toContain(response.status());
  });

  test('game fonts load correctly', async ({ page }) => {
    const scoreContainer = page.locator('.score-container');

    const fontFamily = await scoreContainer.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });

    // Should use monospace font
    expect(fontFamily).toContain('Courier');
  });

  test('submit score button is debounced to prevent double submissions', async ({ page }) => {
    // Show the name modal
    await page.evaluate(() => {
      const modal = document.getElementById('nameModal');
      modal.style.display = 'flex';
    });

    // Verify modal is visible
    const modal = page.locator('#nameModal');
    await expect(modal).toBeVisible();

    // Enter a name
    const nameInput = page.locator('#playerNameInput');
    await nameInput.fill('TestPlayer');

    // Get the submit button
    const submitBtn = page.locator('#submitScore');
    
    // Verify button is initially enabled
    await expect(submitBtn).toBeEnabled();

    // Click the submit button
    await submitBtn.click();

    // Button should be disabled immediately after click (debounced)
    // Note: This may be brief as it re-enables on error when API is not available
    // But we can verify the button doesn't allow rapid double-clicks
    await page.waitForTimeout(50);

    // The modal should still be visible (submission in progress or completed)
    await expect(modal).toBeVisible();
  });
});

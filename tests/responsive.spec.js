import { expect, test } from '@playwright/test';

test.describe('Responsive Layout Tests', () => {

  test('desktop viewport - all elements visible and properly sized', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/public/index.html');

    // Check canvas is visible and has correct dimensions
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    const canvasBox = await canvas.boundingBox();
    // Canvas should be sized appropriately for desktop (not hardcoded to 800x200)
    expect(canvasBox.width).toBeGreaterThan(600);
    expect(canvasBox.width).toBeLessThanOrEqual(1400);

    // Check score container is visible
    await expect(page.locator('.score-container')).toBeVisible();
    await expect(page.locator('#highScore')).toBeVisible();
    await expect(page.locator('#currentScore')).toBeVisible();

    // Check instructions are visible
    await expect(page.locator('.instructions')).toBeVisible();

    // Mobile jump button should exist
    const jumpBtn = page.locator('#jumpBtn');
    await expect(jumpBtn).toHaveCount(1);
  });

  test('mobile portrait - elements should be accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/public/index.html');

    // Canvas should be visible but might need scrolling
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Score container should be visible
    await expect(page.locator('.score-container')).toBeVisible();

    // Check that game container doesn't overflow
    const gameContainer = page.locator('.game-container');
    const containerBox = await gameContainer.boundingBox();

    // Container should not be wider than viewport
    expect(containerBox.width).toBeLessThanOrEqual(375);

    // Mobile jump button should be present
    await expect(page.locator('#jumpBtn')).toHaveCount(1);
  });

  test('mobile landscape - game should fit without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 }); // iPhone SE landscape
    await page.goto('/public/index.html');

    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Check if canvas fits in viewport
    const canvasBox = await canvas.boundingBox();
    const viewportSize = page.viewportSize();

    // Canvas should be visible within viewport
    expect(canvasBox.y + canvasBox.height).toBeLessThanOrEqual(viewportSize.height);

    // Score should be visible
    await expect(page.locator('.score-container')).toBeVisible();

    // Mobile jump button should be accessible
    await expect(page.locator('#jumpBtn')).toHaveCount(1);
  });

  test('tablet portrait - layout should be comfortable', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/public/index.html');

    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // All UI elements should be visible
    await expect(page.locator('.score-container')).toBeVisible();
    await expect(page.locator('.instructions')).toBeVisible();

    // Check canvas is properly centered
    const canvasBox = await canvas.boundingBox();
    const gameContainer = page.locator('.game-container');
    const containerBox = await gameContainer.boundingBox();

    // Canvas should be roughly centered in container
    const canvasCenterX = canvasBox.x + canvasBox.width / 2;
    const containerCenterX = containerBox.x + containerBox.width / 2;
    expect(Math.abs(canvasCenterX - containerCenterX)).toBeLessThan(50);
  });

  test('tablet landscape - should not cut off content', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); // iPad landscape
    await page.goto('/public/index.html');

    // All elements should be visible without scrolling
    const canvas = page.locator('#gameCanvas');
    const scoreContainer = page.locator('.score-container');
    const instructions = page.locator('.instructions');

    await expect(canvas).toBeVisible();
    await expect(scoreContainer).toBeVisible();
    await expect(instructions).toBeVisible();

    // Check that game container fits in viewport
    const gameContainer = page.locator('.game-container');
    const containerBox = await gameContainer.boundingBox();
    const viewportSize = page.viewportSize();

    expect(containerBox.height).toBeLessThanOrEqual(viewportSize.height);
  });

  test('small mobile - content should not overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE (1st gen)
    await page.goto('/public/index.html');

    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Check canvas doesn't cause horizontal scroll - now supports smaller sizes
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox.width).toBeLessThanOrEqual(320);
    expect(canvasBox.width).toBeGreaterThanOrEqual(280); // Minimum responsive size

    // Game container should fit
    const gameContainer = page.locator('.game-container');
    const containerBox = await gameContainer.boundingBox();
    expect(containerBox.width).toBeLessThanOrEqual(320);
  });

  test('ultra-wide desktop - content should be centered', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/public/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Canvas should maintain its size
    const canvas = page.locator('#gameCanvas');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox.width).toBe(800);
    expect(canvasBox.height).toBe(200);

    // Game should be centered on page
    const bodyWidth = await page.evaluate(() => document.body.clientWidth);
    expect(canvasBox.x).toBeGreaterThan(bodyWidth / 4);
  });

  test('mobile button positioning', async ({ page }) => {
    // Test portrait mode - button should be below canvas
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/public/index.html');

    const jumpBtn = page.locator('#jumpBtn');
    const canvas = page.locator('#gameCanvas');
    const mobileControls = page.locator('.mobile-controls');

    const canvasBox = await canvas.boundingBox();
    const controlsBox = await mobileControls.boundingBox();

    // In portrait mode, button should be below the canvas
    expect(controlsBox.y).toBeGreaterThan(canvasBox.y + canvasBox.height);

    // Jump button should be visible
    await expect(jumpBtn).toBeVisible();
  });

  test('mobile button positioning - landscape mode', async ({ page }) => {
    // Test landscape mode - button should be visible
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/public/index.html');

    const jumpBtn = page.locator('#jumpBtn');

    // Jump button should be visible in landscape
    await expect(jumpBtn).toBeVisible();

    // Button should be visible and clickable
    await expect(jumpBtn).toBeEnabled();
  });
});

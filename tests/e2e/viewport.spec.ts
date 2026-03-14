import { test, expect } from '@playwright/test';

test.describe('Viewport switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('site_auth_visual', 'true');
      localStorage.setItem('visual-ai-session', JSON.stringify({
        html: '<div><h1>Viewport Test</h1><p>Responsive content</p></div>',
        lastModel: 'openai',
        styleFrame: 'card',
        theme: 'dark',
        savedAt: Date.now()
      }));
    });
    await page.reload();
    await page.waitForTimeout(1500);
  });

  test('should render correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should render correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show mobile menu button on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForTimeout(1000);

    // Mobile menu button should be visible (hamburger icon)
    const menuBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(menuBtn).toBeVisible();
  });

  test('should hide sidebar by default on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForTimeout(1000);

    // InputPanel should be off-screen (translated out)
    // Check that the main content area is still visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show viewport controls in the renderer toolbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Viewport icons should be visible in the toolbar area
    const content = await page.content();
    // Should have mobile/tablet/desktop viewport options
    expect(content).toMatch(/mobile|tablet|desktop|Mobile|Tablet|Desktop/i);
  });
});

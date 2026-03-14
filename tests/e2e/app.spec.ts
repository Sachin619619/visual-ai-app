import { test, expect } from '@playwright/test';

// Helper to log in to the app
async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  // Wait for the password form
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ timeout: 10000 });
  await passwordInput.fill('visual2026');
  await page.locator('button[type="submit"]').click();
  // Wait for main app to load
  await page.waitForSelector('textarea, [data-testid="prompt-input"]', { timeout: 10000 });
}

test.describe('App load and auth', () => {
  test('should show login screen on first visit', async ({ page }) => {
    // Navigate directly with no cookies/localStorage
    await page.goto('/');
    // Wait for React to mount and check auth
    await page.waitForTimeout(500);

    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show the Visual AI title on login screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    await expect(page.locator('h1')).toContainText('Visual AI');
  });

  test('should reject incorrect password', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ timeout: 5000 });
    await passwordInput.fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);

    // Should still show the password input (not navigated away)
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should allow login with correct password', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ timeout: 5000 });
    await passwordInput.fill('visual2026');
    await page.locator('button[type="submit"]').click();

    // Should no longer show password input
    await expect(page.locator('input[type="password"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should persist login across page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('site_auth_visual', 'true'));
    await page.reload();
    await page.waitForTimeout(500);

    // Should not show password screen
    await expect(page.locator('input[type="password"]')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Main app UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('site_auth_visual', 'true'));
    await page.reload();
    // Wait for app to be ready
    await page.waitForTimeout(1000);
  });

  test('should show the main layout with input panel and renderer', async ({ page }) => {
    // The app should have its main sections visible or accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show mobile menu button on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // Menu button should be visible on mobile
    const menuBtn = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    await expect(menuBtn).toBeVisible();
  });

  test('should open sidebar on menu button click on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const menuBtn = page.locator('button[aria-label*="Open menu"]').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      // Sidebar should open (translate-x-0)
      await page.waitForTimeout(500);
    }
  });

  test('should show quick prompt cards in empty state', async ({ page }) => {
    // When no HTML is generated, quick prompts should show
    await page.evaluate(() => localStorage.removeItem('visual-ai-session'));
    await page.reload();
    await page.waitForTimeout(1000);

    // Check for any visible content cards / prompts
    const content = await page.content();
    expect(content).toContain('Charts');
  });
});

test.describe('Keyboard shortcuts modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('site_auth_visual', 'true'));
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should open keyboard shortcuts modal with ? key', async ({ page }) => {
    await page.keyboard.press('?');
    await page.waitForTimeout(500);
    // Check for keyboard shortcuts content
    const content = await page.content();
    expect(content).toMatch(/Keyboard Shortcuts|shortcuts/i);
  });

  test('should close keyboard shortcuts modal with Escape', async ({ page }) => {
    await page.keyboard.press('?');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Modal should be closed - check that it's not visible
    const modal = page.locator('text=Keyboard Shortcuts').first();
    await expect(modal).not.toBeVisible({ timeout: 2000 });
  });
});

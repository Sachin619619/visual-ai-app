import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('site_auth_visual', 'true');
      localStorage.removeItem('visual-ai-theme');
    });
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should default to dark theme', async ({ page }) => {
    // Dark theme: html should NOT have class "light"
    const hasLightClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('light');
    });
    expect(hasLightClass).toBe(false);
  });

  test('should toggle to light theme when theme button is clicked', async ({ page }) => {
    // Use keyboard shortcut Ctrl+B to toggle theme
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(300);

    // After toggle, should have light class
    const hasLightClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('light');
    });
    expect(hasLightClass).toBe(true);
  });

  test('should toggle back to dark theme', async ({ page }) => {
    // Toggle to light
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(300);
    // Toggle back to dark
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(300);

    const hasLightClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('light');
    });
    expect(hasLightClass).toBe(false);
  });

  test('should persist theme preference in localStorage', async ({ page }) => {
    // Toggle theme with keyboard shortcut
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(300);

    const theme = await page.evaluate(() => localStorage.getItem('visual-ai-theme'));
    expect(theme).toBe('light');
  });

  test('should restore theme from localStorage on reload', async ({ page }) => {
    // Set the theme in localStorage and reload the page
    // We use evaluate before reload since page is already loaded from beforeEach
    await page.evaluate(() => {
      localStorage.setItem('visual-ai-theme', 'light');
      localStorage.setItem('site_auth_visual', 'true');
    });
    await page.reload();
    // Wait for React to mount and apply theme
    await page.waitForTimeout(2000);

    // Check that light class is applied using evaluate (handles null classAttr case)
    const hasLightClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('light');
    });
    expect(hasLightClass).toBe(true);
  });
});

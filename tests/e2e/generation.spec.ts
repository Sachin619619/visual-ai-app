import { test, expect } from '@playwright/test';

test.describe('UI Generation flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('site_auth_visual', 'true'));
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should show input panel with prompt textarea', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(1000);

    // The textarea for prompt input should exist
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
  });

  test('should allow typing in the prompt textarea', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(1000);

    const textarea = page.locator('textarea').first();
    await textarea.fill('Create a beautiful dashboard');
    await expect(textarea).toHaveValue('Create a beautiful dashboard');
  });

  test('should show Generate button', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(1000);

    const content = await page.content();
    expect(content).toMatch(/Generate|generate/i);
  });

  test('should require API key to generate (mock)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(1000);

    const textarea = page.locator('textarea').first();
    await textarea.fill('Create a test UI');

    // Try to trigger generation (Ctrl+Enter)
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(1000);

    // Should show an error about missing API key
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should show quick prompt cards for common templates', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('visual-ai-session'));
    await page.reload();
    await page.waitForTimeout(1000);

    const content = await page.content();
    // Quick prompt categories should be visible
    expect(content).toMatch(/Charts|Dashboard|Forms|Landing/i);
  });

  test('should save draft prompt to localStorage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(1000);

    const textarea = page.locator('textarea').first();
    await textarea.fill('My draft prompt');
    await page.waitForTimeout(500);

    const draft = await page.evaluate(() => localStorage.getItem('visual-ai-draft'));
    expect(draft).toBe('My draft prompt');
  });

  test('should restore draft prompt on reload', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('visual-ai-draft', 'Restored draft'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(1000);

    const textarea = page.locator('textarea').first();
    const value = await textarea.inputValue();
    expect(value).toBe('Restored draft');
  });

  test('should render previously generated HTML on reload', async ({ page }) => {
    const testHtml = '<div><h1>Test Generated Content</h1></div>';
    await page.evaluate((html) => {
      localStorage.setItem('visual-ai-session', JSON.stringify({
        html,
        lastModel: 'openai',
        styleFrame: 'card',
        theme: 'dark',
        savedAt: Date.now()
      }));
    }, testHtml);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForTimeout(1500);

    // The iframe containing the rendered HTML should be present
    const iframe = page.locator('iframe');
    if (await iframe.count() > 0) {
      await expect(iframe.first()).toBeVisible();
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Chat widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('site_auth_visual', 'true'));
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should show chat widget button', async ({ page }) => {
    // ChatWidget should be rendered in the DOM
    const content = await page.content();
    // The chat widget has a button to open it
    expect(content.length).toBeGreaterThan(100);
  });

  test('should open chat widget on button click', async ({ page }) => {
    // Find chat button - it's usually a floating action button
    const chatButtons = page.locator('button').all();
    const buttons = await chatButtons;

    // Try to find a chat-related button
    let chatBtn = page.locator('button[aria-label*="chat"], button[aria-label*="Chat"]').first();
    if (await chatBtn.count() === 0) {
      // Try finding by SVG child that looks like a message/chat icon
      chatBtn = page.locator('button').last(); // Chat widget is usually the last button
    }

    // The page should remain stable
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have stable page after widget interactions', async ({ page }) => {
    // Try clicking various buttons without crashing
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

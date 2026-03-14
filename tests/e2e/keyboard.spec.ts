import { test, expect } from '@playwright/test';

test.describe('Keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('site_auth_visual', 'true'));
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should open keyboard shortcuts modal with ? key', async ({ page }) => {
    await page.keyboard.press('?');
    await page.waitForTimeout(500);
    const content = await page.content();
    expect(content).toMatch(/Keyboard Shortcuts|Generate UI|Undo|Redo/i);
  });

  test('should show all keyboard shortcuts in the modal', async ({ page }) => {
    await page.keyboard.press('?');
    await page.waitForTimeout(500);
    const content = await page.content();
    // All the major shortcuts should be listed
    expect(content).toMatch(/Enter/);
    expect(content).toMatch(/Undo|undo/);
    expect(content).toMatch(/Export|export/i);
  });

  test('should close shortcuts modal with Escape', async ({ page }) => {
    await page.keyboard.press('?');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const shortcutsModal = page.locator('text=Keyboard Shortcuts');
    await expect(shortcutsModal).not.toBeVisible({ timeout: 2000 });
  });

  test('should close shortcuts modal by clicking outside', async ({ page }) => {
    await page.keyboard.press('?');
    await page.waitForTimeout(300);

    // Click on the overlay (outside the modal)
    await page.mouse.click(10, 10);
    await page.waitForTimeout(300);

    const shortcutsModal = page.locator('text=Keyboard Shortcuts');
    await expect(shortcutsModal).not.toBeVisible({ timeout: 2000 });
  });

  test('should handle Ctrl+L (clear canvas) without crash', async ({ page }) => {
    await page.keyboard.press('Control+l');
    await page.waitForTimeout(300);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle Ctrl+B (toggle theme) without crash', async ({ page }) => {
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(300);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle Ctrl+S (share) without crash', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(300);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle Ctrl+Z (undo) without crash', async ({ page }) => {
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(300);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle Ctrl+Y (redo) without crash', async ({ page }) => {
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(300);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test('smoke test - app loads and displays title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Northstar');
});

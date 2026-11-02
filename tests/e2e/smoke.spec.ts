import { test, expect } from '@playwright/test';

test('smoke test - app loads today route and redirects from root', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.*today/);
  await expect(page.locator('h1')).toHaveText('Today');
});

test('navigation - can navigate to inbox', async ({ page }) => {
  await page.goto('/inbox');
  await expect(page.locator('h1')).toHaveText('Inbox');
});

test('dev route - kitchen sink loads', async ({ page }) => {
  await page.goto('/dev/kitchen-sink');
  await expect(page.locator('h1')).toHaveText('Component Kitchen Sink');
});

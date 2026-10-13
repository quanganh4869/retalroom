import { test, expect } from '@playwright/test';

test.describe('RentFlow Properties E2E Flow', () => {
  test('loads home page and shows properties header', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RentFlow/);
    await expect(page.locator('h1')).toContainText('Properties Management');
  });

  test('toggles add property form', async ({ page }) => {
    await page.goto('/');
    const addBtn = page.getByRole('button', { name: /\+ Add Property/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('h3')).toContainText('Add New Property');
    }
  });
});

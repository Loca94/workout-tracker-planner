import { expect, test } from '@playwright/test';

test('dev pages are hidden in a production build', async ({ page }) => {
	const response = await page.goto('/dev/timeline');

	expect(response?.status()).toBe(404);
});

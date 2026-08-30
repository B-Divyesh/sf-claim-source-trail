import { expect, test } from '@playwright/test';

test('advertised Instructor kit checkout reaches Dodo @claim:paid-checkout', async ({ page, request }) => {
  await page.goto('/');
  const checkout = page.getByRole('link', { name: 'Buy Instructor kit' });
  const href = await checkout.getAttribute('href');
  expect(href).toBe('https://api.sociobot.in/api/v1/products/claim-source-trail/checkout');

  let response = await request.get(href!, { maxRedirects: 0 });
  await expect.poll(async () => {
    if (response.status() === 303) return response.status();
    response = await request.get(href!, { maxRedirects: 0 });
    return response.status();
  }, { timeout: 60_000, intervals: [1_000, 2_000, 5_000, 10_000] }).toBe(303);
  expect(new URL(response.headers().location!).origin).toBe('https://checkout.dodopayments.com');
});

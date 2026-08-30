import { expect, test } from '@playwright/test';

test('advertised Instructor kit checkout reaches Dodo @claim:paid-checkout', async ({ page, request }) => {
  await page.goto('/');
  const checkout = page.getByRole('link', { name: 'Buy Instructor kit' });
  const href = await checkout.getAttribute('href');
  expect(href).toBe('https://api.sociobot.in/api/v1/products/claim-source-trail/checkout');

  const response = await request.get(href!, { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(new URL(response.headers().location!).origin).toBe('https://checkout.dodopayments.com');
});

const product = 'claim-source-trail';
const base = 'https://api.sociobot.in/api/v1';

const catalogue = await fetch(`${base}/products`);
if (!catalogue.ok) throw new Error(`Product catalogue returned HTTP ${catalogue.status}.`);
const registered = (await catalogue.json()).data?.find((item) => item.slug === product);
if (!registered || registered.price_minor !== 1800 || registered.currency !== 'USD') {
  throw new Error('Claim Source Trail is not registered as the advertised $18 USD product.');
}

const response = await fetch(`${base}/products/${product}/checkout`, { redirect: 'manual' });
const location = response.headers.get('location');
if (response.status !== 303 || !location || new URL(location).origin !== 'https://checkout.dodopayments.com') {
  throw new Error(`Checkout must return a Dodo 303 redirect, received HTTP ${response.status} to ${location || 'no location'}.`);
}

console.log(`Billing check passed: ${product} is $${(registered.price_minor / 100).toFixed(2)} USD and checkout redirects to Dodo.`);

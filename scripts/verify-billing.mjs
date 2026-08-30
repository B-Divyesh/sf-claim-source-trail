const product = 'claim-source-trail';
const base = 'https://api.sociobot.in/api/v1';

async function fetchAvailable(url, options = {}) {
  let response;
  for (const delay of [0, 1_000, 2_000, 5_000, 10_000]) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    response = await fetch(url, options);
    if (response.status < 500) return response;
  }
  return response;
}

const catalogue = await fetchAvailable(`${base}/products`);
if (!catalogue.ok) throw new Error(`Product catalogue returned HTTP ${catalogue.status}.`);
const registered = (await catalogue.json()).data?.find((item) => item.slug === product);
if (!registered || registered.price_minor !== 1800 || registered.currency !== 'USD') {
  throw new Error('Claim Source Trail is not registered as the advertised $18 USD product.');
}

const response = await fetchAvailable(`${base}/products/${product}/checkout`, { redirect: 'manual' });
const location = response.headers.get('location');
if (response.status !== 303 || !location || new URL(location).origin !== 'https://checkout.dodopayments.com') {
  throw new Error(`Checkout must return a Dodo 303 redirect, received HTTP ${response.status} to ${location || 'no location'}.`);
}

const verification = await fetchAvailable(`${base}/products/${product}/verify?license=invalid-health-check`);
if (!verification.ok) throw new Error(`License verification returned HTTP ${verification.status}.`);
const verdict = await verification.json();
if (verdict.valid !== false) throw new Error('The invalid health-check license unexpectedly verified.');

console.log(`Billing check passed: ${product} is $${(registered.price_minor / 100).toFixed(2)} USD; checkout redirects to Dodo; verification responds.`);

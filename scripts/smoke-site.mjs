// Read-only propagation check. A failure reports the deployed state; it never
// rolls back, rebuilds or changes hosting settings.
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const originArgument = args[args.indexOf('--origin') + 1];
if (!args.includes('--origin') || !originArgument) throw new Error('Usage: node scripts/smoke-site.mjs --origin https://boozeonhormuz.com [--attempts 1]');
const origin = new URL(originArgument);
const local = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
if (origin.protocol !== 'https:' && !(local && origin.protocol === 'http:')) throw new Error('Use HTTPS for a deployed site. HTTP is supported only on loopback for local verification.');
if (origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/') throw new Error('Provide an origin without credentials, path, query or fragment.');
const attempts = args.includes('--attempts') ? Number(args[args.indexOf('--attempts') + 1]) : 3;
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 3) throw new Error('Use one to three attempts.');
const domain = readFileSync(new URL('../public/CNAME', import.meta.url), 'utf8').trim();
if (domain !== 'boozeonhormuz.com') throw new Error('Unexpected repository CNAME. Review the domain before releasing.');
const routes = ['/', '/album/', '/watch/', '/watch/the-premiere/', '/listen/', '/archive/', '/play/', '/tools/broadcast-room/', '/tools/evidence-lounge-studio/', '/apps/broadcast-room.html', '/apps/evidence-lounge-studio.html', '/apps/exit-strategy.html', '/CNAME'];

async function inspect(route) {
  const response = await fetch(new URL(route, origin), { signal: AbortSignal.timeout(10_000), cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  if (!local && new URL(response.url).hostname !== domain) throw new Error(`${route}: final hostname is not the configured CNAME domain.`);
  if (route !== '/CNAME' && !response.headers.get('content-type')?.includes('text/html')) throw new Error(`${route}: expected HTML.`);
  const body = await response.text();
  if (route === '/CNAME' && body.trim() !== domain) throw new Error('/CNAME: published marker does not match the repository domain.');
  if (route === '/') {
    const links = [...body.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(([, key, value]) => [key.toLowerCase(), value])));
    if (!links.some((link) => link.rel === 'canonical' && link.href === `https://${domain}/`)) throw new Error('Homepage canonical does not match the apex domain.');
  }
  if (route === '/watch/the-premiere/' && (!body.includes('Za2XII66eHQ') || !body.includes('VideoObject'))) throw new Error('Premiere source or VideoObject is absent from the deployed page.');
  return `${route}: HTTP ${response.status}`;
}

for (let attempt = 1; attempt <= attempts; attempt++) {
  const results = await Promise.allSettled(routes.map(inspect));
  const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason.message);
  if (!errors.length) {
    console.log(`Smoke check passed: ${routes.length} routes, homepage canonical, premiere and CNAME/domain (${origin.origin}; attempt ${attempt}/${attempts}).`);
    break;
  }
  console.error(`Smoke attempt ${attempt}/${attempts}:\n${errors.join('\n')}`);
  if (attempt === attempts) {
    console.error('Deployment has already completed. Propagation or content verification failed; inspect the live site and Actions release record. No rollback or hosting mutation was attempted.');
    process.exitCode = 1;
  } else await new Promise((resolve) => setTimeout(resolve, 5_000));
}

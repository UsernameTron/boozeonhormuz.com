import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, join, dirname } from 'node:path';

export const criticalRoutes = [
  '/', '/album/', '/watch/', '/watch/the-premiere/', '/listen/', '/archive/',
  '/play/', '/tools/broadcast-room/', '/tools/evidence-lounge-studio/',
  '/apps/broadcast-room.html', '/apps/evidence-lounge-studio.html', '/apps/exit-strategy.html',
];
const site = 'https://boozeonhormuz.com';
const root = resolve(process.argv[2] ?? 'dist');
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const routeFile = (path) => {
  const file = join(root, decodeURIComponent(path));
  return existsSync(file) && statSync(file).isFile() ? file : join(file, 'index.html');
};
assert.equal(readFileSync(join(root, 'CNAME'), 'utf8').trim(), 'boozeonhormuz.com');
for (const route of [...criticalRoutes, '/experience/']) assert.ok(existsSync(routeFile(route)), `Missing route: ${route}`);
assert.ok(existsSync(join(root, 'sitemap-index.xml')), 'Missing sitemap index');
const files = walk(root);
const sitemap = files.filter((f) => /sitemap.*\.xml$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
for (const route of criticalRoutes.filter((r) => !r.startsWith('/apps/'))) {
  assert.ok(sitemap.includes(site + route) || sitemap.includes(site + route.replace(/\/$/, '')), `Missing sitemap route ${route}`);
}
let references = 0;
const broken = [];
for (const file of files.filter((f) => /\.(html|css)$/.test(f))) {
  const content = readFileSync(file, 'utf8');
  assert.doesNotMatch(content, /Fixture(?:\s|%20|&#32;)/, 'Fixture content leaked into production output');
  const rel = relative(root, file).replaceAll('\\', '/');
  const route = '/' + rel.replace(/index\.html$/, '');
  if (file.endsWith('.html') && !rel.startsWith('apps/')) {
    const canonical = content.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)/i)?.[1];
    assert.equal(canonical, site + route, `Unexpected canonical for ${route}`);
  }
  const refs = [...content.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/g)].map((m) => m[1]);
  refs.push(...[...content.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)].map((m) => m[1]));
  for (const match of content.matchAll(/\bsrcset=["']([^"']+)["']/g)) {
    refs.push(...match[1].split(',').map((s) => s.trim().split(/\s+/)[0]));
  }
  for (const ref of refs) {
    if (/^(?:#|data:|blob:|javascript:|mailto:|tel:)/i.test(ref) || ref.includes('${')) continue;
    let url;
    try { url = new URL(ref.replaceAll('&amp;', '&'), site + route); } catch { continue; }
    if (url.origin !== site) continue;
    references++;
    if (!existsSync(routeFile(url.pathname))) broken.push(`${rel}: ${ref}`);
  }
}
assert.deepEqual([...new Set(broken)], [], 'Broken local references');
const premiere = readFileSync(routeFile('/watch/the-premiere/'), 'utf8');
assert.match(premiere, /Za2XII66eHQ/, 'Premiere source changed unexpectedly');
assert.match(premiere, /VideoObject/, 'Premiere structured data missing');
const lighthouse = JSON.parse(readFileSync(resolve('lighthouserc.json'), 'utf8'));
const measured = lighthouse.ci.collect.url.map((url) => new URL(url).pathname);
for (const route of criticalRoutes) assert.ok(measured.includes(route), `Lighthouse misses ${route}`);
console.log(`Output OK: ${files.filter((f) => f.endsWith('.html')).length} HTML files, ${references} local references, domain, canonical tags, sitemap and ${criticalRoutes.length} explicit audit routes.`);

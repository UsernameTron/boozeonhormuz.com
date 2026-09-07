import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Additive, local-only generation: original public URLs and bytes never change.
// The hash includes encoding settings to make cache invalidation deterministic.
const root = fileURLToPath(new URL('../', import.meta.url));
const publicDir = path.join(root, 'public');
const settings = { widths: [320, 640, 960, 1280], quality: 80, effort: 5 };
const skipped = new Set(['_media', 'apps', 'fonts']);
async function images(dir) {
  const files = [];
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.isDirectory() && !skipped.has(entry.name)) files.push(...await images(path.join(dir, entry.name)));
    else if (entry.isFile() && /\.(webp|jpe?g|png)$/i.test(entry.name) && !/^(favicon|apple-touch-icon|og-)/.test(entry.name)) files.push(path.join(dir, entry.name));
  }
  return files;
}
await mkdir(path.join(publicDir, '_media'), { recursive: true });
const manifest = {};
for (const file of await images(publicDir)) {
  const original = await readFile(file);
  const metadata = await sharp(original).metadata();
  if (!metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) continue;
  const rotated = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  const sourceHash = createHash('sha256').update(original).digest('hex');
  const hash = createHash('sha256').update(original).update(JSON.stringify(settings)).digest('hex').slice(0, 16);
  const source = '/' + path.relative(publicDir, file).split(path.sep).join('/');
  const candidates = [];
  for (const size of [...new Set(settings.widths.map((n) => Math.min(n, width)))]) {
    const output = await sharp(original).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: settings.quality, effort: settings.effort }).toBuffer({ resolveWithObject: true });
    const src = `/_media/${hash}-${size}.webp`;
    await writeFile(path.join(publicDir, src), output.data);
    candidates.push({ src, width: output.info.width, height: output.info.height, bytes: output.data.length });
  }
  manifest[source] = { width, height, bytes: original.length, sha256: sourceHash, candidates };
}
await writeFile(path.join(root, 'src/lib/generated-media.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Responsive media: ${Object.keys(manifest).length} originals, ${Object.values(manifest).reduce((n, image) => n + image.candidates.length, 0)} WebP variants.`);

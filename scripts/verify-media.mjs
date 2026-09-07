import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'src/lib/generated-media.json'), 'utf8'));
for (const [src, asset] of Object.entries(manifest)) {
  const original = await readFile(path.join(root, 'public', src));
  assert.equal(createHash('sha256').update(original).digest('hex'), asset.sha256, `${src}: original changed`);
  assert.equal(original.length, asset.bytes);
  assert.ok(asset.candidates.length > 0);
  for (const candidate of asset.candidates) {
    assert.ok(candidate.width <= asset.width, `${src}: no upscaling`);
    assert.ok(candidate.src.startsWith('/_media/'));
    const derivative = await readFile(path.join(root, 'public', candidate.src));
    const metadata = await sharp(derivative).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, candidate.width);
    assert.equal(metadata.height, candidate.height);
    assert.equal(derivative.length, candidate.bytes);
    assert.ok(Math.abs(candidate.height - candidate.width * asset.height / asset.width) <= 1, `${src}: aspect ratio changed`);
  }
}
console.log(`Verified ${Object.keys(manifest).length} source hashes, responsive dimensions, WebP files, and no upscaling.`);

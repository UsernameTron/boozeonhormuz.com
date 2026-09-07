import manifest from './generated-media.json';
import { statSync } from 'node:fs';
import path from 'node:path';

export type MediaDimensions = { width: number; height: number };
export type ResponsiveAsset = MediaDimensions & {
  bytes: number;
  sha256: string;
  candidates: (MediaDimensions & { src: string; bytes: number })[];
};

// The build scans public images. Known missing local files render a placeholder
// immediately, avoiding a broken request and a layout-changing error flash.
export function mediaImageSource(src?: string) {
  if (src?.startsWith('/') && !src.startsWith('//')) {
    const root = path.resolve('public');
    const file = path.resolve(root, '.' + src.split(/[?#]/)[0]);
    if (!file.startsWith(root + path.sep)) return undefined;
    try { if (!statSync(file).isFile()) return undefined; } catch { return undefined; }
  }
  return src;
}

export function responsiveImage(src?: string) {
  const asset = src ? (manifest as Record<string, ResponsiveAsset>)[src] : undefined;
  return {
    width: asset?.width,
    height: asset?.height,
    srcset: asset?.candidates.map((candidate) => `${candidate.src} ${candidate.width}w`).join(', '),
  };
}

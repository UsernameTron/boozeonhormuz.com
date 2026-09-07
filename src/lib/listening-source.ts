// Build-only source identity: replacing a local file at the same URL invalidates
// its old saved position. Remote sources use their URL (including version query).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export function listeningSourceVersion(source: string, publicRoot = path.resolve('public')) {
  if (!source.startsWith('/') || source.startsWith('//')) return source;
  try {
    const root = path.resolve(publicRoot);
    const file = path.resolve(root, '.' + decodeURIComponent(source.split(/[?#]/)[0]));
    if (!file.startsWith(root + path.sep)) return source;
    return createHash('sha256').update(readFileSync(file)).digest('hex');
  } catch { return source; }
}

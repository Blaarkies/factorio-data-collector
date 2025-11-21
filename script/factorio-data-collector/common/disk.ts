import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export async function getAsset(pathOrUrl: string): Promise<string> {
  if (pathOrUrl.startsWith('https')) {
    return fetch(pathOrUrl).then(r => r.text());
  }

  if (!existsSync(pathOrUrl)) {
    console.warn(`File not found at [${pathOrUrl}]`);
    return '0';
  }

  return readFileSync(pathOrUrl, 'utf8');
}


export function writeAsset(path: string, content: object) {
  writeFileSync(path,
    JSON.stringify(content, null, 2)
    , 'utf8');
}

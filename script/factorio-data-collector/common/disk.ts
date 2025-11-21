import {
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
  mkdirSync
} from 'node:fs';
import { getScriptPaths } from './path.ts';
import { join } from 'node:path';

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

function writeAsset(path: string, content: object) {
  writeFileSync(path,
    JSON.stringify(content, null, 2)
    , 'utf8');
}

type FileEntry = { name: string, data: object }

export function writeOutputs(...files: FileEntry[]) {
  let {pathToDataAsset} = getScriptPaths();
  if (existsSync(pathToDataAsset)) {
    rmSync(pathToDataAsset, {recursive: true});
  }

  mkdirSync(pathToDataAsset);

  for (let file of files) {
    writeAsset(join(pathToDataAsset, file.name), file.data);
  }
}

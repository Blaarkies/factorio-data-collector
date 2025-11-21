import { join, parse } from 'node:path';

let paths: { pathToRoot: string, pathToDataAsset: string, pathToHere: string };

export function getScriptPaths() {
  if (paths) {
    return {...paths};
  }

  let pathToRoot = process.cwd();
  let pathToDataAsset = join(pathToRoot, 'asset', 'factorio-data');
  let pathToHere = parse(process.argv[1]).dir;
  paths = {pathToRoot, pathToDataAsset, pathToHere};

  return {...paths};
}

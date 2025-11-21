import { join } from 'node:path';
import { arrayToHash } from './common/hash.ts';
import { getAsset, writeOutputs } from './common/disk.ts';
import { getScriptPaths } from './common/path.ts';
import { existsSync } from 'node:fs';
import type { EnrichedItem } from './enrich/type.ts';
import { collectData } from './collect-data.ts';

(async () => {
  let enrichedItems = await collectData();

  let {oldMetadata, metadata} = await getMetadata(enrichedItems);

  let newHash = JSON.stringify(metadata.hash);
  let oldHash = JSON.stringify(oldMetadata.hash);
  if (oldHash === newHash) {
    console.log('✅ Results are the same, no need to redeploy');
    process.exit(1);
  }

  writeOutputs(
    {name: 'enriched-items.json', data: enrichedItems},
    {name: 'metadata.json', data: metadata},
  );

  // TODO: run git commit
})();


type Metadata = { date: string; hash: { enrichedItems: number } };

async function getMetadata(enrichedItems: EnrichedItem[])
  : Promise<{ metadata: Metadata; oldMetadata: Metadata }> {
  let {pathToDataAsset} = getScriptPaths();

  let oldMetadataPath = join(pathToDataAsset, 'metadata.json');
  let oldMetadataString = existsSync(oldMetadataPath)
    ? await getAsset(oldMetadataPath)
    : '{}';
  let oldMetadata = JSON.parse(oldMetadataString);

  let metadata = {
    date: new Date().toISOString(),
    hash: {
      enrichedItems: arrayToHash(enrichedItems),
    },
  };

  return {oldMetadata, metadata};
}

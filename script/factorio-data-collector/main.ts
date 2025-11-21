import { join, parse } from 'node:path';
import {
  parseLua,
  processItem, requiredItemProperties,
  processRecipe, requiredRecipeProperties
} from './parser/index.ts';
import { arrayToHash } from './common/hash.ts';
import { getAsset, writeAsset } from './common/disk.ts';

awaiterFn();

async function awaiterFn() {
  let pathToMainAsset = join(process.cwd(), 'asset', 'factorio-data');
  let pathToHere = parse(process.argv[1]).dir;

// TODO: use github urls when stable
  let gitFD = join(pathToHere, 'mock-assets/');

  let itemB = gitFD + 'base/prototypes/item.lua';
  let itemSA = gitFD + 'space-age/prototypes/item.lua';
  let recipeB = gitFD + 'base/prototypes/recipe.lua';
  let recipeSA = gitFD + 'space-age/prototypes/recipe.lua';

  type Item = {}

  async function readItems(path: string): Promise<Item[]> {
    let content = await getAsset(path);
    return parseLua(content, requiredItemProperties, processItem);
  }

  type Recipe = {}

  async function readRecipes(path: string): Promise<Recipe[]> {
    let content = await getAsset(path);
    return parseLua(content, requiredRecipeProperties, processRecipe);
  }


  let allItems = await Promise.all(
    [itemB, itemSA].flatMap(p => readItems(p)));
  let items = allItems
    .filter(i => !i.hidden)
    .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

  let recipes = await Promise.all(
    [recipeB, recipeSA].flatMap(p => readRecipes(p)));


  let oldMetadataPath = join(pathToMainAsset, 'metadata.json');
  let oldMetadataString = await getAsset(oldMetadataPath);
  let oldMetadata = JSON.parse(oldMetadataString);

  let metadata = {
    date: new Date().toISOString(),
    hash: {
      items: arrayToHash(items),
      recipes: arrayToHash(recipes),
    },
  };

  let newHash = JSON.stringify(metadata.hash);
  let oldHash = JSON.stringify(oldMetadata.hash);
  if (oldHash === newHash) {
    console.log('✅ Results are the same, no need to redeploy');
    process.exit(1);
  }

  writeAsset(join(pathToMainAsset, 'metadata.json'), metadata);
  writeAsset(join(pathToMainAsset, 'items.json'), items);
  writeAsset(join(pathToMainAsset, 'recipes.json'), recipes);

// run git commit

}

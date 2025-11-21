import { Alternative, EnrichedItem } from '@script/enrich/type';
import { EnrichedAlternative } from '@app/page/sandbox/sandbox/type';

export function getEnrichedAlternative(
  recipe: Alternative, nameItemMap: Map<string, EnrichedItem>)
  : EnrichedAlternative {
  let ingredients = recipe.ingredients.map(i => {
    let ingredientDetails = nameItemMap.get(i.name);
    let ingredientRocketCapacity
      = i.weightRatio * ingredientDetails.rocketCapacity;
    return {
      ...i,
      ingredientRocketCapacity,
    };
  });

  let sample = ingredients[0];
  let craftCount = recipe.yield * sample.ingredientRocketCapacity / sample.amount;

  return {
    ...recipe,
    craftCount,
    ingredients,
  };
}


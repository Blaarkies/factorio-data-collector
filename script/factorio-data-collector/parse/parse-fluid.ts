import type { FactorioItem } from '../game-data/type.ts';
import {
  parseExpression,
  parseLua,
} from './parse-lua.ts';
import type { ValidProp } from './type-data.ts';
import type { TableConstructorExpressionValue } from './type-lua.ts';

type Fluid = {
  type: string
  name: string
  subgroup: string
  icon: string
  base_color: number[]
  flow_color: number[]
  auto_barrel?: boolean
}

// Fluid properties to keep
const requiredProperties: ValidProp[] = [
  'type',
  'name',
  'subgroup',
  'icon',
  'base_color',
  'flow_color',
  'auto_barrel',
];

export let fluidPerBarrel = 50;
export let barrelItemStackSize = 50;
export let energyPerEmpty = 0.2;

export function parseFluidFromContent(content: string): FactorioItem[] {
  let ast = parseLua(content);
  let body = (ast as any).body;
  let tableValues = body.at(-1).expression.arguments[0].fields as
    TableConstructorExpressionValue['fields'];
  let fluids = tableValues.map(f =>
    parseExpression(f, requiredProperties) as Fluid);

  let barrels = fluids
    .filter(f => f.auto_barrel !== false)
    .map(f => ({
      ...f,
      type: 'item',
      name: `${f.name}-barrel`,
      // localised_name: {"item-name.filled-barrel", fluid.localised_name or {"fluid-name." .. fluid.name}},
      // icons: generate_barrel_icons(fluid, empty_barrel_item, barrel_side_mask, barrel_hoop_top_mask),
      // icon_size: empty_barrel_item.icon_size or defines.default_icon_size,
      subgroup: 'barrel',
      // order: fluid.order,
      weight: 10e3,
      // inventory_move_sound: item_sounds.metal_barrel_inventory_move,
      // pick_sound: item_sounds.metal_barrel_inventory_pickup,
      // drop_sound: item_sounds.metal_barrel_inventory_move,
      // TODO: use value from items list
      stack_size: barrelItemStackSize,
      // factoriopedia_alternative: "barrel"
    }) as FactorioItem);

  return barrels;
}

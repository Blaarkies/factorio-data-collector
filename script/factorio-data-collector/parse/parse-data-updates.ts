import { parseExpression, parseLua } from './parse-lua.ts';

function getExpressionLine(e) {
  let lineId = JSON.stringify(e, null, 2)
    .split('\n')
    .filter(l => l.includes('"name"') || l.includes('"raw"'))
    .slice(0, 4)
    .reverse()
    .map(l => l.split('"').slice(3, 4))
    .join('.');
  return lineId;
}

function parseDataUpdates(ast: object[]) {
  let body = (ast as any).body;
  let expressions = body.map(e => {
    let lineId = getExpressionLine(e);

    let valid = lineId.startsWith('data.raw.recipe.');

    return {valid, e};
  })
    .filter(({valid}) => valid)
    .map(({e}) => {
      let var1 = e.variables[0];
      let name = var1.type === 'IndexExpression'
        ? var1.base.base.index
        : var1.base.index;

      let recipeName = name.raw.replaceAll('"', '');
      let propertyName = var1.identifier?.name
        ?? var1.base.identifier?.name;
      let value = parseExpression(e.init[0]);
      let indexed = var1.index?.value - 1;

      return {recipeName, propertyName, value, indexed};
    });

  return expressions;
}

export function parseDataUpdatesFromContent(content: string) {
  let ast = parseLua(content);

  let dataUpdates = parseDataUpdates(ast);
  return dataUpdates;
}

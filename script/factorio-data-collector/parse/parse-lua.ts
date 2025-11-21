import { parse } from 'luaparse';
import {
  isBinaryExpression,
  isBooleanLiteralValue,
  isIdentifierValue,
  isNumericLiteral,
  isStringLiteral,
  isTableConstructorExpression,
  isTableKeyString,
  isTableValue, isUnaryExpression,
} from './type-lua.ts';
import type { ValidProp } from './type-data.ts';
import type {
  Expression,
  ExpressionValue,
  TableKeyString
} from './type-lua.ts';

type Value = boolean | string | number | object;

function parseValue(expression: ExpressionValue): unknown {
  if (isStringLiteral(expression)) {
    return expression.raw.slice(1, -1);
  }

  if (isNumericLiteral(expression)) {
    return Number(expression.value);
  }

  if (isIdentifierValue(expression)) {
    return expression.name;
  }

  if (isBooleanLiteralValue(expression)) {
    return expression.value;
  }

  if (isBinaryExpression(expression)) {
    const left = parseValue(expression.left);
    const right = parseValue(expression.right);
    return left + expression.operator + right;
  }

  if (isUnaryExpression(expression)) {
    return expression.operator + parseValue(expression.argument);
  }

  return 'ERROR';
}

type EvaluatorFn = (entry: [ValidProp, string]) => [ValidProp, string | number]

export function parseExpression(
  expression: Expression,
  filterKeys?: ValidProp[],
  evaluatorFn?: EvaluatorFn,
  )
  : object {
  if (isTableConstructorExpression(expression) || isTableValue(expression)) {
    const fields = isTableConstructorExpression(expression)
      ? expression.fields
      : expression.value.fields;
    const filteredFields = filterKeys
      ? fields.filter(f => isTableKeyString(f)
        ? filterKeys.includes((f as TableKeyString).key.name as ValidProp)
        : true)
      : fields;

    if (isTableConstructorExpression(expression)) {
      const entriesOrObject = filteredFields
        .map(f => parseExpression(f, filterKeys, evaluatorFn));
      let isEntries = Array.isArray(entriesOrObject[0]);
      let r = isEntries
        ? Object.fromEntries(entriesOrObject as [])
        : entriesOrObject;
      return r;
    }

    if (isTableValue(expression)) {
      let r = filteredFields.map(f =>
        parseExpression(f, filterKeys, evaluatorFn)) as [string, Value][];
      if (evaluatorFn) {
        r = r.map(entry => {
          return typeof entry[1] === 'string'
            ? evaluatorFn(entry as [ValidProp, string])
            : entry;
        })
      }

      return Object.fromEntries(r);
    }
  }

  if (isTableKeyString(expression)) {
    const parsedValue = isTableConstructorExpression(expression.value)
      ? parseExpression(expression.value, filterKeys, evaluatorFn)
      : parseValue(expression.value);

    return [expression.key.name, parsedValue];
  }

  return parseValue(expression);
}

export function parseLuaItemsOrRecipes(
  contents: string,
  filterKeys?: ValidProp[],
  evaluatorFn?: EvaluatorFn,
): object[] {
  let ast = parse(contents, {locations: true});

  let dataTable = ast.body[0].init[0];

  let items = parseExpression(
    {
      type: 'TableConstructorExpression',
      fields: dataTable.fields,
      loc: dataTable.loc,
    },
    filterKeys,
    evaluatorFn,
  );

  return items;
}

export function parseLua(contents: string): object[] {
  let ast = parse(contents, {locations: true});
  return ast;
}

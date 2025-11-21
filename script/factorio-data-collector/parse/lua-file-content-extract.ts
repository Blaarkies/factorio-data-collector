export function getDataExtendSection(contents: string) {
  let expressionContents = contents.split(/data:extend\s?\(/g).at(-1);
  let end = expressionContents.lastIndexOf(')');
  let listSection = expressionContents.slice(0, end);
  let fragileContents = `ignoreThis=${listSection}`;
  return fragileContents;
}

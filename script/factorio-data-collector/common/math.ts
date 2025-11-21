export function sum(list: number[]): number {
  let sum = 0;
  for (const n of list) {
    sum += n;
  }
  return sum;
}

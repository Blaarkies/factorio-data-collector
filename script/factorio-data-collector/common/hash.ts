function hash(it: ArrayLike<number> | ArrayBuffer): number {
  const view = it instanceof ArrayBuffer
    ? new Uint8Array(it)
    : Uint8Array.from(it);

  let hash = 5381;
  let count = view.length;

  for (let i = 0; i < count; ++i) {
    hash = ((hash << 5) + hash) ^ view[i];
    hash |= 0;
  }

  return hash;
}

export function arrayToHash(it: object[]): number {
  let buffer = new Uint8Array(
    JSON.stringify(it).split('').map(c => c.charCodeAt(0))
  );
  return hash(buffer);
}

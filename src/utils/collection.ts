export function flatten<T>(array: Array<T[]>): T[] {
  return [].concat.apply([], array);
}

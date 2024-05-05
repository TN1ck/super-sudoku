export function flatten<T>(array: Array<T[]>): T[] {
  return ([] as T[]).concat.apply([], array);
}

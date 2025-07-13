export function flatten<T>(array: Array<T[]>): T[] {
  return ([] as T[]).concat.apply([], array);
}

export function sortBy<T>(array: T[], key: (item: T) => string | number): T[] {
  return [...array].sort((a: T, b: T) => {
    const aKey = key(a);
    const bKey = key(b);
    if (aKey < bKey) {
      return -1;
    }
    if (aKey > bKey) {
      return 1;
    }
    return 0;
  });
}

export function groupBy<T, A extends string | number | symbol>(array: T[], key: (item: T) => A): Record<A, T[]> {
  return array.reduce(
    (acc, item) => {
      const k = key(item);
      acc[k] = acc[k] || [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<A, T[]>,
  );
}

export function mean(array: number[]): number {
  return array.reduce((acc, item) => acc + item, 0) / array.length;
}

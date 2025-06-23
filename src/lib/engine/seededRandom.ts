// Adding our own implementation of some random functions, but they take the random function.

function cloneArray<T>(source: T[]): T[] {
  let index = -1;
  const length = source.length;

  const array = new Array(length);
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

// Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
function splitMix32(a: number) {
  return function (): number {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

export function createSeededRandom(seed: number) {
  return splitMix32(seed);
}

// Copied from lodash, but added TypeScript typings.
// https://github.com/lodash/lodash/blob/main/src/shuffle.ts
export function shuffle<T>(array: T[], randomFn: () => number): T[] {
  const length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  let index = -1;
  const lastIndex = length - 1;
  const result = cloneArray(array);
  while (++index < length) {
    const rand = index + Math.floor(randomFn() * (lastIndex - index + 1));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return result;
}

export function sample<T>(array: T[], randomFn: () => number): T {
  const length = array == null ? 0 : array.length;
  if (!length) {
    throw new Error("Cannot sample from an empty array");
  }
  return array[Math.floor(randomFn() * length)];
}

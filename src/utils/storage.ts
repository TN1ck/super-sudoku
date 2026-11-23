export function safeGetStorageItem(key: string): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to read localStorage key "${key}":`, error);
    return null;
  }
}

export function safeSetStorageItem(key: string, value: string): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to write localStorage key "${key}":`, error);
    return false;
  }
}

export function safeParseJson<T>(raw: string | null): T | undefined {
  if (raw === null) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

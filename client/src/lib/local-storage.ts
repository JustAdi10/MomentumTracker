// Simple wrapper for localStorage with JSON parsing/stringifying
// and error handling

const PREFIX = 'momentum_';

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`${PREFIX}${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

// Utility function to cache API responses for offline use
export function cacheApiResponse(endpoint: string, data: any): void {
  setItem(`cache_${endpoint}`, {
    data,
    timestamp: Date.now()
  });
}

// Get cached API response, with option to specify max age
export function getCachedApiResponse<T>(endpoint: string, maxAgeMs: number = Infinity): { data: T | null, isStale: boolean } {
  const cache = getItem<{ data: T, timestamp: number } | null>(`cache_${endpoint}`, null);
  
  if (!cache) {
    return { data: null, isStale: true };
  }
  
  const isStale = (Date.now() - cache.timestamp) > maxAgeMs;
  return { data: cache.data, isStale };
}

// Specifically for caching the user's habits
export function cacheUserHabits(habits: any[]): void {
  cacheApiResponse('habits', habits);
}

export function getCachedUserHabits<T>(): { data: T | null, isStale: boolean } {
  // Cache is stale if older than 1 hour
  return getCachedApiResponse<T>('habits', 60 * 60 * 1000);
}

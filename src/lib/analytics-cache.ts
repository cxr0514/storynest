// Simple cache implementation since LRU cache is causing issues
class SimpleLRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(options: { max: number }) {
    this.maxSize = options.max;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  get max(): number {
    return this.maxSize;
  }

  get calculatedSize(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }
}

// Cache data types
interface AnalyticsResult {
  characterId: string;
  consistencyScore: number;
  timestamp: string;
  [key: string]: unknown;
}

interface CharacterData {
  id: string;
  name: string;
  stories?: { createdAt?: string }[];
  [key: string]: unknown;
}

interface RealTimeResult {
  overallScore: number;
  suggestions: string[];
  [key: string]: unknown;
}

// Cache configuration for analytics results
const analyticsCache = new SimpleLRUCache<string, AnalyticsResult>({
  max: 1000 // Maximum number of cached results
})

// Character consistency cache (longer TTL since character data changes less frequently)
const characterCache = new SimpleLRUCache<string, CharacterData>({
  max: 500
})

// Real-time analytics cache (shorter TTL for real-time feedback)
const realTimeCache = new SimpleLRUCache<string, RealTimeResult>({
  max: 100
})

interface CacheKey {
  type: 'character' | 'analytics' | 'realtime'
  id: string
  params?: Record<string, unknown>
}

export class AnalyticsCache {
  private static generateCacheKey(cacheKey: CacheKey): string {
    const { type, id, params } = cacheKey
    const paramString = params ? JSON.stringify(params) : ''
    return `${type}:${id}:${paramString}`
  }

  static get(cacheKey: CacheKey): unknown {
    const key = this.generateCacheKey(cacheKey)
    
    switch (cacheKey.type) {
      case 'character':
        return characterCache.get(key)
      case 'analytics':
        return analyticsCache.get(key)
      case 'realtime':
        return realTimeCache.get(key)
      default:
        return undefined
    }
  }

  static set(cacheKey: CacheKey, value: unknown): void {
    const key = this.generateCacheKey(cacheKey)
    
    switch (cacheKey.type) {
      case 'character':
        characterCache.set(key, value as CharacterData)
        break
      case 'analytics':
        analyticsCache.set(key, value as AnalyticsResult)
        break
      case 'realtime':
        realTimeCache.set(key, value as RealTimeResult)
        break
    }
  }

  static delete(cacheKey: CacheKey): boolean {
    const key = this.generateCacheKey(cacheKey)
    
    switch (cacheKey.type) {
      case 'character':
        return characterCache.delete(key)
      case 'analytics':
        return analyticsCache.delete(key)
      case 'realtime':
        return realTimeCache.delete(key)
      default:
        return false
    }
  }

  static clear(type?: 'character' | 'analytics' | 'realtime'): void {
    if (type) {
      switch (type) {
        case 'character':
          characterCache.clear()
          break
        case 'analytics':
          analyticsCache.clear()
          break
        case 'realtime':
          realTimeCache.clear()
          break
      }
    } else {
      characterCache.clear()
      analyticsCache.clear()
      realTimeCache.clear()
    }
  }

  static invalidateCharacter(characterId: string): void {
    // Clear all cache entries related to a character
    const patterns = [
      `character:${characterId}:`,
      `analytics:${characterId}:`,
      `realtime:${characterId}:`
    ]

    for (const pattern of patterns) {
      for (const key of characterCache.keys()) {
        if (key.startsWith(pattern)) {
          characterCache.delete(key)
        }
      }
      for (const key of analyticsCache.keys()) {
        if (key.startsWith(pattern)) {
          analyticsCache.delete(key)
        }
      }
      for (const key of realTimeCache.keys()) {
        if (key.startsWith(pattern)) {
          realTimeCache.delete(key)
        }
      }
    }
  }

  static getStats() {
    return {
      character: {
        size: characterCache.size,
        max: characterCache.max,
        calculatedSize: characterCache.calculatedSize,
      },
      analytics: {
        size: analyticsCache.size,
        max: analyticsCache.max,
        calculatedSize: analyticsCache.calculatedSize,
      },
      realtime: {
        size: realTimeCache.size,
        max: realTimeCache.max,
        calculatedSize: realTimeCache.calculatedSize,
      }
    }
  }
}

// Cached analytics functions
export async function getCachedCharacterConsistency(characterData: CharacterData) {
  const cacheKey: CacheKey = {
    type: 'character',
    id: characterData.id,
    params: {
      storiesCount: characterData.stories?.length || 0,
      lastModified: characterData.stories?.[0]?.createdAt || new Date().toISOString()
    }
  }

  const cached = AnalyticsCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Import analytics function dynamically to avoid circular imports
  const { calculateCharacterConsistency } = await import('./analytics')
  const result = await calculateCharacterConsistency(characterData)
  
  AnalyticsCache.set(cacheKey, result)
  return result
}

export async function getCachedEnhancedCharacterConsistency(characterData: CharacterData) {
  const cacheKey: CacheKey = {
    type: 'analytics',
    id: characterData.id,
    params: {
      storiesCount: characterData.stories?.length || 0,
      lastModified: characterData.stories?.[0]?.createdAt || new Date().toISOString()
    }
  }

  const cached = AnalyticsCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const { calculateEnhancedCharacterConsistency } = await import('./analytics')
  const result = await calculateEnhancedCharacterConsistency(characterData)
  
  AnalyticsCache.set(cacheKey, result)
  return result
}

export async function getCachedRealTimeAnalytics(characterId: string, storyContent: string) {
  const contentHash = hashString(storyContent)
  const cacheKey: CacheKey = {
    type: 'realtime',
    id: characterId,
    params: { contentHash, length: storyContent.length }
  }

  const cached = AnalyticsCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // This would typically call the real-time analytics API
  const result = await fetch('/api/analytics/real-time', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterId,
      storyContent,
      realTimeMode: true
    })
  }).then(res => res.json())

  AnalyticsCache.set(cacheKey, result)
  return result
}

// Simple hash function for content
function hashString(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return hash.toString()
}

// Background cache warming
export class CacheWarmer {
  private static isWarming = false

  static async warmCharacterCache(userId: string) {
    if (this.isWarming) return
    this.isWarming = true

    try {
      // This would typically fetch frequently accessed characters
      const characters = await fetch(`/api/characters?userId=${userId}&limit=10`)
        .then(res => res.json())
        .catch(() => [])

      for (const character of characters) {
        // Pre-calculate and cache analytics for frequently used characters
        await getCachedCharacterConsistency(character)
        await getCachedEnhancedCharacterConsistency(character)
      }
    } catch (error) {
      console.error('Cache warming failed:', error)
    } finally {
      this.isWarming = false
    }
  }

  static async warmAnalyticsCache(childProfileId: string) {
    if (this.isWarming) return
    this.isWarming = true

    try {
      // Pre-calculate platform analytics
      await fetch(`/api/analytics?childProfileId=${childProfileId}&preload=true`)
        .catch(() => {
          console.log('Analytics cache warming failed')
        })
    } catch (error) {
      console.error('Analytics cache warming failed:', error)
    } finally {
      this.isWarming = false
    }
  }
}

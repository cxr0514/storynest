declare module 'lru-cache' {
  export default class LRUCache<K = string, V = unknown> {
    constructor(options?: {
      max?: number;
      maxSize?: number;
      sizeCalculation?: (value: V, key: K) => number;
      dispose?: (value: V, key: K) => void;
      disposeAfter?: (value: V, key: K) => void;
      noDisposeOnSet?: boolean;
      noUpdateTTL?: boolean;
      noDeleteOnFetchRejection?: boolean;
      noDeleteOnStaleGet?: boolean;
      allowStale?: boolean;
      updateAgeOnGet?: boolean;
      updateAgeOnHas?: boolean;
      ttl?: number;
      ttlResolution?: number;
      ttlAutopurge?: boolean;
      ignoreFetchAbort?: boolean;
      allowStaleOnFetchAbort?: boolean;
      allowStaleOnFetchRejection?: boolean;
      fetchMethod?: (key: K, staleValue?: V) => Promise<V>;
    });
    
    set(key: K, value: V, options?: { ttl?: number; start?: number; size?: number }): this;
    get(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size: number;
    max: number;
  }
  
  export { LRUCache };
}

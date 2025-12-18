export abstract class RedisStorePort {
  abstract set(
    key: string,
    payload: string,
    ttlSecconds: number,
  ): Promise<void>;
  abstract get(key: string): Promise<string | null>;
  abstract remove(key: string): Promise<void>;
}

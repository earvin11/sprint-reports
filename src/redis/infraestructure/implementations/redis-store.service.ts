import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisStorePort } from 'src/redis/domain/redis-store.port';

@Injectable()
export class RedisStoreService implements RedisStorePort {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}
  async set(key: string, payload: string, ttlSecconds: number): Promise<void> {
    await this.redisClient.set(key, payload, 'EX', ttlSecconds);
  }
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
  async remove(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}

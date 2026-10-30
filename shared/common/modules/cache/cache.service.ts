import { Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisCacheService {
  constructor(@Inject('CACHE_MANAGER') private cacheManger: Cache) {}

  async getData(key: string): Promise<string | undefined> {
    return await this.cacheManger.get(key);
  }

  async setData<T>(key: string, value: T | any, ttl?: number) {
    return await this.cacheManger.set(key, value, ttl);
  }

  async delete(key: string) {
    return await this.cacheManger.del(key);
  }

  async clear() {
    return await this.cacheManger.clear();
  }
}

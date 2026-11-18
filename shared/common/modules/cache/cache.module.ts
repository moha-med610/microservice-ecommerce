import { Global, Module } from '@nestjs/common';
import { RedisCacheService } from './cache.service.js';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Global()
@Module({
  imports: [
    CacheModule.register({
      stores: [createKeyv('redis://redis:6379')],
      isGlobal: true,
      ttl: 10 * 60 * 1000,
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}

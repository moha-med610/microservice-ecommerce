import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as Crypto from 'crypto';
import { TokenService } from './token.service.js';
import { RedisCacheModule } from '../cache/cache.module.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      signOptions: {
        jwtid: Crypto.randomUUID(),
      },
    }),
    RedisCacheModule,
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}

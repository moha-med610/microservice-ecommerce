import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module.js';
import { HashModule } from './common/modules/hash/hash.module.js';
import { TokenModule } from '@shared/common/modules/token/token.module.js';
import { DatabaseModule } from './database/database.module.js';
import { CacheModule } from '@nestjs/cache-manager';
import { randomUUID } from 'node:crypto';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      verifyOptions: {
        jwtid: randomUUID(),
      },
    }),

    CacheModule.register({
      isGlobal: true,
    }),
    // Service Modules
    DatabaseModule,
    AuthModule,
    TokenModule,
    HashModule,
  ],
})
export class AppModule {}

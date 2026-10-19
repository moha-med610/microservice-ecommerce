import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module.js';
import { HashModule } from './common/modules/hash/hash.module.js';
import { TokenModule } from '@shared/common/modules/token/token.module.js';
import { DatabaseModule } from './database/database.module.js';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    JwtModule.register({
      global: true,
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

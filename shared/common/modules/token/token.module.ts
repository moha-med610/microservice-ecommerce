import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as Crypto from 'crypto';
import { TokenService } from './token.service.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      signOptions: {
        jwtid: Crypto.randomUUID(),
      },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}

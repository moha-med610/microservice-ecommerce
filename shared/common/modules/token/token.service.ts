import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { TokenType } from '../../enums/tokenType.enum.js';
import { JwtPayload } from '../../types/jwt.payload.js';
import {
  getAccessPrivateKey,
  getAccessPublicKey,
  getRefreshPrivateKey,
  getRefreshPublicKey,
} from '@shared/utils/security/keys.js';
import { UserTokenData } from '@shared/common/types/token-data.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { blackListTokes } from '@shared/utils/cache-keys.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisCacheService,
  ) {}

  createToken(payload: UserTokenData) {
    const expiresIn =
      payload.type === TokenType.ACCESS
        ? process.env.ACCESS_TOKEN_EXPIRES_IN
        : process.env.REFRESH_TOKEN_EXPIRES_IN;

    return this.jwtService.sign(payload, {
      privateKey:
        payload.type === TokenType.ACCESS
          ? getAccessPrivateKey()
          : getRefreshPrivateKey(),
      algorithm: 'RS256',
      expiresIn: expiresIn as ms.StringValue,
    });
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  async verifyToken(token: string, type: TokenType) {
    const payload: JwtPayload = this.jwtService.verify(token, {
      publicKey:
        type === TokenType.ACCESS
          ? getAccessPublicKey()
          : getRefreshPublicKey(),
      algorithms: ['RS256'],
    });

    const isRevoked = await this.redisService.getData(
      blackListTokes(payload.jti),
    );

    if (isRevoked) {
      throw new UnauthorizedException(
        'Token is Revoked, Please Login and Try Again',
      );
    }

    return payload;
  }

  async revokeToken(jti: string, exp: Date) {
    const ttl = (Number(exp) - Math.floor(Date.now() / 1000)) * 1000;

    if (ttl <= 0) return;

    await this.redisService.setData(blackListTokes(jti), '1', ttl);
  }
}

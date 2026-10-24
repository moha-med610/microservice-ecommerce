import { Injectable } from '@nestjs/common';
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

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

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

  verifyToken(token: string, type: TokenType) {
    return this.jwtService.verify(token, {
      publicKey:
        type === TokenType.ACCESS
          ? getAccessPublicKey()
          : getRefreshPublicKey(),
      algorithms: ['RS256'],
    });
  }
}

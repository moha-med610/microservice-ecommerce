import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { TokenType } from '../../enums/tokenType.enum.js';
import { JwtPayload } from '../../types/jwt.payload.js';
import {
  getAccessPrivateKey,
  getAccessPublicKey,
} from '@shared/utils/security/keys.js';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(payload: JwtPayload) {
    const expiresIn =
      payload.type === TokenType.ACCESS
        ? process.env.ACCESS_TOKEN_EXPIRES_IN
        : process.env.REFRESH_TOKEN_EXPIRES_IN;

    return this.jwtService.sign(payload, {
      privateKey: getAccessPrivateKey(),
      algorithm: 'RS256',
      expiresIn: expiresIn as ms.StringValue,
    });
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  verifyToken(token: string, type: TokenType) {
    return this.jwtService.verify(token, {
      publicKey: getAccessPublicKey(),
      algorithms: ['RS256'],
    });
  }
}

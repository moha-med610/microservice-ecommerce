import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { getAccessPublicKey } from '../../utils/security/keys.js';
import { USER_STATUS_ENUM } from '../enums/usersStatus.enum.js';
import { TokenService } from '../modules/token/token.service.js';
import { JwtPayload } from '../types/jwt.payload.js';
import { TokenType } from '../enums/tokenType.enum.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly token: TokenService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      const payload: JwtPayload = await this.token.verifyToken(
        token,
        TokenType.ACCESS,
      );

      if (!payload) {
        throw new UnauthorizedException();
      }

      if (payload.status !== USER_STATUS_ENUM.ACTIVE) {
        throw new UnauthorizedException(
          'Your account is not active. Please contact support.',
        );
      }

      if (!payload.isVerified) {
        throw new UnauthorizedException(
          'Your Account Is Not Verified, Please Verify Your Account And Try Again',
        );
      }

      request['user'] = payload;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

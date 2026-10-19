import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { USER_STATUS_ENUM } from '../enums/usersStatus.enum.js';
import { getAccessPublicKey } from '../../utils/security/keys.js';
import { JwtPayload } from '../types/jwt.payload.js';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

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
      const payload: JwtPayload = this.jwtService.verify(token, {
        publicKey: getAccessPublicKey(),
        algorithms: ['RS256'],
      });

      if (payload.status != USER_STATUS_ENUM.ACTIVE) {
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

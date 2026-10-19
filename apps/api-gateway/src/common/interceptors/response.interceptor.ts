import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          statusCode: res.statusCode,
          message: data['message'],
          data: data['data'],
        };
      }),
    );
  }
}

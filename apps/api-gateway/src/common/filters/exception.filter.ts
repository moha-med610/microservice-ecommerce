// apps/gateway/src/filters/rpc-to-http.filter.ts
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    // Normal HTTP exceptions from the gateway itself (validation, guards...)
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json(exception.getResponse());
    }

    // Error coming from a microservice: { code, message, statusCode?, details? }
    if (exception?.code && exception?.message) {
      const status = exception.statusCode ?? HttpStatus.BAD_REQUEST;
      return res.status(status).json({
        success: false,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      });
    }

    // Microservice down / timeout
    if (
      exception?.code === 'ECONNREFUSED' ||
      exception?.name === 'TimeoutError'
    ) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Upstream service unavailable',
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
}

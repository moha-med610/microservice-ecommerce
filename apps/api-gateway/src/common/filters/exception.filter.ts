import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Response } from 'express';

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcToHttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Log the original exception
    this.logger.error(
      exception?.stack || exception?.message || String(exception),
    );

    // Normal HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return res.status(status).json(
        isDevelopment
          ? {
              success: false,
              statusCode: status,
              error: exception.name,
              message: response,
              stack: exception.stack,
            }
          : response,
      );
    }

    // Microservice exceptions
    if (exception?.code && exception?.message) {
      const status = exception.statusCode ?? HttpStatus.BAD_REQUEST;

      return res.status(status).json({
        success: false,
        code: exception.code,
        message: exception.message,
        ...(exception.details && {
          details: exception.details,
        }),
        ...(isDevelopment && {
          error: exception.name,
          stack: exception.stack,
          originalError: exception,
        }),
      });
    }

    // Microservice connection errors / timeout
    if (
      exception?.code === 'ECONNREFUSED' ||
      exception?.name === 'TimeoutError'
    ) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Upstream service unavailable',
        ...(isDevelopment && {
          error: exception.message,
          stack: exception.stack,
        }),
      });
    }

    // Unknown exceptions
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: isDevelopment
        ? exception?.message || String(exception)
        : 'Internal server error',
      ...(isDevelopment && {
        error: exception?.name,
        stack: exception?.stack,
        originalError: exception,
      }),
    });
  }
}

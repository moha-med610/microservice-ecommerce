// libs/common/src/filters/rpc-exception.filter.ts
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { RpcErrorPayload } from '../../utils/errors/app-rpc.exception.js';

@Catch()
export class AllRpcExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllRpcExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    let payload: RpcErrorPayload;

    if (exception instanceof RpcException) {
      const err = exception.getError();
      payload =
        typeof err === 'string'
          ? { code: 'RPC_ERROR', message: err, statusCode: 500 }
          : (err as RpcErrorPayload);
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      payload = {
        code: exception.name,
        message: typeof res === 'string' ? res : res.message,
        statusCode: exception.getStatus(),
      };
    } else {
      this.logger.error(exception);
      payload = {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        statusCode: 500,
      };
    }

    return throwError(() => payload);
  }
}

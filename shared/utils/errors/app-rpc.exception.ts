// libs/common/src/exceptions/app-rpc.exception.ts
import { RpcException } from '@nestjs/microservices';

export interface RpcErrorPayload {
  code: string; // e.g. 'USER_NOT_FOUND'
  message: string;
  statusCode?: number; // HTTP status the gateway should return
  details?: unknown;
}

export class AppRpcException extends RpcException {
  constructor(payload: RpcErrorPayload) {
    super(payload);
  }
}

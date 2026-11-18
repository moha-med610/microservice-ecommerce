import { GatewayTimeoutException, Injectable } from '@nestjs/common';

import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

@Injectable()
export class RequestService {
  async send<TResponse, TPayload>(
    client: ClientKafka | ClientProxy,
    pattern: string,
    payload: TPayload,
    timeoutMs = 5000,
  ): Promise<TResponse> {
    try {
      return await firstValueFrom(
        client
          .send<TResponse, TPayload>(pattern, payload)
          .pipe(timeout({ first: timeoutMs })),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'The downstream service did not respond in time',
        );
      }
      throw error;
    }
  }

  async emit<TPayload>(
    client: ClientKafka,
    pattern: string,
    payload: TPayload,
  ) {
    return client.emit(pattern, payload);
  }
}
